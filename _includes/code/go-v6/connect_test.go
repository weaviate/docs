package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"testing"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/rbac"
	"golang.org/x/oauth2"
)

// TestConnectLocalNoAuth connects to a local instance with no authentication.
// This doubles as the connection smoke test for the docs test stack.
func TestConnectLocalNoAuth(t *testing.T) {
	ctx := context.Background()

	// START LocalNoAuth
	client, err := weaviate.NewLocal(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()

	ready, err := client.IsReady(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Println(ready)
	// END LocalNoAuth

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
		weaviate.WithHTTPHost("127.0.0.1"),
		weaviate.WithHTTPPort("8080"),
		weaviate.WithGRPCHost("127.0.0.1"),
		weaviate.WithGRPCPort("50051"),
	)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()

	ready, err := client.IsReady(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Println(ready)
	// END CustomURL

	if !ready {
		t.Fatal("weaviate is not ready")
	}
}

// TestConnectLocalAuth connects with a Weaviate API key. The region dials the
// default local ports, while the API-key instance in the docs test stack runs
// on 8580, so the test is compile-only.
func TestConnectLocalAuth(t *testing.T) {
	t.Skip("the region dials the default local ports. The API-key instance in the docs test stack runs on 8580")
	ctx := context.Background()

	// START LocalAuth
	// Best practice: store your credentials in environment variables
	client, err := weaviate.NewLocal(ctx,
		weaviate.WithAPIKey(os.Getenv("WEAVIATE_API_KEY")),
	)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()

	ready, err := client.IsReady(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Println(ready)
	// END LocalAuth

	if !ready {
		t.Fatal("weaviate is not ready")
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
		// handle error
		panic(err)
	}
	defer client.Close()

	ready, err := client.IsReady(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Println(ready)
	// END LocalThirdPartyAPIKeys

	if !ready {
		t.Fatal("weaviate is not ready")
	}
}

// TestConnectCloud connects to a Weaviate Cloud instance with an API key.
func TestConnectCloud(t *testing.T) {
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
		// handle error
		panic(err)
	}
	defer client.Close()

	ready, err := client.IsReady(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Println(ready)
	// END APIKeyWCD

	if !ready {
		t.Fatal("weaviate is not ready")
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
		// handle error
		panic(err)
	}
	defer client.Close()

	ready, err := client.IsReady(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Println(ready)
	// END ThirdPartyAPIKeys

	if !ready {
		t.Fatal("weaviate is not ready")
	}
}

// TestConnectOIDC connects to the OIDC-enabled instance with a bearer token
// obtained from the identity provider.
func TestConnectOIDC(t *testing.T) {
	if os.Getenv("WEAVIATE_OIDC_ACCESS_TOKEN") == "" {
		t.Skip("WEAVIATE_OIDC_ACCESS_TOKEN must be set for the OIDC connection test")
	}
	ctx := context.Background()

	// START OIDCConnect
	// Connect to a self-hosted Weaviate instance configured with OIDC.
	// Obtain the access token from your identity provider before connecting.
	client, err := weaviate.NewClient(ctx,
		weaviate.WithScheme("http"),
		weaviate.WithHTTPHost("localhost"),
		weaviate.WithHTTPPort("8580"),
		weaviate.WithGRPCHost("localhost"),
		weaviate.WithGRPCPort("50551"),
		weaviate.WithBearerToken(oauth2.Token{
			AccessToken:  os.Getenv("WEAVIATE_OIDC_ACCESS_TOKEN"),
			RefreshToken: os.Getenv("WEAVIATE_OIDC_REFRESH_TOKEN"),
			ExpiresIn:    60, // Lifetime of the access token in seconds.
		}),
	)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()
	// END OIDCConnect

	// IsReady is unauthenticated, so make an authorized call.
	if _, err := client.Users.OIDC.AssignedRoles(ctx, rbac.AssignedRolesOptions{ID: "test-admin"}); err != nil {
		t.Fatalf("authorized call with the OIDC token failed: %v", err)
	}
}
