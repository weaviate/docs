package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/collections/compression"
	"github.com/weaviate/weaviate-go-client/v6/collections/vectorindex"
	"github.com/weaviate/weaviate-go-client/v6/modules/model2vec"
	"github.com/weaviate/weaviate-go-client/v6/modules/selfprovided"
)

const p2dSkipModel2Vec = "requires the text2vec-model2vec module, which the docs CI Weaviate does not enable (HTTP 422 no module with name text2vec-model2vec); TestCompressionCreateLandsREST proves the same vector config"

const p2dSkipConfigUpdate = "fails at v6.0.0-rc.0: every Config.Update* call returns HTTP 422 (multivector enabled is immutable)"

// p2dIndexConfig reads one vector's index type and index config straight from
// the REST schema endpoint. GetConfig misreports the quantizer at rc.0, so the
// compression tests check the stored schema here instead.
func p2dIndexConfig(t *testing.T, collection, vector string) (string, map[string]any) {
	t.Helper()
	resp, err := http.Get("http://localhost:8080/v1/schema/" + collection)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("GET /v1/schema/%s: HTTP %d", collection, resp.StatusCode)
	}
	var schema struct {
		VectorConfig map[string]struct {
			VectorIndexType   string         `json:"vectorIndexType"`
			VectorIndexConfig map[string]any `json:"vectorIndexConfig"`
		} `json:"vectorConfig"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&schema); err != nil {
		t.Fatal(err)
	}
	vc, ok := schema.VectorConfig[vector]
	if !ok {
		t.Fatalf("%s has no vector %q in its REST schema", collection, vector)
	}
	return vc.VectorIndexType, vc.VectorIndexConfig
}

// p2dRequireIndexConfig asserts the stored index type, that exactly the named
// quantizer is enabled ("" means none), and every dotted path in want
// (e.g. "rq.bits") against the REST schema.
func p2dRequireIndexConfig(t *testing.T, collection, vector, indexType, quantizer string, want map[string]any) {
	t.Helper()
	gotType, conf := p2dIndexConfig(t, collection, vector)
	if gotType != indexType {
		t.Errorf("%s/%s: vectorIndexType = %q, want %q", collection, vector, gotType, indexType)
	}
	for _, q := range []string{"pq", "bq", "sq", "rq"} {
		m, _ := conf[q].(map[string]any)
		enabled, _ := m["enabled"].(bool)
		if enabled != (q == quantizer) {
			t.Errorf("%s/%s: %s.enabled = %v, want %v", collection, vector, q, enabled, q == quantizer)
		}
	}
	for path, w := range want {
		var cur any = conf
		for _, key := range strings.Split(path, ".") {
			m, _ := cur.(map[string]any)
			cur = m[key]
		}
		if fmt.Sprint(cur) != fmt.Sprint(w) {
			t.Errorf("%s/%s: %s = %v, want %v", collection, vector, path, cur, w)
		}
	}
}

// TestEnableRQ enables 8-bit RQ for a new collection at creation time.
func TestEnableRQ(t *testing.T) {
	t.Skip(p2dSkipModel2Vec)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MyCollection")
	defer client.Collections.Delete(ctx, "MyCollection")

	// START EnableRQ
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MyCollection",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: model2vec.Text2Vec{},
				// Set the index explicitly. The client sends compression only with it.
				Index: vectorindex.HNSW{},
				// highlight-start
				Compression: compression.RQ{Bits: 8},
				// highlight-end
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END EnableRQ
	p2dRequireIndexConfig(t, "MyCollection", "default", "hnsw", "rq", map[string]any{"rq.bits": 8})
}

// TestEnableRQ1Bit enables 1-bit RQ for a new collection at creation time.
func TestEnableRQ1Bit(t *testing.T) {
	t.Skip(p2dSkipModel2Vec)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MyCollection")
	defer client.Collections.Delete(ctx, "MyCollection")

	// START 1BitEnableRQ
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MyCollection",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: model2vec.Text2Vec{},
				// Set the index explicitly. The client sends compression only with it.
				Index: vectorindex.HNSW{},
				// highlight-start
				Compression: compression.RQ{Bits: 1},
				// highlight-end
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END 1BitEnableRQ
	p2dRequireIndexConfig(t, "MyCollection", "default", "hnsw", "rq", map[string]any{"rq.bits": 1})
}

// TestRQWithOptions enables RQ with tuned parameters on a flat index.
func TestRQWithOptions(t *testing.T) {
	t.Skip(p2dSkipModel2Vec)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MyCollection")
	defer client.Collections.Delete(ctx, "MyCollection")

	// START RQWithOptions
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MyCollection",
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: model2vec.Text2Vec{},
				// highlight-start
				Compression: compression.RQ{
					Bits:         8,    // Number of bits
					RescoreLimit: 20,   // Candidates to fetch before rescoring
					Cache:        true, // Cache for the flat index (HNSW caches by default)
				},
				Index: vectorindex.Flat{
					VectorCacheMaxObjects: 100000, // Maximum number of objects in the memory cache
				},
				// highlight-end
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END RQWithOptions
	p2dRequireIndexConfig(t, "MyCollection", "default", "flat", "rq", map[string]any{
		"rq.bits": 8, "rq.rescoreLimit": 20, "rq.cache": true, "vectorCacheMaxObjects": 100000,
	})
}

// TestEnableBQ enables BQ for a new collection at creation time.
func TestEnableBQ(t *testing.T) {
	t.Skip(p2dSkipModel2Vec)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MyCollection")
	defer client.Collections.Delete(ctx, "MyCollection")

	// START EnableBQ
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MyCollection",
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: model2vec.Text2Vec{},
				// Set the index explicitly. The client sends compression only with it.
				Index: vectorindex.HNSW{},
				// highlight-start
				Compression: compression.BQ{},
				// highlight-end
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END EnableBQ
	p2dRequireIndexConfig(t, "MyCollection", "default", "hnsw", "bq", nil)
}

// TestBQWithOptions enables BQ with tuned parameters on a flat index.
func TestBQWithOptions(t *testing.T) {
	t.Skip(p2dSkipModel2Vec)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MyCollection")
	defer client.Collections.Delete(ctx, "MyCollection")

	// START BQWithOptions
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MyCollection",
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: model2vec.Text2Vec{},
				// highlight-start
				Compression: compression.BQ{RescoreLimit: 200, Cache: true},
				// highlight-end
				Index: vectorindex.Flat{VectorCacheMaxObjects: 100000},
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END BQWithOptions
	p2dRequireIndexConfig(t, "MyCollection", "default", "flat", "bq", map[string]any{
		"bq.rescoreLimit": 200, "bq.cache": true, "vectorCacheMaxObjects": 100000,
	})
}

// TestBQUpdateSchema is a placeholder for enabling BQ on an existing collection.
func TestBQUpdateSchema(t *testing.T) {
	t.Skip(p2dSkipConfigUpdate)

	// TODO[g-despot]: BQ enable-on-existing snippet pending a working config update
	// START BQUpdateSchema
	// Coming soon
	// END BQUpdateSchema
}

// TestEnableSQ enables SQ for a new collection at creation time.
func TestEnableSQ(t *testing.T) {
	t.Skip(p2dSkipModel2Vec)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MyCollection")
	defer client.Collections.Delete(ctx, "MyCollection")

	// START EnableSQ
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MyCollection",
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: model2vec.Text2Vec{},
				// Set the index explicitly. The client sends compression only with it.
				Index: vectorindex.HNSW{},
				// highlight-start
				Compression: compression.SQ{},
				// highlight-end
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END EnableSQ
	p2dRequireIndexConfig(t, "MyCollection", "default", "hnsw", "sq", nil)
}

// TestSQWithOptions enables SQ with tuned parameters on an HNSW index.
func TestSQWithOptions(t *testing.T) {
	t.Skip(p2dSkipModel2Vec)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "MyCollection")
	defer client.Collections.Delete(ctx, "MyCollection")

	// START SQWithOptions
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name: "MyCollection",
		Vectors: map[string]collections.VectorConfig{
			"default": {
				Vectorizer: model2vec.Text2Vec{},
				// highlight-start
				Compression: compression.SQ{
					RescoreLimit:  200,
					TrainingLimit: 50000,
					Cache:         true,
				},
				// highlight-end
				Index: vectorindex.HNSW{VectorCacheMaxObjects: 100000},
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END SQWithOptions
	p2dRequireIndexConfig(t, "MyCollection", "default", "hnsw", "sq", map[string]any{
		"sq.rescoreLimit": 200, "sq.trainingLimit": 50000, "vectorCacheMaxObjects": 100000,
	})
}

// TestSQUpdateSchema is a placeholder for enabling SQ on an existing collection.
func TestSQUpdateSchema(t *testing.T) {
	t.Skip(p2dSkipConfigUpdate)

	// TODO[g-despot]: SQ enable-on-existing snippet pending a working config update
	// START SQUpdateSchema
	// Coming soon
	// END SQUpdateSchema
}

// TestPQInitialSchema defines a collection without a quantizer, the first step
// of enabling PQ manually.
func TestPQInitialSchema(t *testing.T) {
	t.Skip(p2dSkipModel2Vec)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	_ = client.Collections.Delete(ctx, "Question")
	defer client.Collections.Delete(ctx, "Question")

	// START PQInitialSchema
	_, err := client.Collections.Create(ctx, collections.Collection{
		Name:        "Question",
		Description: "A Jeopardy! question",
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: model2vec.Text2Vec{}},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END PQInitialSchema
	p2dRequireIndexConfig(t, "Question", "default", "hnsw", "", nil)
}

// TestPQUpdateSchema is a placeholder for enabling PQ on an existing collection.
func TestPQUpdateSchema(t *testing.T) {
	t.Skip(p2dSkipConfigUpdate)

	// TODO[g-despot]: PQ enable-on-existing snippet pending a working config update
	// START PQUpdateSchema
	// Coming soon
	// END PQUpdateSchema
}

// TestPQGetSchema is a placeholder for reading the PQ settings back.
func TestPQGetSchema(t *testing.T) {
	t.Skip("fails at v6.0.0-rc.0: GetConfig reports the wrong quantizer (a PQ collection reads back as compression.RQ)")

	// TODO[g-despot]: PQ read-back snippet pending a correct compression decode
	// START PQGetSchema
	// Coming soon
	// END PQGetSchema
}

// TestRQUpdateSchema is a placeholder for enabling RQ on an existing collection.
func TestRQUpdateSchema(t *testing.T) {
	t.Skip(p2dSkipConfigUpdate)

	// TODO[g-despot]: RQ enable-on-existing snippets pending a working config update
	// START RQUpdateSchema
	// Coming soon
	// END RQUpdateSchema

	// START RQ1BitUpdateSchema
	// Coming soon
	// END RQ1BitUpdateSchema
}

// TestMuveraEncoding is a placeholder for MUVERA multi-vector encoding.
func TestMuveraEncoding(t *testing.T) {
	t.Skip("fails at v6.0.0-rc.0: a MUVERA encoder is stored with muvera.enabled=false, so encoding never turns on")

	// TODO[g-despot]: MUVERA encoding snippet pending a client fix
	// START MuveraEncoding
	// Coming soon
	// END MuveraEncoding
}

// TestCompressionCreateLandsREST creates each create-time compression config
// above with self-provided vectors (the docs CI has no text2vec-model2vec) and
// proves through the REST schema that the quantizer and its options are stored.
func TestCompressionCreateLandsREST(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	const name = "GoV6CompressionTwin"
	vec := selfprovided.Vectorizer
	cases := []struct {
		region    string
		vc        collections.VectorConfig
		indexType string
		quantizer string
		want      map[string]any
	}{
		{"EnableRQ", collections.VectorConfig{Vectorizer: vec, Index: vectorindex.HNSW{}, Compression: compression.RQ{Bits: 8}},
			"hnsw", "rq", map[string]any{"rq.bits": 8}},
		{"1BitEnableRQ", collections.VectorConfig{Vectorizer: vec, Index: vectorindex.HNSW{}, Compression: compression.RQ{Bits: 1}},
			"hnsw", "rq", map[string]any{"rq.bits": 1}},
		{"RQWithOptions", collections.VectorConfig{Vectorizer: vec,
			Compression: compression.RQ{Bits: 8, RescoreLimit: 20, Cache: true},
			Index:       vectorindex.Flat{VectorCacheMaxObjects: 100000}},
			"flat", "rq", map[string]any{"rq.bits": 8, "rq.rescoreLimit": 20, "rq.cache": true, "vectorCacheMaxObjects": 100000}},
		{"EnableBQ", collections.VectorConfig{Vectorizer: vec, Index: vectorindex.HNSW{}, Compression: compression.BQ{}},
			"hnsw", "bq", nil},
		{"BQWithOptions", collections.VectorConfig{Vectorizer: vec,
			Compression: compression.BQ{RescoreLimit: 200, Cache: true},
			Index:       vectorindex.Flat{VectorCacheMaxObjects: 100000}},
			"flat", "bq", map[string]any{"bq.rescoreLimit": 200, "bq.cache": true, "vectorCacheMaxObjects": 100000}},
		{"EnableSQ", collections.VectorConfig{Vectorizer: vec, Index: vectorindex.HNSW{}, Compression: compression.SQ{}},
			"hnsw", "sq", nil},
		{"SQWithOptions", collections.VectorConfig{Vectorizer: vec,
			Compression: compression.SQ{RescoreLimit: 200, TrainingLimit: 50000, Cache: true},
			Index:       vectorindex.HNSW{VectorCacheMaxObjects: 100000}},
			"hnsw", "sq", map[string]any{"sq.rescoreLimit": 200, "sq.trainingLimit": 50000, "vectorCacheMaxObjects": 100000}},
		{"PQInitialSchema", collections.VectorConfig{Vectorizer: vec},
			"hnsw", "", nil},
	}
	for _, c := range cases {
		t.Run(c.region, func(t *testing.T) {
			_ = client.Collections.Delete(ctx, name)
			defer client.Collections.Delete(ctx, name)
			_, err := client.Collections.Create(ctx, collections.Collection{
				Name:    name,
				Vectors: map[string]collections.VectorConfig{"default": c.vc},
			})
			if err != nil {
				t.Fatal(err)
			}
			p2dRequireIndexConfig(t, name, "default", c.indexType, c.quantizer, c.want)
		})
	}
}
