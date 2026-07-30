package main

import (
	"context"
	"testing"

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
	if _, err := jeopardy.Data.Insert(ctx,
		&data.Object{
			Properties: map[string]any{"question": "This organ removes excess glucose from the blood", "answer": "Liver"},
			Vectors: []types.Vector{
				{Name: "jeopardy_questions_vector", Single: []float32{0.10, 0.21, 0.32}},
				{Name: "jeopardy_answers_vector", Single: []float32{0.20, 0.11, 0.30}},
			},
		},
		&data.Object{
			Properties: map[string]any{"question": "The only living mammal in the order Proboscidea", "answer": "Elephant"},
			Vectors: []types.Vector{
				{Name: "jeopardy_questions_vector", Single: []float32{0.11, 0.20, 0.34}},
				{Name: "jeopardy_answers_vector", Single: []float32{0.14, 0.19, 0.30}},
			},
		},
		&data.Object{
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
	t.Skip("requires a collection with multiple named vectors and a configured vectorizer")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END MultiTargetMultipleNearVectorsV1
}

// TestMultiTargetMultipleNearVectorsV2 assigns a weight to each query vector.
func TestMultiTargetMultipleNearVectorsV2(t *testing.T) {
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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END MultiTargetMultipleNearVectorsV2
}

// TestMultiTargetWithSimpleJoin selects a named join strategy for the target
// vectors.
func TestMultiTargetWithSimpleJoin(t *testing.T) {
	t.Skip("requires a collection with multiple named vectors and a configured vectorizer")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END MultiTargetWithSimpleJoin
}

// TestMultiTargetManualWeights weights the raw distance to each target vector.
func TestMultiTargetManualWeights(t *testing.T) {
	t.Skip("requires a collection with multiple named vectors and a configured vectorizer")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END MultiTargetManualWeights
}

// TestMultiTargetRelativeScore weights the normalized distance to each target
// vector.
func TestMultiTargetRelativeScore(t *testing.T) {
	t.Skip("requires a collection with multiple named vectors and a configured vectorizer")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END MultiTargetRelativeScore
}
