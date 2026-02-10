package main

// START NearText
import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/weaviate/weaviate-go-client/v5/weaviate"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/graphql"
)

func main() {
	// Step 1.1: Connect to your local Weaviate instance
	cfg := weaviate.Config{
		Host:   "localhost:8080",
		Scheme: "http",
	}
	client, err := weaviate.NewClient(cfg)
	if err != nil {
		panic(err)
	}

	// Step 2.2: Perform a semantic search with NearText
	// highlight-start
	title := graphql.Field{Name: "title"}
	description := graphql.Field{Name: "description"}
	genre := graphql.Field{Name: "genre"}

	nearText := client.GraphQL().NearTextArgBuilder().
		WithConcepts([]string{"sci-fi"})

	result, err := client.GraphQL().Get().
		WithClassName("Movie").
		WithNearText(nearText).
		WithLimit(2).
		WithFields(title, description, genre).
		Do(context.Background())
	// highlight-end

	if err != nil {
		panic(err)
	}

	// Inspect the results
	if result.Errors != nil {
		fmt.Printf("Error: %v\n", result.Errors)
		return
	}

	data := result.Data["Get"].(map[string]interface{})
	movies := data["Movie"].([]interface{})

	for _, movie := range movies {
		jsonData, err := json.MarshalIndent(movie, "", "  ")
		if err != nil {
			panic(err)
		}
		fmt.Println(string(jsonData))
	}
	// END NearText
}
