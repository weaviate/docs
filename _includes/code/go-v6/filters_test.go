package main

import (
	"context"
	"testing"
	"time"

	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/query/filter"
)

// The filter snippets read the JeopardyQuestion demo collection on a local
// instance. Each shows how to express one kind of filter with the query/filter
// package; the search itself is a plain fetch (Query.OverAll) so the filter is
// the only variable.

func TestSingleFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START SingleFilter
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
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
	// END SingleFilter
}

func TestMultipleFiltersAnd(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START MultipleFiltersAnd
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: filter.And{
			&filter.Cond{
				Target:   "round",
				Operator: filter.Equal,
				Value:    "Double Jeopardy!",
			},
			&filter.Cond{
				Target:   "points",
				Operator: filter.LessThan,
				Value:    int64(600),
			},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END MultipleFiltersAnd
}

func TestMultipleFiltersNested(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START MultipleFiltersNested
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: filter.And{
			&filter.Cond{
				Target:   "answer",
				Operator: filter.Like,
				Value:    "*nest*",
			},
			filter.Or{
				&filter.Cond{
					Target:   "points",
					Operator: filter.GreaterThan,
					Value:    int64(700),
				},
				&filter.Cond{
					Target:   "points",
					Operator: filter.LessThan,
					Value:    int64(300),
				},
			},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END MultipleFiltersNested
}

func TestContainsAnyFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ContainsAnyFilter
	// The tokens to match against the tokenized "question" property.
	tokens := []string{"animal", "elephant"}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: &filter.Cond{
			Target:   "question",
			Operator: filter.ContainsAny,
			Value:    tokens,
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END ContainsAnyFilter
}

func TestContainsAllFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ContainsAllFilter
	tokens := []string{"blood", "glucose"}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: &filter.Cond{
			Target:   "question",
			Operator: filter.ContainsAll,
			Value:    tokens,
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END ContainsAllFilter
}

func TestContainsNoneFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ContainsNoneFilter
	tokens := []string{"animal", "elephant"}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: &filter.Cond{
			Target:   "question",
			Operator: filter.ContainsNone,
			Value:    tokens,
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END ContainsNoneFilter
}

func TestLikeFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START LikeFilter
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: &filter.Cond{
			Target:   "answer",
			Operator: filter.Like,
			// "*" matches zero or more characters, "?" matches exactly one.
			Value: "*giraffe*",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END LikeFilter
}

func TestCrossReferenceFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CrossReferenceFilter
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: &filter.Cond{
			// Build a path into the referenced collection with Reference().
			Target:   filter.Reference("hasCategory").Property("title"),
			Operator: filter.Like,
			Value:    "*Sport*",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END CrossReferenceFilter
}

func TestFilterByDate(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START FilterByDate
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: &filter.Cond{
			Target:   "dateRecorded",
			Operator: filter.GreaterThan,
			// Compare date properties against a time.Time value.
			Value: time.Date(2020, time.January, 1, 0, 0, 0, 0, time.UTC),
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END FilterByDate
}

func TestFilterById(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START FilterById
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Filter: &filter.Cond{
			// filter.UUID targets the object's own id.
			Target:   filter.UUID,
			Operator: filter.Equal,
			Value:    "00037775-1432-35e5-bc59-443baaef7d80",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END FilterById
}

func TestFilterByTimestamp(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START FilterByTimestamp
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: &filter.Cond{
			// filter.CreatedAt and filter.LastUpdatedAt target internal timestamps.
			Target:   filter.CreatedAt,
			Operator: filter.GreaterThanEqual,
			Value:    time.Date(2020, time.January, 1, 0, 0, 0, 0, time.UTC),
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END FilterByTimestamp
}

func TestFilterByPropertyLength(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START FilterByPropertyLength
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: &filter.Cond{
			// filter.Len wraps a property in a len(property) target.
			Target:   filter.Len("answer"),
			Operator: filter.GreaterThan,
			Value:    int64(20),
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END FilterByPropertyLength
}

func TestFilterByPropertyNullState(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START FilterByPropertyNullState
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 3,
		Filter: &filter.Cond{
			Target:   "answer",
			Operator: filter.IsNull,
			Value:    true,
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END FilterByPropertyNullState
}

// TestNearTextWithFilter combines a semantic search with a filter. It queries a
// collection whose vectorizer turns the query text into a vector server-side.
func TestNearTextWithFilter(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START NearTextWithFilter
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.NearText(ctx, query.NearText{
		Concepts: []string{"large animals"},
		Limit:    2,
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
	// END NearTextWithFilter
}
