package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/collections/vectorindex"
	"github.com/weaviate/weaviate-go-client/v6/modules/selfprovided"
)

// TestCreateCollectionExample creates a collection that sets the main
// top-level configuration parameters at once: properties, a named vector,
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
				Index: vectorindex.HNSW{
					EfConstruction: 300,
					Distance:       vectorindex.DistanceCosine,
					FilterStrategy: vectorindex.FilterStrategySweeping,
				},
				Vectorizer: selfprovided.Vectorizer,
			},
		},
		MultiTenancy: &collections.MultiTenancyConfig{Enabled: false},
		Sharding: &collections.ShardingConfig{
			VirtualPerPhysical:  128,
			DesiredCount:        1,
			DesiredVirtualCount: 128,
		},
		Replication: &collections.ReplicationConfig{
			Factor:           1,
			DeletionStrategy: collections.TimeBasedResolution,
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CreateCollectionExample

	p2yExpect(t, p2yRESTClass(t, "Article"), map[string]any{
		"vectorConfig.default.vectorIndexType":                  "hnsw",
		"vectorConfig.default.vectorIndexConfig.efConstruction": 300,
		"vectorConfig.default.vectorIndexConfig.distance":       "cosine",
		"vectorConfig.default.vectorIndexConfig.filterStrategy": "sweeping",
		"replicationConfig.factor":                              1,
		"replicationConfig.deletionStrategy":                    "TimeBasedResolution",
		"shardingConfig.virtualPerPhysical":                     128,
		"multiTenancyConfig.enabled":                            false,
	})
}

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
	if err != nil {
		// handle error
		panic(err)
	}
	// END BasicCreateCollection
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
		// highlight-start
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "body", DataType: collections.DataTypeText},
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CreateCollectionWithProperties
}

// TestCheckIfExists reports whether a collection is defined in the schema.
func TestCheckIfExists(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CheckIfExists
	exists, err := client.Collections.Exists(ctx, "Article")
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Println(exists)
	// END CheckIfExists
}

// TestReadOneCollection reads a single collection definition from the schema.
func TestReadOneCollection(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	setupArticle(t, client)
	defer client.Collections.Delete(ctx, "Article")

	// START ReadOneCollection
	config, err := client.Collections.GetConfig(ctx, "Article")
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Println(config.Name)
	for _, p := range config.Properties {
		fmt.Printf("  %s (%s)\n", p.Name, p.DataType)
	}
	// END ReadOneCollection

	if config.Name != "Article" {
		t.Fatalf("GetConfig returned collection %q, want Article", config.Name)
	}
}

// TestReadAllCollections reads every collection definition in the schema.
func TestReadAllCollections(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ReadAllCollections
	configs, err := client.Collections.List(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	for _, config := range configs {
		fmt.Println(config.Name)
	}
	// END ReadAllCollections
}

// TestUpdateCollection is a placeholder. The client exposes the Config.Update*
// calls, but each one re-sends the whole collection and the server rejects it
// with HTTP 422 on any collection that has a property or an HNSW vector.
func TestUpdateCollection(t *testing.T) {
	t.Skip("fails at v6.0.0-rc.0: every Config.Update* call returns HTTP 422 on a collection with properties or an HNSW vector")

	// TODO[g-despot]: update-collection snippet pending a client fix for the HTTP 422
	// START UpdateCollection
	// Coming soon
	// END UpdateCollection
}
