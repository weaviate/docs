package main

import (
	"context"
	"fmt"
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

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridBasic
	jeopardy := client.Collections.Use("JeopardyQuestion")
	// highlight-start
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		Limit: 3,
	})
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridBasic
}

func TestHybridWithScore(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridWithScore
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		Limit: 3,
		// highlight-start
		ReturnMetadata: query.ReturnMetadata{
			Score:        true,
			ExplainScore: true,
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		if obj.Metadata.Score != nil {
			fmt.Printf("score: %v\n", *obj.Metadata.Score)
		}
		if obj.Metadata.ExplainScore != nil {
			fmt.Printf("explain: %v\n", *obj.Metadata.ExplainScore)
		}
	}
	// END HybridWithScore
}

func TestHybridWithAlpha(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridWithAlpha
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// Alpha of 0 is pure keyword search, 1 is pure vector search.
		// highlight-start
		Alpha: query.Alpha(0.25),
		// highlight-end
		Limit: 3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridWithAlpha
}

func TestHybridWithFusionType(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridWithFusionType
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// highlight-start
		Fusion: query.HybridFusionRelativeScore,
		// highlight-end
		Limit: 3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridWithFusionType
}

func TestHybridWithProperties(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridWithProperties
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// Restrict the keyword search to these properties.
		// highlight-start
		QueryProperties: []string{"question", "answer"},
		// highlight-end
		Limit: 3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridWithProperties
}

func TestHybridWithPropertyWeighting(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridWithPropertyWeighting
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// Boost the "question" property with the ^ operator.
		// highlight-start
		QueryProperties: []string{"question^2", "answer"},
		// highlight-end
		Limit: 3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridWithPropertyWeighting
}

func TestHybridWithBM25OperatorOrWithMin(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridWithBM25OperatorOrWithMin
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "Australian mammal cute",
		// The keyword half matches objects containing at least this many of
		// the query tokens. The vector half is unaffected.
		// highlight-start
		KeywordSimilarity: query.MinimumTokensMatch(2),
		// highlight-end
		Limit: 3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridWithBM25OperatorOrWithMin
}

func TestHybridWithBM25OperatorAnd(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridWithBM25OperatorAnd
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "Australian mammal cute",
		// Every token must appear together in a single searched property for
		// the keyword half to match.
		// highlight-start
		KeywordSimilarity: query.AllTokensMatch,
		// highlight-end
		Limit: 3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridWithBM25OperatorAnd
}

func TestHybridWithVector(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// The snippet's query vector is three-dimensional, so use the collection that
	// takes caller-supplied vectors rather than the vectorized one.
	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridWithVector
	// A query vector, for example an embedding produced by your model.
	vector := []float32{0.12, 0.20, 0.33}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// Supply the vector for the vector-search half of the query.
		// highlight-start
		NearVector: &query.NearVector{
			Target: &types.Vector{Name: "default", Single: vector},
		},
		// highlight-end
		Limit: 3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridWithVector
}

func TestHybridLimit(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridLimit
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// highlight-start
		Limit: 3,
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridLimit
}

func TestHybridAutocut(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridAutocut
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		// highlight-start
		AutoLimit: 1,
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridAutocut
}

func TestHybridWithFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START HybridWithFilter
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.Hybrid(ctx, query.Hybrid{
		Query: "food",
		Limit: 3,
		// highlight-start
		Filter: &filter.Cond{
			Target:   "round",
			Operator: filter.Equal,
			Value:    "Double Jeopardy!",
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END HybridWithFilter
}
