package main

import "testing"

// The v6 Go client does not yet expose generative (RAG) or reranker model
// configuration on a collection, so the snippets below are placeholders. Each
// one skips and renders a "Coming soon" note until the client adds support.

// TestSetReranker is a placeholder: configuring a reranker model integration on
// a collection is not yet available in the v6 Go client.
func TestSetReranker(t *testing.T) {
	t.Skip("configuring a reranker model on a collection is not yet available in the v6 Go client")

	// TODO[g-despot]: set-reranker snippet pending v6 client support
	// START SetReranker
	// Coming soon
	// END SetReranker
}

// TestUpdateReranker is a placeholder: the v6 Go client has no reranker model
// configuration on a collection, so there is nothing to update.
func TestUpdateReranker(t *testing.T) {
	t.Skip("updating a reranker model on a collection is not yet available in the v6 Go client")

	// TODO[g-despot]: update-reranker snippet pending v6 client support
	// START UpdateReranker
	// Coming soon
	// END UpdateReranker
}

// TestSetGenerative is a placeholder: configuring a generative model
// integration on a collection is not yet available in the v6 Go client.
func TestSetGenerative(t *testing.T) {
	t.Skip("configuring a generative model on a collection is not yet available in the v6 Go client")

	// TODO[g-despot]: set-generative snippet pending v6 client support
	// START SetGenerative
	// Coming soon
	// END SetGenerative
}

// TestUpdateGenerative is a placeholder: the v6 Go client has no generative
// model configuration on a collection, so there is nothing to update.
func TestUpdateGenerative(t *testing.T) {
	t.Skip("updating a generative model on a collection is not yet available in the v6 Go client")

	// TODO[g-despot]: update-generative snippet pending v6 client support
	// START UpdateGenerative
	// Coming soon
	// END UpdateGenerative
}
