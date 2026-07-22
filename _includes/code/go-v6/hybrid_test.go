package main

import (
	"context"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/query/filter"
	"github.com/weaviate/weaviate-go-client/v6/types"
)

// The hybrid snippets query a collection whose vectorizer turns the query
// string into a vector server-side, mirroring the demo datasets used across the
// docs. They connect to a local instance and read the JeopardyQuestion demo
// collection.

func TestHybridBasic(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridBasic
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		Limit: 3,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END HybridBasic
}

func TestHybridWithScore(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridWithScore
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		Limit: 3,
		ReturnMetadata: query.ReturnMetadata{
			Score:        true,
			ExplainScore: true,
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		if obj.Metadata.Score != nil {
			t.Logf("score: %v", *obj.Metadata.Score)
		}
		if obj.Metadata.ExplainScore != nil {
			t.Logf("explain: %v", *obj.Metadata.ExplainScore)
		}
	}
	// END HybridWithScore
}

func TestHybridWithAlpha(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridWithAlpha
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// Alpha of 0 is pure keyword search, 1 is pure vector search.
		Alpha: query.Alpha(0.25),
		Limit: 3,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END HybridWithAlpha
}

func TestHybridWithFusionType(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridWithFusionType
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query:  "food",
		Fusion: query.HybridFusionRelativeScore,
		Limit:  3,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END HybridWithFusionType
}

func TestHybridWithProperties(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridWithProperties
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// Restrict the keyword search to these properties.
		QueryProperties: []string{"question", "answer"},
		Limit:           3,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END HybridWithProperties
}

func TestHybridWithPropertyWeighting(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridWithPropertyWeighting
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// Boost the "question" property with the ^ operator.
		QueryProperties: []string{"question^2", "answer"},
		Limit:           3,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END HybridWithPropertyWeighting
}

func TestHybridWithVector(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridWithVector
	// A query vector, for example an embedding produced by your model.
	vector := []float32{0.12, 0.20, 0.33}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// Supply the vector for the vector-search half of the query.
		NearVector: &query.NearVector{
			Target: &types.Vector{Single: vector},
		},
		Limit: 3,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END HybridWithVector
}

func TestHybridLimit(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridLimit
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		Limit: 3,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END HybridLimit
}

func TestHybridAutocut(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridAutocut
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query:     "food",
		AutoLimit: 1,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END HybridAutocut
}

func TestHybridWithFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START HybridWithFilter
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		Limit: 3,
		Filter: &filter.Cond{
			Target:   "round",
			Operator: filter.Equal,
			Value:    "Double Jeopardy!",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END HybridWithFilter
}
