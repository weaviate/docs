package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
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
			{Name: "points", DataType: collections.DataTypeInt},
		},
	}); err != nil {
		t.Fatalf("create JeopardyQuestion collection: %v", err)
	}
}

// p2bSetupEphemeral (re)creates the EphemeralObject collection the delete
// snippets use and seeds it with one object per name.
func p2bSetupEphemeral(t *testing.T, client *weaviate.Client, objects map[uuid.UUID]string) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "EphemeralObject")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name:       "EphemeralObject",
		Properties: []collections.Property{{Name: "name", DataType: collections.DataTypeText}},
	}); err != nil {
		t.Fatalf("create EphemeralObject collection: %v", err)
	}
	if len(objects) == 0 {
		return
	}
	batch := make([]*data.Object, 0, len(objects))
	for id, name := range objects {
		batch = append(batch, &data.Object{UUID: &id, Properties: map[string]any{"name": name}})
	}
	if _, err := client.Collections.Use("EphemeralObject").Data.Insert(ctx, batch...); err != nil {
		t.Fatalf("seed EphemeralObject: %v", err)
	}
	waitForCount(t, client.Collections.Use("EphemeralObject"), len(objects))
}

// p2bCount returns the object count of a collection.
func p2bCount(t *testing.T, client *weaviate.Client, collection string) int64 {
	t.Helper()
	n, err := client.Collections.Use(collection).Count(context.Background())
	if err != nil {
		t.Fatalf("count %s: %v", collection, err)
	}
	return n
}

// p2bRESTObject reads an object back over REST, independent of the client, so a
// test can prove what a write actually stored.
func p2bRESTObject(t *testing.T, collection string, id uuid.UUID, include string) map[string]any {
	t.Helper()
	url := fmt.Sprintf("http://localhost:8080/v1/objects/%s/%s", collection, id)
	if include != "" {
		url += "?include=" + include
	}
	resp, err := http.Get(url)
	if err != nil {
		t.Fatalf("GET %s: %v", url, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNotFound {
		return nil
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("GET %s: HTTP %d", url, resp.StatusCode)
	}
	var obj map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&obj); err != nil {
		t.Fatalf("decode %s: %v", url, err)
	}
	return obj
}

func p2bProps(t *testing.T, collection string, id uuid.UUID) map[string]any {
	t.Helper()
	obj := p2bRESTObject(t, collection, id, "")
	if obj == nil {
		t.Fatalf("object %s/%s not found", collection, id)
	}
	props, _ := obj["properties"].(map[string]any)
	return props
}

func TestCreateObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START CreateObject
	questions := client.Collections.Use("JeopardyQuestion")

	// highlight-start
	res, err := questions.Data.Insert(ctx, &data.Object{
		// highlight-end
		Properties: map[string]any{
			"question": "This vector DB is OSS & supports automatic property type inference on import",
			// "answer": "Weaviate", // Properties can be omitted.
			"newProperty": 123, // Auto-schema adds this as a number property.
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}

	fmt.Println(res.UUIDs[0]) // The id of the new object.
	// END CreateObject

	props := p2bProps(t, "JeopardyQuestion", res.UUIDs[0])
	if props["newProperty"] != float64(123) {
		t.Fatalf("newProperty = %v, want 123", props["newProperty"])
	}
}

func TestReplaceObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	seedID := uuid.MustParse("e1f2a3b4-c5d6-4e7f-8a9b-4c5d6e7f8a9b")
	if _, err := client.Collections.Use("JeopardyQuestion").Data.Insert(ctx, &data.Object{
		UUID: &seedID,
		Properties: map[string]any{
			"question": "Test question",
			"answer":   "Test answer",
			"points":   -1,
		},
	}); err != nil {
		t.Fatal(err)
	}

	// START UpdateReplace
	questions := client.Collections.Use("JeopardyQuestion")
	id := uuid.MustParse("e1f2a3b4-c5d6-4e7f-8a9b-4c5d6e7f8a9b") // The object to replace.

	// highlight-start
	err := questions.Data.Replace(ctx, data.Object{
		// highlight-end
		UUID: &id,
		Properties: map[string]any{
			"answer": "Replaced",
			// The other properties are deleted.
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END UpdateReplace

	props := p2bProps(t, "JeopardyQuestion", seedID)
	if props["answer"] != "Replaced" || props["question"] != nil || props["points"] != nil {
		t.Fatalf("after replace: %v", props)
	}
}

func TestPartialUpdate(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	seedID := uuid.MustParse("a3b4c5d6-e7f8-4a9b-8c0d-1e2f3a4b5c6d")
	if _, err := client.Collections.Use("JeopardyQuestion").Data.Insert(ctx, &data.Object{
		UUID: &seedID,
		Properties: map[string]any{
			"question": "Test question",
			"answer":   "Test answer",
			"points":   -1,
		},
	}); err != nil {
		t.Fatal(err)
	}

	// START UpdateMerge
	questions := client.Collections.Use("JeopardyQuestion")
	id := uuid.MustParse("a3b4c5d6-e7f8-4a9b-8c0d-1e2f3a4b5c6d") // The object to update.

	err := questions.Data.Update(ctx, data.Object{
		UUID: &id,
		// highlight-start
		Properties: map[string]any{
			"points": 100,
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END UpdateMerge

	props := p2bProps(t, "JeopardyQuestion", seedID)
	if props["points"] != float64(100) || props["question"] != "Test question" || props["answer"] != "Test answer" {
		t.Fatalf("after update: %v", props)
	}
}

func TestDeleteObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	seedID := uuid.MustParse("f1a2b3c4-d5e6-4f7a-8b9c-5d6e7f8a9b0c")
	p2bSetupEphemeral(t, client, map[uuid.UUID]string{seedID: "EphemeralObjectA"})
	defer client.Collections.Delete(ctx, "EphemeralObject")

	// START DeleteObject
	collection := client.Collections.Use("EphemeralObject")
	id := uuid.MustParse("f1a2b3c4-d5e6-4f7a-8b9c-5d6e7f8a9b0c") // The object to delete.

	// highlight-start
	err := collection.Data.Delete(ctx, id)
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
	}
	// END DeleteObject

	if p2bRESTObject(t, "EphemeralObject", seedID, "") != nil {
		t.Fatal("object still exists after delete")
	}
}

// p2bEphemeralFive seeds five EphemeralObject_<i> objects with fixed ids.
func p2bEphemeralFive() map[uuid.UUID]string {
	return map[uuid.UUID]string{
		uuid.MustParse("a5b6c7d8-0001-4a00-8000-000000000001"): "EphemeralObject_0",
		uuid.MustParse("a5b6c7d8-0002-4a00-8000-000000000002"): "EphemeralObject_1",
		uuid.MustParse("a5b6c7d8-0003-4a00-8000-000000000003"): "EphemeralObject_2",
		uuid.MustParse("a5b6c7d8-0004-4a00-8000-000000000004"): "EphemeralObject_3",
		uuid.MustParse("a5b6c7d8-0005-4a00-8000-000000000005"): "EphemeralObject_4",
	}
}

func TestDeleteMany(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	p2bSetupEphemeral(t, client, p2bEphemeralFive())
	defer client.Collections.Delete(ctx, "EphemeralObject")

	// START DeleteMany
	collection := client.Collections.Use("EphemeralObject")

	_, err := collection.Data.DeleteSelected(ctx, data.DeleteSelected{
		// highlight-start
		Filter: &filter.Cond{
			Target:   "name",
			Operator: filter.Like,
			Value:    "EphemeralObject*",
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END DeleteMany

	if n := p2bCount(t, client, "EphemeralObject"); n != 0 {
		t.Fatalf("count after delete = %d, want 0", n)
	}
}

func TestDeleteContains(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	p2bSetupEphemeral(t, client, map[uuid.UUID]string{
		uuid.MustParse("b5c6d7e8-0001-4b00-8000-000000000001"): "asia",
		uuid.MustParse("b5c6d7e8-0002-4b00-8000-000000000002"): "europe",
		uuid.MustParse("b5c6d7e8-0003-4b00-8000-000000000003"): "africa",
	})
	defer client.Collections.Delete(ctx, "EphemeralObject")

	// START DeleteContains
	collection := client.Collections.Use("EphemeralObject")

	_, err := collection.Data.DeleteSelected(ctx, data.DeleteSelected{
		Filter: &filter.Cond{
			Target: "name",
			// highlight-start
			Operator: filter.ContainsAny, // Or filter.ContainsAll, filter.ContainsNone
			Value:    []string{"europe", "asia"},
			// highlight-end
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END DeleteContains

	if n := p2bCount(t, client, "EphemeralObject"); n != 1 {
		t.Fatalf("count after delete = %d, want 1", n)
	}
}

func TestDeleteByIDBatch(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	p2bSetupEphemeral(t, client, p2bEphemeralFive())
	defer client.Collections.Delete(ctx, "EphemeralObject")

	// START DeleteByIDBatch
	collection := client.Collections.Use("EphemeralObject")

	response, err := collection.Query.OverAll(ctx, query.OverAll{Limit: 3}) // Fetch 3 object ids
	if err != nil {
		// handle error
		panic(err)
	}
	ids := make([]uuid.UUID, 0, len(response.Objects))
	for _, obj := range response.Objects {
		ids = append(ids, obj.UUID)
	}

	_, err = collection.Data.DeleteSelected(ctx, data.DeleteSelected{
		// highlight-start
		Filter: &filter.Cond{
			Target:   filter.UUID,
			Operator: filter.ContainsAny,
			Value:    ids, // Delete the 3 objects
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END DeleteByIDBatch

	if n := p2bCount(t, client, "EphemeralObject"); n != 2 {
		t.Fatalf("count after delete = %d, want 2", n)
	}
}

// TestReadObjectByID selects one object with a filter on its id: rc.0 has no
// fetch-by-id call.
func TestReadObjectByID(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyDemo(t, client)
	defer cleanupJeopardyDemo(ctx, client)

	// START ReadObject
	questions := client.Collections.Use("JeopardyQuestion")
	// There is no fetch-by-id call. Filter on the object id instead.
	// highlight-start
	response, err := questions.Query.OverAll(ctx, query.OverAll{
		Filter: &filter.Cond{
			Target:   filter.UUID,
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
			{Name: "points", DataType: collections.DataTypeInt},
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

	// START CreateWithVector
	questions := client.Collections.Use("JeopardyQuestion")

	res, err := questions.Data.Insert(ctx, &data.Object{
		Properties: map[string]any{
			"question": "This vector DB is OSS and supports automatic property type inference on import",
			"answer":   "Weaviate",
		},
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

	fmt.Println(res.UUIDs[0]) // The id of the new object.
	// END CreateWithVector

	obj := p2bRESTObject(t, "JeopardyQuestion", res.UUIDs[0], "vector")
	vecs, _ := obj["vectors"].(map[string]any)
	if v, _ := vecs["default"].([]any); len(v) != 3 {
		t.Fatalf("stored vectors = %v", obj["vectors"])
	}
}

func TestCreateWithId(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START CreateWithId
	questions := client.Collections.Use("JeopardyQuestion")

	// highlight-start
	id := uuid.MustParse("12345678-e64f-5d94-90db-c8cfa3fc1234")
	// highlight-end
	res, err := questions.Data.Insert(ctx, &data.Object{
		// highlight-start
		UUID: &id,
		// highlight-end
		Properties: map[string]any{
			"question": "This vector DB is OSS and supports automatic property type inference on import",
			"answer":   "Weaviate",
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}

	fmt.Println(res.UUIDs[0]) // The id of the new object.
	// END CreateWithId

	if res.UUIDs[0] != id {
		t.Fatalf("inserted id = %s, want %s", res.UUIDs[0], id)
	}
}

// TestCreateWithDeterministicId is a placeholder: rc.0 has no deterministic
// (UUID5) id helper.
func TestCreateWithDeterministicId(t *testing.T) {
	t.Skip("no deterministic (UUID5) id helper at v6.0.0-rc.0")

	// TODO[g-despot]: deterministic-id snippet pending v6 client support
	// START CreateWithDeterministicId
	// Coming soon
	// END CreateWithDeterministicId
}

// TestValidateObject is a placeholder: rc.0 has no object validation call.
func TestValidateObject(t *testing.T) {
	t.Skip("no object validation call (/objects/validate) at v6.0.0-rc.0")

	// TODO[g-despot]: validate-object snippet pending v6 client support
	// START ValidateObject
	// Coming soon
	// END ValidateObject
}

// TestReadWithVector selects one object with a filter on its id and requests
// its vector: rc.0 has no fetch-by-id call.
func TestReadWithVector(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START ReadWithVector
	questions := client.Collections.Use("JeopardyQuestion")
	// There is no fetch-by-id call. Filter on the object id instead.
	response, err := questions.Query.OverAll(ctx, query.OverAll{
		Filter: &filter.Cond{
			Target:   filter.UUID,
			Operator: filter.Equal,
			Value:    "a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f",
		},
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

func TestUpdateVector(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyBYOV(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	seedID := uuid.MustParse("c4d5e6f7-a8b9-4c0d-8e1f-2a3b4c5d6e7f")
	if _, err := client.Collections.Use("JeopardyQuestion").Data.Insert(ctx, &data.Object{
		UUID:       &seedID,
		Properties: map[string]any{"question": "Test question", "answer": "Test answer", "points": -1},
		Vectors:    []types.Vector{{Name: "default", Single: []float32{0.1, 0.2, 0.3}}},
	}); err != nil {
		t.Fatal(err)
	}

	// START UpdateVector
	questions := client.Collections.Use("JeopardyQuestion")
	id := uuid.MustParse("c4d5e6f7-a8b9-4c0d-8e1f-2a3b4c5d6e7f") // The object to update.

	err := questions.Data.Update(ctx, data.Object{
		UUID: &id,
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
	// END UpdateVector

	obj := p2bRESTObject(t, "JeopardyQuestion", seedID, "vector")
	vecs, _ := obj["vectors"].(map[string]any)
	v, _ := vecs["default"].([]any)
	if len(v) != 3 || fmt.Sprint(v[0]) != "0.12345" {
		t.Fatalf("stored vectors = %v", obj["vectors"])
	}
	props, _ := obj["properties"].(map[string]any)
	if props["question"] != "Test question" || props["points"] != float64(-1) {
		t.Fatalf("properties not kept: %v", props)
	}
}

func TestDeleteProperty(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	seedID := uuid.MustParse("b1e2d3c4-a5f6-4e7d-8c9b-1a2b3c4d5e6f")
	if _, err := client.Collections.Use("JeopardyQuestion").Data.Insert(ctx, &data.Object{
		UUID: &seedID,
		Properties: map[string]any{
			"question": "Test question",
			"answer":   "Test answer",
			"points":   100,
		},
	}); err != nil {
		t.Fatal(err)
	}
	waitForCount(t, client.Collections.Use("JeopardyQuestion"), 1)

	// START DelProps
	questions := client.Collections.Use("JeopardyQuestion")
	id := uuid.MustParse("b1e2d3c4-a5f6-4e7d-8c9b-1a2b3c4d5e6f") // The object to update.
	propNames := []string{"answer"}                              // The properties to delete.

	// Fetch the object.
	response, err := questions.Query.OverAll(ctx, query.OverAll{
		Filter: &filter.Cond{Target: filter.UUID, Operator: filter.Equal, Value: id},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	if len(response.Objects) == 0 {
		panic("object not found")
	}

	// Remove the unwanted properties.
	properties := response.Objects[0].Properties
	for _, name := range propNames {
		delete(properties, name)
	}

	// Replace the object with the remaining properties.
	err = questions.Data.Replace(ctx, data.Object{UUID: &id, Properties: properties})
	if err != nil {
		// handle error
		panic(err)
	}
	// END DelProps

	props := p2bProps(t, "JeopardyQuestion", seedID)
	if props["answer"] != nil || props["question"] != "Test question" {
		t.Fatalf("after delete property: %v", props)
	}
}

func TestDeleteDryRun(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	p2bSetupEphemeral(t, client, p2bEphemeralFive())
	defer client.Collections.Delete(ctx, "EphemeralObject")

	// START DryRun
	collection := client.Collections.Use("EphemeralObject")

	res, err := collection.Data.DeleteSelected(ctx, data.DeleteSelected{
		Filter: &filter.Cond{
			Target:   "name",
			Operator: filter.Like,
			Value:    "EphemeralObject*",
		},
		// highlight-start
		DryRun: true,
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}

	fmt.Printf("Matched %d objects, deleted none\n", res.Matches)
	// END DryRun

	if res.Matches != 5 {
		t.Fatalf("matches = %d, want 5", res.Matches)
	}
	if n := p2bCount(t, client, "EphemeralObject"); n != 5 {
		t.Fatalf("count after dry run = %d, want 5", n)
	}
}
