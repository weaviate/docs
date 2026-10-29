package main

import (
	"context"
	"fmt"
	"strings"
	"testing"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
)

// p2bSetupXref (re)creates JeopardyCategory (title) and JeopardyQuestion
// (question, answer, hasCategory -> JeopardyCategory) and seeds the given
// categories and one question.
func p2bSetupXref(t *testing.T, client *weaviate.Client, questionID uuid.UUID, categories map[uuid.UUID]string) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "JeopardyQuestion")
	_ = client.Collections.Delete(ctx, "JeopardyCategory")

	// The reference target must exist before the collection that points to it.
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name:       "JeopardyCategory",
		Properties: []collections.Property{{Name: "title", DataType: collections.DataTypeText}},
	}); err != nil {
		t.Fatal(err)
	}
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "JeopardyQuestion",
		Properties: []collections.Property{
			{Name: "question", DataType: collections.DataTypeText},
			{Name: "answer", DataType: collections.DataTypeText},
		},
		References: []collections.Reference{
			{Name: "hasCategory", Collections: []string{"JeopardyCategory"}},
		},
	}); err != nil {
		t.Fatal(err)
	}

	cats := make([]*data.Object, 0, len(categories))
	for id, title := range categories {
		cats = append(cats, &data.Object{UUID: &id, Properties: map[string]any{"title": title}})
	}
	if _, err := client.Collections.Use("JeopardyCategory").Data.Insert(ctx, cats...); err != nil {
		t.Fatal(err)
	}
	if _, err := client.Collections.Use("JeopardyQuestion").Data.Insert(ctx, &data.Object{
		UUID:       &questionID,
		Properties: map[string]any{"question": "This city is home to the Golden Gate Bridge", "answer": "San Francisco"},
	}); err != nil {
		t.Fatal(err)
	}
}

// p2bRefTargets returns the beacons stored on a reference property, read over REST.
func p2bRefTargets(t *testing.T, collection string, id uuid.UUID, property string) string {
	t.Helper()
	refs, _ := p2bProps(t, collection, id)[property].([]any)
	var b strings.Builder
	for _, r := range refs {
		if m, ok := r.(map[string]any); ok {
			fmt.Fprintf(&b, "%v ", m["beacon"])
		}
	}
	return b.String()
}

func TestAddOneWayCrossReference(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	seedQuestion := uuid.MustParse("d2e3f4a5-b6c7-4d8e-8f9a-9b0c1d2e3f4a")
	seedCategory := uuid.MustParse("c2d3e4f5-a6b7-4c8d-8e9f-8a9b0c1d2e3f")
	p2bSetupXref(t, client, seedQuestion, map[uuid.UUID]string{seedCategory: "U.S. CITIES"})
	defer client.Collections.Delete(ctx, "JeopardyQuestion")
	defer client.Collections.Delete(ctx, "JeopardyCategory")

	// START OneWay
	questionID := uuid.MustParse("d2e3f4a5-b6c7-4d8e-8f9a-9b0c1d2e3f4a") // The source object.
	categoryID := uuid.MustParse("c2d3e4f5-a6b7-4c8d-8e9f-8a9b0c1d2e3f") // The target object.

	questions := client.Collections.Use("JeopardyQuestion")
	_, err := questions.Data.AddReferences(ctx, data.Reference{
		Origin: data.ObjectPath{
			Collection: "JeopardyQuestion",
			Property:   "hasCategory",
			UUID:       questionID,
		},
		// highlight-start
		UUID: categoryID,
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END OneWay

	if got := p2bRefTargets(t, "JeopardyQuestion", seedQuestion, "hasCategory"); !strings.Contains(got, seedCategory.String()) {
		t.Fatalf("hasCategory = %q", got)
	}
}

// TestAddMultipleCrossReferences adds several cross-references from a single
// source object to multiple target objects.
func TestAddMultipleCrossReferences(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	seedQuestion := uuid.MustParse("d1e2f3a4-b5c6-4d7e-8f90-1a2b3c4d5e6f")
	seedCities := uuid.MustParse("e1f2a3b4-c5d6-4e7f-8a90-1b2c3d4e5f60")
	seedMuseums := uuid.MustParse("f1a2b3c4-d5e6-4f70-8a91-2b3c4d5e6f70")
	p2bSetupXref(t, client, seedQuestion, map[uuid.UUID]string{seedCities: "U.S. CITIES", seedMuseums: "MUSEUMS"})
	defer client.Collections.Delete(ctx, "JeopardyQuestion")
	defer client.Collections.Delete(ctx, "JeopardyCategory")

	// Multiple Go
	questionID := uuid.MustParse("d1e2f3a4-b5c6-4d7e-8f90-1a2b3c4d5e6f") // The source object.
	usCitiesID := uuid.MustParse("e1f2a3b4-c5d6-4e7f-8a90-1b2c3d4e5f60") // A target object.
	museumsID := uuid.MustParse("f1a2b3c4-d5e6-4f70-8a91-2b3c4d5e6f70")  // Another target object.

	questions := client.Collections.Use("JeopardyQuestion")

	// highlight-start
	_, err := questions.Data.AddReferences(ctx,
		data.Reference{
			Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: questionID},
			UUID:   usCitiesID,
		},
		data.Reference{
			Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: questionID},
			UUID:   museumsID,
		},
	)
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
	}
	// END Multiple Go

	got := p2bRefTargets(t, "JeopardyQuestion", seedQuestion, "hasCategory")
	if !strings.Contains(got, seedCities.String()) || !strings.Contains(got, seedMuseums.String()) {
		t.Fatalf("hasCategory = %q", got)
	}
}

// TestAddTwoWayCrossReferences adds the reverse reference property to the
// existing JeopardyCategory collection, then links a question and a category in
// both directions.
func TestAddTwoWayCrossReferences(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	seedQuestion := uuid.MustParse("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d")
	seedCategory := uuid.MustParse("b1c2d3e4-f5a6-4b7c-8d9e-1f2a3b4c5d6e")
	p2bSetupXref(t, client, seedQuestion, map[uuid.UUID]string{seedCategory: "U.S. CITIES"})
	defer client.Collections.Delete(ctx, "JeopardyQuestion")
	defer client.Collections.Delete(ctx, "JeopardyCategory")

	// START TwoWayCategory2
	// Add the reference to JeopardyQuestion, after it was created
	category := client.Collections.Use("JeopardyCategory")
	err := category.Config.AddReference(ctx, collections.Reference{
		// highlight-start
		Name:        "hasQuestion",
		Collections: []string{"JeopardyQuestion"},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END TwoWayCategory2

	// TwoWay Go
	questionID := uuid.MustParse("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d") // The "San Francisco" question.
	categoryID := uuid.MustParse("b1c2d3e4-f5a6-4b7c-8d9e-1f2a3b4c5d6e") // The "U.S. CITIES" category.

	// For the question, add a cross-reference to the category
	questions := client.Collections.Use("JeopardyQuestion")
	// highlight-start
	if _, err := questions.Data.AddReferences(ctx, data.Reference{
		Origin: data.ObjectPath{Collection: "JeopardyQuestion", Property: "hasCategory", UUID: questionID},
		UUID:   categoryID,
	}); err != nil {
		// handle error
		panic(err)
	}
	// highlight-end

	// For the category, add a cross-reference to the question
	categories := client.Collections.Use("JeopardyCategory")
	// highlight-start
	if _, err := categories.Data.AddReferences(ctx, data.Reference{
		Origin: data.ObjectPath{Collection: "JeopardyCategory", Property: "hasQuestion", UUID: categoryID},
		UUID:   questionID,
	}); err != nil {
		// handle error
		panic(err)
	}
	// highlight-end
	// END TwoWay Go

	if got := p2bRefTargets(t, "JeopardyQuestion", seedQuestion, "hasCategory"); !strings.Contains(got, seedCategory.String()) {
		t.Fatalf("hasCategory = %q", got)
	}
	if got := p2bRefTargets(t, "JeopardyCategory", seedCategory, "hasQuestion"); !strings.Contains(got, seedQuestion.String()) {
		t.Fatalf("hasQuestion = %q", got)
	}
}

// TestDeleteCrossReference is a placeholder: rc.0 can only drop a reference by
// replacing the whole object.
func TestDeleteCrossReference(t *testing.T) {
	t.Skip("no reference-delete call at v6.0.0-rc.0: dropping one reference means Data.Replace of the whole object with the remaining references")

	// TODO[g-despot]: cross-reference delete snippet pending v6 client support
	// Delete Go
	// Coming soon
	// END Delete Go
}

// TestUpdateCrossReference is a placeholder: rc.0 can only change a reference
// list by replacing the whole object.
func TestUpdateCrossReference(t *testing.T) {
	t.Skip("no reference-replace call at v6.0.0-rc.0: Data.Replace rewrites the whole object, every property included, to change one reference list")

	// TODO[g-despot]: cross-reference update snippet pending v6 client support
	// Update Go
	// Coming soon
	// END Update Go
}
