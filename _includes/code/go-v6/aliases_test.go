package main

import (
	"context"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/query"
)

// The alias snippets below run against a live server. They are kept out of the
// CI run set (compile-only) and skip when executed directly.

// TestCreateAlias points a new alias at an existing collection.
func TestCreateAlias(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
