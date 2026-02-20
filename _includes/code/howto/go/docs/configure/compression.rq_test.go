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

func TestRQConfiguration(t *testing.T) {
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

	t.Run("Enable RQ", func(t *testing.T) {
		className := "MyCollectionRQDefault"
		// Delete the collection if it already exists to ensure a clean start
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			// This is not a fatal error, the collection might not exist
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// START EnableRQ
		// Define the configuration for RQ. Setting 'enabled' to true
		// highlight-start
		rq_config := map[string]interface{}{
			"enabled": true,
		}
		// highlight-end

		// Define the class schema
		class := &models.Class{
			Class:      className,
			Vectorizer: "text2vec-openai",
			// highlight-start
			// Assign the RQ configuration to the vector index config
			VectorIndexConfig: map[string]interface{}{
				"rq": rq_config,
			},
			// highlight-end
		}

		// Create the collection in Weaviate
		err = client.Schema().ClassCreator().
			WithClass(class).
			Do(context.Background())
		// END EnableRQ
		require.NoError(t, err)

		// Assertions to verify the configuration
		classInfo, err := client.Schema().ClassGetter().WithClassName(className).Do(ctx)
		require.NoError(t, err)
		require.NotNil(t, classInfo)

		vic, ok := classInfo.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)
		rqConfig, ok := vic["rq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, rqConfig["enabled"])
	})

	t.Run("Enable 1-bit RQ", func(t *testing.T) {
		className := "MyCollectionRQDefault"
		// Delete the collection if it already exists to ensure a clean start
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			// This is not a fatal error, the collection might not exist
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// START 1BitEnableRQ
		// Define the configuration for RQ. Setting 'enabled' to true
		// highlight-start
		rq_config := map[string]interface{}{
			"enabled": true,
			"bits":    1,
		}
		// highlight-end

		// Define the class schema
		class := &models.Class{
			Class:      className,
			Vectorizer: "text2vec-openai",
			// highlight-start
			// Assign the RQ configuration to the vector index config
			VectorIndexConfig: map[string]interface{}{
				"rq": rq_config,
			},
			// highlight-end
		}

		// Create the collection in Weaviate
		err = client.Schema().ClassCreator().
			WithClass(class).
			Do(context.Background())
		// END 1BitEnableRQ
		require.NoError(t, err)

		// Assertions to verify the configuration
		classInfo, err := client.Schema().ClassGetter().WithClassName(className).Do(ctx)
		require.NoError(t, err)
		require.NotNil(t, classInfo)

		vic, ok := classInfo.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)
		rqConfig, ok := vic["rq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, rqConfig["enabled"])
		assert.Equal(t, float64(1), rqConfig["bits"])
	})

	t.Run("Enable RQ with Options", func(t *testing.T) {
		className := "MyCollectionRQWithOptions"
		// Delete the collection to recreate it with new options
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// START RQWithOptions
		// Define a custom configuration for RQ
		// highlight-start
		rq_with_options_config := map[string]interface{}{
			"enabled":      true,
			"bits":         8,  // Optional: Number of bits
			"rescoreLimit": 20, // Optional: Number of candidates to fetch before rescoring
		}
		// highlight-end

		// Define the class schema with the custom RQ config and other HNSW settings
		class_with_options := &models.Class{
			Class:      className,
			Vectorizer: "text2vec-openai",
			VectorIndexConfig: map[string]interface{}{
				// highlight-start
				"rq": rq_with_options_config,
				// highlight-end
			},
		}

		// Create the collection in Weaviate
		err = client.Schema().ClassCreator().
			WithClass(class_with_options).
			Do(context.Background())
		// END RQWithOptions
		require.NoError(t, err)

		// Assertions to verify the configuration
		classInfo, err := client.Schema().ClassGetter().WithClassName(className).Do(ctx)
		require.NoError(t, err)
		require.NotNil(t, classInfo)

		vic, ok := classInfo.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)

		// Assert RQ settings
		rqConfig, ok := vic["rq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, rqConfig["enabled"])
		// JSON numbers are unmarshalled as float64
		assert.Equal(t, float64(20), rqConfig["rescoreLimit"])
	})

	t.Run("Enable RQ on Existing Collection", func(t *testing.T) {
		className := "MyExistingCollection"

		// First, create a collection without RQ
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// Create initial collection without RQ
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

		// START UpdateSchemaToEnableRQ
		// Get the existing collection configuration
		class, err := client.Schema().ClassGetter().
			WithClassName(className).Do(context.Background())

		if err != nil {
			log.Fatalf("get class for vec idx cfg update: %v", err)
		}

		// Get the current vector index configuration
		cfg := class.VectorIndexConfig.(map[string]interface{})

		// Add RQ configuration to enable quantization
		cfg["rq"] = map[string]interface{}{
			"enabled": true,
		}

		// Update the class configuration
		class.VectorIndexConfig = cfg

		// Apply the updated configuration to the collection
		err = client.Schema().ClassUpdater().
			WithClass(class).Do(context.Background())

		if err != nil {
			log.Fatalf("update class to use rq: %v", err)
		}
		// END UpdateSchemaToEnableRQ

		// Verify the RQ configuration was applied
		updatedClass, err := client.Schema().ClassGetter().
			WithClassName(className).Do(context.Background())
		require.NoError(t, err)

		vic, ok := updatedClass.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)

		rqConfig, ok := vic["rq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, rqConfig["enabled"])
		assert.Equal(t, float64(20), rqConfig["rescoreLimit"])
	})

	t.Run("Enable 1-bit RQ on Existing Collection", func(t *testing.T) {
		className := "MyExistingCollection"

		// First, create a collection without RQ
		err := client.Schema().ClassDeleter().WithClassName(className).Do(context.Background())
		if err != nil {
			log.Printf("Could not delete collection '%s', it might not exist: %v\n", className, err)
		}

		// Create initial collection without RQ
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

		// START 1BitUpdateSchema
		// Get the existing collection configuration
		class, err := client.Schema().ClassGetter().
			WithClassName(className).Do(context.Background())

		if err != nil {
			log.Fatalf("get class for vec idx cfg update: %v", err)
		}

		// Get the current vector index configuration
		cfg := class.VectorIndexConfig.(map[string]interface{})

		// Add RQ configuration to enable scalar quantization
		cfg["rq"] = map[string]interface{}{
			"enabled": true,
			"bits":    1,
		}

		// Update the class configuration
		class.VectorIndexConfig = cfg

		// Apply the updated configuration to the collection
		err = client.Schema().ClassUpdater().
			WithClass(class).Do(context.Background())

		if err != nil {
			log.Fatalf("update class to use rq: %v", err)
		}
		// END 1BitUpdateSchema

		// Verify the RQ configuration was applied
		updatedClass, err := client.Schema().ClassGetter().
			WithClassName(className).Do(context.Background())
		require.NoError(t, err)

		vic, ok := updatedClass.VectorIndexConfig.(map[string]interface{})
		require.True(t, ok)

		rqConfig, ok := vic["rq"].(map[string]interface{})
		require.True(t, ok)
		assert.Equal(t, true, rqConfig["enabled"])
		assert.Equal(t, float64(1), rqConfig["bits"])
	})
}
