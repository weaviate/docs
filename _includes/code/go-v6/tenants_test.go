package main

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/tenant"
)

// The multi-tenancy snippets below run against a live server. They are kept out
// of the CI run set (compile-only) and skip when executed directly.

// TestEnableMultiTenancy creates a collection with multi-tenancy turned on.
func TestEnableMultiTenancy(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MultiTenancyCollection")

	// START EnableMultiTenancy
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MultiTenancyCollection",
		MultiTenancy: &collections.MultiTenancyConfig{
			Enabled: true,
		},
	})
	// END EnableMultiTenancy
	if err != nil {
		t.Fatal(err)
	}
}

// TestEnableAutoMT creates a multi-tenancy collection that also creates and
// activates tenants automatically when data is inserted for an unknown tenant.
func TestEnableAutoMT(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MultiTenancyCollection")

	// START EnableAutoMT
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MultiTenancyCollection",
		MultiTenancy: &collections.MultiTenancyConfig{
			Enabled:              true,
			AutoTenantCreation:   true,
			AutoTenantActivation: true,
		},
	})
	// END EnableAutoMT
	if err != nil {
		t.Fatal(err)
	}
}

// TestUpdateAutoMT is a placeholder: the v6 Go client cannot yet update an
// existing collection's configuration, so auto-tenant settings can only be set
// at creation time.
func TestUpdateAutoMT(t *testing.T) {
	t.Skip("updating a collection's configuration is not yet available in the v6 Go client")

	// TODO[g-despot]: update-collection (auto-tenant) snippet pending v6 client support
	// START UpdateAutoMT
	// Coming soon
	// END UpdateAutoMT
}

// TestAddTenantsToClass adds tenants to a multi-tenancy collection.
func TestAddTenantsToClass(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START AddTenantsToClass
	collection := client.Collections.Use("MultiTenancyCollection")
	err := collection.Tenants.Create(ctx,
		tenant.Tenant{Name: "tenantA"},                          // Active by default.
		tenant.Tenant{Name: "tenantB", Status: tenant.Inactive}, // Created on disk, not loaded.
	)
	// END AddTenantsToClass
	if err != nil {
		t.Fatal(err)
	}
}

// TestListTenants lists every tenant in a multi-tenancy collection.
func TestListTenants(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ListTenants
	collection := client.Collections.Use("MultiTenancyCollection")
	// Passing no tenant names returns every tenant in the collection.
	tenants, err := collection.Tenants.Get(ctx)
	if err != nil {
		t.Fatal(err)
	}
	for _, tn := range tenants {
		t.Logf("%s: %s", tn.Name, tn.Status)
	}
	// END ListTenants
}

// TestRemoveTenants deletes tenants (and their data) from a collection.
func TestRemoveTenants(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START RemoveTenants
	collection := client.Collections.Use("MultiTenancyCollection")
	// Unknown tenant names are ignored.
	err := collection.Tenants.Delete(ctx, "tenantB", "tenantX")
	// END RemoveTenants
	if err != nil {
		t.Fatal(err)
	}
}

// TestCreateMtObject inserts an object into a specific tenant. The tenant is
// bound once on the collection handle and applies to every operation made with
// it.
func TestCreateMtObject(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CreateMtObject
	// Bind the tenant to the collection handle.
	collection := client.Collections.Use("MultiTenancyCollection",
		collections.WithTenant("tenantA"),
	)
	_, err := collection.Data.Insert(ctx, &data.Object{
		Properties: map[string]any{
			"question": "This vector DB is OSS and supports automatic property type inference on import",
		},
	})
	// END CreateMtObject
	if err != nil {
		t.Fatal(err)
	}
}

// TestMtSearch runs a query scoped to a single tenant.
func TestMtSearch(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START Search
	collection := client.Collections.Use("MultiTenancyCollection",
		collections.WithTenant("tenantA"),
	)
	response, err := collection.Query.OverAll(ctx, query.OverAll{
		Limit: 2,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, obj := range response.Objects {
		t.Logf("%v", obj.Properties)
	}
	// END Search
}

// TestMtAddCrossRef adds a cross-reference from an object that belongs to a
// tenant. The tenant is bound on the handle used to make the request.
func TestMtAddCrossRef(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	sourceID := uuid.New()
	targetID := uuid.New()

	// START AddCrossRef
	collection := client.Collections.Use("MultiTenancyCollection",
		collections.WithTenant("tenantA"),
	)
	res, err := collection.Data.AddReferences(ctx, data.Reference{
		Origin: data.ObjectPath{
			Collection: "MultiTenancyCollection",
			Property:   "hasCategory",
			UUID:       sourceID,
		},
		UUID: targetID,
	})
	if err != nil {
		t.Fatal(err)
	}
	// END AddCrossRef
	for ref, msg := range res.Errors {
		if msg != "" {
			t.Fatalf("add reference %v: %s", ref, msg)
		}
	}
}
