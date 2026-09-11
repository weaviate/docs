package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/modules/selfprovided"
	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/query/filter"
	"github.com/weaviate/weaviate-go-client/v6/types"
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
	// highlight-start
	_, err := questions.Data.Insert(ctx, &data.Object{
		// highlight-end
		Properties: map[string]any{
			"question": "This vector database is open source and written in Go",
			"answer":   "Weaviate",
			"category": "SCIENCE",
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CreateObject
}

// TestReplaceObject replaces a whole object. The object must not carry
// cross-references: Data.Replace still rejects those with HTTP 422 "invalid object:
// reference property is not a map". Replace the object without references, then use
// Data.AddReferences.
func TestReplaceObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	id := uuid.MustParse("e1f2a3b4-c5d6-4e7f-8a9b-4c5d6e7f8a9b")
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
	// highlight-start
	err := questions.Data.Replace(ctx, data.Object{
		// highlight-end
		UUID: &id,
		Properties: map[string]any{
			"question": "This vector database is open source and written in Go",
			"answer":   "Weaviate",
			"category": "SCIENCE",
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END UpdateReplace
}

// TestPartialUpdate is a placeholder: the v6 Go client can replace a whole
// object but cannot yet merge a partial update into an existing object.
func TestPartialUpdate(t *testing.T) {
	t.Skip("partial update (merge) is not yet available in the v6 Go client; use Data.Replace for a full update")

	// TODO[g-despot]: partial update (merge) snippet pending v6 client support
	// START UpdateMerge
	// Coming soon
	// END UpdateMerge
}

func TestDeleteObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	id := uuid.MustParse("f1a2b3c4-d5e6-4f7a-8b9c-5d6e7f8a9b0c")
	if _, err := questions.Data.Insert(ctx, &data.Object{
		UUID:       &id,
		Properties: map[string]any{"question": "This object will be deleted"},
	}); err != nil {
		t.Fatal(err)
	}

	// START DeleteObject
	// highlight-start
	err := questions.Data.Delete(ctx, id)
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
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
	dm1 := uuid.MustParse("a2b3c4d5-e6f7-4a8b-8c9d-6e7f8a9b0c1d")
	dm2 := uuid.MustParse("b2c3d4e5-f6a7-4b8c-8d9e-7f8a9b0c1d2e")
	if _, err := questions.Data.Insert(ctx,
		&data.Object{UUID: &dm1, Properties: map[string]any{"answer": "Hawaii", "category": "GEOGRAPHY"}},
		&data.Object{UUID: &dm2, Properties: map[string]any{"answer": "Kilauea", "category": "GEOGRAPHY"}},
	); err != nil {
		t.Fatal(err)
	}

	// START DeleteMany
	res, err := questions.Data.DeleteSelected(ctx, data.DeleteSelected{
		// highlight-start
		Filter: &filter.Cond{
			Target:   "category",
			Operator: filter.Equal,
			Value:    "GEOGRAPHY",
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END DeleteMany

	for id, delErr := range res.Errors {
		if delErr != nil {
			t.Fatalf("delete %s: %v", id, delErr)
		}
	}
}

// TestReadObjectByID retrieves a single object by its id. The v6 Go client has no
// fetch-object-by-id call, so the object is selected by a filter on its id.
func TestReadObjectByID(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyDemo(t, client)
	defer cleanupJeopardyDemo(ctx, client)

	// START ReadObject
	questions := client.Collections.Use("JeopardyQuestion")
	// The v6 client has no fetch-by-id call; select an object by its id.
	// highlight-start
	response, err := questions.Query.OverAll(ctx, query.OverAll{
		Filter: &filter.Cond{
			Target:   filter.UUID, // The object's own id.
			Operator: filter.Equal,
			Value:    "a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f",
		},
	})
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%s: %v\n", obj.UUID, obj.Properties)
	}
	// END ReadObject
}

// setupJeopardyBYOV (re)creates a JeopardyQuestion collection with a single
// "default" vector supplied by the caller at insert time (the "none"/selfprovided
// vectorizer). The create-with-vector snippet needs a collection that accepts a
// user-provided vector, so the setup sits outside the snippet markers.
func setupJeopardyBYOV(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "JeopardyQuestion")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyQuestion",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
			{Name: "answer", DataType: collections.DataTypeText},
			{Name: "category", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: selfprovided.Vectorizer},
		},
	}); err != nil {
		t.Fatalf("create JeopardyQuestion collection: %v", err)
	}
}

func TestCreateWithVector(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyBYOV(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	// START CreateWithVector
	_, err := questions.Data.Insert(ctx, &data.Object{
		Properties: map[string]any{
			"question": "This vector database is open source and written in Go",
			"answer":   "Weaviate",
			"category": "SCIENCE",
		},
		// Supply the object's vector under the matching vector name
		// ("default" for a single, unnamed vector).
		// highlight-start
		Vectors: []types.Vector{
			{Name: "default", Single: []float32{0.12345, 0.6789, 0.9876}},
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CreateWithVector
}

func TestCreateWithId(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	// START CreateWithId
	// highlight-start
	id := uuid.MustParse("12345678-9abc-4def-8123-456789abcdef")
	// highlight-end
	_, err := questions.Data.Insert(ctx, &data.Object{
		// highlight-start
		UUID: &id,
		// highlight-end
		Properties: map[string]any{
			"question": "This vector database is open source and written in Go",
			"answer":   "Weaviate",
			"category": "SCIENCE",
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CreateWithId
}

// TestCreateWithDeterministicId is a placeholder: the v6 Go client does not
// yet provide a deterministic (UUID5) id helper.
func TestCreateWithDeterministicId(t *testing.T) {
	t.Skip("deterministic id generation is not yet available in the v6 Go client")

	// TODO[g-despot]: deterministic-id snippet pending v6 client support
	// START CreateWithDeterministicId
	// Coming soon
	// END CreateWithDeterministicId
}

// TestValidateObject is a placeholder: the v6 Go client does not yet expose an
// object validation call.
func TestValidateObject(t *testing.T) {
	t.Skip("object validation is not yet available in the v6 Go client")

	// TODO[g-despot]: validate-object snippet pending v6 client support
	// START ValidateObject
	// Coming soon
	// END ValidateObject
}

// TestReadWithVector retrieves a single object together with its vector.
// The v6 Go client has no fetch-object-by-id call, so the object is selected by a
// filter on its id and the vector is requested explicitly.
func TestReadWithVector(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START ReadWithVector
	questions := client.Collections.Use("JeopardyQuestion")
	// The v6 client has no fetch-by-id call; select an object by its id and
	// request the vector to retrieve an object together with its embedding.
	response, err := questions.Query.OverAll(ctx, query.OverAll{
		Filter: &filter.Cond{
			Target:   filter.UUID, // The object's own id.
			Operator: filter.Equal,
			Value:    "a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f",
		},
		// Name the vectors to return; use "default" for a single unnamed vector.
		// highlight-start
		ReturnVectors: []string{"default"},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%s: %v\n", obj.UUID, obj.Vectors["default"].Single)
	}
	// END ReadWithVector
}

// TestUpdateVector is a placeholder: updating only an object's vector needs a
// partial update. Data.Replace does carry Vectors, so replacing a whole object
// including its vector works; merging a new vector into an existing object without
// resending its properties does not.
func TestUpdateVector(t *testing.T) {
	t.Skip("updating an object's vector on its own needs a partial update, which the v6 Go client does not support; use Data.Replace to rewrite the whole object with its vector")

	// TODO[g-despot]: update-object-vector snippet pending v6 client support
	// START UpdateVector
	// Coming soon
	// END UpdateVector
}

// TestDeleteProperty removes a property value by replacing the object with a copy
// that omits it. Like TestReplaceObject, the object must not carry cross-references.
func TestDeleteProperty(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	id := uuid.MustParse("b1e2d3c4-a5f6-4e7d-8c9b-1a2b3c4d5e6f")
	if _, err := questions.Data.Insert(ctx, &data.Object{
		UUID: &id,
		Properties: map[string]any{
			"question": "This vector database is open source and written in Go",
			"answer":   "Weaviate",
			"category": "SCIENCE",
		},
	}); err != nil {
		t.Fatal(err)
	}

	// START DelProps
	// Weaviate has no per-property delete. To remove a property value, replace the
	// object with a copy that omits it (or sets it to "" for a text property).
	err := questions.Data.Replace(ctx, data.Object{
		UUID: &id,
		Properties: map[string]any{
			"question": "This vector database is open source and written in Go",
			"answer":   "Weaviate",
			// "category" is omitted, so it is removed from the stored object.
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END DelProps
}

// TestDeleteDryRun previews a delete-by-filter without removing anything.
// DeleteSelected discards Matches/Successful/Failed and always reports Took: 0s, so
// Verbose plus the Errors map is the only way to see which objects matched.
func TestDeleteDryRun(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	// START DryRun
	res, err := questions.Data.DeleteSelected(ctx, data.DeleteSelected{
		Filter: &filter.Cond{
			Target:   "answer",
			Operator: filter.Like,
			Value:    "*bird*",
		},
		// highlight-start
		DryRun:  true, // Report matches without deleting them.
		Verbose: true, // Include the id and status of each match.
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// With DryRun set nothing is deleted; the result reports what would match.
	for id := range res.Errors {
		fmt.Printf("Would delete: %s\n", id)
	}
	// END DryRun
}
