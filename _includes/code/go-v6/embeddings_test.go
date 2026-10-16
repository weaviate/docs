package main

import (
	"context"
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	wembed "github.com/weaviate/weaviate-go-client/v6/modules/weaviate"
)

// TestVectorizerWeaviate configures a collection whose named vector is produced
// by the Weaviate Embeddings service through the text2vec-weaviate module.
// Creating the collection needs no Weaviate Embeddings access. No object is
// inserted, so nothing calls the service.
func TestVectorizerWeaviate(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "DemoCollection")
	defer client.Collections.Delete(ctx, "DemoCollection")

	// START BasicVectorizerWeaviate
	// import wembed "github.com/weaviate/weaviate-go-client/v6/modules/weaviate"
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
	conf := p2dRequireVectorizer(t, "DemoCollection", "title_vector", "text2vec-weaviate")
	if fmt.Sprint(conf["properties"]) != "[title]" {
		t.Errorf("properties = %v, want [title]", conf["properties"])
	}
}

// p2eRegion returns the lines between the START and END markers of a region,
// matched per line the way FilteredTextBlock matches them.
func p2eRegion(t *testing.T, file, region string) string {
	t.Helper()
	src, err := os.ReadFile(file)
	if err != nil {
		t.Fatal(err)
	}
	var out []string
	in := false
	for _, line := range strings.Split(string(src), "\n") {
		switch {
		case strings.Contains(line, "// START "+region):
			in = true
		case strings.Contains(line, "// END "+region):
			return strings.Join(out, "\n")
		case in:
			out = append(out, line)
		}
	}
	t.Fatalf("%s: region %s not found", file, region)
	return ""
}

// TestVectorizerWeaviateCustomModel selects a specific Weaviate Embeddings model
// for the text2vec-weaviate vectorizer.
func TestVectorizerWeaviateCustomModel(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "DemoCollection")
	defer client.Collections.Delete(ctx, "DemoCollection")

	// START VectorizerWeaviateCustomModel
	// import wembed "github.com/weaviate/weaviate-go-client/v6/modules/weaviate"
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
	conf := p2dRequireVectorizer(t, "DemoCollection", "title_vector", "text2vec-weaviate")
	if conf["model"] != wembed.SnowflakeArcticEmbedLv2_0 {
		t.Errorf("model = %v, want %s", conf["model"], wembed.SnowflakeArcticEmbedLv2_0)
	}
	if fmt.Sprint(conf["properties"]) != "[title]" {
		t.Errorf("properties = %v, want [title]", conf["properties"])
	}
	// The server stores this model by default, so REST cannot tell whether the
	// region sets it. Check the rendered region text instead.
	if !strings.Contains(p2eRegion(t, "embeddings_test.go", "VectorizerWeaviateCustomModel"), "Model: wembed.SnowflakeArcticEmbedLv2_0,") {
		t.Error("region VectorizerWeaviateCustomModel no longer sets Model")
	}
}
