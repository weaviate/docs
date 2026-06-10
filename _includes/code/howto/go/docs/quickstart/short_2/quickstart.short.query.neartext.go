package main

// START NearText
import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/weaviate/weaviate-go-client/v5/weaviate"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/auth"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/graphql"
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

	// Step 2.2: Perform a semantic search with NearText
	// highlight-start
	// END NearText

	// START NearText
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
	// END NearText

	// START NearText
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
