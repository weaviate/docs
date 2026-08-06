package main

// Complete, runnable program for the local quickstart's create-collection step.

// START LocalCreate
import (
	"context"
	"fmt"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
)

// text2vecContextionary is a one-line custom-module vectorizer. The v6 client
// encodes a module from its Name(), so this selects the built-in
// text2vec-contextionary module, which embeds text properties server-side with
// no external service or API key.
type text2vecContextionary struct{}

func (text2vecContextionary) Name() string { return "text2vec-contextionary" }

func main() {
	ctx := context.Background()

	// Step 1.1: Connect to your local Weaviate instance.
	client, err := weaviate.NewLocal(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()

	// Step 1.2: Create a collection. Its text properties are vectorized
	// server-side by the text2vec-contextionary module (see the type above).
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Movie",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "description", DataType: collections.DataTypeText},
			{Name: "genre", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: text2vecContextionary{}},
		},
	}); err != nil {
		// handle error
		panic(err)
	}

	// Step 1.3: Import a few objects. The server vectorizes each one on import.
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

// END LocalCreate
