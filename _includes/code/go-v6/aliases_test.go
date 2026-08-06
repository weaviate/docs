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
		// handle error
		panic(err)
	}
	for _, a := range aliases {
		fmt.Printf("alias %q -> collection %q\n", a.Alias, a.Collection)
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
		// handle error
		panic(err)
	}
	// The client lists all aliases; filter by the target collection.
	for _, a := range aliases {
		if a.Collection == "Article" {
			fmt.Printf("alias %q -> collection %q\n", a.Alias, a.Collection)
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
		// handle error
		panic(err)
	}
	fmt.Printf("alias %q -> collection %q\n", alias.Alias, alias.Collection)
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
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END UseAlias
}

// TestAliasMigrationTutorial runs the zero-downtime migration tutorial end to end
// as a single live sequence: create the original collection, expose it through an
// alias, add data through the alias, create a new collection version, migrate the
// data, switch the alias, then clean up. Each rendered step snippet stays clean on
// its own; the isolation and async-index-settle scaffolding lives between the
// markers. Objects carry fixed, non-leading-zero UUIDs so the reads that follow
// each write are deterministic (a server-assigned 0x00-leading id truncates in the
// gRPC id_as_bytes reply and flakes queries; see filterByIdSeedUUID). The migration
// preserves those ids in the new collection so the final read is safe too.
func TestAliasMigrationTutorial(t *testing.T) {
	// START ConnectToWeaviate
	ctx := context.Background()
	client, err := weaviate.NewLocal(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()
	// END ConnectToWeaviate

	// Delete-before-create isolation, and a deferred cleanup that runs while the
	// client is still open (defers are LIFO, so this runs before client.Close).
	cleanup := func() {
		_ = client.Alias.Delete(ctx, "ProductsAlias")
		_ = client.Collections.Delete(ctx, "Products_v1")
		_ = client.Collections.Delete(ctx, "Products_v2")
	}
	cleanup()
	defer cleanup()

	// START Step1CreateOriginal
	// Create the original collection and add some products.
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Products_v1",
		Properties: []collections.Property{
			{Name: "name", DataType: collections.DataTypeText},
			{Name: "price", DataType: collections.DataTypeNumber},
		},
	}); err != nil {
		// handle error
		panic(err)
	}

	productsV1 := client.Collections.Use("Products_v1")
	productA := uuid.MustParse("a1a2a3a4-b1b2-4c00-8d00-e1e2e3e4e5e6")
	productB := uuid.MustParse("b1b2b3b4-c1c2-4d00-8e00-f1f2f3f4f5f6")
	if _, err := productsV1.Data.Insert(ctx,
		&data.Object{UUID: &productA, Properties: map[string]any{"name": "Product A", "price": 100}},
		&data.Object{UUID: &productB, Properties: map[string]any{"name": "Product B", "price": 200}},
	); err != nil {
		// handle error
		panic(err)
	}
	// END Step1CreateOriginal

	waitForCount(t, productsV1, 2)

	// START Step2CreateAlias
	// Point an alias at the current collection. Your application uses this alias.
	if err := client.Alias.Create(ctx, collections.Alias{
		Alias:      "ProductsAlias",
		Collection: "Products_v1",
	}); err != nil {
		// handle error
		panic(err)
	}
	// END Step2CreateAlias

	// START MigrationUseAlias
	// Application code refers only to the alias, never the underlying collection.
	products := client.Collections.Use("ProductsAlias")

	// Insert data through the alias.
	productC := uuid.MustParse("c1c2c3c4-d1d2-4e00-8f00-a1a2a3a4a5a6")
	if _, err := products.Data.Insert(ctx,
		&data.Object{UUID: &productC, Properties: map[string]any{"name": "Product C", "price": 300}},
	); err != nil {
		// handle error
		panic(err)
	}

	// Query through the alias.
	response, err := products.Query.OverAll(ctx, query.OverAll{Limit: 5})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("Product: %v, Price: %v\n", obj.Properties["name"], obj.Properties["price"])
	}
	// END MigrationUseAlias

	waitForCount(t, productsV1, 3)

	// START Step3NewCollection
	// Create the new collection version, adding a "category" property.
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Products_v2",
		Properties: []collections.Property{
			{Name: "name", DataType: collections.DataTypeText},
			{Name: "price", DataType: collections.DataTypeNumber},
			{Name: "category", DataType: collections.DataTypeText}, // New field
		},
	}); err != nil {
		// handle error
		panic(err)
	}
	// END Step3NewCollection

	// START Step4MigrateData
	// Copy every object into the new collection, adding a default value for the
	// new "category" field and preserving each object's id.
	productsV2 := client.Collections.Use("Products_v2")
	oldData, err := productsV1.Query.OverAll(ctx, query.OverAll{Limit: 100})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range oldData.Objects {
		uid := obj.UUID
		if _, err := productsV2.Data.Insert(ctx, &data.Object{
			UUID: &uid,
			Properties: map[string]any{
				"name":     obj.Properties["name"],
				"price":    obj.Properties["price"],
				"category": "General", // Default value for the new field
			},
		}); err != nil {
			// handle error
			panic(err)
		}
	}
	// END Step4MigrateData

	waitForCount(t, productsV2, 3)

	// START Step5UpdateAlias
	// Switch the alias to the new collection. The change is instantaneous.
	if err := client.Alias.Update(ctx, collections.Alias{
		Alias:      "ProductsAlias",
		Collection: "Products_v2",
	}); err != nil {
		// handle error
		panic(err)
	}

	// Every query through the alias now reaches the new collection.
	products = client.Collections.Use("ProductsAlias")
	result, err := products.Query.OverAll(ctx, query.OverAll{Limit: 1})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range result.Objects {
		fmt.Printf("%v\n", obj.Properties) // Includes the new "category" field
	}
	// END Step5UpdateAlias

	// START Step6Cleanup
	// After verifying the migration, delete the old collection.
	if err := client.Collections.Delete(ctx, "Products_v1"); err != nil {
		// handle error
		panic(err)
	}
	// END Step6Cleanup
}
