package main

// Complete, runnable program for the Weaviate Cloud quickstart's
// create-collection step.

// START CloudCreate
import (
	"context"
	"fmt"
	"os"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	wembed "github.com/weaviate/weaviate-go-client/v6/modules/weaviate"
)

func main() {
	ctx := context.Background()

	// Best practice: store your credentials in environment variables.
	// Step 1.1: Connect to your Weaviate Cloud instance.
	client, err := weaviate.NewWeaviateCloud(
		ctx,
		os.Getenv("WEAVIATE_URL"),     // e.g. "my-cluster.weaviate.network"
		os.Getenv("WEAVIATE_API_KEY"), // an admin API key
	)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()

	// Step 1.2: Create a collection vectorized by Weaviate Embeddings
	// (the text2vec-weaviate module).
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Movie",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "description", DataType: collections.DataTypeText},
			{Name: "genre", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: wembed.Text2Vec{}},
		},
	}); err != nil {
		// handle error
		panic(err)
	}

	// Step 1.3: Import a few objects. Weaviate Embeddings vectorizes each on import.
	if _, err := client.Collections.Use("Movie").Data.Insert(ctx,
		&data.Object{Properties: map[string]any{
			"title":       "The Matrix",
			"description": "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
			"genre":       "Science Fiction",
		}},
		&data.Object{Properties: map[string]any{
			"title":       "Spirited Away",
			"description": "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
			"genre":       "Animation",
		}},
		&data.Object{Properties: map[string]any{
			"title":       "The Lord of the Rings: The Fellowship of the Ring",
			"description": "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
			"genre":       "Fantasy",
		}},
	); err != nil {
		// handle error
		panic(err)
	}

	fmt.Println("Imported & vectorized 3 objects into the Movie collection")
}

// END CloudCreate
