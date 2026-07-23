package main

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
)

func TestAddOneWayCrossReference(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "JeopardyQuestion")
	_ = client.Collections.Delete(ctx, "JeopardyCategory")
	defer client.Collections.Delete(ctx, "JeopardyQuestion")
	defer client.Collections.Delete(ctx, "JeopardyCategory")

	// The reference target must exist before the collection that points to it.
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyCategory",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
	}); err != nil {
		t.Fatal(err)
	}
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyQuestion",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
		},
		References: []collections.Reference{
			{Name: "hasCategory", Collections: []string{"JeopardyCategory"}},
		},
	}); err != nil {
		t.Fatal(err)
	}

	categories := client.Collections.Use("JeopardyCategory")
	questions := client.Collections.Use("JeopardyQuestion")

	categoryID := uuid.New()
	if _, err := categories.Data.Insert(ctx, &data.Object{
		UUID:       &categoryID,
		Properties: map[string]any{"title": "SCIENCE"},
	}); err != nil {
		t.Fatal(err)
	}
	questionID := uuid.New()
	if _, err := questions.Data.Insert(ctx, &data.Object{
		UUID:       &questionID,
		Properties: map[string]any{"question": "This vector database is written in Go"},
	}); err != nil {
		t.Fatal(err)
	}

	// START OneWay
	// Add a reference from the source object (a JeopardyQuestion) to the target
	// object (a JeopardyCategory) through the "hasCategory" reference property.
	res, err := questions.Data.AddReferences(ctx, data.Reference{
		Origin: data.ObjectPath{
			Collection: "JeopardyQuestion",
			Property:   "hasCategory",
			UUID:       questionID,
		},
		UUID: categoryID,
	})
	if err != nil {
		t.Fatal(err)
	}
	// END OneWay

	for ref, msg := range res.Errors {
		if msg != "" {
			t.Fatalf("add reference %v: %s", ref, msg)
		}
	}
}

// TestDeleteCrossReference is a placeholder: the v6 Go client can add
// references but cannot yet delete them.
func TestDeleteCrossReference(t *testing.T) {
	t.Skip("deleting a cross-reference is not yet available in the v6 Go client")

	// TODO[g-despot]: cross-reference delete snippet pending v6 client support
	// Delete Go
	// Coming soon
	// END Delete Go
}

// TestUpdateCrossReference is a placeholder: the v6 Go client can add
// references but cannot yet update (replace) them.
func TestUpdateCrossReference(t *testing.T) {
	t.Skip("updating a cross-reference is not yet available in the v6 Go client")

	// TODO[g-despot]: cross-reference update snippet pending v6 client support
	// Update Go
	// Coming soon
	// END Update Go
}
