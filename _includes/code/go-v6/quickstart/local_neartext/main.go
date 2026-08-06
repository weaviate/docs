package main

// Complete, runnable program for the local quickstart's near-text (semantic
// search) step.

// START NearText
import (
	"context"
	"fmt"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/query"
)

func main() {
	ctx := context.Background()

	// Step 2.1: Connect to your local Weaviate instance.
	client, err := weaviate.NewLocal(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()

	// Step 2.2: Semantic (vector) search. text2vec-contextionary turns the query
	// text into a vector server-side and returns the closest matches.
	movies := client.Collections.Use("Movie")
	response, err := movies.Query.NearText(ctx, query.NearText{
		Concepts: []string{"science fiction movie"},
		Limit:    2,
		ReturnMetadata: query.ReturnMetadata{
			Distance: true,
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
		if obj.Metadata.Distance != nil {
			fmt.Printf("distance: %v\n", *obj.Metadata.Distance)
		}
	}
}

// END NearText
