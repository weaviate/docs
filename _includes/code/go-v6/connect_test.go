package main

import (
	"context"
	"os"
	"testing"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
)

func TestConnectLocal(t *testing.T) {
	ctx := context.Background()

	// START ConnectLocal
	client, err := weaviate.NewLocal(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END ConnectLocal

	ready, err := client.IsReady(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if !ready {
		t.Fatal("weaviate is not ready")
	}
}

func TestConnectCloud(t *testing.T) {
	host := os.Getenv("WEAVIATE_URL")
	apiKey := os.Getenv("WEAVIATE_API_KEY")
	if host == "" || apiKey == "" {
		t.Skip("WEAVIATE_URL and WEAVIATE_API_KEY must be set for the cloud connection test")
	}
	ctx := context.Background()

	// START ConnectCloud
	client, err := weaviate.NewWeaviateCloud(ctx, host, apiKey)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	// END ConnectCloud

	if _, err := client.IsReady(ctx); err != nil {
		t.Fatal(err)
	}
}
