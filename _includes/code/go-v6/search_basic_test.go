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
	"github.com/weaviate/weaviate-go-client/v6/tenant"
	"github.com/weaviate/weaviate-go-client/v6/types"
)

func TestBasicQuery(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticle(t, client)
	defer client.Collections.Delete(ctx, "Article")

	articles := client.Collections.Use("Article")
	// Fixed, non-leading-zero id keeps the query deterministic (a server-assigned
	// 0x00-leading id flakes the gRPC reply; see filterByIdSeedUUID in main_test.go).
	id := uuid.MustParse("d1e2f3a4-b5c6-4d7e-8f9a-3b4c5d6e7f8a")
	if _, err := articles.Data.Insert(ctx, &data.Object{
		UUID:       &id,
		Properties: map[string]any{"title": "Hello", "body": "World"},
	}); err != nil {
		t.Fatal(err)
	}

	// START BasicQuery
	response, err := articles.Query.OverAll(ctx, query.OverAll{
		Limit: 2,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BasicQuery
}

// TestBasicGet lists objects without any search parameters.
func TestBasicGet(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START BasicGet
	jeopardy := client.Collections.Use("JeopardyQuestion")
	// highlight-start
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{})
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END BasicGet
}

// TestGetWithLimit caps the number of returned objects.
func TestGetWithLimit(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetWithLimit
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		// highlight-start
		Limit: 1,
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END GetWithLimit
}

// TestGetWithOffset paginates with limit and offset.
func TestGetWithOffset(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetWithOffset
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		// highlight-start
		Limit:  1,
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
	// END GetWithOffset
}

// TestGetProperties returns a subset of object properties.
func TestGetProperties(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetProperties
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		// highlight-start
		Limit:            1,
		ReturnProperties: []string{"question", "answer", "points"},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END GetProperties
}

// TestGetObjectVector returns the object vector alongside the results.
func TestGetObjectVector(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetObjectVector
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 1,
		// Name the vectors to return; use "default" for a single unnamed vector.
		// highlight-start
		ReturnVectors: []string{"default"},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Vectors["default"].Single)
	}
	// END GetObjectVector
}

// TestGetObjectId reads the object id (uuid) from the results.
func TestGetObjectId(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetObjectId
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 1,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		// The object id is always returned.
		// highlight-start
		fmt.Printf("%v\n", obj.UUID)
		// highlight-end
	}
	// END GetObjectId
}

// TestGetWithCrossRefs returns properties from cross-referenced objects.
func TestGetWithCrossRefs(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyDemo(t, client)
	defer cleanupJeopardyDemo(ctx, client)

	// START GetWithCrossRefs
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 2,
		// highlight-start
		ReturnReferences: []query.Reference{
			{
				PropertyName:     "hasCategory",
				TargetCollection: "JeopardyCategory",
				ReturnProperties: []string{"title"},
			},
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties["question"])
		// Print the referenced objects.
		refs := obj.References.(map[string][]types.Object[map[string]any])
		for _, ref := range refs["hasCategory"] {
			fmt.Printf("%v\n", ref.Properties)
		}
	}
	// END GetWithCrossRefs

	var nrefs int
	for _, obj := range response.Objects {
		nrefs += len(obj.References.(map[string][]types.Object[map[string]any])["hasCategory"])
	}
	if nrefs == 0 {
		t.Fatal("no referenced objects returned")
	}
}

// TestGetWithMetadata returns object metadata such as the creation timestamp.
func TestGetWithMetadata(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardySearch(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START GetWithMetadata
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 1,
		// highlight-start
		ReturnMetadata: query.ReturnMetadata{
			CreatedAt: true,
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		if obj.CreatedAt != nil {
			fmt.Printf("created at: %v\n", *obj.CreatedAt)
		}
	}
	// END GetWithMetadata
}

// setupWineReviewMTSearch (re)creates the multi-tenant WineReviewMT collection
// with tenantA and seeds it, for the tenant search snippet.
func setupWineReviewMTSearch(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "WineReviewMT")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "WineReviewMT",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "review_body", DataType: collections.DataTypeText},
		},
		MultiTenancy: &collections.MultiTenancyConfig{Enabled: true},
	}); err != nil {
		t.Fatalf("create WineReviewMT: %v", err)
	}
	if err := client.Collections.Use("WineReviewMT").Tenants.Create(ctx, tenant.Tenant{Name: "tenantA"}); err != nil {
		t.Fatalf("create tenantA: %v", err)
	}
	tenantA := client.Collections.Use("WineReviewMT", collections.WithTenant("tenantA"))
	w1 := uuid.MustParse("9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d")
	if _, err := tenantA.Data.Insert(ctx, &data.Object{UUID: &w1, Properties: map[string]any{
		"title":       "Schloss Vollrads Riesling",
		"review_body": "A sweet white wine with notes of peach and honey.",
	}}); err != nil {
		t.Fatalf("seed tenantA: %v", err)
	}
	waitForCount(t, tenantA, 1)
}

// TestMultiTenancy queries a specific tenant of a multi-tenant collection.
func TestMultiTenancy(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupWineReviewMTSearch(t, client)
	defer client.Collections.Delete(ctx, "WineReviewMT")

	// START MultiTenancy
	// Bind the tenant once when you take the collection handle.
	// highlight-start
	reviews := client.Collections.Use("WineReviewMT",
		collections.WithTenant("tenantA"),
	)
	// highlight-end
	response, err := reviews.Query.OverAll(ctx, query.OverAll{
		ReturnProperties: []string{"review_body", "title"},
		Limit:            1,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END MultiTenancy

	if len(response.Objects) != 1 || response.Objects[0].Properties["title"] != "Schloss Vollrads Riesling" {
		t.Fatalf("tenant query returned %d objects", len(response.Objects))
	}
}
