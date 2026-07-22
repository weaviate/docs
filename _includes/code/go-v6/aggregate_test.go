package main

import (
	"context"
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
		TotalCount: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	if result.TotalCount != nil {
		t.Logf("object count: %d", *result.TotalCount)
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
		Text: []aggregate.Text{
			{Property: "category", Count: true, TopOccurrences: true},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	category := result.Text["category"]
	for _, occ := range category.TopOccurrences {
		t.Logf("%s occurs %d times", occ.Value, occ.OccursTimes)
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
		Integer: []aggregate.Integer{
			{Property: "points", Count: true, Sum: true, Min: true, Max: true, Mean: true},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	points := result.Integer["points"]
	if points.Sum != nil {
		t.Logf("total points: %d", *points.Sum)
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
		aggregate.GroupBy{Property: "category", Limit: 10},
	)
	if err != nil {
		t.Fatal(err)
	}
	for _, group := range result.Groups {
		t.Logf("group %v", group.Value)
		if points := group.Integer["points"]; points.Count != nil {
			t.Logf("  count: %d", *points.Count)
		}
	}
	// END groupBy
}

// TestAggregateNearVector aggregates the objects returned by a vector search.
// This snippet is not yet wired into a docs page, but it exercises the
// implemented near-vector aggregation path.
func TestAggregateNearVector(t *testing.T) {
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
			Target:     &types.Vector{Single: vector},
			Similarity: query.Distance(0.3),
		},
		ObjectLimit: 10,
		TotalCount:  true,
	})
	if err != nil {
		t.Fatal(err)
	}
	if result.TotalCount != nil {
		t.Logf("matched object count: %d", *result.TotalCount)
	}
	// END AggregateNearVector
}
