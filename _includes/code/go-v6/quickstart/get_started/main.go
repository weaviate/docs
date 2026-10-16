// Complete, runnable program for the Go v6 client page's Get started section.

// START GetStarted
package main

import (
	"context"
	"fmt"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/query"
)

// The client has no typed Ollama vectorizer yet, so this small custom module
// type names text2vec-ollama. Its JSON-tagged fields are the module settings.
type text2vecOllama struct {
	APIEndpoint string `json:"apiEndpoint,omitempty"`
	Model       string `json:"model,omitempty"`
}

func (text2vecOllama) Name() string { return "text2vec-ollama" }

func main() {
	ctx := context.Background()

	// Step 1: Connect to your local Weaviate instance.
	client, err := weaviate.NewLocal(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()

	// Step 2: Create a collection vectorized by the Ollama embedding integration.
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Question",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
			{Name: "answer", DataType: collections.DataTypeText},
			{Name: "category", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: text2vecOllama{
				APIEndpoint: "http://ollama:11434", // If using Docker you might need: http://host.docker.internal:11434
				Model:       "nomic-embed-text",
			}},
		},
	}); err != nil {
		// handle error
		panic(err)
	}

	// Step 3: Import a few objects. The server vectorizes each one on import.
	questions := client.Collections.Use("Question")
	if _, err := questions.Data.Insert(ctx,
		&data.Object{Properties: map[string]any{
			"question": "This organ removes excess glucose from the blood & stores it as glycogen",
			"answer":   "Liver",
			"category": "SCIENCE",
		}},
		&data.Object{Properties: map[string]any{
			"question": "It's the only living mammal in the order Proboseidea",
			"answer":   "Elephant",
			"category": "ANIMALS",
		}},
		&data.Object{Properties: map[string]any{
			"question": "The gavial looks very much like a crocodile except for this bodily feature",
			"answer":   "the nose or snout",
			"category": "ANIMALS",
		}},
	); err != nil {
		// handle error
		panic(err)
	}

	// Step 4: Run a semantic (vector) search.
	response, err := questions.Query.NearText(ctx, query.NearText{
		Concepts: []string{"biology"},
		Limit:    2,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
}

// END GetStarted
