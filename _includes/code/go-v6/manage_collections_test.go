package main

import (
	"context"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/collections/vectorindex"
	"github.com/weaviate/weaviate-go-client/v6/modules/selfprovided"
)

// TestCreateCollectionExample creates a collection that exercises the main
// top-level configuration parameters at once — properties, a named vector,
// sharding, replication, and multi-tenancy. It backs the "how to create a
// collection" reference example.
func TestCreateCollectionExample(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START CreateCollectionExample
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name:        "Article",
		Description: "A collection of articles",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "body", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Index: vectorindex.HFresh{
					Distance:         vectorindex.DistanceCosine,
					MaxPostingSizeKB: 8,
				},
				Vectorizer: selfprovided.Vectorizer,
			},
		},
		Replication: &collections.ReplicationConfig{Factor: 1},
		Sharding: &collections.ShardingConfig{
			VirtualPerPhysical:  128,
			DesiredCount:        1,
			DesiredVirtualCount: 128,
		},
		MultiTenancy: &collections.MultiTenancyConfig{Enabled: false},
	})
	// END CreateCollectionExample
	if err != nil {
		t.Fatal(err)
	}
}

// The collection-management snippets below run against a live server. They are
// kept out of the CI run set (compile-only) and skip when executed directly.

// TestBasicCreateCollection creates a collection with only a name. Missing
// properties are added by auto-schema when data is first inserted.
func TestBasicCreateCollection(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START BasicCreateCollection
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
	})
	// END BasicCreateCollection
	if err != nil {
		t.Fatal(err)
	}
}

// TestCreateCollectionWithProperties defines the collection properties and
// their data types up front instead of relying on auto-schema.
func TestCreateCollectionWithProperties(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START CreateCollectionWithProperties
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "body", DataType: collections.DataTypeText},
		},
	})
	// END CreateCollectionWithProperties
	if err != nil {
		t.Fatal(err)
	}
}

// TestCheckIfExists reports whether a collection is defined in the schema.
func TestCheckIfExists(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CheckIfExists
	exists, err := client.Collections.Exists(ctx, "Article")
	// END CheckIfExists
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("Article exists: %v", exists)
}

// TestReadOneCollection reads a single collection definition from the schema.
func TestReadOneCollection(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ReadOneCollection
	config, err := client.Collections.GetConfig(ctx, "Article")
	// END ReadOneCollection
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%s", config.Name)
}

// TestReadAllCollections reads every collection definition in the schema.
func TestReadAllCollections(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ReadAllCollections
	configs, err := client.Collections.List(ctx)
	// END ReadAllCollections
	if err != nil {
		t.Fatal(err)
	}
	for _, config := range configs {
		t.Logf("%s", config.Name)
	}
}

// TestUpdateCollection is a placeholder: the v6 Go client cannot yet update an
// existing collection definition. Collection settings must be chosen at
// creation time; to change an immutable setting, recreate the collection.
func TestUpdateCollection(t *testing.T) {
	t.Skip("updating a collection definition is not yet available in the v6 Go client")

	// TODO[g-despot]: update-collection snippet pending v6 client support
	// START UpdateCollection
	// Coming soon
	// END UpdateCollection
}
