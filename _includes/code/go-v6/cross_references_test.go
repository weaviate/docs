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

	categoryID := uuid.MustParse("c2d3e4f5-a6b7-4c8d-8e9f-8a9b0c1d2e3f")
	if _, err := categories.Data.Insert(ctx, &data.Object{
		UUID:       &categoryID,
		Properties: map[string]any{"title": "SCIENCE"},
	}); err != nil {
		t.Fatal(err)
	}
	questionID := uuid.MustParse("d2e3f4a5-b6c7-4d8e-8f9a-9b0c1d2e3f4a")
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
		// handle error
		panic(err)
	}
	// END OneWay

	for ref, msg := range res.Errors {
		if msg != "" {
			t.Fatalf("add reference %v: %s", ref, msg)
		}
	}
}

// TestAddMultipleCrossReferences adds several cross-references from a single
// source object to multiple target objects.
func TestAddMultipleCrossReferences(t *testing.T) {
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

	questionID := uuid.MustParse("d1e2f3a4-b5c6-4d7e-8f90-1a2b3c4d5e6f")
	if _, err := questions.Data.Insert(ctx, &data.Object{
		UUID:       &questionID,
		Properties: map[string]any{"question": "This vector database is written in Go"},
	}); err != nil {
		t.Fatal(err)
	}
	usCitiesID := uuid.MustParse("e1f2a3b4-c5d6-4e7f-8a90-1b2c3d4e5f60")
	museumsID := uuid.MustParse("f1a2b3c4-d5e6-4f70-8a91-2b3c4d5e6f70")
	if _, err := categories.Data.Insert(ctx,
		&data.Object{UUID: &usCitiesID, Properties: map[string]any{"title": "U.S. CITIES"}},
		&data.Object{UUID: &museumsID, Properties: map[string]any{"title": "MUSEUMS"}},
	); err != nil {
		t.Fatal(err)
	}

	// Multiple Go
	// Add several cross-references from one source object (a JeopardyQuestion)
	// to multiple target objects (two JeopardyCategory objects) through the
	// "hasCategory" reference property.
	res, err := questions.Data.AddReferences(ctx,
		data.Reference{
			Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: questionID},
			UUID:   usCitiesID,
		},
		data.Reference{
			Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: questionID},
			UUID:   museumsID,
		},
	)
	if err != nil {
		// handle error
		panic(err)
	}
	// END Multiple Go

	for ref, msg := range res.Errors {
		if msg != "" {
			t.Fatalf("add reference %v: %s", ref, msg)
		}
	}
}

// TestAddTwoWayCrossReferences shows how to add cross-references in both
// directions between a question and a category. It is skipped because the
// two-way pattern needs a reverse reference property ("hasQuestion") on the
// already-created JeopardyCategory collection, and adding a property to an
// existing collection (a collection update) is not yet available in the v6 Go
// client.
func TestAddTwoWayCrossReferences(t *testing.T) {
	t.Skip("two-way cross-references need a reverse reference property added to the existing JeopardyCategory collection, which requires a collection update not yet available in the v6 Go client")

	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	questions := client.Collections.Use("JeopardyQuestion")
	categories := client.Collections.Use("JeopardyCategory")

	questionID := uuid.MustParse("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d")
	categoryID := uuid.MustParse("b1c2d3e4-f5a6-4b7c-8d9e-1f2a3b4c5d6e")

	// TwoWay Go
	// Reference the category from the question...
	if _, err := questions.Data.AddReferences(ctx, data.Reference{
		Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: questionID},
		UUID:   categoryID,
	}); err != nil {
		// handle error
		panic(err)
	}

	// ...then reference the question back from the category.
	if _, err := categories.Data.AddReferences(ctx, data.Reference{
		Origin: data.ObjectPath{Collection: "JeopardyCategory", Property: "hasQuestion", UUID: categoryID},
		UUID:   questionID,
	}); err != nil {
		// handle error
		panic(err)
	}
	// END TwoWay Go
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
