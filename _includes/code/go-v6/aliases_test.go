package main

import (
	"context"
	"testing"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/query"
)

// The alias snippets run live against the local instance. Aliases are
// instance-global, so each test seeds the collections it needs (Article and
// ArticlesV2) and the specific alias it operates on, rather than depending on
// the order the tests execute in.

// setupArticleForAliases (re)creates Article and ArticlesV2 and seeds Article so
// a query through an alias returns data.
func setupArticleForAliases(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "Article")
	_ = client.Collections.Delete(ctx, "ArticlesV2")
	for _, name := range []string{"Article", "ArticlesV2"} {
		if _, err := client.Collections.Create(ctx, collections.Collection{
			Name: name,
			Properties: []collections.Property{
				{Name: "title", DataType: collections.DataTypeText},
				{Name: "body", DataType: collections.DataTypeText},
			},
		}); err != nil {
			t.Fatalf("create %s collection: %v", name, err)
		}
	}
	articles := client.Collections.Use("Article")
	// Fixed, non-leading-zero ids keep the alias query deterministic (a
	// server-assigned 0x00-leading id flakes gRPC queries; see filterByIdSeedUUID).
	a1 := uuid.MustParse("b1c2d3e4-f5a6-4b7c-8d9e-1f2a3b4c5d6e")
	a2 := uuid.MustParse("c1d2e3f4-a5b6-4c7d-8e9f-2a3b4c5d6e7f")
	if _, err := articles.Data.Insert(ctx,
		&data.Object{UUID: &a1, Properties: map[string]any{"title": "Weaviate", "body": "An open-source vector database"}},
		&data.Object{UUID: &a2, Properties: map[string]any{"title": "Vectors", "body": "Numeric representations of data"}},
	); err != nil {
		t.Fatalf("seed Article: %v", err)
	}
	waitForCount(t, articles, 2)
}

// ensureAlias (re)creates an alias pointing at a collection, replacing any alias
// of the same name so the read/update/delete alias tests have a known starting
// point regardless of execution order.
func ensureAlias(t *testing.T, client *weaviate.Client, alias, collection string) {
	t.Helper()
	ctx := context.Background()
	_ = client.Alias.Delete(ctx, alias)
	if err := client.Alias.Create(ctx, collections.Alias{Alias: alias, Collection: collection}); err != nil {
		t.Fatalf("create alias %s: %v", alias, err)
	}
}

// cleanupAliases removes the alias and collections created for the alias
// snippets. Call it with defer so the deletes run while the client is open.
func cleanupAliases(ctx context.Context, client *weaviate.Client) {
	_ = client.Alias.Delete(ctx, "ArticlesProd")
	_ = client.Collections.Delete(ctx, "Article")
	_ = client.Collections.Delete(ctx, "ArticlesV2")
}

// TestCreateAlias points a new alias at an existing collection.
func TestCreateAlias(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticleForAliases(t, client)
	_ = client.Alias.Delete(ctx, "ArticlesProd") // clean slate: the snippet creates it
	defer cleanupAliases(ctx, client)

	// START CreateAlias
	err := client.Alias.Create(ctx, collections.Alias{
		Alias:      "ArticlesProd",
		Collection: "Article",
	})
	// END CreateAlias
	if err != nil {
		t.Fatal(err)
	}
}

// TestListAllAliases lists every alias defined in the instance.
func TestListAllAliases(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticleForAliases(t, client)
	ensureAlias(t, client, "ArticlesProd", "Article")
	defer cleanupAliases(ctx, client)

	// START ListAllAliases
	aliases, err := client.Alias.List(ctx)
	if err != nil {
		t.Fatal(err)
	}
	for _, a := range aliases {
		t.Logf("alias %q -> collection %q", a.Alias, a.Collection)
	}
	// END ListAllAliases
}

// TestListCollectionAliases keeps only the aliases that point at one collection.
func TestListCollectionAliases(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticleForAliases(t, client)
	ensureAlias(t, client, "ArticlesProd", "Article")
	defer cleanupAliases(ctx, client)

	// START ListCollectionAliases
	aliases, err := client.Alias.List(ctx)
	if err != nil {
		t.Fatal(err)
	}
	// The client lists all aliases; filter by the target collection.
	for _, a := range aliases {
		if a.Collection == "Article" {
			t.Logf("alias %q -> collection %q", a.Alias, a.Collection)
		}
	}
	// END ListCollectionAliases
}

// TestGetAlias fetches a single alias by name.
func TestGetAlias(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticleForAliases(t, client)
	ensureAlias(t, client, "ArticlesProd", "Article")
	defer cleanupAliases(ctx, client)

	// START GetAlias
	alias, err := client.Alias.Get(ctx, "ArticlesProd")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("alias %q -> collection %q", alias.Alias, alias.Collection)
	// END GetAlias
}

// TestUpdateAlias re-points an existing alias at a different collection.
func TestUpdateAlias(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticleForAliases(t, client)
	ensureAlias(t, client, "ArticlesProd", "Article")
	defer cleanupAliases(ctx, client)

	// START UpdateAlias
	err := client.Alias.Update(ctx, collections.Alias{
		Alias:      "ArticlesProd",
		Collection: "ArticlesV2",
	})
	// END UpdateAlias
	if err != nil {
		t.Fatal(err)
	}
}

// TestDeleteAlias removes an alias. The underlying collection is untouched.
func TestDeleteAlias(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticleForAliases(t, client)
	ensureAlias(t, client, "ArticlesProd", "Article")
	defer cleanupAliases(ctx, client)

	// START DeleteAlias
	err := client.Alias.Delete(ctx, "ArticlesProd")
	// END DeleteAlias
	if err != nil {
		t.Fatal(err)
	}
}

// TestUseAlias queries through an alias. Anywhere a collection name is expected,
// an alias name can be used in its place.
func TestUseAlias(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticleForAliases(t, client)
	ensureAlias(t, client, "ArticlesProd", "Article")
	defer cleanupAliases(ctx, client)

	// START UseAlias
	// "ArticlesProd" is an alias; the query runs against its target collection.
	articles := client.Collections.Use("ArticlesProd")
	response, err := articles.Query.OverAll(ctx, query.OverAll{
		Limit: 2,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END UseAlias
}
