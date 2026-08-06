package main

// Complete, runnable program for the Weaviate Cloud quickstart's near-text
// (semantic search) step.
//
// The body between the START/END markers is indented one extra level ON PURPOSE.
// The docs "go6" snippet formatter strips one indent level — it is built for
// snippets lifted from inside a test function — so this extra level makes the
// rendered quickstart tab a clean, column-0 program. Do NOT run gofmt on this
// file: it would remove the offset and break the rendered snippet.

// START CloudNearText
	import (
		"context"
		"fmt"
		"os"

		weaviate "github.com/weaviate/weaviate-go-client/v6"
		"github.com/weaviate/weaviate-go-client/v6/query"
	)

	func main() {
		ctx := context.Background()

		// Step 2.1: Connect to your Weaviate Cloud instance.
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

		// Step 2.2: Semantic (vector) search. Weaviate Embeddings vectorizes the query
		// text server-side and returns the closest matches.
		movies := client.Collections.Use("Movie")
		response, err := movies.Query.NearText(ctx, query.NearText{
			Concepts: []string{"science fiction movie"},
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
// END CloudNearText
