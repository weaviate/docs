package main

import (
	"context"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	wembed "github.com/weaviate/weaviate-go-client/v6/modules/weaviate"
)

// TestVectorizerWeaviate configures a collection whose named vector is produced
// by the Weaviate Embeddings service through the text2vec-weaviate module.
//
// Weaviate Embeddings is a Weaviate Cloud service, so this test is compile-only:
// the docs CI runs against an anonymous local instance with no Embeddings
// service. t.Skip is the first statement, so the suite compiles the idiomatic
// configuration without dialing. It backs the "Go v6" tab of the Weaviate
// Embeddings model-provider page.
func TestVectorizerWeaviate(t *testing.T) {
	t.Skip("requires Weaviate Embeddings / a cloud instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "DemoCollection")
	defer client.Collections.Delete(ctx, "DemoCollection")

	// START BasicVectorizerWeaviate
	// wembed aliases "github.com/weaviate/weaviate-go-client/v6/modules/weaviate";
	// the alias avoids colliding with the root client package, also named weaviate.
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "DemoCollection",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"title_vector": {
				Vectorizer: wembed.Text2Vec{
					Properties: []string{"title"},
				},
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END BasicVectorizerWeaviate
}

// TestVectorizerWeaviateCustomModel is the model-selection form of the
// text2vec-weaviate vectorizer: it pins a specific Weaviate Embeddings model and
// the embedding dimensionality. Compile-only for the same reason as
// TestVectorizerWeaviate. It backs the "Go v6" tab of the model-provider page's
// "Select a model" section.
func TestVectorizerWeaviateCustomModel(t *testing.T) {
	t.Skip("requires Weaviate Embeddings / a cloud instance")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "DemoCollection")
	defer client.Collections.Delete(ctx, "DemoCollection")

	// START VectorizerWeaviateCustomModel
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "DemoCollection",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"title_vector": {
				Vectorizer: wembed.Text2Vec{
					Properties: []string{"title"},
					Model:      wembed.SnowflakeArcticEmbedLv2_0,
					Dimensions: 256,
				},
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END VectorizerWeaviateCustomModel
}
