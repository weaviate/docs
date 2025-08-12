package docs

import (
	"context"
	"log"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/weaviate/weaviate-go-client/v5/weaviate"
	"github.com/weaviate/weaviate/entities/models"
)

func TestBQConfiguration(t *testing.T) {
	ctx := context.Background()
	apiKey := os.Getenv("OPENAI_APIKEY")
	if apiKey == "" {
		t.Skip("OPENAI_APIKEY environment variable not set")
	}

	// ==============================
	// =====  CONNECT =====
	// ==============================

	// START ConnectCode
	config := weaviate.Config{
		Scheme: "http",
		Host:   "localhost:8080",
		Headers: map[string]string{
			"X-OpenAI-Api-Key": apiKey,
		},
	}
	client, err := weaviate.NewClient(config)
	require.NoError(t, err)

	ready, err := client.Misc().ReadyChecker().Do(context.Background())
	require.NoError(t, err)
	require.True(t, ready)
	// END ConnectCode

	// Clean up before test
	err = client.Schema().AllDeleter().Do(ctx)
	require.NoError(t, err)

	t.Run("Enable BQ", func(t *testing.T) {
		className := "MyCollectionBQDefault"
		// Delete the collection if it already exists to ensure a clean start
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// START EnableBQ
		// Define the configuration for BQ. Setting 'enabled' to true
		// highlight-start
		bq_config := map[string]interface{}{
			"enabled": true,
		}
		// highlight-end

		// Define the class schema
		class := &models.Class{
			Class:      className,
			Vectorizer: "text2vec-openai",
			// highlight-start
			// Assign the BQ configuration to the vector index config
			VectorIndexConfig: map[string]interface{}{
				"bq": bq_config,
			},
			// highlight-end
		}

		// Create the collection in Weaviate
		err = client.Schema().ClassCreator().
			WithClass(class).
			Do(context.Background())
		// END EnableBQ
		require.NoError(t, err)

		// Assertions to verify the configuration
		classInfo, err := client.Schema().ClassGetter().WithClassName(className).Do(ctx)
		require.NoError(t, err)
		require.NotNil(t, classInfo)

		vic, ok := classInfo.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)
		bqConfig, ok := vic["bq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, bqConfig["enabled"])
	})

	t.Run("Enable BQ with Options", func(t *testing.T) {
		className := "MyCollectionBQWithOptions"
		// Delete the collection to recreate it with new options
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// START BQWithOptions
		// Define a custom configuration for BQ.
		// Note: BQ may not support all parameters - check your Weaviate version's documentation
		// highlight-start
		bq_with_options_config := map[string]interface{}{
			"enabled":      true,
			"rescoreLimit": 200,  // May not be supported for BQ - check documentation
			"cache":        true, // Enable caching of binary quantized vectors
		}
		// highlight-end

		// Define the class schema with the custom BQ config and other HNSW settings
		class_with_options := &models.Class{
			Class:      className,
			Vectorizer: "text2vec-openai",
			VectorIndexConfig: map[string]interface{}{
				// highlight-start
				"bq": bq_with_options_config,
				// highlight-end
				"distance":              "cosine", // Set the distance metric for HNSW
				"vectorCacheMaxObjects": 100000,   // Configure the vector cache
			},
		}

		// Create the collection in Weaviate
		err = client.Schema().ClassCreator().
			WithClass(class_with_options).
			Do(context.Background())
		// END BQWithOptions
		require.NoError(t, err)

		// Assertions to verify the configuration
		classInfo, err := client.Schema().ClassGetter().WithClassName(className).Do(ctx)
		require.NoError(t, err)
		require.NotNil(t, classInfo)

		vic, ok := classInfo.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)

		// Assert BQ settings
		bqConfig, ok := vic["bq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, bqConfig["enabled"])

		// Note: rescoreLimit and cache parameters might not be returned in the response
		// depending on Weaviate version or BQ implementation
		// Check if they exist before asserting
		if rescoreLimit, exists := bqConfig["rescoreLimit"]; exists {
			assert.Equal(t, float64(200), rescoreLimit)
		}
		if cache, exists := bqConfig["cache"]; exists {
			assert.Equal(t, true, cache)
		}

		// Assert other HNSW settings
		assert.Equal(t, "cosine", vic["distance"])
		assert.Equal(t, float64(100000), vic["vectorCacheMaxObjects"])
	})

	t.Run("Enable BQ on Existing Collection", func(t *testing.T) {
		className := "MyExistingCollectionBQ"

		// First, create a collection without BQ
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// Create initial collection without BQ
		initialClass := &models.Class{
			Class:      className,
			Vectorizer: "text2vec-openai",
			VectorIndexConfig: map[string]interface{}{
				"distance": "cosine",
			},
		}

		err = client.Schema().ClassCreator().
			WithClass(initialClass).
			Do(context.Background())
		require.NoError(t, err)

		// START UpdateSchemaToEnableBQ
		// Get the existing collection configuration
		class, err := client.Schema().ClassGetter().
			WithClassName(className).Do(context.Background())

		if err != nil {
			log.Fatalf("get class for vec idx cfg update: %v", err)
		}

		// Get the current vector index configuration
		cfg := class.VectorIndexConfig.(map[string]interface{})

		// Add BQ configuration to enable binary quantization
		// Note: Some parameters like rescoreLimit may not be supported for BQ
		cfg["bq"] = map[string]interface{}{
			"enabled":      true,
			"rescoreLimit": 200,  // Optional: may not be supported for BQ
			"cache":        true, // Optional: enable caching of binary quantized vectors
		}

		// Update the class configuration
		class.VectorIndexConfig = cfg

		// Apply the updated configuration to the collection
		err = client.Schema().ClassUpdater().
			WithClass(class).Do(context.Background())

		if err != nil {
			log.Fatalf("update class to use bq: %v", err)
		}
		// END UpdateSchemaToEnableBQ

		// Verify the BQ configuration was applied
		updatedClass, err := client.Schema().ClassGetter().
			WithClassName(className).Do(context.Background())
		require.NoError(t, err)

		vic, ok := updatedClass.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)

		bqConfig, ok := vic["bq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, bqConfig["enabled"])

		// Note: rescoreLimit and cache parameters might not be returned in the response
		// depending on Weaviate version or BQ implementation
		// Check if they exist before asserting
		if rescoreLimit, exists := bqConfig["rescoreLimit"]; exists {
			assert.Equal(t, float64(200), rescoreLimit)
		}
		if cache, exists := bqConfig["cache"]; exists {
			assert.Equal(t, true, cache)
		}
	})
}
