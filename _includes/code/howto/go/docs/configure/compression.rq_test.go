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
			"rescoreLimit": 200, // The number of candidates to fetch before rescoring
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
				"distance":              "cosine", // Set the distance metric for HNSW
				"vectorCacheMaxObjects": 100000,   // Configure the vector cache
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
		assert.Equal(t, float64(200), rqConfig["rescoreLimit"])

		// Assert other HNSW settings
		assert.Equal(t, "cosine", vic["distance"])
		assert.Equal(t, float64(100000), vic["vectorCacheMaxObjects"])
	})
}
