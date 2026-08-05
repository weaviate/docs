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
	"github.com/weaviate/weaviate-go-client/v6/types"
)

// The multi-target vector snippets query a "JeopardyTiny" collection with two
// named vectors. The bring-your-own-vector (NearVector) variants run live via
// setupJeopardyTiny; the near-text variants stay skipped until a vectorizer is
// available in this CI lane.

// setupJeopardyTiny (re)creates JeopardyTiny with two bring-your-own named
// vectors and seeds objects that carry both. The vector-config keys match the
// target names used by the multi-target near-vector snippets.
func setupJeopardyTiny(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "JeopardyTiny")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyTiny",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
			{Name: "answer", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"jeopardy_questions_vector": {Vectorizer: selfprovided.Vectorizer},
			"jeopardy_answers_vector":   {Vectorizer: selfprovided.Vectorizer},
		},
	}); err != nil {
		t.Fatalf("create JeopardyTiny collection: %v", err)
	}

	jeopardy := client.Collections.Use("JeopardyTiny")
	// Fixed, non-leading-zero ids keep the near-vector run deterministic: a
	// server-assigned id beginning 0x00 truncates to 15 bytes in the gRPC
	// id_as_bytes reply field and the client rejects the whole SearchReply. See
	// the filterByIdSeedUUID note in main_test.go.
	t1 := uuid.MustParse("8d9e0f1a-2b3c-4d5e-8f60-4d5e6f7a8b9c")
	t2 := uuid.MustParse("9e0f1a2b-3c4d-4e5f-8061-5e6f7a8b9c0d")
	t3 := uuid.MustParse("af1a2b3c-4d5e-4f6a-8b62-6f7a8b9c0d1e")
	if _, err := jeopardy.Data.Insert(ctx,
		&data.Object{
			UUID:       &t1,
			Properties: map[string]any{"question": "This organ removes excess glucose from the blood", "answer": "Liver"},
			Vectors: []types.Vector{
				{Name: "jeopardy_questions_vector", Single: []float32{0.10, 0.21, 0.32}},
				{Name: "jeopardy_answers_vector", Single: []float32{0.20, 0.11, 0.30}},
			},
		},
		&data.Object{
			UUID:       &t2,
			Properties: map[string]any{"question": "The only living mammal in the order Proboscidea", "answer": "Elephant"},
			Vectors: []types.Vector{
				{Name: "jeopardy_questions_vector", Single: []float32{0.11, 0.20, 0.34}},
				{Name: "jeopardy_answers_vector", Single: []float32{0.14, 0.19, 0.30}},
			},
		},
		&data.Object{
			UUID:       &t3,
			Properties: map[string]any{"question": "This tall animal has a long neck and roams the savanna", "answer": "Giraffe"},
			Vectors: []types.Vector{
				{Name: "jeopardy_questions_vector", Single: []float32{0.14, 0.19, 0.30}},
				{Name: "jeopardy_answers_vector", Single: []float32{0.11, 0.20, 0.34}},
			},
		},
	); err != nil {
		t.Fatalf("seed JeopardyTiny: %v", err)
	}

	waitForCount(t, jeopardy, 3)
}

// TestMultiBasic searches several target vectors by name. With no join strategy
// specified, Weaviate combines the results using the default (minimum) strategy.
func TestMultiBasic(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyTinyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyTiny")

	// START MultiBasic
	jeopardy := client.Collections.Use("JeopardyTiny")
	response, err := jeopardy.Query.NearText(ctx, query.NearText{
		Concepts: []string{"a wild animal"},
		// Minimum is the default join strategy when combining target vectors.
		Target: query.Min([]query.VectorName{
			"jeopardy_questions_vector",
			"jeopardy_answers_vector",
		}),
		Limit:          2,
		ReturnMetadata: query.ReturnMetadata{Distance: true},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END MultiBasic
}

// TestMultiTargetNearVector supplies a separate query vector for each target
// vector.
func TestMultiTargetNearVector(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyTiny(t, client)
	defer client.Collections.Delete(ctx, "JeopardyTiny")

	v1 := []float32{0.12, 0.20, 0.33}
	v2 := []float32{0.14, 0.19, 0.30}

	// START MultiTargetNearVector
	jeopardy := client.Collections.Use("JeopardyTiny")
	response, err := jeopardy.Query.NearVector(ctx, query.NearVector{
		// Pair each named target vector with its own query vector.
		Target: query.Min([]types.Vector{
			{Name: "jeopardy_questions_vector", Single: v1},
			{Name: "jeopardy_answers_vector", Single: v2},
		}),
		Limit:          2,
		ReturnMetadata: query.ReturnMetadata{Distance: true},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END MultiTargetNearVector
}

// TestMultiTargetMultipleNearVectorsV1 targets the same vector more than once by
// listing it twice with different query vectors.
func TestMultiTargetMultipleNearVectorsV1(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyTiny(t, client)
	defer client.Collections.Delete(ctx, "JeopardyTiny")

	v1 := []float32{0.12, 0.20, 0.33}
	v2 := []float32{0.14, 0.19, 0.30}
	v3 := []float32{0.11, 0.20, 0.34}

	// START MultiTargetMultipleNearVectorsV1
	jeopardy := client.Collections.Use("JeopardyTiny")
	response, err := jeopardy.Query.NearVector(ctx, query.NearVector{
		// A target vector name may appear more than once, each with its own vector.
		Target: query.Min([]types.Vector{
			{Name: "jeopardy_questions_vector", Single: v1},
			{Name: "jeopardy_answers_vector", Single: v2},
			{Name: "jeopardy_answers_vector", Single: v3},
		}),
		Limit:          2,
		ReturnMetadata: query.ReturnMetadata{Distance: true},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END MultiTargetMultipleNearVectorsV1
}

// TestMultiTargetMultipleNearVectorsV2 assigns a weight to each query vector.
func TestMultiTargetMultipleNearVectorsV2(t *testing.T) {
	t.Skip("go-client v6 mis-marshals a repeated target with per-vector weights: marshalNearVector (internal/api/search.go) de-duplicates TargetVectors but appends one WeightsForTarget per vector, so a target named twice yields len(weights)=3 vs len(targets)=2. Weaviate 1.38 rejects it (parse_search_request.go extractWeights requires equal, positional counts): \"number of weights (3) does not match number of targets (2)\". The Python/Java clients duplicate the target name to match the weights; the Go client should too. Snippet is idiomatic (matches the other clients); deferred pending a client fix")

	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyTiny(t, client)
	defer client.Collections.Delete(ctx, "JeopardyTiny")

	v1 := []float32{0.12, 0.20, 0.33}
	v2 := []float32{0.14, 0.19, 0.30}
	v3 := []float32{0.11, 0.20, 0.34}

	// START MultiTargetMultipleNearVectorsV2
	jeopardy := client.Collections.Use("JeopardyTiny")
	response, err := jeopardy.Query.NearVector(ctx, query.NearVector{
		// Weight each query vector; repeated targets are weighted independently.
		Target: query.ManualWeights([]query.WeightedVector[types.Vector]{
			query.Weighted(types.Vector{Name: "jeopardy_questions_vector", Single: v1}, 10),
			query.Weighted(types.Vector{Name: "jeopardy_answers_vector", Single: v2}, 30),
			query.Weighted(types.Vector{Name: "jeopardy_answers_vector", Single: v3}, 30),
		}),
		Limit:          2,
		ReturnMetadata: query.ReturnMetadata{Distance: true},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END MultiTargetMultipleNearVectorsV2
}

// TestMultiTargetWithSimpleJoin selects a named join strategy for the target
// vectors.
func TestMultiTargetWithSimpleJoin(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyTinyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyTiny")

	// START MultiTargetWithSimpleJoin
	jeopardy := client.Collections.Use("JeopardyTiny")
	response, err := jeopardy.Query.NearText(ctx, query.NearText{
		Concepts: []string{"a wild animal"},
		// query.Sum, query.Min, query.ManualWeights, and query.RelativeScore
		// are also available.
		Target: query.Average([]query.VectorName{
			"jeopardy_questions_vector",
			"jeopardy_answers_vector",
		}),
		Limit:          2,
		ReturnMetadata: query.ReturnMetadata{Distance: true},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END MultiTargetWithSimpleJoin
}

// TestMultiTargetManualWeights weights the raw distance to each target vector.
func TestMultiTargetManualWeights(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyTinyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyTiny")

	// START MultiTargetManualWeights
	jeopardy := client.Collections.Use("JeopardyTiny")
	response, err := jeopardy.Query.NearText(ctx, query.NearText{
		Concepts: []string{"a wild animal"},
		Target: query.ManualWeights([]query.WeightedVector[query.VectorName]{
			query.Weighted(query.VectorName("jeopardy_questions_vector"), 10),
			query.Weighted(query.VectorName("jeopardy_answers_vector"), 50),
		}),
		Limit:          2,
		ReturnMetadata: query.ReturnMetadata{Distance: true},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END MultiTargetManualWeights
}

// TestMultiTargetRelativeScore weights the normalized distance to each target
// vector.
func TestMultiTargetRelativeScore(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyTinyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyTiny")

	// START MultiTargetRelativeScore
	jeopardy := client.Collections.Use("JeopardyTiny")
	response, err := jeopardy.Query.NearText(ctx, query.NearText{
		Concepts: []string{"a wild animal"},
		Target: query.RelativeScore([]query.WeightedVector[query.VectorName]{
			query.Weighted(query.VectorName("jeopardy_questions_vector"), 10),
			query.Weighted(query.VectorName("jeopardy_answers_vector"), 10),
		}),
		Limit:          2,
		ReturnMetadata: query.ReturnMetadata{Distance: true},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END MultiTargetRelativeScore
}
