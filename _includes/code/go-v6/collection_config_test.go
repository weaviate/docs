package main

import (
	"context"
	"testing"
	"time"

	"github.com/weaviate/weaviate-go-client/v6/collections"
)

// The inverted-index, replication, and sharding snippets below run against a
// live server. They are kept out of the CI run set (compile-only) and skip
// when executed directly.

// TestEnableInvertedIndex turns on property-level inverted indexes for
// filtering, searching, and range filtering.
func TestEnableInvertedIndex(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START EnableInvertedIndex
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText, IndexFilterable: true, IndexSearchable: true},
			{Name: "wordCount", DataType: collections.DataTypeInt, IndexRangeFilters: true},
		},
	})
	// END EnableInvertedIndex
	if err != nil {
		t.Fatal(err)
	}
}

// TestSetInvertedIndexParams configures collection-level inverted index
// parameters, including BM25 tuning and stopwords.
func TestSetInvertedIndexParams(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START SetInvertedIndexParams
	invertedIndex := &collections.InvertedIndexConfig{
		BM25: &collections.BM25Config{
			B:  0.75,
			K1: 1.2,
		},
		Stopwords: &collections.StopwordConfig{
			Preset:    "en",
			Additions: []string{"star", "nebula"},
			Removals:  []string{"a", "the"},
		},
		IndexNullState:      true,
		IndexPropertyLength: true,
		IndexTimestamps:     true,
	}
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
		InvertedIndex: invertedIndex,
	})
	// END SetInvertedIndexParams
	if err != nil {
		t.Fatal(err)
	}
}

// TestAllReplicationSettings configures replication, including the deletion
// resolution strategy and async replication tuning.
func TestAllReplicationSettings(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START AllReplicationSettings
	replication := &collections.ReplicationConfig{
		Factor:           3,
		DeletionStrategy: collections.TimeBasedResolution,
		AsyncReplication: &collections.AsyncReplicationConfig{
			HashTreeHeight:       16,
			ReplicationFrequency: 30 * time.Second,
		},
	}
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name:        "Article",
		Replication: replication,
	})
	// END AllReplicationSettings
	if err != nil {
		t.Fatal(err)
	}
}

// TestShardingSettings configures sharding for the collection.
func TestShardingSettings(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START ShardingSettings
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Sharding: &collections.ShardingConfig{
			VirtualPerPhysical:  128,
			DesiredCount:        1,
			DesiredVirtualCount: 128,
		},
	})
	// END ShardingSettings
	if err != nil {
		t.Fatal(err)
	}
}
