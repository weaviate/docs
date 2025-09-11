// How-to: Manage-collections -> Aliases
package main

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/weaviate/weaviate-go-client/v5/weaviate"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/alias"
	"github.com/weaviate/weaviate/entities/models"
	"github.com/weaviate/weaviate/entities/schema"
)

func Test_ManageAliases(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// START ConnectToWeaviate
	// Connect to local Weaviate instance
	config := weaviate.Config{
		Scheme: "http",
		Host:   "localhost:8080",
	}
	client, err := weaviate.NewClient(config)
	require.NoError(t, err)
	// END ConnectToWeaviate

	// Check if Weaviate is ready
	ready, err := client.Misc().ReadyChecker().Do(ctx)
	require.NoError(t, err)
	require.True(t, ready)

	// Cleanup before tests
	cleanup := func() {
		// Clean up aliases
		aliasesToDelete := []string{"ArticlesProd", "MyArticles", "Products"}
		for _, aliasName := range aliasesToDelete {
			_ = client.Alias().AliasDeleter().WithAliasName(aliasName).Do(ctx)
		}

		// Clean up collections
		collectionsToDelete := []string{"Articles", "ArticlesV2", "Products_v1", "Products_v2", "MyArticles"}
		for _, className := range collectionsToDelete {
			_ = client.Schema().ClassDeleter().WithClassName(className).Do(ctx)
		}
	}

	cleanup()
	defer cleanup()

	t.Run("create alias", func(t *testing.T) {
		// CreateAlias START
		// Create a collection first
		err := client.Schema().ClassCreator().WithClass(&models.Class{
			Class:      "Articles",
			Vectorizer: "none",
			Properties: []*models.Property{
				{Name: "title", DataType: schema.DataTypeText.PropString()},
				{Name: "content", DataType: schema.DataTypeText.PropString()},
			},
		}).Do(ctx)

		require.NoError(t, err)

		// Create an alias pointing to the collection
		err = client.Alias().AliasCreator().WithAlias(&alias.Alias{
			Alias: "ArticlesProd",
			Class: "Articles",
		}).Do(ctx)
		// CreateAlias END

		require.NoError(t, err)
	})

	t.Run("list all aliases", func(t *testing.T) {
		// ListAllAliases START
		// Get all aliases in the instance
		allAliases, err := client.Alias().Getter().Do(ctx)

		require.NoError(t, err)

		// Filter to show only aliases from this example
		for _, aliasInfo := range allAliases {
			if aliasInfo.Class == "Articles" || aliasInfo.Class == "ArticlesV2" {
				fmt.Printf("Alias: %s -> Collection: %s\n", aliasInfo.Alias, aliasInfo.Class)
			}
		}
		// ListAllAliases END

		assert.Greater(t, len(allAliases), 0)
	})

	t.Run("list collection aliases", func(t *testing.T) {
		// ListCollectionAliases START
		// Get all aliases pointing to a specific collection
		collectionAliases, err := client.Alias().Getter().WithClassName("Articles").Do(ctx)

		require.NoError(t, err)

		for _, aliasInfo := range collectionAliases {
			fmt.Printf("Alias pointing to Articles: %s\n", aliasInfo.Alias)
		}
		// ListCollectionAliases END

		assert.Equal(t, 1, len(collectionAliases))
		assert.Equal(t, "ArticlesProd", collectionAliases[0].Alias)
	})

	t.Run("get alias", func(t *testing.T) {
		// GetAlias START
		// Get information about a specific alias
		aliasInfo, err := client.Alias().AliasGetter().WithAliasName("ArticlesProd").Do(ctx)

		require.NoError(t, err)

		if aliasInfo != nil {
			fmt.Printf("Alias: %s\n", aliasInfo.Alias)
			fmt.Printf("Target collection: %s\n", aliasInfo.Class)
		}
		// GetAlias END

		assert.Equal(t, "ArticlesProd", aliasInfo.Alias)
		assert.Equal(t, "Articles", aliasInfo.Class)
	})

	t.Run("update alias", func(t *testing.T) {
		// UpdateAlias START
		// Create a new collection for migration
		err := client.Schema().ClassCreator().WithClass(&models.Class{
			Class:      "ArticlesV2",
			Vectorizer: "none",
			Properties: []*models.Property{
				{Name: "title", DataType: schema.DataTypeText.PropString()},
				{Name: "content", DataType: schema.DataTypeText.PropString()},
				{Name: "author", DataType: schema.DataTypeText.PropString()}, // New field
			},
		}).Do(ctx)

		require.NoError(t, err)

		// Update the alias to point to the new collection
		err = client.Alias().AliasUpdater().WithAlias(&alias.Alias{
			Alias: "ArticlesProd",
			Class: "ArticlesV2",
		}).Do(ctx)

		if err == nil {
			fmt.Println("Alias updated successfully")
		}
		// UpdateAlias END

		require.NoError(t, err)

		// Verify the update
		updatedAlias, err := client.Alias().AliasGetter().WithAliasName("ArticlesProd").Do(ctx)
		require.NoError(t, err)
		assert.Equal(t, "ArticlesV2", updatedAlias.Class)
	})

	t.Run("delete alias", func(t *testing.T) {
		// Ensure Articles collection exists for UseAlias example
		_ = client.Schema().ClassDeleter().WithClassName("Articles").Do(ctx)
		err := client.Schema().ClassCreator().WithClass(&models.Class{
			Class:      "Articles",
			Vectorizer: "none",
			Properties: []*models.Property{
				{Name: "title", DataType: schema.DataTypeText.PropString()},
				{Name: "content", DataType: schema.DataTypeText.PropString()},
			},
		}).Do(ctx)
		require.NoError(t, err)

		// DeleteAlias START
		// Delete an alias (the underlying collection remains)
		err = client.Alias().AliasDeleter().WithAliasName("ArticlesProd").Do(ctx)
		// DeleteAlias END

		// Should succeed even if alias doesn't exist
		assert.NoError(t, err)
	})

	t.Run("use alias", func(t *testing.T) {
		// UseAlias START
		// Create an alias for easier access
		err := client.Alias().AliasCreator().WithAlias(&alias.Alias{
			Alias: "MyArticles",
			Class: "Articles",
		}).Do(ctx)

		require.NoError(t, err)

		// Use the alias just like a collection name

		// Insert data using the alias
		w, err := client.Data().Creator().
			WithClassName("MyArticles").
			WithProperties(map[string]interface{}{
				"title":   "Using Aliases in Weaviate",
				"content": "Aliases make collection management easier...",
			}).Do(ctx)

		require.NoError(t, err)

		// Query using the alias
		result, err := client.Data().ObjectsGetter().
			WithClassName("MyArticles").
			WithLimit(5).
			Do(ctx)

		require.NoError(t, err)

		for _, obj := range result {
			if title, ok := obj.Properties.(map[string]interface{})["title"]; ok {
				fmt.Printf("Found: %v\n", title)
			}
		}
		// UseAlias END

		require.NoError(t, err)
		assert.NotNil(t, w)
		assert.Greater(t, len(result), 0)
	})

	t.Run("migration example", func(t *testing.T) {
		// START Step1CreateOriginal
		// Create original collection with data
		err := client.Schema().ClassCreator().WithClass(&models.Class{
			Class:      "Products_v1",
			Vectorizer: "none",
		}).Do(ctx)

		require.NoError(t, err)

		// Insert data into Products_v1
		objects := []*models.Object{
			{
				Class: "Products_v1",
				Properties: map[string]interface{}{
					"name":  "Product A",
					"price": 100,
				},
			},
			{
				Class: "Products_v1",
				Properties: map[string]interface{}{
					"name":  "Product B",
					"price": 200,
				},
			},
		}

		_, err = client.Batch().ObjectsBatcher().
			WithObjects(objects...).
			Do(ctx)

		require.NoError(t, err)
		// END Step1CreateOriginal

		// START Step2CreateAlias
		// Create alias pointing to current collection
		err = client.Alias().AliasCreator().WithAlias(&alias.Alias{
			Alias: "Products",
			Class: "Products_v1",
		}).Do(ctx)

		require.NoError(t, err)
		// END Step2CreateAlias

		// START MigrationUseAlias
		// Your application always uses the alias name "Products"
		// Insert data through the alias
		_, err = client.Data().Creator().WithClassName("Products").WithProperties(map[string]interface{}{
			"name":  "Product C",
			"price": 300,
		}).Do(ctx)
		require.NoError(t, err)

		// Query through the alias
		resp, err := client.Data().ObjectsGetter().WithClassName("Products").WithLimit(5).Do(ctx)
		require.NoError(t, err)
		for _, obj := range resp {
			props := obj.Properties.(map[string]interface{})
			t.Logf("Product: %v, Price: $%v", props["name"], props["price"])
		}
		// END MigrationUseAlias

		// START Step3NewCollection
		// Create new collection with updated schema
		err = client.Schema().ClassCreator().WithClass(&models.Class{
			Class:      "Products_v2",
			Vectorizer: "none",
			Properties: []*models.Property{
				{Name: "name", DataType: schema.DataTypeText.PropString()},
				{Name: "price", DataType: schema.DataTypeNumber.PropString()},
				{Name: "category", DataType: schema.DataTypeText.PropString()}, // New field
			},
		}).Do(ctx)

		require.NoError(t, err)
		// END Step3NewCollection

		// START Step4MigrateData
		// Migrate data to new collection
		oldData, err := client.Data().ObjectsGetter().
			WithClassName("Products_v1").
			Do(ctx)

		require.NoError(t, err)

		for _, obj := range oldData {
			props := obj.Properties.(map[string]interface{})
			_, err = client.Data().Creator().
				WithClassName("Products_v2").
				WithProperties(map[string]interface{}{
					"name":     props["name"],
					"price":    props["price"],
					"category": "General", // Default value for new field
				}).Do(ctx)

			require.NoError(t, err)
		}
		// END Step4MigrateData

		// START Step5UpdateAlias
		// Switch alias to new collection (instant switch!)
		err = client.Alias().AliasUpdater().WithAlias(&alias.Alias{
			Alias: "Products",
			Class: "Products_v2",
		}).Do(ctx)

		require.NoError(t, err)

		// All queries using "Products" alias now use the new collection
		result, err := client.Data().ObjectsGetter().
			WithClassName("Products").
			WithLimit(1).
			Do(ctx)

		require.NoError(t, err)

		if len(result) > 0 {
			fmt.Printf("%v\n", result[0].Properties) // Will include the new "category" field
		}
		// END Step5UpdateAlias

		// START Step6Cleanup
		// Clean up old collection after verification
		err = client.Schema().ClassDeleter().WithClassName("Products_v1").Do(ctx)
		// END Step6Cleanup

		// Error is expected if collection has data or other dependencies
		// In production, you'd want to ensure the collection is empty first
		assert.NoError(t, err)

		// Verify migration worked
		assert.Greater(t, len(result), 0)
		props := result[0].Properties.(map[string]interface{})
		assert.Equal(t, "General", props["category"])
	})

	t.Run("error handling", func(t *testing.T) {
		// Test creating alias for non-existent collection
		err := client.Alias().AliasCreator().WithAlias(&alias.Alias{
			Alias: "NonExistentAlias",
			Class: "NonExistentClass",
		}).Do(ctx)
		assert.Error(t, err)

		// Test getting non-existent alias
		_, err = client.Alias().AliasGetter().WithAliasName("DoesNotExist").Do(ctx)
		assert.Error(t, err)

		// Test deleting non-existent alias
		err = client.Alias().AliasDeleter().WithAliasName("DoesNotExist").Do(ctx)
		assert.Error(t, err)
	})
}
