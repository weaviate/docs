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
	res, err := questions.Data.Insert(ctx, &data.Object{
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

	for id, msg := range res.Errors {
		if msg != "" {
			t.Fatalf("insert %s: %s", id, msg)
		}
	}
}

func TestReplaceObject(t *testing.T) {
	// Deferred: this is a go-client v6 (alpha) bug, not a snippet bug. The client's
	// Replace serializes the PUT body WITHOUT the object id (it sends the id only in
	// the URL path), but Weaviate's class-scoped PUT handler requires the body id to
	// equal the path id, so the server rejects it with HTTP 422 "field 'id' is
	// immutable". The published UpdateReplace snippet below is already idiomatic and
	// carries the object's UUID; re-enable this test once the client sends the id.
	t.Skip("go-client v6 Data.Replace omits the object id from the PUT body; Weaviate requires body id == path id (HTTP 422 \"field 'id' is immutable\") — deferred pending a client fix")
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
	err := questions.Data.Replace(ctx, data.Object{
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
	err := questions.Data.Delete(ctx, id)
	if err != nil {
		// handle error
		panic(err)
	}
	// END DeleteObject
}

func TestDeleteMany(t *testing.T) {
	// Deferred: this is a go-client v6 (alpha) bug, not a snippet bug. Data.DeleteSelected
	// panics because *api.DeleteObjectsRequest is not wired into the gRPC transport
	// dispatch (internal/api/transport/transport.go has no BatchDeleteRequest case), so it
	// falls through to dev.Assert(false, "...does not implement MessageMarshaler..."). The
	// published DeleteMany snippet below is idiomatic; re-enable once the client wires it up.
	t.Skip("go-client v6 Data.DeleteSelected panics — *api.DeleteObjectsRequest not wired to gRPC MessageMarshaler; deferred pending a client fix")
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
		Filter: &filter.Cond{
			Target:   "category",
			Operator: filter.Equal,
			Value:    "GEOGRAPHY",
		},
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
	response, err := questions.Query.OverAll(ctx, query.OverAll{
		Filter: &filter.Cond{
			Target:   filter.UUID, // The object's own id.
			Operator: filter.Equal,
			Value:    "a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f",
		},
	})
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
	res, err := questions.Data.Insert(ctx, &data.Object{
		Properties: map[string]any{
			"question": "This vector database is open source and written in Go",
			"answer":   "Weaviate",
			"category": "SCIENCE",
		},
		// Supply the object's vector under the matching vector name
		// ("default" for a single, unnamed vector).
		Vectors: []types.Vector{
			{Name: "default", Single: []float32{0.12345, 0.6789, 0.9876}},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CreateWithVector

	for id, msg := range res.Errors {
		if msg != "" {
			t.Fatalf("insert %s: %s", id, msg)
		}
	}
}

func TestCreateWithId(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	questions := client.Collections.Use("JeopardyQuestion")

	// START CreateWithId
	id := uuid.MustParse("12345678-9abc-4def-8123-456789abcdef")
	res, err := questions.Data.Insert(ctx, &data.Object{
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
	// END CreateWithId

	for oid, msg := range res.Errors {
		if msg != "" {
			t.Fatalf("insert %s: %s", oid, msg)
		}
	}
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
		ReturnVectors: []string{"default"},
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
// partial update, which the v6 Go client does not yet support (it can replace a
// whole object but not merge a change into one).
func TestUpdateVector(t *testing.T) {
	t.Skip("updating an object's vector is not yet available in the v6 Go client")

	// TODO[g-despot]: update-object-vector snippet pending v6 client support
	// START UpdateVector
	// Coming soon
	// END UpdateVector
}

// TestDeleteProperty removes a property value by replacing the object with a copy
// that omits it. It is deferred for the same reason as TestReplaceObject: the v6
// client's Data.Replace omits the object id from the PUT body, but Weaviate's
// class-scoped PUT handler requires body id == path id, so it rejects the request
// with HTTP 422 "field 'id' is immutable". The published DelProps snippet is
// already idiomatic; re-enable once the client sends the id.
func TestDeleteProperty(t *testing.T) {
	t.Skip("go-client v6 Data.Replace omits the object id from the PUT body; Weaviate requires body id == path id (HTTP 422 \"field 'id' is immutable\") — deferred pending a client fix")
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

// TestDeleteDryRun previews a delete-by-filter without removing anything. It is
// deferred for the same reason as TestDeleteMany: the v6 client's
// Data.DeleteSelected panics because *api.DeleteObjectsRequest is not wired into
// the gRPC transport dispatch. The published DryRun snippet is idiomatic;
// re-enable once the client wires it up.
func TestDeleteDryRun(t *testing.T) {
	t.Skip("go-client v6 Data.DeleteSelected panics — *api.DeleteObjectsRequest not wired to gRPC MessageMarshaler; deferred pending a client fix")
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
		DryRun:  true, // Report matches without deleting them.
		Verbose: true, // Include the id and status of each match.
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
