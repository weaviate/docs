package main

import (
	"context"
	"testing"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
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
		// An empty VectorConfig registers a named vector with no vectorizer, so
		// vectors must be supplied at insert time.
		Vectors: map[string]collections.VectorConfig{
			"default": {},
		},
	}); err != nil {
		t.Fatalf("create JeopardyQuestion collection: %v", err)
	}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	if _, err := jeopardy.Data.Insert(ctx,
		&data.Object{
			Properties: map[string]any{"question": "This organ removes excess glucose from the blood & stores it as glycogen", "answer": "Liver", "category": "SCIENCE", "points": 100},
			Vectors:    []types.Vector{{Name: "default", Single: []float32{0.10, 0.21, 0.32}}},
		},
		&data.Object{
			Properties: map[string]any{"question": "It's the only living mammal in the order Proboscidea", "answer": "Elephant", "category": "ANIMALS", "points": 200},
			Vectors:    []types.Vector{{Name: "default", Single: []float32{0.11, 0.20, 0.34}}},
		},
		&data.Object{
			Properties: map[string]any{"question": "The gavial looks very much like a crocodile except for this bodily feature", "answer": "the nose or snout", "category": "ANIMALS", "points": 400},
			Vectors:    []types.Vector{{Name: "default", Single: []float32{0.14, 0.19, 0.30}}},
		},
	); err != nil {
		t.Fatalf("seed JeopardyQuestion: %v", err)
	}
}

// TestGetNearText runs a semantic search over a collection whose vectorizer
// turns the query text into a vector server-side.
func TestGetNearText(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
		if obj.Metadata.Distance != nil {
			t.Logf("distance: %v", *obj.Metadata.Distance)
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
		Target: &types.Vector{Single: vector},
		Limit:  2,
		ReturnMetadata: query.ReturnMetadata{
			Distance: true,
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
		if obj.Metadata.Distance != nil {
			t.Logf("distance: %v", *obj.Metadata.Distance)
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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
		Target:     &types.Vector{Single: vector},
		Similarity: query.Distance(0.25),
		ReturnMetadata: query.ReturnMetadata{
			Distance: true,
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
		Target: &types.Vector{Single: vector},
		Limit:  2,
		Offset: 1,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
		Target: &types.Vector{Single: vector},
		// Return objects from the first similarity cluster only.
		AutoLimit: 1,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
			Target: &types.Vector{Single: vector},
			Limit:  10,
		},
		query.GroupBy{
			Property:       "category",
			NumberOfGroups: 2,
			ObjectLimit:    2,
		},
	)
	if err != nil {
		t.Fatal(err)
	}
	for name, group := range response.Groups {
		t.Logf("group %q holds %d objects", name, group.Size)
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
		Target: &types.Vector{Single: vector},
		Limit:  2,
		Filter: &filter.Cond{
			Target:   "category",
			Operator: filter.Equal,
			Value:    "ANIMALS",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END GetWithFilter
}
