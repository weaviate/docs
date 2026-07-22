package main

import (
	"context"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/collections/compression"
	"github.com/weaviate/weaviate-go-client/v6/collections/vectorindex"
	"github.com/weaviate/weaviate-go-client/v6/modules/model2vec"
)

// The compression snippets below run against a live server. They are kept out
// of the CI run set (compile-only) and skip when executed directly. Rotational
// Quantization (RQ) is enabled per named vector through its VectorConfig.

// TestEnableRQ enables 8-bit RQ for a new collection at creation time.
func TestEnableRQ(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START EnableRQ
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: model2vec.Text2Vec{}, Compression: compression.RQ{Bits: 8}},
		},
	})
	// END EnableRQ
	if err != nil {
		t.Fatal(err)
	}
}

// TestEnableRQ1Bit enables 1-bit RQ for a new collection at creation time.
func TestEnableRQ1Bit(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START 1BitEnableRQ
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: model2vec.Text2Vec{}, Compression: compression.RQ{Bits: 1}},
		},
	})
	// END 1BitEnableRQ
	if err != nil {
		t.Fatal(err)
	}
}

// TestRQWithOptions enables RQ and tunes its parameters alongside the vector
// index configuration.
func TestRQWithOptions(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START RQWithOptions
	vectorConfig := collections.VectorConfig{
		Index: vectorindex.HFresh{Distance: vectorindex.DistanceCosine},
		Compression: compression.RQ{
			Bits:         8,
			RescoreLimit: 20,
			Cache:        true,
		},
		Vectorizer: model2vec.Text2Vec{},
	}
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name:    "Article",
		Vectors: map[string]collections.VectorConfig{"default": vectorConfig},
	})
	// END RQWithOptions
	if err != nil {
		t.Fatal(err)
	}
}
