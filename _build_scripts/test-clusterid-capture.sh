#!/usr/bin/env bash
#
# Response-side checks for the cluster-id capture pipeline (Phase 1).
#
# netlify/edge-functions/capture-clusterid.ts must be PASSIVE: with it
# deployed, every response on /e/* and /improve-your-cluster has to be exactly
# what the redirect rules and error-link-src.ts produce without it. This
# script asserts that with curl against a running site (netlify dev, a deploy
# preview, or production).
#
# IT CANNOT SEE THE EVENTS. The log side is checked MANUALLY -- in the Netlify
# UI's edge-function log, or on `netlify dev` stdout -- by filtering for the
# "[clusterid-capture] " prefix. What to expect there for the cases below:
# one event per attributed REQUEST (most cases here issue two curl requests,
# so two lines), exactly ONE per alias double-hop request (the first hop,
# src_id is the alias id), clusterid null + clusterid_valid false for
# the malformed case (the raw value never appears), id_valid false for the
# junk path, NO event at all for the bare /improve-your-cluster visit, and
# ua_class "agent" vs "browser" for the two UA cases.
#
# Needs curl and standard tools only. Exit 0 iff every case passes.
#
#   _build_scripts/test-clusterid-capture.sh http://localhost:8888
#   _build_scripts/test-clusterid-capture.sh https://deploy-preview-N--docs-weaviate-io.netlify.app
#   _build_scripts/test-clusterid-capture.sh https://docs.weaviate.io

set -u

BASE="${1:?usage: $0 <base-url>   e.g. http://localhost:8888}"
BASE="${BASE%/}"

# Any well-formed 8-4-4-4-12 value; the function validates shape, not version.
CID="0f0e829a-3d8f-4b3e-9c1a-2b7d8f6a5c4d"
BROWSER_UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

PASS=0
FAIL=0
ok()  { PASS=$((PASS + 1)); echo "PASS  $1"; }
bad() { FAIL=$((FAIL + 1)); echo "FAIL  $1"; echo "      $2"; }

# First-response status code (no redirect following). Extra curl args pass through.
status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

# Raw Location header of the first response, so the query/fragment ORDER is
# exactly what the server sent (curl's %{redirect_url} is a resolved form).
loc() { curl -s -D - -o /dev/null "$1" | tr -d '\r' | awk 'tolower($1) == "location:" { print $2; exit }'; }

# Final URL after following every redirect.
final() { curl -s -o /dev/null -L -w '%{url_effective}' "$1"; }

# --- 1. Canonical id with a valid clusterid -------------------------------
# Both params must survive into the Location QUERY (i.e. before any #fragment):
# the redirect rules forward the query only because every `to` is plain, and
# error-link-src adds src= -- capture must not have disturbed either.
name="/e/py-dep011?clusterid=<uuid> -> 30x, clusterid= and src= in the query, fragment after"
code=$(status "$BASE/e/py-dep011?clusterid=$CID")
l=$(loc "$BASE/e/py-dep011?clusterid=$CID")
q="${l%%#*}" # the part before any fragment
if [[ "$code" == 30? && "$q" == *"clusterid=$CID"* && "$q" == *"src=py-dep011"* ]]; then
  ok "$name"
else
  bad "$name" "got $code, Location: ${l:-<none>}"
fi

# --- 2. Legacy alias reaches the canonical id's page ----------------------
# The alias hop keeps the first-hop src (src=dep011, by design -- "the value
# set on the first hop stands"), so compare the final PAGE, not the query.
name="/e/dep011?clusterid=<uuid> follows to the same page as /e/py-dep011, clusterid intact"
fa=$(final "$BASE/e/dep011?clusterid=$CID")
fc=$(final "$BASE/e/py-dep011?clusterid=$CID")
pa="${fa%%\?*}" pa="${pa%%#*}"
pc="${fc%%\?*}" pc="${pc%%#*}"
if [[ -n "$pa" && "$pa" == "$pc" && "$fa" == *"clusterid=$CID"* ]]; then
  ok "$name"
else
  bad "$name" "alias landed on '$fa', canonical on '$fc'"
fi

# --- 3. Bare canonical id: unchanged, and no clusterid appears ------------
name="/e/py-dep011 bare -> 30x with src=py-dep011 and no clusterid="
code=$(status "$BASE/e/py-dep011")
l=$(loc "$BASE/e/py-dep011")
if [[ "$code" == 30? && "$l" == *"src=py-dep011"* && "$l" != *"clusterid="* ]]; then
  ok "$name"
else
  bad "$name" "got $code, Location: ${l:-<none>}"
fi

# --- 4. Malformed clusterid: response identical, value still forwarded ----
# Capture must not strip or sanitize the request; it only refuses to LOG the
# malformed value (log check: clusterid null, clusterid_valid false).
name="/e/py-dep011?clusterid=not-a-uuid -> 30x, src= set, raw value still forwarded"
code=$(status "$BASE/e/py-dep011?clusterid=not-a-uuid")
l=$(loc "$BASE/e/py-dep011?clusterid=not-a-uuid")
if [[ "$code" == 30? && "$l" == *"src=py-dep011"* && "$l" == *"clusterid=not-a-uuid"* ]]; then
  ok "$name"
else
  bad "$name" "got $code, Location: ${l:-<none>}"
fi

# --- 5. Junk path: the trailing 302 catch-all still fires -----------------
name="/e/NOT-a-valid-ID -> 302 to /errors (catch-all intact)"
code=$(status "$BASE/e/NOT-a-valid-ID")
l=$(loc "$BASE/e/NOT-a-valid-ID")
if [[ "$code" == "302" && "${l%%\?*}" == *"/errors" ]]; then
  ok "$name"
else
  bad "$name" "got $code, Location: ${l:-<none>}"
fi

# --- 6. Banner page with clusterid: plain 200 -----------------------------
name="/improve-your-cluster?clusterid=<uuid> -> 200"
code=$(status "$BASE/improve-your-cluster?clusterid=$CID")
if [[ "$code" == "200" ]]; then ok "$name"; else bad "$name" "got $code"; fi

# --- 7. Banner page bare: plain 200 (and NO event -- log check) -----------
name="/improve-your-cluster bare -> 200"
code=$(status "$BASE/improve-your-cluster")
if [[ "$code" == "200" ]]; then ok "$name"; else bad "$name" "got $code"; fi

# --- 8. HEAD request behaves like GET on the redirect ---------------------
name="HEAD /e/py-dep011?clusterid=<uuid> -> 30x (log check: method HEAD)"
code=$(curl -s -I -o /dev/null -w '%{http_code}' "$BASE/e/py-dep011?clusterid=$CID")
if [[ "$code" == 30? ]]; then ok "$name"; else bad "$name" "got $code"; fi

# --- 9. UA classes get identical responses (log check: agent vs browser) --
name="agent UA (curl/8) -> same 30x"
code=$(status -A "curl/8" "$BASE/e/py-dep011?clusterid=$CID")
if [[ "$code" == 30? ]]; then ok "$name"; else bad "$name" "got $code"; fi

name="browser UA (Mozilla/5.0 ...) -> same 30x"
code=$(status -A "$BROWSER_UA" "$BASE/e/py-dep011?clusterid=$CID")
if [[ "$code" == 30? ]]; then ok "$name"; else bad "$name" "got $code"; fi

echo
if [[ "$FAIL" -gt 0 ]]; then
  echo "test-clusterid-capture: $FAIL of $((PASS + FAIL)) case(s) FAILED against $BASE"
  exit 1
fi
echo "test-clusterid-capture OK: all $PASS response-side cases passed against $BASE (the log side is manual -- see the header)."
