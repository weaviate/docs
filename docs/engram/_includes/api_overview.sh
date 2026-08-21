#!/bin/bash
set -euo pipefail

BASE_URL="${ENGRAM_BASE_URL:-https://api.engram.weaviate.io}"

: <<'DOCSNIPPETS'
# START VerifyKey
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://api.engram.weaviate.io/v1/auth/verify" \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
# 204
# END VerifyKey

# START ListGroups
curl "https://api.engram.weaviate.io/v1/groups" \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
# END ListGroups

# START Health
curl "https://api.engram.weaviate.io/health"
# END Health
DOCSNIPPETS

# --- Test execution below ---

# A valid key verifies with 204 and an empty body
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/v1/auth/verify" \
  -H "Authorization: Bearer $ENGRAM_API_KEY")
[ "$CODE" = "204" ] || { echo "FAIL: auth/verify returned $CODE, expected 204"; exit 1; }
echo "Verify key: OK"

# An invalid key is rejected with 401
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/v1/auth/verify" \
  -H "Authorization: Bearer eng_definitely_not_a_real_key")
[ "$CODE" = "401" ] || { echo "FAIL: invalid key returned $CODE, expected 401"; exit 1; }
echo "Reject invalid key: OK"

# Groups are readable and carry their topics' scoping.
# Not GROUPS: bash reserves that name for the caller's group IDs and silently
# discards the assignment, leaving $GROUPS as the numeric primary GID.
GROUPS_JSON=$(curl -s "$BASE_URL/v1/groups" -H "Authorization: Bearer $ENGRAM_API_KEY")
echo "$GROUPS_JSON" | jq -e '.groups | type == "array"' > /dev/null \
  || { echo "FAIL: /v1/groups did not return a groups array"; exit 1; }
echo "$GROUPS_JSON" | jq -e '.groups[0] | has("group_id") and has("name") and has("topics")' > /dev/null \
  || { echo "FAIL: group object missing group_id/name/topics"; exit 1; }
echo "$GROUPS_JSON" | jq -e '[.groups[].topics[]?] | length == 0 or all(has("topic_name") and has("is_bounded") and (.scoping | has("user_scoped")))' > /dev/null \
  || { echo "FAIL: topic object missing topic_name/is_bounded/scoping.user_scoped"; exit 1; }
echo "List groups: OK"

# /health is unauthenticated and lives outside /v1
HEALTH=$(curl -s "$BASE_URL/health")
echo "$HEALTH" | jq -e '.status == "healthy"' > /dev/null \
  || { echo "FAIL: /health did not report healthy: $HEALTH"; exit 1; }
echo "Health: OK"

# Dropping the /v1 prefix 404s rather than redirecting
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/groups" \
  -H "Authorization: Bearer $ENGRAM_API_KEY")
[ "$CODE" = "404" ] || { echo "FAIL: un-prefixed /groups returned $CODE, expected 404"; exit 1; }
echo "Missing /v1 prefix: OK"

echo "PASS"
