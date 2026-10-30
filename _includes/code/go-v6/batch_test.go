package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/batch"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
)

// TestServerSideBatchImport streams objects into a collection with server-side
// batching (the gRPC BatchStream RPC). It backs the Go v6 tab of the import
// how-to's server-side batching section. No reference goes through the stream:
// at v6.0.0-rc.0 a streamed reference makes Close hang.
func TestServerSideBatchImport(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	dataRows := make([]map[string]any, 0, 5)
	for i := range 5 {
		dataRows = append(dataRows, map[string]any{"title": fmt.Sprintf("Object %d", i+1)})
	}

	collection := client.Collections.Use("MyCollection")

	// highlight-start
	// Open a server-side batch stream. The client sends objects
	// at the rate the server requests.
	b := collection.Batch(ctx, batch.WithRetryTimes(1))

	tasks := make([]*batch.Task, 0, len(dataRows))
	for _, row := range dataRows {
		task, err := b.Object(ctx, &data.Object{Properties: row})
		if err != nil {
			// handle error
			panic(err)
		}
		tasks = append(tasks, task)
	}

	// Close blocks until every task has completed.
	if err := b.Close(); err != nil {
		// handle error
		panic(err)
	}
	// highlight-end

	// Wait returns the error of a task that failed.
	failed := 0
	for _, task := range tasks {
		if err := task.Wait(); err != nil {
			failed++
			fmt.Printf("Failed to import %s: %v\n", task.ID(), err)
		}
	}
	if failed > 0 {
		fmt.Printf("Number of failed imports: %d\n", failed)
	}
	// END ServerSideBatchImportExample

	if failed != 0 {
		t.Fatalf("%d objects failed to import", failed)
	}
	waitForCount(t, client.Collections.Use("MyCollection"), len(dataRows))
}
