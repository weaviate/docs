package main

import (
	"context"
	"fmt"
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
		Index: vectorindex.HFresh{Distance: vectorindex.DistanceCosine, MaxPostingSizeKB: 8},
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

// TestBQCompression documents Binary Quantization (BQ). The v6 Go client
// (v6.0.0-beta.1) registers only Rotational Quantization in
// collections/compression, so a BQ quantizer cannot yet be configured, and
// there is no collection-update API to enable it on an existing collection.
func TestBQCompression(t *testing.T) {
	t.Skip("Binary Quantization is not yet available in the v6 Go client")

	// TODO[g-despot]: BQ snippets pending v6 client support
	// START EnableBQ
	// Coming soon
	// END EnableBQ

	// START BQUpdateSchema
	// Coming soon
	// END BQUpdateSchema

	// START BQWithOptions
	// Coming soon
	// END BQWithOptions
}

// TestSQCompression documents Scalar Quantization (SQ). As with BQ, the v6 Go
// client (v6.0.0-beta.1) registers only Rotational Quantization in
// collections/compression, so an SQ quantizer cannot yet be configured.
func TestSQCompression(t *testing.T) {
	t.Skip("Scalar Quantization is not yet available in the v6 Go client")

	// TODO[g-despot]: SQ snippets pending v6 client support
	// START EnableSQ
	// Coming soon
	// END EnableSQ

	// START SQUpdateSchema
	// Coming soon
	// END SQUpdateSchema

	// START SQWithOptions
	// Coming soon
	// END SQWithOptions
}

// TestPQInitialSchema defines a collection without a quantizer. In the v6 Go
// client, compression is chosen at collection-creation time, so a definition
// that omits Compression is the "define a collection without PQ" step.
func TestPQInitialSchema(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START PQInitialSchema
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: model2vec.Text2Vec{}},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END PQInitialSchema
}

// TestPQUpdateSchema is a placeholder: enabling PQ on an existing collection
// requires both a collection-update API (absent in the v6 Go client) and a PQ
// quantizer (only RQ is registered in collections/compression).
func TestPQUpdateSchema(t *testing.T) {
	t.Skip("Product Quantization is not yet available in the v6 Go client")

	// TODO[g-despot]: PQ enable-on-existing snippet pending v6 client support
	// START PQUpdateSchema
	// Coming soon
	// END PQUpdateSchema
}

// TestPQGetSchema reads a collection's configuration back from the server so it
// can be reviewed. GetConfig returns the full collection definition, including
// each named vector's index and compression configuration.
func TestPQGetSchema(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: model2vec.Text2Vec{}},
		},
	}); err != nil {
		t.Fatal(err)
	}

	// START PQGetSchema
	config, err := client.Collections.GetConfig(ctx, "Article")
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("Vector config: %+v\n", config.Vectors["default"])
	// END PQGetSchema
}

// TestRQUpdateSchema is a placeholder: enabling RQ on an existing collection
// requires a collection-update API, which the v6 Go client does not yet
// provide. RQ can only be set at collection-creation time (see TestEnableRQ).
func TestRQUpdateSchema(t *testing.T) {
	t.Skip("updating an existing collection is not yet available in the v6 Go client")

	// TODO[g-despot]: RQ enable-on-existing snippets pending v6 client support
	// START RQUpdateSchema
	// Coming soon
	// END RQUpdateSchema

	// START RQ1BitUpdateSchema
	// Coming soon
	// END RQ1BitUpdateSchema
}

// TestMuveraEncoding is a placeholder: MUVERA multi-vector encoding is not yet
// configurable through the v6 Go client.
func TestMuveraEncoding(t *testing.T) {
	t.Skip("MUVERA encoding is not yet available in the v6 Go client")

	// TODO[g-despot]: MUVERA encoding snippet pending v6 client support
	// START MuveraEncoding
	// Coming soon
	// END MuveraEncoding
}
