package main

import (
	"context"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/collections/compression"
	"github.com/weaviate/weaviate-go-client/v6/collections/vectorindex"
	"github.com/weaviate/weaviate-go-client/v6/modules/model2vec"
	"github.com/weaviate/weaviate-go-client/v6/modules/selfprovided"
)

// The vectorizer and vector-index snippets below run against a live server.
// They are kept out of the CI run set (compile-only) and skip when executed
// directly. Named vectors are the default model: each entry of the Vectors map
// carries its own index, compression, and vectorizer.

// TestCreateCollectionWithVectorizer configures a vectorizer that generates an
// embedding for each object.
func TestCreateCollectionWithVectorizer(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START CreateCollectionWithVectorizer
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "body", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: model2vec.Text2Vec{}},
		},
	})
	// END CreateCollectionWithVectorizer
	if err != nil {
		t.Fatal(err)
	}
}

// TestVectorizerSettings configures the vectorizer, such as which inference
// service it calls and which properties it embeds.
func TestVectorizerSettings(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START VectorizerSettings
	// Point the vectorizer at a remote inference service and embed only the
	// listed properties.
	vectorizer := model2vec.Text2Vec{
		URL:        "http://text2vec-model2vec:8080",
		Properties: []string{"title"},
	}
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "body", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: vectorizer},
		},
	})
	// END VectorizerSettings
	if err != nil {
		t.Fatal(err)
	}
}

// TestCreateCollectionWithNamedVectors defines multiple named vectors, each
// with its own configuration.
func TestCreateCollectionWithNamedVectors(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START CreateCollectionWithNamedVectors
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "body", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			// A vector generated from the title only.
			"title": {Vectorizer: model2vec.Text2Vec{Properties: []string{"title"}}},
			// A vector you supply yourself at import time.
			"custom": {Vectorizer: selfprovided.Vectorizer},
		},
	})
	// END CreateCollectionWithNamedVectors
	if err != nil {
		t.Fatal(err)
	}
}

// TestSetVectorIndexType selects the vector index type for a named vector.
func TestSetVectorIndexType(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START SetVectorIndexType
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Vectors: map[string]collections.VectorConfig{
			"default": {Index: vectorindex.HFresh{}, Vectorizer: model2vec.Text2Vec{}},
		},
	})
	// END SetVectorIndexType
	if err != nil {
		t.Fatal(err)
	}
}

// TestSetVectorIndexParams tunes the vector index and enables vector
// compression for a named vector.
func TestSetVectorIndexParams(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START SetVectorIndexParams
	vectorConfig := collections.VectorConfig{
		Index: vectorindex.HFresh{
			Distance:         vectorindex.DistanceCosine,
			MaxPostingSizeKB: 1024,
			ReplicaCount:     3,
			SearchProbe:      64,
		},
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
	// END SetVectorIndexParams
	if err != nil {
		t.Fatal(err)
	}
}

// TestPropModuleSettings sets property-level options, such as tokenization,
// and controls which properties the vectorizer embeds.
func TestPropModuleSettings(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START PropModuleSettings
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText, Tokenization: collections.TokenizationWord},
			{Name: "chunk", DataType: collections.DataTypeText, Tokenization: collections.TokenizationWhitespace},
		},
		Vectors: map[string]collections.VectorConfig{
			// Embed the title only; chunk is left out of the vector.
			"default": {Vectorizer: model2vec.Text2Vec{Properties: []string{"title"}}},
		},
	})
	// END PropModuleSettings
	if err != nil {
		t.Fatal(err)
	}
}

// TestDistanceMetric sets the distance metric for a collection that stores
// user-supplied vectors.
func TestDistanceMetric(t *testing.T) {
	t.Skip("requires a running Weaviate instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START DistanceMetric
	// Bring your own vectors and set the distance metric on the index.
	index := vectorindex.HFresh{Distance: vectorindex.DistanceCosine}
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Vectors: map[string]collections.VectorConfig{
			"default": {Index: index, Vectorizer: selfprovided.Vectorizer},
		},
	})
	// END DistanceMetric
	if err != nil {
		t.Fatal(err)
	}
}
