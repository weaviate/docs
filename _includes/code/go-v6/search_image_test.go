package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/google/uuid"
	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/collections"
	"github.com/weaviate/weaviate-go-client/v6/data"
	"github.com/weaviate/weaviate-go-client/v6/query"
)

// The image snippets search a multimodal collection with collection.Query.NearMedia.
// The v6 client takes a base64 string for every media kind and never encodes for
// you, so the snippets show the encoding step explicitly.

// clipVectorizer is a test-only Vectorizer that selects the multi2vec-clip module,
// which vectorizes images and text into one space. The v6 client encodes any
// modules.Module by reflection, so a struct that reports the module name and its
// JSON config is enough to request server-side vectorization.
type clipVectorizer struct {
	ImageFields []string `json:"imageFields"`
	TextFields  []string `json:"textFields"`
}

func (clipVectorizer) Name() string { return "multi2vec-clip" }

// solidPNG encodes a small solid-colour PNG, so the image fixtures need no
// network access and no binary blobs in the repository.
func solidPNG(t *testing.T, c color.RGBA) []byte {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, 32, 32))
	for x := 0; x < 32; x++ {
		for y := 0; y < 32; y++ {
			img.Set(x, y, c)
		}
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("encode fixture png: %v", err)
	}
	return buf.Bytes()
}

// setupDogImages (re)creates a Dog collection whose vectors come from
// multi2vec-clip, then seeds two images. The docs CI image stack
// (tests/docker-compose-anon-clip.yml) provides the module; when it is not
// running the test skips at runtime rather than failing.
func setupDogImages(t *testing.T, client *weaviate.Client) []byte {
	t.Helper()
	ctx := context.Background()
	_ = client.Collections.Delete(ctx, "Dog")
	if _, err := client.Collections.Create(ctx, collections.Collection{
		Name: "Dog",
		Properties: []collections.Property{
			{Name: "breed", DataType: collections.DataTypeText},
			// The v6 client has no blob DataType constant yet. DataType is a
			// string, so the server-side name still works.
			{Name: "image", DataType: collections.DataType("blob")},
		},
		Vectors: map[string]collections.VectorConfig{
			"default": {Vectorizer: clipVectorizer{
				ImageFields: []string{"image"},
				TextFields:  []string{"breed"},
			}},
		},
	}); err != nil {
		if strings.Contains(err.Error(), "multi2vec-clip") {
			t.Skipf("multi2vec-clip is not enabled on this Weaviate instance: %v", err)
		}
		t.Fatalf("create Dog collection: %v", err)
	}

	corgi := solidPNG(t, color.RGBA{R: 220, G: 150, B: 60, A: 255})
	poodle := solidPNG(t, color.RGBA{R: 40, G: 60, B: 200, A: 255})

	d1 := uuid.MustParse("11111111-1111-4111-8111-111111111111")
	d2 := uuid.MustParse("22222222-2222-4222-8222-222222222222")
	dogs := client.Collections.Use("Dog")
	if _, err := dogs.Data.Insert(ctx,
		&data.Object{UUID: &d1, Properties: map[string]any{
			"breed": "Corgi", "image": base64.StdEncoding.EncodeToString(corgi),
		}},
		&data.Object{UUID: &d2, Properties: map[string]any{
			"breed": "Poodle", "image": base64.StdEncoding.EncodeToString(poodle),
		}},
	); err != nil {
		t.Fatalf("seed Dog collection: %v", err)
	}

	waitForCount(t, dogs, 2)
	return corgi
}

func TestSearchImageByPath(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	corgi := setupDogImages(t, client)
	defer client.Collections.Delete(ctx, "Dog")

	// Run from a scratch directory holding the image the snippet reads.
	t.Chdir(t.TempDir())
	if err := os.MkdirAll("images", 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join("images", "search-image.jpg"), corgi, 0o644); err != nil {
		t.Fatal(err)
	}

	// START ImageByPath
	// The v6 client takes a base64 string, so read the file and encode it.
	img, err := os.ReadFile("./images/search-image.jpg")
	if err != nil {
		// handle error
		panic(err)
	}

	dogs := client.Collections.Use("Dog")
	response, err := dogs.Query.NearMedia(ctx, query.NearMedia{
		// Always name the media kind. A NearMedia with no Media runs no search
		// at all: it returns arbitrary objects and drops any distance cutoff.
		Media:            query.Image(base64.StdEncoding.EncodeToString(img)),
		ReturnProperties: []string{"breed"},
		Limit:            1,
		// Target: query.VectorName("vector_name"), // required with multiple named vectors
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END ImageByPath
}

func TestSearchImageByBase64(t *testing.T) {
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	corgi := setupDogImages(t, client)
	defer client.Collections.Delete(ctx, "Dog")

	base64String := base64.StdEncoding.EncodeToString(corgi)

	// START ImageByBase64
	dogs := client.Collections.Use("Dog")
	response, err := dogs.Query.NearMedia(ctx, query.NearMedia{
		// query.Image marks the string as an image. The other media kinds are
		// query.Audio, query.Video, query.Depth, query.Thermal and query.IMU.
		Media:            query.Image(base64String),
		ReturnProperties: []string{"breed"},
		Limit:            1,
		// Target: query.VectorName("vector_name"), // required with multiple named vectors
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, obj := range response.Objects {
		fmt.Printf("%v\n", obj.Properties)
	}
	// END ImageByBase64
}

func TestSearchImageBase64Helper(t *testing.T) {
	// START ImageBase64Helper
	// The v6 client never encodes media for you, so fetch the image and
	// base64-encode it before passing it to query.Image.
	urlToBase64 := func(url string) (string, error) {
		req, err := http.NewRequest(http.MethodGet, url, nil)
		if err != nil {
			return "", err
		}
		// Many image hosts reject Go's default user agent. Identify your app.
		req.Header.Set("User-Agent", "weaviate-docs-example/1.0")

		res, err := http.DefaultClient.Do(req)
		if err != nil {
			return "", err
		}
		defer res.Body.Close()
		// http.Client does not treat a 4xx/5xx as an error, so check it: an
		// error page would otherwise be encoded and sent as if it were an image.
		if res.StatusCode != http.StatusOK {
			return "", fmt.Errorf("get %s: %s", url, res.Status)
		}
		content, err := io.ReadAll(res.Body)
		if err != nil {
			return "", err
		}
		return base64.StdEncoding.EncodeToString(content), nil
	}

	base64Img, err := urlToBase64("https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deutsches_Museum_Portrait_4.jpg/500px-Deutsches_Museum_Portrait_4.jpg")
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("base64 image: %d characters\n", len(base64Img))
	// END ImageBase64Helper
}
