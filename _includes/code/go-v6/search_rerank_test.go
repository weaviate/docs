package main

import "testing"

// This file holds placeholders for the reranking how-to page. The v6 Go client
// does not expose a reranker on search queries yet, so each marked region
// contains only a "Coming soon" line. The Go v6 doc tab renders that placeholder
// while the surrounding test compiles and skips.

// TestRerankNamedVectorNearText is a placeholder: reranking a named-vector
// near-text search is not yet available in the v6 Go client.
func TestRerankNamedVectorNearText(t *testing.T) {
	t.Skip("reranking search results is not yet available in the v6 Go client")

	// TODO[g-despot]: named-vector near-text rerank snippet pending v6 client support
	// START RerankNamedVectorNearText
	// Coming soon
	// END RerankNamedVectorNearText
}

// TestRerankVectorResults is a placeholder: reranking vector search results is
// not yet available in the v6 Go client.
func TestRerankVectorResults(t *testing.T) {
	t.Skip("reranking search results is not yet available in the v6 Go client")

	// TODO[g-despot]: rerank vector-search-results snippet pending v6 client support
	// START RerankVectorResults
	// Coming soon
	// END RerankVectorResults
}

// TestRerankKeywordResults is a placeholder: reranking keyword (BM25) search
// results is not yet available in the v6 Go client.
func TestRerankKeywordResults(t *testing.T) {
	t.Skip("reranking search results is not yet available in the v6 Go client")

	// TODO[g-despot]: rerank keyword-search-results snippet pending v6 client support
	// START RerankKeywordResults
	// Coming soon
	// END RerankKeywordResults
}
