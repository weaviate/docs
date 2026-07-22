package main

import (
	"context"
	"testing"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
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
