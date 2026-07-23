package main

import (
	"context"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/query"
)

func TestBasicQuery(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticle(t, client)
	defer client.Collections.Delete(ctx, "Article")

	articles := client.Collections.Use("Article")
	if _, err := articles.Data.Insert(ctx, &data.Object{
		Properties: map[string]any{"title": "Hello", "body": "World"},
	}); err != nil {
		t.Fatal(err)
	}

	// START BasicQuery
	response, err := articles.Query.OverAll(ctx, query.OverAll{
		Limit: 2,
	})
	// END BasicQuery
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
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
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
		Limit: 1,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
		Limit:  1,
		Offset: 1,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
		Limit:            1,
		ReturnProperties: []string{"question", "answer", "points"},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
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
		ReturnVectors: []string{"default"},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Vectors["default"].Single)
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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		// The object id is always returned.
		t.Logf("%v", obj.UUID)
	}
	// END GetObjectId
}

// TestGetWithCrossRefs returns properties from cross-referenced objects.
func TestGetWithCrossRefs(t *testing.T) {
	t.Skip("enabled in a later CI tier")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START GetWithCrossRefs
	jeopardy := client.Collections.Use("JeopardyQuestion")
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 2,
		ReturnReferences: []query.Reference{
			{
				PropertyName:     "hasCategory",
				TargetCollection: "JeopardyCategory",
				ReturnProperties: []string{"title"},
			},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END GetWithCrossRefs
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
		ReturnMetadata: query.ReturnMetadata{
			CreatedAt: true,
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		if obj.CreatedAt != nil {
			t.Logf("created at: %v", *obj.CreatedAt)
		}
	}
	// END GetWithMetadata
}

// TestMultiTenancy queries a specific tenant of a multi-tenant collection.
func TestMultiTenancy(t *testing.T) {
	t.Skip("enabled in a later CI tier")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START MultiTenancy
	// Bind the tenant once when you take the collection handle.
	jeopardy := client.Collections.Use("JeopardyQuestion",
		collections.WithTenant("tenantA"),
	)
	response, err := jeopardy.Query.OverAll(ctx, query.OverAll{
		Limit: 2,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END MultiTenancy
}
