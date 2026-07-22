package main

import (
	"context"
	"testing"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/query/filter"
)

// setupJeopardy (re)creates a minimal JeopardyQuestion collection used by the
// object how-to snippets. It has no vectorizer, so objects carry explicit
// properties only.
func setupJeopardy(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	// Start from a clean slate; ignore the error when the collection is absent.
	_ = client.Collections.Delete(ctx, "JeopardyQuestion")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyQuestion",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
			{Name: "answer", DataType: collections.DataTypeText},
			{Name: "category", DataType: collections.DataTypeText},
		},
	}); err != nil {
		t.Fatalf("create JeopardyQuestion collection: %v", err)
	}
}

func TestCreateObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	// START CreateObject
	res, err := questions.Data.Insert(ctx, &data.Object{
		Properties: map[string]any{
			"question": "This vector database is open source and written in Go",
			"answer":   "Weaviate",
			"category": "SCIENCE",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	// END CreateObject

	for id, msg := range res.Errors {
		if msg != "" {
			t.Fatalf("insert %s: %s", id, msg)
		}
	}
}

func TestReplaceObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	id := uuid.New()
	if _, err := questions.Data.Insert(ctx, &data.Object{
		UUID: &id,
		Properties: map[string]any{
			"question": "Placeholder question",
			"answer":   "Placeholder answer",
			"category": "SCIENCE",
		},
	}); err != nil {
		t.Fatal(err)
	}

	// START UpdateReplace
	// Replace overwrites the whole object. Properties that are omitted here are
	// removed from the stored object, so include every value you want to keep.
	err := questions.Data.Replace(ctx, data.Object{
		UUID: &id,
		Properties: map[string]any{
			"question": "This vector database is open source and written in Go",
			"answer":   "Weaviate",
			"category": "SCIENCE",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	// END UpdateReplace
}

// TestPartialUpdate is a placeholder: the v6 Go client can replace a whole
// object but cannot yet merge a partial update into an existing object.
func TestPartialUpdate(t *testing.T) {
	t.Skip("partial update (merge) is not yet available in the v6 Go client; use Data.Replace for a full update")

	// START UpdateMerge
	// Coming soon
	//
	// TODO[g-despot]: partial update (merge) snippet pending v6 client support
	// END UpdateMerge
}

func TestDeleteObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	id := uuid.New()
	if _, err := questions.Data.Insert(ctx, &data.Object{
		UUID:       &id,
		Properties: map[string]any{"question": "This object will be deleted"},
	}); err != nil {
		t.Fatal(err)
	}

	// START DeleteObject
	err := questions.Data.Delete(ctx, id)
	if err != nil {
		t.Fatal(err)
	}
	// END DeleteObject
}

func TestDeleteMany(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")
	if _, err := questions.Data.Insert(ctx,
		&data.Object{Properties: map[string]any{"answer": "Hawaii", "category": "GEOGRAPHY"}},
		&data.Object{Properties: map[string]any{"answer": "Kilauea", "category": "GEOGRAPHY"}},
	); err != nil {
		t.Fatal(err)
	}

	// START DeleteMany
	res, err := questions.Data.DeleteSelected(ctx, data.DeleteSelected{
		Filter: &filter.Cond{
			Target:   "category",
			Operator: filter.Equal,
			Value:    "GEOGRAPHY",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	// END DeleteMany

	for id, delErr := range res.Errors {
		if delErr != nil {
			t.Fatalf("delete %s: %v", id, delErr)
		}
	}
}

// TestReadObjectByID is a placeholder: the v6 Go client does not yet expose a
// fetch-object-by-id call. Retrieve objects through a search query for now.
func TestReadObjectByID(t *testing.T) {
	t.Skip("fetch-object-by-id is not yet available in the v6 Go client")

	// START ReadObject
	// Coming soon
	//
	// TODO[g-despot]: fetch-object-by-id snippet pending v6 client support
	// END ReadObject
}
