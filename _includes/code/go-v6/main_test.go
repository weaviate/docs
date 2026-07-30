package main

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/aggregate"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/tenant"
)

// connectLocal returns a client connected to a local Weaviate instance
// (localhost:8080 REST, localhost:50051 gRPC). This is the connection the
// docs test stack exposes; the insert and query smoke tests dial through it.
func connectLocal(t *testing.T) *weaviate.Client {
	t.Helper()
	ctx := context.Background()
	client, err := weaviate.NewLocal(ctx)
	if err != nil {
		t.Fatalf("connect to local Weaviate: %v", err)
	}
	return client
}

// setupArticle (re)creates a minimal Article collection used by the object and
// query smoke tests. It has no vectorizer, so objects are inserted with
// explicit properties only and read back with a plain fetch.
func setupArticle(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	// Start from a clean slate; ignore the error when the collection is absent.
	_ = client.Collections.Delete(ctx, "Article")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "body", DataType: collections.DataTypeText},
		},
	}); err != nil {
		t.Fatalf("create Article collection: %v", err)
	}
}

// waitForCount polls a collection handle until it reports at least n objects,
// then returns. The docs test instance runs with ASYNC_INDEXING enabled, so
// objects are not guaranteed to be queryable the instant Insert returns; polling
// the aggregate object count settles that race and keeps the seeded tests
// deterministic. For a multi-tenant collection, pass a tenant-bound handle so
// the aggregate is scoped to that tenant.
func waitForCount(t *testing.T, handle *collections.Handle, n int) {
	t.Helper()
	ctx := context.Background()
	deadline := time.Now().Add(30 * time.Second)
	var last int64
	for time.Now().Before(deadline) {
		res, err := handle.Aggregate.OverAll(ctx, aggregate.OverAll{TotalCount: true})
		if err == nil && res.TotalCount != nil {
			last = *res.TotalCount
			if last >= int64(n) {
				return
			}
		}
		time.Sleep(200 * time.Millisecond)
	}
	t.Fatalf("waitForCount: %q reached %d/%d objects before timeout", handle.CollectionName(), last, n)
}

// filterByIdSeedUUID is the id filtered on by TestFilterById; setupJeopardyDemo
// seeds one question with this id so that snippet returns a deterministic match.
const filterByIdSeedUUID = "00037775-1432-35e5-bc59-443baaef7d80"

// Fixed ids for the demo JeopardyCategory rows so questions can be linked to
// them with AddReferences during seeding.
var (
	demoCatAnimals = uuid.MustParse("11111111-1111-4111-8111-111111111111")
	demoCatSports  = uuid.MustParse("22222222-2222-4222-8222-222222222222")
	demoCatScience = uuid.MustParse("33333333-3333-4333-8333-333333333333")
)

// setupJeopardyDemo (re)creates the full JeopardyQuestion demo collection used by
// the filter and cross-reference snippets: a question/answer/category/round/
// points/dateRecorded schema plus a hasCategory reference to a seeded
// JeopardyCategory. It has no vectorizer, so the filter examples run on a plain
// fetch (Query.OverAll) with the filter as the only variable.
//
// The inverted index turns on the null-state, property-length and timestamp
// indexes because the FilterByPropertyNullState, FilterByPropertyLength and
// FilterByTimestamp snippets query those indexes and error without them.
func setupJeopardyDemo(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "JeopardyQuestion")
	_ = client.Collections.Delete(ctx, "JeopardyCategory")

	// The reference target must exist before the collection that points to it.
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyCategory",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
	}); err != nil {
		t.Fatalf("create JeopardyCategory collection: %v", err)
	}
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyQuestion",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
			{Name: "answer", DataType: collections.DataTypeText},
			{Name: "category", DataType: collections.DataTypeText},
			{Name: "round", DataType: collections.DataTypeText},
			{Name: "points", DataType: collections.DataTypeInt},
			{Name: "dateRecorded", DataType: collections.DataTypeDate},
		},
		References: []collections.Reference{
			{Name: "hasCategory", Collections: []string{"JeopardyCategory"}},
		},
		InvertedIndex: &collections.InvertedIndexConfig{
			IndexNullState:      true,
			IndexPropertyLength: true,
			IndexTimestamps:     true,
		},
	}); err != nil {
		t.Fatalf("create JeopardyQuestion collection: %v", err)
	}

	categories := client.Collections.Use("JeopardyCategory")
	if _, err := categories.Data.Insert(ctx,
		&data.Object{UUID: &demoCatAnimals, Properties: map[string]any{"title": "Animals"}},
		&data.Object{UUID: &demoCatSports, Properties: map[string]any{"title": "Sports"}},
		&data.Object{UUID: &demoCatScience, Properties: map[string]any{"title": "Science"}},
	); err != nil {
		t.Fatalf("seed JeopardyCategory: %v", err)
	}

	q1 := uuid.MustParse(filterByIdSeedUUID)
	q2, q3, q5 := uuid.New(), uuid.New(), uuid.New()
	jeopardy := client.Collections.Use("JeopardyQuestion")
	if _, err := jeopardy.Data.Insert(ctx,
		&data.Object{UUID: &q1, Properties: map[string]any{
			"question": "This organ removes excess glucose from the blood & stores it as glycogen",
			"answer":   "Liver", "category": "SCIENCE", "round": "Jeopardy!", "points": 100,
			"dateRecorded": "2021-05-05T00:00:00Z",
		}},
		&data.Object{UUID: &q2, Properties: map[string]any{
			"question": "This large animal, the elephant, is the only living member of Proboscidea",
			"answer":   "Elephant", "category": "ANIMALS", "round": "Double Jeopardy!", "points": 200,
			"dateRecorded": "2022-01-01T00:00:00Z",
		}},
		&data.Object{UUID: &q3, Properties: map[string]any{
			"question": "This tall animal has a long neck and roams the African savanna",
			"answer":   "Giraffe", "category": "ANIMALS", "round": "Double Jeopardy!", "points": 500,
			"dateRecorded": "2023-03-03T00:00:00Z",
		}},
		&data.Object{Properties: map[string]any{
			"question": "Bees build these six-sided structures to store honey in a hive",
			"answer":   "A honeycomb nest built by bees", "category": "NATURE", "round": "Jeopardy!", "points": 200,
			"dateRecorded": "2020-06-06T00:00:00Z",
		}},
		&data.Object{UUID: &q5, Properties: map[string]any{
			"question": "This racket sport holds its most famous tournament at Wimbledon",
			"answer":   "Tennis", "category": "SPORTS", "round": "Final Jeopardy!", "points": 800,
			"dateRecorded": "2021-09-09T00:00:00Z",
		}},
		// A question with no answer so FilterByPropertyNullState has a match.
		&data.Object{Properties: map[string]any{
			"question": "This open-source vector database is written in Go",
			"category": "TECH", "round": "Double Jeopardy!", "points": 400,
			"dateRecorded": "2024-04-04T00:00:00Z",
		}},
	); err != nil {
		t.Fatalf("seed JeopardyQuestion: %v", err)
	}

	// Link a few questions to their categories so the cross-reference filter has
	// data to traverse. Best-effort: only a transport error is fatal.
	if _, err := jeopardy.Data.AddReferences(ctx,
		data.Reference{Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: q1}, UUID: demoCatScience},
		data.Reference{Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: q2}, UUID: demoCatAnimals},
		data.Reference{Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: q3}, UUID: demoCatAnimals},
		data.Reference{Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: q5}, UUID: demoCatSports},
	); err != nil {
		t.Fatalf("seed JeopardyQuestion references: %v", err)
	}

	waitForCount(t, jeopardy, 6)
}

// cleanupJeopardyDemo removes the collections created by setupJeopardyDemo. Call
// it with defer so the delete runs while the client is still open.
func cleanupJeopardyDemo(ctx context.Context, client *weaviate.Client) {
	_ = client.Collections.Delete(ctx, "JeopardyQuestion")
	_ = client.Collections.Delete(ctx, "JeopardyCategory")
}

// Fixed ids for the multi-tenancy seed so TestMtAddCrossRef can reference a real
// source object (a MultiTenancyCollection question in tenantA) and a real target
// object (a JeopardyCategory row) instead of dangling random ids.
var (
	mtSourceID   = uuid.MustParse("44444444-4444-4444-8444-444444444444")
	mtCategoryID = uuid.MustParse("55555555-5555-4555-8555-555555555555")
)

// createMultiTenancyCollection (re)creates the MultiTenancyCollection schema used
// by the multi-tenancy snippets: a multi-tenant question collection with a
// hasCategory reference to a (non-tenant) JeopardyCategory, mirroring the docs
// demo. It creates no tenants and seeds no data, so the AddTenantsToClass snippet
// can create tenantA/tenantB itself.
func createMultiTenancyCollection(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "MultiTenancyCollection")
	_ = client.Collections.Delete(ctx, "JeopardyCategory")

	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyCategory",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
	}); err != nil {
		t.Fatalf("create JeopardyCategory collection: %v", err)
	}
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MultiTenancyCollection",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
		},
		References: []collections.Reference{
			{Name: "hasCategory", Collections: []string{"JeopardyCategory"}},
		},
		MultiTenancy: &collections.MultiTenancyConfig{Enabled: true},
	}); err != nil {
		t.Fatalf("create MultiTenancyCollection: %v", err)
	}
}

// setupMultiTenancy (re)creates MultiTenancyCollection, adds tenantA and seeds it
// with a question (plus a JeopardyCategory row) so the tenant read/search and
// cross-reference snippets have data to work with.
func setupMultiTenancy(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	createMultiTenancyCollection(t, client)

	if _, err := client.Collections.Use("JeopardyCategory").Data.Insert(ctx,
		&data.Object{UUID: &mtCategoryID, Properties: map[string]any{"title": "Software"}},
	); err != nil {
		t.Fatalf("seed JeopardyCategory: %v", err)
	}

	collection := client.Collections.Use("MultiTenancyCollection")
	if err := collection.Tenants.Create(ctx, tenant.Tenant{Name: "tenantA"}); err != nil {
		t.Fatalf("create tenantA: %v", err)
	}

	tenantA := client.Collections.Use("MultiTenancyCollection", collections.WithTenant("tenantA"))
	if _, err := tenantA.Data.Insert(ctx,
		&data.Object{UUID: &mtSourceID, Properties: map[string]any{
			"question": "This vector DB is OSS and supports automatic property type inference on import",
		}},
		&data.Object{Properties: map[string]any{
			"question": "This organ removes excess glucose from the blood & stores it as glycogen",
		}},
	); err != nil {
		t.Fatalf("seed tenantA: %v", err)
	}

	waitForCount(t, tenantA, 2)
}

// cleanupMultiTenancy removes the collections created for the multi-tenancy
// snippets. Call it with defer so the delete runs while the client is still open.
func cleanupMultiTenancy(ctx context.Context, client *weaviate.Client) {
	_ = client.Collections.Delete(ctx, "MultiTenancyCollection")
	_ = client.Collections.Delete(ctx, "JeopardyCategory")
}

// setupMultiTenancyJeopardy (re)creates a multi-tenant JeopardyQuestion
// collection and seeds tenantA. The "read all objects" multi-tenancy search
// snippet binds tenantA on a JeopardyQuestion handle, so this seeds that exact
// collection name (distinct from the non-tenant JeopardyQuestion demo).
func setupMultiTenancyJeopardy(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "JeopardyQuestion")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyQuestion",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
			{Name: "answer", DataType: collections.DataTypeText},
			{Name: "category", DataType: collections.DataTypeText},
			{Name: "points", DataType: collections.DataTypeInt},
		},
		MultiTenancy: &collections.MultiTenancyConfig{Enabled: true},
	}); err != nil {
		t.Fatalf("create multi-tenant JeopardyQuestion: %v", err)
	}

	collection := client.Collections.Use("JeopardyQuestion")
	if err := collection.Tenants.Create(ctx, tenant.Tenant{Name: "tenantA"}); err != nil {
		t.Fatalf("create tenantA: %v", err)
	}

	tenantA := client.Collections.Use("JeopardyQuestion", collections.WithTenant("tenantA"))
	if _, err := tenantA.Data.Insert(ctx,
		&data.Object{Properties: map[string]any{"question": "This organ removes excess glucose from the blood", "answer": "Liver", "category": "SCIENCE", "points": 100}},
		&data.Object{Properties: map[string]any{"question": "The only living mammal in the order Proboscidea", "answer": "Elephant", "category": "ANIMALS", "points": 200}},
	); err != nil {
		t.Fatalf("seed tenantA: %v", err)
	}

	waitForCount(t, tenantA, 2)
}
