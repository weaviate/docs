package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/modules/selfprovided"
	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/query/filter"
	"github.com/weaviate/weaviate-go-client/v6/types"
)

// setupJeopardySearch (re)creates a JeopardyQuestion collection with a single
// user-supplied ("bring your own") vector named "default" and seeds a few
// objects with explicit vectors. Because the collection has no vectorizer, the
// vector-search snippets that build on it run without an inference module.
//
// The near-text and hybrid snippets on this page instead query a collection
// that has a text vectorizer configured, mirroring the demo datasets used
// throughout the docs; they are not backed by this helper.
func setupJeopardySearch(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "JeopardyQuestion")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyQuestion",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
			{Name: "answer", DataType: collections.DataTypeText},
			{Name: "category", DataType: collections.DataTypeText},
			{Name: "points", DataType: collections.DataTypeInt},
		},
		// A named vector that brings its own vectors: the server requires every
		// vector config to name a vectorizer, so use the "none" vectorizer
		// (selfprovided) and supply the vectors explicitly at insert time.
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: selfprovided.Vectorizer},
		},
	}); err != nil {
		t.Fatalf("create JeopardyQuestion collection: %v", err)
	}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	// Fixed, non-leading-zero ids keep the run deterministic. A server-assigned id
	// beginning 0x00 comes back from gRPC search as 15 bytes (the id_as_bytes reply
	// field drops leading zero bytes) and the client's uuid.FromBytes then rejects
	// the whole SearchReply, flaking every query over this collection. See the
	// filterByIdSeedUUID note in main_test.go.
	s1 := uuid.MustParse("5a6b7c8d-9e0f-4a1b-8c2d-1a2b3c4d5e6f")
	s2 := uuid.MustParse("6b7c8d9e-0f1a-4b2c-8d3e-2b3c4d5e6f7a")
	s3 := uuid.MustParse("7c8d9e0f-1a2b-4c3d-8e4f-3c4d5e6f7a8b")
	if _, err := jeopardy.Data.Insert(ctx,
		&data.Object{
			UUID:       &s1,
			Properties: map[string]any{"question": "This organ removes excess glucose from the blood & stores it as glycogen", "answer": "Liver", "category": "SCIENCE", "points": 100},
			Vectors:    []types.Vector{{Name: "default", Single: []float32{0.10, 0.21, 0.32}}},
		},
		&data.Object{
			UUID:       &s2,
			Properties: map[string]any{"question": "It's the only living mammal in the order Proboscidea", "answer": "Elephant", "category": "ANIMALS", "points": 200},
			Vectors:    []types.Vector{{Name: "default", Single: []float32{0.11, 0.20, 0.34}}},
		},
		&data.Object{
			UUID:       &s3,
			Properties: map[string]any{"question": "The gavial looks very much like a crocodile except for this bodily feature", "answer": "the nose or snout", "category": "ANIMALS", "points": 400},
			Vectors:    []types.Vector{{Name: "default", Single: []float32{0.14, 0.19, 0.30}}},
		},
	); err != nil {
		t.Fatalf("seed JeopardyQuestion: %v", err)
	}
	waitForCount(t, jeopardy, 3)
}

// TestGetNearText runs a semantic search over a collection whose vectorizer
// turns the query text into a vector server-side.
func TestGetNearText(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetNearText
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.NearText(ctx, query.NearText{
		Concepts: []string{"animals in movies"},
		Limit:    2,
		ReturnMetadata: query.ReturnMetadata{
			Distance: true,
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
		if obj.Metadata.Distance != nil {
			fmt.Printf("distance: %v\n", *obj.Metadata.Distance)
		}
	}
	// END GetNearText
}

// TestGetNearVector runs a vector similarity search from an input vector.
func TestGetNearVector(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetNearVector
	// A query vector, for example an embedding produced by your model.
	vector := []float32{0.12, 0.20, 0.33}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.NearVector(ctx, query.NearVector{
		Target: &types.Vector{Name: "default", Single: vector},
		Limit:  2,
		ReturnMetadata: query.ReturnMetadata{
			Distance: true,
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
		if obj.Metadata.Distance != nil {
			fmt.Printf("distance: %v\n", *obj.Metadata.Distance)
		}
	}
	// END GetNearVector
}

// TestNamedVectorNearText searches a named vector by passing the vector name as
// the search target.
func TestNamedVectorNearText(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupWineReviewNV(t, client)
	defer client.Collections.Delete(ctx, "WineReviewNV")

	// START NamedVectorNearText
	reviews := client.Collections.Use("WineReviewNV")
	response, err := reviews.Query.NearText(ctx, query.NearText{
		Concepts: []string{"a sweet German white wine"},
		// Select the named vector to search against.
		Target: query.VectorName("title_country"),
		Limit:  2,
		ReturnMetadata: query.ReturnMetadata{
			Distance: true,
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END NamedVectorNearText
}

// TestGetWithDistance sets a maximum distance threshold on a vector search.
func TestGetWithDistance(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetWithDistance
	vector := []float32{0.12, 0.20, 0.33}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.NearVector(ctx, query.NearVector{
		Target:     &types.Vector{Name: "default", Single: vector},
		Similarity: query.Distance(0.25),
		ReturnMetadata: query.ReturnMetadata{
			Distance: true,
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END GetWithDistance
}

// TestGetLimitOffset paginates a vector search with limit and offset.
func TestGetLimitOffset(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetLimitOffset
	vector := []float32{0.12, 0.20, 0.33}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.NearVector(ctx, query.NearVector{
		Target: &types.Vector{Name: "default", Single: vector},
		Limit:  2,
		Offset: 1,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END GetLimitOffset
}

// TestAutocut limits results to the first N distance clusters (autocut).
func TestAutocut(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START Autocut
	vector := []float32{0.12, 0.20, 0.33}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.NearVector(ctx, query.NearVector{
		Target: &types.Vector{Name: "default", Single: vector},
		// Return objects from the first similarity cluster only.
		AutoLimit: 1,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END Autocut
}

// TestGetWithGroupBy groups the results of a vector search by a property.
func TestGetWithGroupBy(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetWithGroupBy
	vector := []float32{0.12, 0.20, 0.33}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.NearVector.GroupBy(ctx,
		query.NearVector{
			Target: &types.Vector{Name: "default", Single: vector},
			Limit:  10,
		},
		query.GroupBy{
			Property:       "category",
			NumberOfGroups: 2,
			ObjectLimit:    2,
		},
	)
	if err != nil {
		// handle error
		panic(err)
	}
	for name, group := range response.Groups {
		fmt.Printf("group %q holds %d objects\n", name, group.Size)
	}
	// END GetWithGroupBy
}

// TestGetWithFilter narrows a vector search with a property filter.
func TestGetWithFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetWithFilter
	vector := []float32{0.12, 0.20, 0.33}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.NearVector(ctx, query.NearVector{
		Target: &types.Vector{Name: "default", Single: vector},
		Limit:  2,
		Filter: &filter.Cond{
			Target:   "category",
			Operator: filter.Equal,
			Value:    "ANIMALS",
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END GetWithFilter
}
