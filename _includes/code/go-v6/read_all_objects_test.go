package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/query"
	"google.golang.org/api/iterator"
)

// TestReadAllProps iterates through every object in a collection, printing each
// object's id and properties. The seeded collection carries vectors, but the
// iterator returns properties only (see TestReadAllVectors for the vectors).
func TestReadAllProps(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START ReadAllProps
	questions := client.Collections.Use("JeopardyQuestion")
	// The v6 client wraps the cursor (`after`) API in an ObjectIterator.
	iter := query.NewObjectIterator(ctx, questions.Query)
	for {
		obj, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			// handle error
			panic(err)
		}
		fmt.Printf("%s: %v\n", obj.UUID, obj.Properties)
	}
	// END ReadAllProps
}

// TestReadAllVectors iterates through every object, returning the vectors too.
func TestReadAllVectors(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupJeopardyVectorized(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START ReadAllVectors
	questions := client.Collections.Use("JeopardyQuestion")
	// The ObjectIterator does not return vectors, so page through the cursor
	// (`after`) API directly and request the vectors on each page. A zero id
	// starts from the beginning; pass the last id of each page as the next cursor.
	var after uuid.UUID
	for {
		res, err := questions.Query.OverAll(ctx, query.OverAll{
			Limit: 100,
			After: after,
			// Name the vectors to return; use "default" for a single unnamed vector.
			ReturnVectors: []string{"default"},
		})
		if err != nil {
			// handle error
			panic(err)
		}
		if len(res.Objects) == 0 {
			break
		}
		for _, obj := range res.Objects {
			fmt.Printf("%s: %v\n", obj.UUID, obj.Vectors["default"].Single)
		}
		after = res.Objects[len(res.Objects)-1].UUID
	}
	// END ReadAllVectors
}

// TestReadAllTenants iterates every tenant, then every object within each tenant.
// It is deferred for the same reason as TestListTenants: the v6 client's
// Tenants.Get panics because *api.GetTenantsRequest is not wired into the gRPC
// transport dispatch, so listing tenants aborts the test binary. The published
// ReadAllTenants snippet is idiomatic; re-enable once the client wires it up.
func TestReadAllTenants(t *testing.T) {
	t.Skip("go-client v6 Tenants.Get panics — *api.GetTenantsRequest not wired to gRPC MessageMarshaler; deferred pending a client fix")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupMultiTenancyJeopardy(t, client)
	defer client.Collections.Delete(ctx, "JeopardyQuestion")

	// START ReadAllTenants
	questions := client.Collections.Use("JeopardyQuestion")
	// List every tenant, then iterate each tenant's objects in turn.
	tenants, err := questions.Tenants.Get(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	for _, tn := range tenants {
		scoped := client.Collections.Use("JeopardyQuestion", collections.WithTenant(tn.Name))
		iter := query.NewObjectIterator(ctx, scoped.Query)
		for {
			obj, err := iter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				// handle error
				panic(err)
			}
			fmt.Printf("%s (%s): %v\n", obj.UUID, tn.Name, obj.Properties)
		}
	}
	// END ReadAllTenants
}
