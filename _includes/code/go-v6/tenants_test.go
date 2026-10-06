package main

import (
	"context"
	"fmt"
	"testing"

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

// TestMtAddCrossRef adds a cross-reference from an object that belongs to a
// tenant. The tenant is bound on the handle used to make the request.
func TestMtAddCrossRef(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupMultiTenancy(t, client)
	defer cleanupMultiTenancy(ctx, client)

	// Reference a seeded MultiTenancyCollection question (in tenantA) as the
	// source and a seeded JeopardyCategory row as the target.
	sourceID := mtSourceID
	targetID := mtCategoryID

	// START AddCrossRef
	// highlight-start
	collection := client.Collections.Use("MultiTenancyCollection",
		collections.WithTenant("tenantA"),
	)
	// highlight-end
	_, err := collection.Data.AddReferences(ctx, data.Reference{
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
}
