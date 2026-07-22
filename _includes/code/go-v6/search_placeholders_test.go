package main

import "testing"

// This file holds placeholders for search and aggregate operations that the v6
// Go client does not implement yet. Each marked region contains only a
// "Coming soon" line so the docs render a clear placeholder in the Go v6 tab;
// the surrounding test compiles and skips.

// TestGetNearObject is a placeholder: the v6 Go client cannot yet search by an
// existing object id (near-object).
func TestGetNearObject(t *testing.T) {
	t.Skip("near-object search is not yet available in the v6 Go client")

	// TODO[g-despot]: near-object search snippet pending v6 client support
	// START NearObject
	// Coming soon
	// END NearObject
}

// TestFilterByGeolocation is a placeholder: the v6 Go client does not yet
// expose a geo-coordinate range filter operator.
func TestFilterByGeolocation(t *testing.T) {
	t.Skip("geo-coordinate filtering is not yet available in the v6 Go client")

	// TODO[g-despot]: geo-coordinate filter snippet pending v6 client support
	// START GeoFilter
	// Coming soon
	// END GeoFilter
}

// TestAggregateNearText is a placeholder: the v6 Go client cannot yet aggregate
// over the results of a near-text search.
func TestAggregateNearText(t *testing.T) {
	t.Skip("aggregation over a near-text search is not yet available in the v6 Go client")

	// TODO[g-despot]: near-text aggregation snippet pending v6 client support
	// START AggregateNearText
	// Coming soon
	// END AggregateNearText
}

// TestAggregateHybrid is a placeholder: the v6 Go client cannot yet aggregate
// over the results of a hybrid search.
func TestAggregateHybrid(t *testing.T) {
	t.Skip("aggregation over a hybrid search is not yet available in the v6 Go client")

	// TODO[g-despot]: hybrid aggregation snippet pending v6 client support
	// START AggregateHybrid
	// Coming soon
	// END AggregateHybrid
}

// TestAggregateWhereFilter is a placeholder: the v6 Go client cannot yet
// aggregate objects selected by a standalone filter.
func TestAggregateWhereFilter(t *testing.T) {
	t.Skip("filtered aggregation is not yet available in the v6 Go client")

	// TODO[g-despot]: filtered aggregation snippet pending v6 client support
	// START AggregateWhereFilter
	// Coming soon
	// END AggregateWhereFilter
}
