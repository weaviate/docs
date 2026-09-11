package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/aggregate"
	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/types"
)

// The aggregate snippets run against the seeded JeopardyQuestion collection, so
// they execute without an inference module.

func TestAggregateMetaCount(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START MetaCount
	jeopardy := client.Collections.Use("JeopardyQuestion")
	result, err := jeopardy.Aggregate.OverAll(ctx, aggregate.OverAll{
		// highlight-start
		TotalCount: true,
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	if result.TotalCount != nil {
		fmt.Printf("object count: %d\n", *result.TotalCount)
	}
	// END MetaCount
}

func TestAggregateTextProp(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START TextProp
	jeopardy := client.Collections.Use("JeopardyQuestion")
	result, err := jeopardy.Aggregate.OverAll(ctx, aggregate.OverAll{
		// highlight-start
		Text: []aggregate.Text{
			{Property: "category", Count: true, TopOccurrences: true},
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	category := result.Text["category"]
	for _, occ := range category.TopOccurrences {
		fmt.Printf("%s occurs %d times\n", occ.Value, occ.OccursTimes)
	}
	// END TextProp
}

func TestAggregateIntProp(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START IntProp
	jeopardy := client.Collections.Use("JeopardyQuestion")
	result, err := jeopardy.Aggregate.OverAll(ctx, aggregate.OverAll{
		// highlight-start
		Integer: []aggregate.Integer{
			{Property: "points", Count: true, Sum: true, Min: true, Max: true, Mean: true},
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	points := result.Integer["points"]
	if points.Sum != nil {
		fmt.Printf("total points: %d\n", *points.Sum)
	}
	// END IntProp
}

func TestAggregateGroupBy(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START groupBy
	jeopardy := client.Collections.Use("JeopardyQuestion")
	result, err := jeopardy.Aggregate.OverAll.GroupBy(ctx,
		aggregate.OverAll{
			Integer: []aggregate.Integer{
				{Property: "points", Count: true, Sum: true},
			},
		},
		// highlight-start
		aggregate.GroupBy{Property: "category", Limit: 10},
		// highlight-end
	)
	if err != nil {
		// handle error
		panic(err)
	}
	for _, group := range result.Groups {
		fmt.Printf("group %v\n", group.Value)
		if points := group.Integer["points"]; points.Count != nil {
			fmt.Printf("  count: %d\n", *points.Count)
		}
	}
	// END groupBy
}

// TestAggregateNearVector aggregates the objects returned by a vector search.
// This snippet is not yet wired into a docs page, but it exercises the
// implemented near-vector aggregation path.
func TestAggregateNearVector(t *testing.T) {
	// A server-side bug, not a client or snippet issue, and the snippet is wired to
	// no docs page.
	t.Skip("Weaviate 1.38 panics on aggregate near-vector over a BYO-vector collection; fixed in 1.39.x, so re-enable after a live check")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START AggregateNearVector
	vector := []float32{0.12, 0.20, 0.33}

	jeopardy := client.Collections.Use("JeopardyQuestion")
	result, err := jeopardy.Aggregate.NearVector(ctx, aggregate.NearVector{
		Query: query.NearVector{
			Target:     &types.Vector{Name: "default", Single: vector},
			Similarity: query.Distance(0.3),
		},
		ObjectLimit: 10,
		TotalCount:  true,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	if result.TotalCount != nil {
		fmt.Printf("matched object count: %d\n", *result.TotalCount)
	}
	// END AggregateNearVector
}
