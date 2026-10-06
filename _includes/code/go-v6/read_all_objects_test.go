package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"slices"
	"strings"
	"testing"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/query"
	"github.com/weaviate/weaviate-go-client/v6/tenant"
	"google.golang.org/api/iterator"
)

// p2bWineReviews is the seed data for the WineReview read-all snippets. Fixed,
// non-leading-zero ids keep the run deterministic.
var p2bWineReviews = []*data.Object{
	{UUID: new(uuid.MustParse("a7b8c9d0-0001-4a00-8000-000000000001")), Properties: map[string]any{"title": "Mount Etna Rosso", "country": "Italy"}},
	{UUID: new(uuid.MustParse("a7b8c9d0-0002-4a00-8000-000000000002")), Properties: map[string]any{"title": "Napa Valley Cabernet", "country": "US"}},
	{UUID: new(uuid.MustParse("a7b8c9d0-0003-4a00-8000-000000000003")), Properties: map[string]any{"title": "Mosel Riesling", "country": "Germany"}},
}

// p2bSetupWineReview (re)creates a WineReview-shaped collection whose "default"
// vector is produced by text2vec-contextionary. With multiTenant set it adds
// tenantA and tenantB and seeds both.
func p2bSetupWineReview(t *testing.T, client *weaviate.Client, name string, multiTenant bool) {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, name)
	cfg := collections.Collection{
		Name: name,
		Properties: []collections.Property{
			{Name: "title", DataType: collections.DataTypeText},
			{Name: "country", DataType: collections.DataTypeText},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: contextionaryVectorizer{}},
		},
	}
	if multiTenant {
		cfg.MultiTenancy = &collections.MultiTenancyConfig{Enabled: true}
	}
	if _, err := client.Collections.Create(ctx, cfg); err != nil {
		t.Fatalf("create %s: %v", name, err)
	}

	handles := []*collections.Handle{client.Collections.Use(name)}
	if multiTenant {
		if err := handles[0].Tenants.Create(ctx, tenant.Tenant{Name: "tenantA"}, tenant.Tenant{Name: "tenantB"}); err != nil {
			t.Fatalf("create tenants: %v", err)
		}
		handles = []*collections.Handle{
			client.Collections.Use(name, collections.WithTenant("tenantA")),
			client.Collections.Use(name, collections.WithTenant("tenantB")),
		}
	}
	for _, h := range handles {
		if _, err := h.Data.Insert(ctx, p2bWineReviews...); err != nil {
			t.Fatalf("seed %s: %v", name, err)
		}
		waitForCount(t, h, len(p2bWineReviews))
	}
}

func TestReadAllProps(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	p2bSetupWineReview(t, client, "WineReview", false)
	defer client.Collections.Delete(ctx, "WineReview")

	output := p2yCaptureStdout(t)
	// START ReadAllProps
	collection := client.Collections.Use("WineReview")

	// highlight-start
	iter := collection.Objects(ctx)
	// highlight-end
	for {
		obj, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			// handle error
			panic(err)
		}
		fmt.Println(obj.UUID, obj.Properties)
	}
	// END ReadAllProps

	lines := output()
	if len(lines) != len(p2bWineReviews) {
		t.Fatalf("iterator yielded %d objects, want %d: %q", len(lines), len(p2bWineReviews), lines)
	}
	for _, seed := range p2bWineReviews {
		if !slices.ContainsFunc(lines, func(l string) bool { return strings.HasPrefix(l, seed.UUID.String()+" ") }) {
			t.Errorf("iterator did not yield %s", seed.UUID)
		}
	}
}

func TestReadAllVectors(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	p2bSetupWineReview(t, client, "WineReview", false)
	defer client.Collections.Delete(ctx, "WineReview")

	// START ReadAllVectors
	collection := client.Collections.Use("WineReview")

	// The object iterator returns no vectors, so page with After and request them.
	var after uuid.UUID
	for {
		res, err := collection.Query.OverAll(ctx, query.OverAll{
			Limit: 100,
			After: after,
			// highlight-start
			ReturnVectors: []string{"default"},
			// highlight-end
		})
		if err != nil {
			// handle error
			panic(err)
		}
		if len(res.Objects) == 0 {
			break
		}
		for _, obj := range res.Objects {
			fmt.Println(obj.Properties)
			// highlight-start
			fmt.Println(obj.Vectors["default"].Single)
			// highlight-end
		}
		after = res.Objects[len(res.Objects)-1].UUID
	}
	// END ReadAllVectors

	if after == uuid.Nil {
		t.Fatal("no page was read")
	}
}

func TestReadAllTenants(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	p2bSetupWineReview(t, client, "WineReviewMT", true)
	defer client.Collections.Delete(ctx, "WineReviewMT")

	output := p2yCaptureStdout(t)
	// START ReadAllTenants
	multiCollection := client.Collections.Use("WineReviewMT")

	// Get a list of tenants
	// highlight-start
	tenants, err := multiCollection.Tenants.Get(ctx)
	// highlight-end
	if err != nil {
		// handle error
		panic(err)
	}

	// Iterate through tenants
	for _, tn := range tenants {
		// Iterate through objects within each tenant
		// highlight-start
		iter := multiCollection.WithOptions(collections.WithTenant(tn.Name)).Objects(ctx)
		// highlight-end
		for {
			obj, err := iter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				// handle error
				panic(err)
			}
			fmt.Printf("%s: %v\n", tn.Name, obj.Properties)
		}
	}
	// END ReadAllTenants

	lines := output()
	if len(tenants) != 2 {
		t.Fatalf("tenants = %d, want 2", len(tenants))
	}
	for _, name := range []string{"tenantA", "tenantB"} {
		n := 0
		for _, l := range lines {
			if strings.HasPrefix(l, name+": ") {
				n++
			}
		}
		if n != len(p2bWineReviews) {
			t.Errorf("iterator yielded %d objects for %s, want %d", n, name, len(p2bWineReviews))
		}
	}
}

// p2yCaptureStdout redirects os.Stdout until the returned function is called,
// which restores it and returns the captured lines.
func p2yCaptureStdout(t *testing.T) func() []string {
	t.Helper()
	orig := os.Stdout
	r, w, err := os.Pipe()
	if err != nil {
		t.Fatal(err)
	}
	os.Stdout = w
	done := make(chan []byte)
	go func() {
		b, _ := io.ReadAll(r)
		done <- b
	}()
	restored := false
	restore := func() []string {
		if restored {
			return nil
		}
		restored = true
		w.Close()
		os.Stdout = orig
		b := <-done
		r.Close()
		orig.Write(b)
		return strings.Split(strings.TrimRight(string(b), "\n"), "\n")
	}
	t.Cleanup(func() { restore() })
	return restore
}
