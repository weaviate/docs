package main

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/weaviate/weaviate-go-client/v6/collections"
)

// TestEnableInvertedIndex turns on property-level inverted indexes for
// filtering, searching, and range filtering.
func TestEnableInvertedIndex(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START EnableInvertedIndex
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			// highlight-start
			{Name: "title", DataType: collections.DataTypeText, IndexFilterable: new(true), IndexSearchable: new(true)},
			{Name: "wordCount", DataType: collections.DataTypeInt, IndexRangeable: new(true)},
			// highlight-end
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END EnableInvertedIndex
}

// TestSetInvertedIndexParams configures collection-level inverted index
// parameters, including BM25 tuning and stopwords.
func TestSetInvertedIndexParams(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START SetInvertedIndexParams
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			// highlight-start
			{Name: "title", DataType: collections.DataTypeText, IndexFilterable: new(true), IndexSearchable: new(true), Tokenization: collections.TokenizationWord},
			{Name: "chunk", DataType: collections.DataTypeText, IndexFilterable: new(true), IndexSearchable: new(true), Tokenization: collections.TokenizationField},
			{Name: "chunk_number", DataType: collections.DataTypeInt, IndexRangeable: new(true)},
			// highlight-end
		},
		// highlight-start
		InvertedIndex: &collections.InvertedIndexConfig{
			BM25: &collections.BM25Config{
				B:  0.7,
				K1: 1.25,
			},
			Stopwords: &collections.StopwordConfig{
				Preset:    "en",
				Additions: []string{"example", "stopword"},
				Removals:  []string{"the", "and"},
			},
			IndexNullState:      true,
			IndexPropertyLength: true,
			IndexTimestamps:     true,
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END SetInvertedIndexParams
}

// TestAllReplicationSettings configures replication, including the deletion
// resolution strategy and async replication tuning.
func TestAllReplicationSettings(t *testing.T) {
	t.Skip("needs a three-node cluster: replication factor 3 returns HTTP 422 on the single-node docs instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START AllReplicationSettings
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		// highlight-start
		Replication: &collections.ReplicationConfig{
			Factor:           3,
			DeletionStrategy: collections.TimeBasedResolution,
			AsyncReplication: &collections.AsyncReplicationConfig{
				HashTreeHeight:       16,
				ReplicationFrequency: 30 * time.Millisecond,
			},
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END AllReplicationSettings
}

// TestShardingSettings configures sharding for the collection.
func TestShardingSettings(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START ShardingSettings
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		// highlight-start
		Sharding: &collections.ShardingConfig{
			VirtualPerPhysical:  128,
			DesiredCount:        1,
			DesiredVirtualCount: 128,
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END ShardingSettings
}

// TestDropInvertedIndex drops individual inverted indexes from properties and
// proves the effect with a raw REST schema read.
func TestDropInvertedIndex(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText, IndexFilterable: new(true), IndexSearchable: new(true)},
			{Name: "chunk_number", DataType: collections.DataTypeInt, IndexRangeable: new(true)},
		},
	}); err != nil {
		t.Fatal(err)
	}

	// START DropInvertedIndex
	collection := client.Collections.Use("Article")

	// highlight-start
	// Drop the searchable inverted index from the "title" property
	err := collection.Config.DropPropertyIndex(ctx, collections.DropPropertyIndexOptions{
		PropertyName: "title",
		IndexType:    collections.IndexSearchable,
	})
	if err != nil {
		// handle error
		panic(err)
	}

	// Drop the filterable inverted index from the "title" property
	err = collection.Config.DropPropertyIndex(ctx, collections.DropPropertyIndexOptions{
		PropertyName: "title",
		IndexType:    collections.IndexFilterable,
	})
	if err != nil {
		// handle error
		panic(err)
	}

	// Drop the range filter index from the "chunk_number" property
	err = collection.Config.DropPropertyIndex(ctx, collections.DropPropertyIndexOptions{
		PropertyName: "chunk_number",
		IndexType:    collections.IndexRangeable,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// highlight-end
	// END DropInvertedIndex

	flags := p2cRESTPropertyIndexFlags(t, "Article")
	for _, check := range []struct{ prop, flag string }{
		{"title", "indexSearchable"},
		{"title", "indexFilterable"},
		{"chunk_number", "indexRangeFilters"},
	} {
		if v, ok := flags[check.prop][check.flag]; !ok || v {
			t.Errorf("%s.%s = %v (present %v), want false", check.prop, check.flag, v, ok)
		}
	}
}

// p2cRESTPropertyIndexFlags reads a collection's schema over raw REST and
// returns each property's boolean index flags, bypassing the client's decoder.
func p2cRESTPropertyIndexFlags(t *testing.T, collection string) map[string]map[string]bool {
	t.Helper()
	resp, err := http.Get("http://localhost:8080/v1/schema/" + collection)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	var class struct {
		Properties []map[string]any `json:"properties"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&class); err != nil {
		t.Fatal(err)
	}
	out := map[string]map[string]bool{}
	for _, p := range class.Properties {
		name, _ := p["name"].(string)
		out[name] = map[string]bool{}
		for _, k := range []string{"indexFilterable", "indexSearchable", "indexRangeFilters"} {
			if v, ok := p[k].(bool); ok {
				out[name][k] = v
			}
		}
	}
	return out
}
