package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/query/filter"
)

// The BM25 snippets run a standalone keyword search with collection.Query.BM25.
// They read the JeopardyQuestion demo collection on a local instance. BM25 scores
// keywords only, so the collection's vectorizer plays no part in these queries.

func TestBM25Basic(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25Basic
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "food",
		Limit: 3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BM25Basic
}

func TestBM25Score(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25Score
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "food",
		Limit: 3,
		ReturnMetadata: query.ReturnMetadata{
			Score: true,
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
		if obj.Metadata.Score != nil {
			fmt.Printf("score: %v\n", *obj.Metadata.Score)
		}
	}
	// END BM25Score
}

func TestBM25Properties(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25Properties
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "safety",
		// Search these properties only. By default every searchable text
		// property is considered.
		QueryProperties: []string{"question"},
		Limit:           3,
		ReturnMetadata: query.ReturnMetadata{
			Score: true,
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
		if obj.Metadata.Score != nil {
			fmt.Printf("score: %v\n", *obj.Metadata.Score)
		}
	}
	// END BM25Properties
}

func TestBM25Boost(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25Boost
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "food",
		// Weight a property with the ^ operator: a match in "question"
		// counts double a match in "answer".
		QueryProperties: []string{"question^2", "answer"},
		Limit:           3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BM25Boost
}

func TestBM25OperatorOrWithMin(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25OperatorOrWithMin
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "African desert wind",
		// Return objects that match at least this many of the query tokens.
		KeywordSimilarity: query.MinimumTokensMatch(1),
		Limit:             3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BM25OperatorOrWithMin
}

func TestBM25OperatorAnd(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25OperatorAnd
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "African desert wind",
		// Every token ("african", "desert", "wind") must appear together
		// in a single searched property.
		KeywordSimilarity: query.AllTokensMatch,
		Limit:             3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BM25OperatorAnd
}

func TestBM25OperatorCrossPropertyAnd(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25OperatorCrossPropertyAnd
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "African desert wind",
		// Every token must be matched by at least one searched property, but
		// not all by the same one. Requires Weaviate 1.37.15, 1.38.8 or
		// 1.39.0 or newer: older servers ignore the operator silently and the
		// search behaves as a plain OR.
		KeywordSimilarity: query.AllTokensMatchCross,
		// and_cross errors unless every searched property shares the same
		// tokenization and analyzer settings.
		QueryProperties: []string{"question", "answer"},
		Limit:           3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BM25OperatorCrossPropertyAnd
}

func TestBM25Limit(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25Limit
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "safety",
		// Return at most 3 objects, skipping the first match.
		Limit:  3,
		Offset: 1,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BM25Limit
}

func TestBM25Autocut(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25Autocut
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "safety",
		// Return objects from the first N groups of closely-scoring results.
		AutoLimit: 1,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BM25Autocut
}

func TestBM25Filter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25Filter
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "food",
		Filter: &filter.Cond{
			Target:   "round",
			Operator: filter.Equal,
			Value:    "Double Jeopardy!",
		},
		// Return these properties only.
		ReturnProperties: []string{"answer", "question", "round"},
		Limit:            3,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BM25Filter
}
