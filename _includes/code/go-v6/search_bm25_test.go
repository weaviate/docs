package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
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
	// highlight-start
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
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
		// highlight-start
		ReturnMetadata: query.ReturnMetadata{
			Score: true,
		},
		// highlight-end
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
		// highlight-start
		QueryProperties: []string{"question"},
		// highlight-end
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
	// END BM25Boost
}

// setupJeopardyOperators (re)creates JeopardyQuestion with data that tells the
// three search operators apart for the query "African desert wind". One object
// carries every token in a single property, one splits them across question and
// answer, and one carries a single token. The operator tests assert on the
// resulting counts, so an operator the server silently ignores turns them red
// rather than passing on an empty result set.
func setupJeopardyOperators(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "JeopardyQuestion")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyQuestion",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
			{Name: "answer", DataType: collections.DataTypeText},
		},
	}); err != nil {
		t.Fatalf("create JeopardyQuestion collection: %v", err)
	}

	o1 := uuid.MustParse("1a2b3c4d-5e6f-4a7b-8c9d-1a2b3c4d5e61")
	o2 := uuid.MustParse("2a2b3c4d-5e6f-4a7b-8c9d-1a2b3c4d5e62")
	o3 := uuid.MustParse("3a2b3c4d-5e6f-4a7b-8c9d-1a2b3c4d5e63")
	jeopardy := client.Collections.Use("JeopardyQuestion")
	if _, err := jeopardy.Data.Insert(ctx,
		// "african" and "desert" in the question, "wind" in the answer: matched
		// by and_cross only.
		&data.Object{UUID: &o1, Properties: map[string]any{
			"question": "This hot African desert is famous for its shifting sands",
			"answer":   "Sahara wind",
		}},
		// All three tokens in one property: matched by and and by and_cross.
		&data.Object{UUID: &o2, Properties: map[string]any{
			"question": "The African desert wind that carries dust across the Atlantic",
			"answer":   "Harmattan",
		}},
		// A single token: matched by or only.
		&data.Object{UUID: &o3, Properties: map[string]any{
			"question": "This African country is home to Mount Kilimanjaro",
			"answer":   "Tanzania",
		}},
	); err != nil {
		t.Fatalf("seed JeopardyQuestion: %v", err)
	}
	waitForCount(t, jeopardy, 3)
}

func TestBM25OperatorOrWithMin(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyOperators(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25OperatorOrWithMin
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "African desert wind",
		// Return objects that match at least this many of the query tokens.
		// highlight-start
		KeywordSimilarity: query.MinimumTokensMatch(1),
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
	// END BM25OperatorOrWithMin

	// All three objects carry at least one token.
	if got := len(response.Objects); got != 3 {
		t.Fatalf("or with minimum_match=1: got %d objects, want 3", got)
	}
}

func TestBM25OperatorAnd(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyOperators(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25OperatorAnd
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "African desert wind",
		// Every token ("african", "desert", "wind") must appear together
		// in a single searched property.
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
	// END BM25OperatorAnd

	// Only the object whose question carries all three tokens matches.
	if got := len(response.Objects); got != 1 {
		t.Fatalf("and: got %d objects, want 1", got)
	}
}

func TestBM25OperatorCrossPropertyAnd(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyOperators(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BM25OperatorCrossPropertyAnd
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query: "African desert wind",
		// Every token must be matched by at least one searched property, but not
		// all by the same one. Requires Weaviate 1.37.15, 1.38.8 or 1.39.0 or
		// newer; older servers ignore this silently and search as a plain OR.
		// highlight-start
		KeywordSimilarity: query.AllTokensMatchCross,
		// highlight-end
		// and_cross errors unless every searched property shares the same
		// tokenization and analyzer settings.
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
	// END BM25OperatorCrossPropertyAnd

	// and_cross matches the object whose tokens are split across question and
	// answer as well as the one that carries them all in the question.
	crossHits := len(response.Objects)
	if crossHits != 2 {
		t.Fatalf("and_cross: got %d objects, want 2", crossHits)
	}

	// Control: the same query under and, over the same properties. A server that
	// does not support and_cross drops the operator silently and answers as
	// plain OR, so pin the difference rather than trusting the query to fail.
	control, err := jeopardy.Query.BM25(ctx, query.BM25{
		Query:             "African desert wind",
		KeywordSimilarity: query.AllTokensMatch,
		QueryProperties:   []string{"question", "answer"},
		Limit:             3,
	})
	if err != nil {
		t.Fatalf("and control: %v", err)
	}
	if andHits := len(control.Objects); andHits != 1 {
		t.Fatalf("and control: got %d objects, want 1", andHits)
	} else if crossHits <= andHits {
		t.Fatalf("and_cross returned %d objects and and returned %d: the server "+
			"is ignoring and_cross", crossHits, andHits)
	}
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
		// highlight-start
		Limit:  3,
		Offset: 1,
		// highlight-end
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
		// highlight-start
		Filter: &filter.Cond{
			Target:   "round",
			Operator: filter.Equal,
			Value:    "Double Jeopardy!",
		},
		// highlight-end
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
