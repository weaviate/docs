package main

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/weaviate/weaviate-go-client/v6/aggregate"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/types"
)

// The over-all aggregate snippets run against the seeded JeopardyQuestion
// collection without an inference module. The near-text and hybrid aggregate
// snippets use the contextionary-vectorized JeopardyQuestion seed.

// waitSearchVectorsIndexed polls a near-text aggregate until at least n objects
// are in the vector index. With async indexing, an object count can settle
// before the vectors are searchable, and a vector search then misses objects.
func waitSearchVectorsIndexed(t *testing.T, handle *collections.Handle, n int) {
	t.Helper()
	pollVectorIndexCount(t, handle, n, func(ctx context.Context) (*aggregate.Result, error) {
		return handle.Aggregate.NearText(ctx, aggregate.NearText{
			Query:       query.NearText{Concepts: []string{"animals"}},
			ObjectLimit: 1000,
			TotalCount:  true,
		})
	})
}

// waitNearVectorIndexed does the same for a collection that brings its own
// vectors, with a near-vector aggregate over the given vector.
func waitNearVectorIndexed(t *testing.T, handle *collections.Handle, n int, vector []float32) {
	t.Helper()
	pollVectorIndexCount(t, handle, n, func(ctx context.Context) (*aggregate.Result, error) {
		return handle.Aggregate.NearVector(ctx, aggregate.NearVector{
			Query:       query.NearVector{Target: &types.Vector{Single: vector}},
			ObjectLimit: 1000,
			TotalCount:  true,
		})
	})
}

func pollVectorIndexCount(t *testing.T, handle *collections.Handle, n int, count func(context.Context) (*aggregate.Result, error)) {
	t.Helper()
	ctx := context.Background()
	deadline := time.Now().Add(30 * time.Second)
	var last int64
	for time.Now().Before(deadline) {
		res, err := count(ctx)
		if err == nil && res.TotalCount != nil {
			last = *res.TotalCount
			if last >= int64(n) {
				return
			}
		}
		time.Sleep(200 * time.Millisecond)
	}
	t.Fatalf("%q has %d/%d objects in the vector index", handle.CollectionName(), last, n)
}

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
		// handle error
		panic(err)
	}
	if result.TotalCount != nil {
		fmt.Printf("matched object count: %d\n", *result.TotalCount)
	}
	// END AggregateNearVector
}

// TestAggregateNearText aggregates the objects returned by a near-text search,
// capped with an object limit.
func TestAggregateNearText(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")
	waitSearchVectorsIndexed(t, client.Collections.Use("JeopardyQuestion"), 6)

	// START AggregateNearText
	jeopardy := client.Collections.Use("JeopardyQuestion")
	result, err := jeopardy.Aggregate.NearText(ctx, aggregate.NearText{
		Query: query.NearText{
			Concepts: []string{"animals in space"},
		},
		// highlight-start
		ObjectLimit: 10,
		// highlight-end
		Integer: []aggregate.Integer{
			{Property: "points", Sum: true},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	if sum := result.Integer["points"].Sum; sum != nil {
		fmt.Printf("%d\n", *sum)
	}
	// END AggregateNearText

	// The seed holds six objects worth 2100 points, all within the limit.
	if got := result.Integer["points"].Sum; got == nil || *got != 2100 {
		t.Fatalf("points sum = %v, want 2100", got)
	}
}

// TestAggregateDistanceNearText aggregates the objects within a distance of a
// near-text query.
func TestAggregateDistanceNearText(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")
	waitSearchVectorsIndexed(t, client.Collections.Use("JeopardyQuestion"), 6)

	// START AggregateDistanceNearText
	jeopardy := client.Collections.Use("JeopardyQuestion")
	result, err := jeopardy.Aggregate.NearText(ctx, aggregate.NearText{
		Query: query.NearText{
			Concepts: []string{"animals in space"},
			// highlight-start
			Similarity: query.Distance(0.19),
			// highlight-end
		},
		Integer: []aggregate.Integer{
			{Property: "points", Sum: true},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	if sum := result.Integer["points"].Sum; sum != nil {
		fmt.Printf("%d\n", *sum)
	}
	// END AggregateDistanceNearText

	// The aggregate must cover exactly the objects a search with the same cutoff returns.
	hits, err := jeopardy.Query.NearText(ctx, query.NearText{
		Concepts:   []string{"animals in space"},
		Similarity: query.Distance(0.19),
	})
	if err != nil {
		t.Fatal(err)
	}
	var want int64
	for _, obj := range hits.Objects {
		want += obj.Properties["points"].(int64)
	}
	var got int64
	if sum := result.Integer["points"].Sum; sum != nil {
		got = *sum
	}
	if got != want {
		t.Fatalf("points sum = %d, want %d from %d search hits", got, want, len(hits.Objects))
	}
	// Without the cutoff the same aggregate covers all six objects, so a zero
	// here shows the distance was applied.
	if want == 0 {
		all, err := jeopardy.Aggregate.NearText(ctx, aggregate.NearText{
			Query:       query.NearText{Concepts: []string{"animals in space"}},
			ObjectLimit: 10,
			TotalCount:  true,
		})
		if err != nil || all.TotalCount == nil || *all.TotalCount != 6 {
			t.Fatalf("unbounded aggregate: err=%v", err)
		}
	}
}

// TestAggregateHybrid aggregates the objects returned by a hybrid search.
func TestAggregateHybrid(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")
	waitSearchVectorsIndexed(t, client.Collections.Use("JeopardyQuestion"), 6)

	// START AggregateHybrid
	jeopardy := client.Collections.Use("JeopardyQuestion")
	result, err := jeopardy.Aggregate.Hybrid(ctx, aggregate.Hybrid{
		Query: query.Hybrid{
			Query:             "animals in space",
			KeywordSimilarity: query.AllTokensMatch,
		},
		// highlight-start
		ObjectLimit: 10,
		// highlight-end
		Integer: []aggregate.Integer{
			{Property: "points", Sum: true},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	if sum := result.Integer["points"].Sum; sum != nil {
		fmt.Printf("%d\n", *sum)
	}
	// END AggregateHybrid

	if got := result.Integer["points"].Sum; got == nil || *got != 2100 {
		t.Fatalf("points sum = %v, want 2100", got)
	}
}
