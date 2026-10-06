package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	wembed "github.com/weaviate/weaviate-go-client/v6/modules/weaviate"
)

// TestVectorizerWeaviate configures a collection whose named vector is produced
// by the Weaviate Embeddings service through the text2vec-weaviate module.
func TestVectorizerWeaviate(t *testing.T) {
	t.Skip("requires Weaviate Embeddings, which only a Weaviate Cloud instance provides")
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
		// highlight-start
		Vectors: map[string]collections.VectorConfig{
			"title_vector": {
				Vectorizer: wembed.Text2Vec{
					Properties: []string{"title"},
				},
			},
		},
		// highlight-end
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END BasicVectorizerWeaviate
}

// TestVectorizerWeaviateCustomModel selects a specific Weaviate Embeddings model
// for the text2vec-weaviate vectorizer.
func TestVectorizerWeaviateCustomModel(t *testing.T) {
	t.Skip("requires Weaviate Embeddings, which only a Weaviate Cloud instance provides")
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
					// highlight-start
					Model: wembed.SnowflakeArcticEmbedLv2_0,
					// highlight-end
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

// TestVectorizerWeaviateConfigLandsREST creates the VectorizerWeaviateCustomModel
// config on the local instance, which loads text2vec-weaviate but cannot reach
// Weaviate Embeddings, and checks the stored vectorizer config through REST.
// No object is inserted, so nothing calls the service.
func TestVectorizerWeaviateConfigLandsREST(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	const name = "GoV6EmbeddingsTwin"
	_ = client.Collections.Delete(ctx, name)
	defer client.Collections.Delete(ctx, name)
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name:       name,
		Properties: []collections.Property{{Name: "title", DataType: collections.DataTypeText}},
		Vectors: map[string]collections.VectorConfig{
			"title_vector": {Vectorizer: wembed.Text2Vec{
				Properties: []string{"title"},
				Model:      wembed.SnowflakeArcticEmbedLv2_0,
			}},
		},
	})
	if err != nil {
		t.Fatal(err)
	}

	resp, err := http.Get("http://localhost:8080/v1/schema/" + name)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	var schema struct {
		VectorConfig map[string]struct {
			Vectorizer map[string]map[string]any `json:"vectorizer"`
		} `json:"vectorConfig"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&schema); err != nil {
		t.Fatal(err)
	}
	conf := schema.VectorConfig["title_vector"].Vectorizer["text2vec-weaviate"]
	if conf == nil {
		t.Fatalf("title_vector has no text2vec-weaviate vectorizer: %+v", schema.VectorConfig)
	}
	if conf["model"] != wembed.SnowflakeArcticEmbedLv2_0 {
		t.Errorf("model = %v, want %s", conf["model"], wembed.SnowflakeArcticEmbedLv2_0)
	}
	if fmt.Sprint(conf["properties"]) != "[title]" {
		t.Errorf("properties = %v, want [title]", conf["properties"])
	}
}
