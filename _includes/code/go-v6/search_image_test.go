package main

import "testing"

// This file holds placeholders for the image search how-to page. The v6 Go client
// does not expose near-image (image) search yet, so each marked region contains
// only a "Coming soon" line. The Go v6 doc tab renders that placeholder while the
// surrounding test compiles and skips.

// TestSearchImageByPath is a placeholder: searching by a local image file path
// (near-image) is not yet available in the v6 Go client.
func TestSearchImageByPath(t *testing.T) {
	t.Skip("near-image search is not yet available in the v6 Go client")

	// TODO[g-despot]: image-by-file-path search snippet pending v6 client support
	// START ImageByPath
	// Coming soon
	// END ImageByPath
}

// TestSearchImageByBase64 is a placeholder: searching by a base64 image
// representation (near-image) is not yet available in the v6 Go client.
func TestSearchImageByBase64(t *testing.T) {
	t.Skip("near-image search is not yet available in the v6 Go client")

	// TODO[g-despot]: image-by-base64 search snippet pending v6 client support
	// START ImageByBase64
	// Coming soon
	// END ImageByBase64
}

// TestSearchImageBase64Helper is a placeholder: the base64 helper is only shown
// alongside near-image search, which is not yet available in the v6 Go client.
func TestSearchImageBase64Helper(t *testing.T) {
	t.Skip("near-image search is not yet available in the v6 Go client")

	// TODO[g-despot]: base64-representation helper snippet pending v6 client support
	// START ImageBase64Helper
	// Coming soon
	// END ImageBase64Helper
}
