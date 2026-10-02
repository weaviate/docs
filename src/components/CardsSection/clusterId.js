// Canonical 8-4-4-4-12 hex, version-agnostic on purpose. Weaviate mints a v7
// and falls back to v4 when the monotonic-random source fails, so a regex that
// pinned the version nibble would reject exactly the ids born on a bad day.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The cluster id from a `?clusterid=` query string, lowercased, or null when it
// is absent, empty or malformed.
export function readClusterId(search) {
  const value = (new URLSearchParams(search).get("clusterid") || "").trim();
  return UUID.test(value) ? value.toLowerCase() : null;
}
