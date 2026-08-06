package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/weaviate/weaviate-go-client/v6/batch"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
)

// TestServerSideBatchImport streams a handful of objects into a collection with
// server-side batching (the gRPC BatchStream RPC, available on Weaviate 1.36+).
// It runs live against the docs test stack: the server paces the stream, the
// client waits for every task to complete, and the test asserts that no object
// failed to import. Fixed, non-leading-zero ids keep the run reproducible. It
// backs the "Go v6" tab of the batch-import how-to's server-side batching
// section.
func TestServerSideBatchImport(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// Start from a clean slate so re-runs are deterministic.
	_ = client.Collections.Delete(ctx, "MyCollection")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MyCollection",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
	}); err != nil {
		t.Fatalf("create MyCollection collection: %v", err)
	}
	defer client.Collections.Delete(ctx, "MyCollection")

	// START ServerSideBatchImportExample
	collection := client.Collections.Use("MyCollection")

	// Open a server-side batch stream. The server sets the send rate, so you do
	// not have to tune batch sizes yourself; WithRetryTimes retries a failed
	// object up to the given number of times.
	// highlight-start
	b, err := collection.Batch(ctx, batch.WithRetryTimes(1))
	if err != nil {
		// handle error
		panic(err)
	}

	// Stream each object. Object() returns a task; the object is written in the
	// background while the server paces the stream. Fixed ids keep the import
	// reproducible.
	ids := []string{
		"a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f",
		"b2c3d4e5-f6a7-4b5c-8d9e-2a3b4c5d6e7f",
		"c3d4e5f6-a7b8-4c5d-8e9f-3a4b5c6d7e80",
		"d4e5f6a7-b8c9-4d5e-8f90-4b5c6d7e8f90",
		"e5f6a7b8-c9d0-4e5f-8a01-5c6d7e8f9012",
	}
	tasks := make([]*batch.Task, 0, len(ids))
	for i, id := range ids {
		objID := uuid.MustParse(id)
		task, err := b.Object(ctx, &data.Object{
			UUID:       &objID,
			Properties: map[string]any{"title": fmt.Sprintf("Object %d", i+1)},
		})
		if err != nil {
			// handle error
			panic(err)
		}
		tasks = append(tasks, task)
	}

	// Close blocks until every streamed object has been written to the server.
	if err := b.Close(); err != nil {
		// handle error
		panic(err)
	}
	// highlight-end

	// After the stream drains, Wait reports whether that object failed to import.
	for _, task := range tasks {
		if err := task.Wait(); err != nil {
			// handle error
			panic(err)
		}
	}
	// END ServerSideBatchImportExample

	// Wait for the streamed objects to become countable (the docs stack runs with
	// async indexing) so the import is settled before the test returns.
	waitForCount(t, client.Collections.Use("MyCollection"), len(ids))
}
