package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/collections/vectorindex"
	"github.com/weaviate/weaviate-go-client/v6/modules/model2vec"
	"github.com/weaviate/weaviate-go-client/v6/modules/selfprovided"
)

const p2dSkipModel2VecVectorConfig = "requires the text2vec-model2vec module, which the docs CI Weaviate does not enable (HTTP 422 no module with name text2vec-model2vec)"

// TestCreateCollectionWithVectorizer configures a vectorizer that generates an
// embedding for each object.
func TestCreateCollectionWithVectorizer(t *testing.T) {
	t.Skip(p2dSkipModel2VecVectorConfig)
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
		// highlight-start
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: model2vec.Text2Vec{}},
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CreateCollectionWithVectorizer
}

// TestVectorizerSettings configures the vectorizer, such as which inference
// service it calls and which properties it embeds.
func TestVectorizerSettings(t *testing.T) {
	t.Skip(p2dSkipModel2VecVectorConfig)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START VectorizerSettings
	// Point the vectorizer at a remote inference service and embed only the
	// listed properties.
	// highlight-start
	vectorizer := model2vec.Text2Vec{
		URL:        "http://text2vec-model2vec:8080",
		Properties: []string{"title"},
	}
	// highlight-end
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END VectorizerSettings
}

// TestCreateCollectionWithNamedVectors defines multiple named vectors, each
// with its own configuration.
func TestCreateCollectionWithNamedVectors(t *testing.T) {
	t.Skip(p2dSkipModel2VecVectorConfig)
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
		// highlight-start
		Vectors: map[string]collections.VectorConfig{
			// A vector generated from the title only.
			"title": {Vectorizer: model2vec.Text2Vec{Properties: []string{"title"}}},
			// A vector you supply yourself at import time.
			"custom": {Vectorizer: selfprovided.Vectorizer},
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CreateCollectionWithNamedVectors
}

// TestAddNamedVectors is a placeholder for adding a named vector to an existing
// collection.
func TestAddNamedVectors(t *testing.T) {
	t.Skip("not possible at v6.0.0-rc.0: no call adds a named vector to an existing collection (UpdateVectorConfig rejects unknown vector names)")

	// TODO[g-despot]: add-named-vectors snippet pending v6 client support
	// START AddNamedVectors
	// Coming soon
	// END AddNamedVectors
}

// TestSetVectorIndexType selects the vector index type for a named vector.
func TestSetVectorIndexType(t *testing.T) {
	t.Skip(p2dSkipModel2VecVectorConfig)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START SetVectorIndexType
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "body", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: model2vec.Text2Vec{},
				// highlight-start
				Index: vectorindex.HNSW{}, // Use the HNSW index
				// Index: vectorindex.Flat{}, // Use the flat index
				// Index: vectorindex.Dynamic{Threshold: 10000}, // Use the dynamic index
				// Index: vectorindex.HFresh{MaxPostingSizeKB: 8}, // Use the HFresh index
				// highlight-end
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END SetVectorIndexType
	p2dRequireIndexConfig(t, "Article", "default", "hnsw", "", nil)
}

// TestSetVectorIndexParams tunes the HNSW index for a named vector.
func TestSetVectorIndexParams(t *testing.T) {
	t.Skip(p2dSkipModel2VecVectorConfig)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START SetVectorIndexParams
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: model2vec.Text2Vec{},
				// highlight-start
				Index: vectorindex.HNSW{
					EfConstruction: 300,
					Distance:       vectorindex.DistanceCosine,
					FilterStrategy: vectorindex.FilterStrategyACORN,
				},
				// highlight-end
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END SetVectorIndexParams
	p2dRequireIndexConfig(t, "Article", "default", "hnsw", "", map[string]any{
		"efConstruction": 300, "distance": "cosine", "filterStrategy": "acorn",
	})
}

// TestPropModuleSettings sets property-level options, such as tokenization,
// and controls which properties the vectorizer embeds.
func TestPropModuleSettings(t *testing.T) {
	t.Skip(p2dSkipModel2VecVectorConfig)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START PropModuleSettings
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Properties: []collections.Property{
			{
				Name:     "title",
				DataType: collections.DataTypeText,
				// highlight-start
				Tokenization: collections.TokenizationLowercase, // Use "lowercase" tokenization
				Description:  "The title of the article.",       // Optional description
				// highlight-end
			},
			{
				Name:     "body",
				DataType: collections.DataTypeText,
				// highlight-start
				Tokenization: collections.TokenizationWhitespace, // Use "whitespace" tokenization
				// highlight-end
			},
		},
		Vectors: map[string]collections.VectorConfig{
			// highlight-start
			// Vectorize the title only. The body is left out of the vector.
			"default": {Vectorizer: model2vec.Text2Vec{Properties: []string{"title"}}},
			// highlight-end
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END PropModuleSettings
}

// TestDistanceMetric sets the distance metric for a collection that stores
// user-supplied vectors.
func TestDistanceMetric(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Article")
	defer client.Collections.Delete(ctx, "Article")

	// START DistanceMetric
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Article",
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: selfprovided.Vectorizer,
				// highlight-start
				Index: vectorindex.HNSW{Distance: vectorindex.DistanceCosine},
				// highlight-end
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END DistanceMetric
	p2dRequireIndexConfig(t, "Article", "default", "hnsw", "", map[string]any{"distance": "cosine"})
}

// TestVectorIndexConfigLandsREST creates the index configs of
// SetVectorIndexType and SetVectorIndexParams with self-provided vectors (the
// docs CI has no text2vec-model2vec) and proves them through the REST schema.
func TestVectorIndexConfigLandsREST(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	const name = "GoV6VectorIndexTwin"
	cases := []struct {
		region    string
		index     collections.VectorIndex
		indexType string
		want      map[string]any
	}{
		{"SetVectorIndexType", vectorindex.HNSW{}, "hnsw", nil},
		{"SetVectorIndexType/flat", vectorindex.Flat{}, "flat", nil},
		{"SetVectorIndexType/dynamic", vectorindex.Dynamic{Threshold: 10000}, "dynamic", map[string]any{"threshold": 10000}},
		{"SetVectorIndexType/hfresh", vectorindex.HFresh{MaxPostingSizeKB: 8}, "hfresh", nil},
		{"SetVectorIndexParams", vectorindex.HNSW{
			EfConstruction: 300,
			Distance:       vectorindex.DistanceCosine,
			FilterStrategy: vectorindex.FilterStrategyACORN,
		}, "hnsw", map[string]any{"efConstruction": 300, "distance": "cosine", "filterStrategy": "acorn"}},
	}
	for _, c := range cases {
		t.Run(c.region, func(t *testing.T) {
			_ = client.Collections.Delete(ctx, name)
			defer client.Collections.Delete(ctx, name)
			_, err := client.Collections.Create(ctx, collections.Collection{
				Name: name,
				Vectors: map[string]collections.VectorConfig{
					"default": {Vectorizer: selfprovided.Vectorizer, Index: c.index},
				},
			})
			if err != nil {
				t.Fatal(err)
			}
			gotType, conf := p2dIndexConfig(t, name, "default")
			if gotType != c.indexType {
				t.Errorf("vectorIndexType = %q, want %q", gotType, c.indexType)
			}
			for k, w := range c.want {
				if fmt.Sprint(conf[k]) != fmt.Sprint(w) {
					t.Errorf("%s = %v, want %v", k, conf[k], w)
				}
			}
		})
	}
}
