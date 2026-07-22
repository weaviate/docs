package main

import (
	"context"
	"net/http"
	"os"
	"testing"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"golang.org/x/oauth2"
)

// TestConnectLocalNoAuth connects to a local instance with no authentication.
// This doubles as the connection smoke test for the docs test stack.
func TestConnectLocalNoAuth(t *testing.T) {
	ctx := context.Background()

	// START LocalNoAuth
	client, err := weaviate.NewLocal(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END LocalNoAuth

	ready, err := client.IsReady(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if !ready {
		t.Fatal("weaviate is not ready")
	}
}

// TestConnectCustomURL connects to an instance on a custom host and port.
func TestConnectCustomURL(t *testing.T) {
	ctx := context.Background()

	// START CustomURL
	client, err := weaviate.NewClient(ctx,
		weaviate.WithScheme("http"),
		weaviate.WithHTTPHost("localhost"),
		weaviate.WithHTTPPort(8080),
		weaviate.WithGRPCHost("localhost"),
		weaviate.WithGRPCPort(50051),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END CustomURL

	if _, err := client.IsReady(ctx); err != nil {
		t.Fatal(err)
	}
}

// TestConnectLocalAuth connects to a local instance with a Weaviate API key.
func TestConnectLocalAuth(t *testing.T) {
	apiKey := os.Getenv("WEAVIATE_API_KEY")
	if apiKey == "" {
		t.Skip("WEAVIATE_API_KEY must be set for the local API-key connection test")
	}
	ctx := context.Background()

	// START LocalAuth
	client, err := weaviate.NewLocal(ctx,
		weaviate.WithAPIKey(os.Getenv("WEAVIATE_API_KEY")),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END LocalAuth

	if _, err := client.IsReady(ctx); err != nil {
		t.Fatal(err)
	}
}

// TestConnectLocalThirdPartyAPIKeys passes a third-party inference key as a
// request header alongside a local connection.
func TestConnectLocalThirdPartyAPIKeys(t *testing.T) {
	if os.Getenv("COHERE_API_KEY") == "" {
		t.Skip("COHERE_API_KEY must be set for the third-party key connection test")
	}
	ctx := context.Background()

	// START LocalThirdPartyAPIKeys
	client, err := weaviate.NewLocal(ctx,
		weaviate.WithHeader(http.Header{
			"X-Cohere-Api-Key": []string{os.Getenv("COHERE_API_KEY")},
		}),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END LocalThirdPartyAPIKeys

	if _, err := client.IsReady(ctx); err != nil {
		t.Fatal(err)
	}
}

// TestConnectWeaviateCloud connects to a Weaviate Cloud instance with an API key.
func TestConnectWeaviateCloud(t *testing.T) {
	if os.Getenv("WEAVIATE_URL") == "" || os.Getenv("WEAVIATE_API_KEY") == "" {
		t.Skip("WEAVIATE_URL and WEAVIATE_API_KEY must be set for the cloud connection test")
	}
	ctx := context.Background()

	// START APIKeyWCD
	client, err := weaviate.NewWeaviateCloud(
		ctx,
		os.Getenv("WEAVIATE_URL"),
		os.Getenv("WEAVIATE_API_KEY"),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END APIKeyWCD

	if _, err := client.IsReady(ctx); err != nil {
		t.Fatal(err)
	}
}

// TestConnectCloudThirdPartyAPIKeys connects to Weaviate Cloud and forwards a
// third-party inference key as a request header.
func TestConnectCloudThirdPartyAPIKeys(t *testing.T) {
	if os.Getenv("WEAVIATE_URL") == "" || os.Getenv("WEAVIATE_API_KEY") == "" || os.Getenv("COHERE_API_KEY") == "" {
		t.Skip("WEAVIATE_URL, WEAVIATE_API_KEY and COHERE_API_KEY must be set for the cloud third-party key test")
	}
	ctx := context.Background()

	// START ThirdPartyAPIKeys
	client, err := weaviate.NewWeaviateCloud(
		ctx,
		os.Getenv("WEAVIATE_URL"),
		os.Getenv("WEAVIATE_API_KEY"),
		weaviate.WithHeader(http.Header{
			"X-Cohere-Api-Key": []string{os.Getenv("COHERE_API_KEY")},
		}),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END ThirdPartyAPIKeys

	if _, err := client.IsReady(ctx); err != nil {
		t.Fatal(err)
	}
}

// TestConnectOIDC connects to a self-hosted instance using an OIDC bearer token
// obtained from an identity provider.
func TestConnectOIDC(t *testing.T) {
	if os.Getenv("WEAVIATE_OIDC_ACCESS_TOKEN") == "" {
		t.Skip("WEAVIATE_OIDC_ACCESS_TOKEN must be set for the OIDC connection test")
	}
	ctx := context.Background()

	// START OIDCConnect
	client, err := weaviate.NewClient(ctx,
		weaviate.WithScheme("http"),
		weaviate.WithHTTPHost("localhost"),
		weaviate.WithHTTPPort(8080),
		weaviate.WithGRPCHost("localhost"),
		weaviate.WithGRPCPort(50051),
		weaviate.WithBearerToken(oauth2.Token{
			AccessToken:  os.Getenv("WEAVIATE_OIDC_ACCESS_TOKEN"),
			RefreshToken: os.Getenv("WEAVIATE_OIDC_REFRESH_TOKEN"),
		}),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END OIDCConnect

	if _, err := client.IsReady(ctx); err != nil {
		t.Fatal(err)
	}
}
