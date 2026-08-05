package main

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	wembed "github.com/weaviate/weaviate-go-client/v6/modules/weaviate"
	"github.com/weaviate/weaviate-go-client/v6/query"
)

// waitForNearText polls a near-text search until it returns at least one object.
// The docs test stack runs with async vector indexing, so a collection's vector
// index can lag the object count that waitForCount settles; a near-text issued
// in that window hits an empty index and returns no results (an HTTP 200 with an
// empty list, not an error). Polling the search itself closes that race so the
// rendered near-text step is deterministic. It sits outside every snippet marker,
// so it never appears in a rendered snippet.
func waitForNearText(t *testing.T, handle *collections.Handle, concepts []string) {
	t.Helper()
	ctx := context.Background()
	deadline := time.Now().Add(30 * time.Second)
	for time.Now().Before(deadline) {
		resp, err := handle.Query.NearText(ctx, query.NearText{Concepts: concepts, Limit: 1})
		if err == nil && len(resp.Objects) > 0 {
			return
		}
		time.Sleep(200 * time.Millisecond)
	}
	t.Fatalf("waitForNearText: %q returned no near-text results before timeout", handle.CollectionName())
}

// START LocalCreate
// text2vecContextionary is a one-line custom-module vectorizer. The v6 client
// encodes a module from its Name(), so this selects the built-in
// text2vec-contextionary module, which embeds text properties server-side with
// no external service or API key. v6 ships typed vectorizer helpers for
// model2vec and self-provided vectors; every other module (Ollama, OpenAI,
// Weaviate Embeddings, ...) is configured with a small type like this one.
type text2vecContextionary struct{}

func (text2vecContextionary) Name() string { return "text2vec-contextionary" }

// END LocalCreate

// TestQuickstartLocal runs the locally hosted quickstart end to end against the
// docs test stack: connect, create a vectorized collection, import objects, and
// run a semantic (near-text) search. It backs the "Go v6" tab of the local
// quickstart's create-collection and near-text steps.
func TestQuickstartLocal(t *testing.T) {
	ctx := context.Background()

	// START LocalCreate
	// Step 1.1: Connect to your local Weaviate instance.
	client, err := weaviate.NewLocal(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END LocalCreate

	// NOT SHOWN TO THE USER — start from a clean slate so re-runs are deterministic.
	_ = client.Collections.Delete(ctx, "Movie")
	defer client.Collections.Delete(ctx, "Movie")

	// START LocalCreate
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
		t.Fatal(err)
	}

	// Step 1.3: Import a few objects. The server vectorizes each one on import.
	// The fixed ids keep this example reproducible.
	matrix := uuid.MustParse("1a1a1a1a-0001-4a5b-8c9d-1a2b3c4d5e6f")
	spirited := uuid.MustParse("2b2b2b2b-0002-4b5c-8d9e-2a3b4c5d6e7f")
	rings := uuid.MustParse("3c3c3c3c-0003-4c5d-8e9f-3a4b5c6d7e80")
	if _, err := client.Collections.Use("Movie").Data.Insert(ctx,
		&data.Object{UUID: &matrix, Properties: map[string]any{
			"title":       "The Matrix",
			"description": "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
			"genre":       "Science Fiction",
		}},
		&data.Object{UUID: &spirited, Properties: map[string]any{
			"title":       "Spirited Away",
			"description": "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
			"genre":       "Animation",
		}},
		&data.Object{UUID: &rings, Properties: map[string]any{
			"title":       "The Lord of the Rings: The Fellowship of the Ring",
			"description": "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
			"genre":       "Fantasy",
		}},
	); err != nil {
		t.Fatal(err)
	}
	fmt.Println("Imported & vectorized 3 objects into the Movie collection")
	// END LocalCreate

	// NOT SHOWN — the docs stack runs with async indexing, so both the object count
	// and the vector index settle a moment after Insert returns. Wait for the
	// objects, then wait until the vector index answers a near-text search, so the
	// rendered near-text step is stable (not an empty-index short-circuit).
	waitForCount(t, client.Collections.Use("Movie"), 3)
	waitForNearText(t, client.Collections.Use("Movie"), []string{"science fiction movie"})

	// START NearText
	// Step 2: Semantic (vector) search. text2vec-contextionary turns the query
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
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
		if obj.Metadata.Distance != nil {
			fmt.Printf("distance: %v\n", *obj.Metadata.Distance)
		}
	}
	// END NearText
}

// TestQuickstartCloud is the Weaviate Cloud form of the quickstart. It is
// compile-only: the docs CI stack has no Weaviate Cloud instance wired for this
// snippet, so it is kept out of the live run (t.Skip). The calls below are the
// idiomatic Cloud shape — connect with an API key and vectorize with Weaviate
// Embeddings (the text2vec-weaviate typed helper). It backs the "Go v6" tab of
// the Cloud quickstart's create-collection and near-text steps.
func TestQuickstartCloud(t *testing.T) {
	t.Skip("Weaviate Cloud quickstart: requires a Weaviate Cloud instance with Weaviate Embeddings; compile-only in docs CI")
	ctx := context.Background()

	// START CloudCreate
	// Step 1.1: Connect to your Weaviate Cloud instance.
	client, err := weaviate.NewWeaviateCloud(
		ctx,
		os.Getenv("WEAVIATE_URL"),     // e.g. "my-cluster.weaviate.network"
		os.Getenv("WEAVIATE_API_KEY"), // an admin API key
	)
	if err != nil {
		t.Fatal(err)
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
		t.Fatal(err)
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
		t.Fatal(err)
	}
	// END CloudCreate

	// START CloudNearText
	// Step 2: Semantic (vector) search. Weaviate Embeddings vectorizes the query
	// text server-side and returns the closest matches.
	movies := client.Collections.Use("Movie")
	response, err := movies.Query.NearText(ctx, query.NearText{
		Concepts: []string{"science fiction movie"},
		Limit:    2,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END CloudNearText
}

// TestQuickstartRAG is the placeholder for the quickstart's retrieval augmented
// generation (RAG) step. The v6 Go client has no generative/RAG support yet
// (no collection-level generative config and no generate query), so this
// compiles and skips; the rendered snippet shows only a "Coming soon" note.
func TestQuickstartRAG(t *testing.T) {
	t.Skip("generative (RAG) is not yet available in the v6 Go client")
	// TODO[g-despot]: generative (RAG) query pending v6 client support
	// START RAG
	// Coming soon
	// END RAG
}
