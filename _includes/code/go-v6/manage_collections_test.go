package main

import (
	"context"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
)

func TestCreateCollection(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START CreateCollection
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "body", DataType: collections.DataTypeText},
		},
	})
	// END CreateCollection
	if err != nil {
		t.Fatal(err)
	}
}
