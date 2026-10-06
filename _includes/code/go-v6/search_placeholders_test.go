package main

import "testing"

// This file holds placeholders for search and aggregate operations that the v6
// Go client cannot run correctly yet. Each marked region contains only a
// "Coming soon" line, and the surrounding test compiles and skips.

// TestFilterByGeolocation is a placeholder: query/filter has no geo-range
// operator at v6.0.0-rc.0.
func TestFilterByGeolocation(t *testing.T) {
	t.Skip("not available at v6.0.0-rc.0: query/filter has no geo-coordinate range operator")

	// TODO[g-despot]: geo-coordinate filter snippet pending v6 client support
	// START GeoFilter
	// Coming soon
	// END GeoFilter
}

// TestAggregateWhereFilter is a placeholder. At v6.0.0-rc.0 aggregate.OverAll
// has no filter, and a Filter on the query of Aggregate.NearText or
// Aggregate.Hybrid is dropped: an impossible filter still counts 6 of 6 objects.
func TestAggregateWhereFilter(t *testing.T) {
	t.Skip("fails at v6.0.0-rc.0: aggregation silently ignores a filter (an impossible filter still counts every object)")

	// TODO[g-despot]: filtered aggregation snippet pending v6 client support
	// START AggregateWhereFilter
	// Coming soon
	// END AggregateWhereFilter
}
