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

func TestPQConfiguration(t *testing.T) {
	ctx := context.Background()
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		t.Skip("OPENAI_API_KEY environment variable not set")
	}

	// ==============================
	// =====  CONNECT =====
	// ==============================

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

	// Clean up before test
	err = client.Schema().AllDeleter().Do(ctx)
	require.NoError(t, err)

	t.Run("Enable PQ", func(t *testing.T) {
		className := "MyCollectionPQDefault"
		// Delete the collection if it already exists to ensure a clean start
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// START EnablePQ
		// Define the configuration for PQ. Setting 'enabled' to true
		// highlight-start
		pq_config := map[string]interface{}{
			"enabled": true,
		}
		// highlight-end

		// Define the class schema
		class := &models.Class{
			Class:      className,
			Vectorizer: "text2vec-openai",
			// highlight-start
			// Assign the PQ configuration to the vector index config
			VectorIndexConfig: map[string]interface{}{
				"pq": pq_config,
			},
			// highlight-end
		}

		// Create the collection in Weaviate
		err = client.Schema().ClassCreator().
			WithClass(class).
			Do(context.Background())
		// END EnablePQ
		require.NoError(t, err)

		// Assertions to verify the configuration
		classInfo, err := client.Schema().ClassGetter().WithClassName(className).Do(ctx)
		require.NoError(t, err)
		require.NotNil(t, classInfo)

		vic, ok := classInfo.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)
		pqConfig, ok := vic["pq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, pqConfig["enabled"])
	})

	t.Run("Enable PQ with Options", func(t *testing.T) {
		className := "MyCollectionPQWithOptions"
		// Delete the collection to recreate it with new options
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// START PQWithOptions
		// Define a custom configuration for PQ.
		// highlight-start
		pq_with_options_config := map[string]interface{}{
			"enabled":       true,
			"trainingLimit": 100000, // The number of vectors to use for training the quantizer
			"segments":      96,     // The number of segments to use for product quantization
			"centroids":     256,    // The number of centroids to use (optional, default 256)
			"encoder": map[string]interface{}{
				"type":         "kmeans", // Encoder type (kmeans or tile)
				"distribution": "normal", // Distribution type for tile encoder
			},
		}
		// highlight-end

		// Define the class schema with the custom PQ config and other HNSW settings
		class_with_options := &models.Class{
			Class:      className,
			Vectorizer: "text2vec-openai",
			VectorIndexConfig: map[string]interface{}{
				// highlight-start
				"pq": pq_with_options_config,
				// highlight-end
			},
		}

		// Create the collection in Weaviate
		err = client.Schema().ClassCreator().
			WithClass(class_with_options).
			Do(context.Background())
		// END PQWithOptions
		require.NoError(t, err)

		// Assertions to verify the configuration
		classInfo, err := client.Schema().ClassGetter().WithClassName(className).Do(ctx)
		require.NoError(t, err)
		require.NotNil(t, classInfo)

		vic, ok := classInfo.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)

		// Assert PQ settings
		pqConfig, ok := vic["pq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, pqConfig["enabled"])
		// JSON numbers are unmarshalled as float64
		assert.Equal(t, float64(100000), pqConfig["trainingLimit"])
		assert.Equal(t, float64(96), pqConfig["segments"])
		assert.Equal(t, float64(256), pqConfig["centroids"])

		// Assert encoder settings if returned
		if encoder, ok := pqConfig["encoder"].(map[string]interface{}); ok {
			assert.Equal(t, "kmeans", encoder["type"])
			assert.Equal(t, "normal", encoder["distribution"])
		}
	})

	t.Run("Enable PQ on Existing Collection", func(t *testing.T) {
		className := "Question"

		// First, create a collection without PQ
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// START InitialSchema
		// Create initial collection without PQ
		initialClass := &models.Class{
			Class:      className,
			Vectorizer: "text2vec-openai",
			Properties: []*models.Property{
				{Name: "question", DataType: []string{"text"}},
				{Name: "answer", DataType: []string{"text"}},
			},
			VectorIndexConfig: map[string]interface{}{
				"distance": "cosine",
			},
		}

		err = client.Schema().ClassCreator().
			WithClass(initialClass).
			Do(context.Background())
		// END InitialSchema
		require.NoError(t, err)

		// Optionally add some data here if needed for PQ training
		// For this test, we'll skip data loading since it's about configuration

		// START UpdateSchema
		// Get the existing collection configuration
		class, err := client.Schema().ClassGetter().
			WithClassName(className).Do(context.Background())

		if err != nil {
			log.Fatalf("get class for vec idx cfg update: %v", err)
		}

		// Get the current vector index configuration
		cfg := class.VectorIndexConfig.(map[string]interface{})

		// Add PQ configuration to enable product quantization
		cfg["pq"] = map[string]interface{}{
			"enabled":       true,
			"trainingLimit": 100000, // Optional: number of vectors to use for training
			"segments":      96,     // Optional: number of segments for product quantization
		}

		// Update the class configuration
		class.VectorIndexConfig = cfg

		// Apply the updated configuration to the collection
		err = client.Schema().ClassUpdater().
			WithClass(class).Do(context.Background())

		if err != nil {
			log.Fatalf("update class to use pq: %v", err)
		}
		// END UpdateSchema

		// START GetSchema
		// Verify the PQ configuration was applied
		updatedClass, err := client.Schema().ClassGetter().
			WithClassName(className).Do(context.Background())
		if err != nil {
			log.Fatalf("get class to verify vec idx cfg changes: %v", err)
		}

		cfg = updatedClass.VectorIndexConfig.(map[string]interface{})
		log.Printf("pq config: %v", cfg["pq"])
		// END GetSchema

		// Additional assertions for test verification
		require.NoError(t, err)
		vic, ok := updatedClass.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)

		pqConfig, ok := vic["pq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, pqConfig["enabled"])
		assert.Equal(t, float64(100000), pqConfig["trainingLimit"])
		assert.Equal(t, float64(96), pqConfig["segments"])
	})
}
