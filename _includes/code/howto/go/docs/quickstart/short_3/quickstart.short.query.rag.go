package main

// START RAG
import (
	"context"
	"fmt"
	"os"

	"github.com/weaviate/weaviate-go-client/v5/weaviate"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/auth"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/graphql"
)

func main() {
	// Best practice: store your credentials in environment variables
	weaviateURL := os.Getenv("WEAVIATE_URL")
	weaviateAPIKey := os.Getenv("WEAVIATE_API_KEY")
	anthropicAPIKey := os.Getenv("ANTHROPIC_API_KEY")

	// Step 2.1: Connect to your Weaviate Cloud instance
	// highlight-start
	headers := map[string]string{
		"X-Anthropic-Api-Key": anthropicAPIKey,
	}

	cfg := weaviate.Config{
		Host:       weaviateURL,
		Scheme:     "https",
		AuthConfig: auth.ApiKey{Value: weaviateAPIKey},
		Headers:    headers,
	}
	client, err := weaviate.NewClient(cfg)
	if err != nil {
		panic(err)
	}
	// highlight-end

	// Step 2.2: Perform RAG with NearText results
	// highlight-start
	title := graphql.Field{Name: "title"}
	description := graphql.Field{Name: "description"}
	genre := graphql.Field{Name: "genre"}

	nearText := client.GraphQL().NearTextArgBuilder().
		WithConcepts([]string{"sci-fi"})

	generate := graphql.NewGenerativeSearch().GroupedResult("Write a tweet with emojis about this movie.")

	result, err := client.GraphQL().Get().
		WithClassName("Movie").
		WithNearText(nearText).
		WithLimit(1).
		WithFields(title, description, genre).
		WithGenerativeSearch(generate).
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

	fmt.Printf("%v", result)
	// END RAG
}
