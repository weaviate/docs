package main

import (
	"context"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/data"
)

func TestCreateObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticle(t, client)
	defer client.Collections.Delete(ctx, "Article")

	articles := client.Collections.Use("Article")

	// START CreateObject
	res, err := articles.Data.Insert(ctx, &data.Object{
		Properties: map[string]any{
			"title": "Weaviate Go v6",
			"body":  "A smoke-test object inserted by the docs test suite.",
		},
	})
	// END CreateObject
	if err != nil {
		t.Fatal(err)
	}
	for id, msg := range res.Errors {
		if msg != "" {
			t.Fatalf("insert object %s failed: %s", id, msg)
		}
	}
}
