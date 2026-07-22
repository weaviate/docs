package main

import (
	"context"
	"testing"

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
