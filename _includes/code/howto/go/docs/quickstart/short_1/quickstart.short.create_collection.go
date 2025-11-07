package main

// START CreateCollection
import (
	"context"
	"fmt"
	"os"

	"github.com/weaviate/weaviate-go-client/v5/weaviate"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/auth"
	"github.com/weaviate/weaviate/entities/models"
)

func main() {
	// Best practice: store your credentials in environment variables
	weaviateURL := os.Getenv("WEAVIATE_HOST")
	weaviateAPIKey := os.Getenv("WEAVIATE_API_KEY")

	// Step 1.1: Connect to your Weaviate Cloud instance
	cfg := weaviate.Config{
		Host:       weaviateURL,
		Scheme:     "https",
		AuthConfig: auth.ApiKey{Value: weaviateAPIKey},
	}
	client, err := weaviate.NewClient(cfg)
	if err != nil {
		panic(err)
	}

	// END CreateCollection

	// NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
	client.Schema().ClassDeleter().WithClassName("Movie").Do(context.Background())

	// START CreateCollection
	// Step 1.2: Create a collection
	// highlight-start
	classObj := &models.Class{
		Class:      "Movie",
		Vectorizer: "text2vec-weaviate",
		ModuleConfig: map[string]interface{}{
			"generative-anthropic": map[string]interface{}{
				"model": "claude-3-5-haiku-latest",
			},
		},
	}

	err = client.Schema().ClassCreator().WithClass(classObj).Do(context.Background())
	if err != nil {
		panic(err)
	}
	// highlight-end

	// END CreateCollection

	// START CreateCollection
	// Step 1.3: Import three objects
	dataObjects := []map[string]interface{}{
		{
			"title":       "The Matrix",
			"description": "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
			"genre":       "Science Fiction",
		},
		{
			"title":       "Spirited Away",
			"description": "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
			"genre":       "Animation",
		},
		{
			"title":       "The Lord of the Rings: The Fellowship of the Ring",
			"description": "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
			"genre":       "Fantasy",
		},
	}

	// END CreateCollection

	// START CreateCollection
	// Insert objects
	objects := make([]*models.Object, len(dataObjects))
	for i, obj := range dataObjects {
		objects[i] = &models.Object{
			Class:      "Movie",
			Properties: obj,
		}
	}

	_, err = client.Batch().ObjectsBatcher().WithObjects(objects...).Do(context.Background())
	if err != nil {
		panic(err)
	}

	fmt.Printf("Imported & vectorized %d objects into the Movie collection\n", len(dataObjects))
	// END CreateCollection
}
