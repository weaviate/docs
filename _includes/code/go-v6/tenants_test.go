package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/tenant"
)

// TestEnableMultiTenancy creates a collection with multi-tenancy turned on.
func TestEnableMultiTenancy(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MultiTenancyCollection")
	defer client.Collections.Delete(ctx, "MultiTenancyCollection")

	// START EnableMultiTenancy
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MultiTenancyCollection",
		// highlight-start
		MultiTenancy: &collections.MultiTenancyConfig{
			Enabled: true,
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END EnableMultiTenancy
}

// TestEnableAutoMT creates a multi-tenancy collection that creates tenants
// automatically when data is inserted for an unknown tenant.
func TestEnableAutoMT(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "CollectionWithAutoMTEnabled")
	defer client.Collections.Delete(ctx, "CollectionWithAutoMTEnabled")

	// START EnableAutoMT
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "CollectionWithAutoMTEnabled",
		// highlight-start
		MultiTenancy: &collections.MultiTenancyConfig{
			Enabled:            true,
			AutoTenantCreation: true,
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END EnableAutoMT

	p2yExpect(t, p2yRESTClass(t, "CollectionWithAutoMTEnabled"), map[string]any{
		"multiTenancyConfig.enabled":            true,
		"multiTenancyConfig.autoTenantCreation": true,
	})
}

// TestUpdateAutoMT is a placeholder. Config.UpdateMultiTenancyConfig exists,
// but it re-sends the whole collection and the server rejects it with HTTP 422
// on any collection that has a property.
func TestUpdateAutoMT(t *testing.T) {
	t.Skip("fails at v6.0.0-rc.0: every Config.Update* call returns HTTP 422 on a collection with properties or an HNSW vector")

	// TODO[g-despot]: update-auto-tenant snippet pending a client fix for the HTTP 422
	// START UpdateAutoMT
	// Coming soon
	// END UpdateAutoMT
}

// TestAddTenantsToClass adds tenants to a multi-tenancy collection.
func TestAddTenantsToClass(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// A fresh collection with no tenants; the snippet creates them.
	createMultiTenancyCollection(t, client)
	defer cleanupMultiTenancy(ctx, client)

	// START AddTenantsToClass
	collection := client.Collections.Use("MultiTenancyCollection")

	// Add two tenants to the collection
	// highlight-start
	err := collection.Tenants.Create(ctx,
		tenant.Tenant{Name: "tenantA"},
		tenant.Tenant{Name: "tenantB"},
	)
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddTenantsToClass

	got, err := collection.Tenants.Get(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 2 {
		t.Fatalf("got %d tenants, want 2", len(got))
	}
}

// TestListTenants lists every tenant in a multi-tenancy collection.
func TestListTenants(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupMultiTenancy(t, client)
	defer cleanupMultiTenancy(ctx, client)

	// START ListTenants
	collection := client.Collections.Use("MultiTenancyCollection")
	// Passing no tenant names returns every tenant in the collection.
	// highlight-start
	tenants, err := collection.Tenants.Get(ctx)
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
	}
	for _, tn := range tenants {
		fmt.Printf("%s: %s\n", tn.Name, tn.Status)
	}
	// END ListTenants
}

// TestRemoveTenants deletes tenants (and their data) from a collection.
func TestRemoveTenants(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupMultiTenancy(t, client)
	defer cleanupMultiTenancy(ctx, client)

	// START RemoveTenants
	collection := client.Collections.Use("MultiTenancyCollection")
	// Unknown tenant names are ignored.
	// highlight-start
	err := collection.Tenants.Delete(ctx, "tenantB", "tenantX")
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
	}
	// END RemoveTenants
}

// TestCreateMtObject inserts an object into a specific tenant. The tenant is
// bound once on the collection handle and applies to every operation made with
// it.
func TestCreateMtObject(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupMultiTenancy(t, client)
	defer cleanupMultiTenancy(ctx, client)

	// START CreateMtObject
	// Bind the tenant to the collection handle.
	// highlight-start
	collection := client.Collections.Use("MultiTenancyCollection",
		collections.WithTenant("tenantA"),
	)
	// highlight-end
	_, err := collection.Data.Insert(ctx, &data.Object{
		Properties: map[string]any{
			"question": "This vector DB is OSS & supports automatic property type inference on import",
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CreateMtObject
}

// TestMtSearch runs a query scoped to a single tenant.
func TestMtSearch(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupMultiTenancy(t, client)
	defer cleanupMultiTenancy(ctx, client)

	// START Search
	// highlight-start
	collection := client.Collections.Use("MultiTenancyCollection",
		collections.WithTenant("tenantA"),
	)
	// highlight-end
	response, err := collection.Query.OverAll(ctx, query.OverAll{
		Limit: 2,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END Search
}

// TestMtAddCrossRef adds a cross-reference property to a multi-tenancy
// collection, then a cross-reference from an object that belongs to a tenant.
// The tenant is bound on the handle used to make the request.
func TestMtAddCrossRef(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	p2ySetupMultiTenancyNoRef(t, client)
	defer cleanupMultiTenancy(ctx, client)

	// Reference a seeded MultiTenancyCollection question (in tenantA) as the
	// source and a seeded JeopardyCategory row as the target.
	sourceID := mtSourceID
	targetID := mtCategoryID

	// START AddCrossRef
	collection := client.Collections.Use("MultiTenancyCollection")
	// Add the cross-reference property to the multi-tenancy collection
	err := collection.Config.AddReference(ctx, collections.Reference{
		Name:        "hasCategory",
		Collections: []string{"JeopardyCategory"},
	})
	if err != nil {
		// handle error
		panic(err)
	}

	// Get a handle bound to the required tenant
	// highlight-start
	tenantA := collection.WithOptions(collections.WithTenant("tenantA"))
	// highlight-end

	// Add a reference from a MultiTenancyCollection object to a JeopardyCategory object
	// sourceID: MultiTenancyCollection object id. targetID: JeopardyCategory id.
	_, err = tenantA.Data.AddReferences(ctx, data.Reference{
		Origin: data.ObjectPath{
			Collection: "MultiTenancyCollection",
			Property:   "hasCategory",
			UUID:       sourceID,
		},
		UUID: targetID,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddCrossRef

	p2yExpect(t, p2yRESTClass(t, "MultiTenancyCollection"), map[string]any{
		"properties.hasCategory.dataType": []any{"JeopardyCategory"},
	})
	resp, err := http.Get("http://localhost:8080/v1/objects/MultiTenancyCollection/" + sourceID.String() + "?tenant=tenantA")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	var obj struct {
		Properties struct {
			HasCategory []struct {
				Beacon string `json:"beacon"`
			} `json:"hasCategory"`
		} `json:"properties"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&obj); err != nil {
		t.Fatal(err)
	}
	if refs := obj.Properties.HasCategory; len(refs) != 1 || !strings.HasSuffix(refs[0].Beacon, targetID.String()) {
		t.Fatalf("hasCategory on the tenantA object = %+v, want one reference to %s", refs, targetID)
	}
}

// p2ySetupMultiTenancyNoRef seeds MultiTenancyCollection (tenantA) and
// JeopardyCategory like setupMultiTenancy, but without the hasCategory
// reference property, so the AddCrossRef snippet creates it.
func p2ySetupMultiTenancyNoRef(t *testing.T, client *weaviate.Client) {
	t.Helper()
	ctx := context.Background()
	cleanupMultiTenancy(ctx, client)
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name:       "JeopardyCategory",
		Properties: []collections.Property{{Name: "title", DataType: collections.DataTypeText}},
	}); err != nil {
		t.Fatalf("create JeopardyCategory: %v", err)
	}
	if _, err := client.Collections.Use("JeopardyCategory").Data.Insert(ctx,
		&data.Object{UUID: &mtCategoryID, Properties: map[string]any{"title": "Software"}},
	); err != nil {
		t.Fatalf("seed JeopardyCategory: %v", err)
	}
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name:         "MultiTenancyCollection",
		Properties:   []collections.Property{{Name: "question", DataType: collections.DataTypeText}},
		MultiTenancy: &collections.MultiTenancyConfig{Enabled: true},
	}); err != nil {
		t.Fatalf("create MultiTenancyCollection: %v", err)
	}
	if err := client.Collections.Use("MultiTenancyCollection").Tenants.Create(ctx, tenant.Tenant{Name: "tenantA"}); err != nil {
		t.Fatalf("create tenantA: %v", err)
	}
	tenantA := client.Collections.Use("MultiTenancyCollection", collections.WithTenant("tenantA"))
	if _, err := tenantA.Data.Insert(ctx, &data.Object{UUID: &mtSourceID, Properties: map[string]any{
		"question": "This vector DB is OSS and supports automatic property type inference on import",
	}}); err != nil {
		t.Fatalf("seed tenantA: %v", err)
	}
	waitForCount(t, tenantA, 1)
}
