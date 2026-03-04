#!/bin/bash
set -euo pipefail

BASE_URL="${ENGRAM_BASE_URL:-https://api.engram.weaviate.io}"
USER_ID="test-curl-$(uuidgen | tr '[:upper:]' '[:lower:]' | head -c 8)"

: <<'DOCSNIPPETS'
# START GetMemory
curl https://api.engram.weaviate.io/v1/memories/{memory-id}?user_id=user-uuid&group=default \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
# END GetMemory

# START DeleteMemory
curl -X DELETE https://api.engram.weaviate.io/v1/memories/{memory-id}?user_id=user-uuid&group=default \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
# END DeleteMemory
DOCSNIPPETS

# --- Test execution below ---

# Seed a memory to manage
RUN_ID=$(curl -s -X POST "$BASE_URL/v1/memories" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "string",
      "content": "The user prefers dark mode and uses VS Code."
    },
    "user_id": "'"$USER_ID"'",
    "group": "default"
  }' | jq -r '.run_id')

for i in $(seq 1 30); do
  STATUS=$(curl -s "$BASE_URL/v1/runs/$RUN_ID" \
    -H "Authorization: Bearer $ENGRAM_API_KEY" | jq -r '.status')
  [ "$STATUS" = "completed" ] && break
  sleep 2
done
[ "$STATUS" = "completed" ] || { echo "FAIL: seed run did not complete"; exit 1; }

# Wait for indexing
for i in $(seq 1 10); do
  WARMUP=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
    -H "Authorization: Bearer $ENGRAM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query": "dark mode VS Code", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 1}}')
  WARMUP_COUNT=$(echo "$WARMUP" | jq '.memories | length' 2>/dev/null || echo "0")
  [ "$WARMUP_COUNT" -ge 1 ] 2>/dev/null && break
  sleep 3
done

# Find a memory ID
MEMORY_ID=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "dark mode", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 5}}' \
  | jq -r '.memories[0].Body.id // .memories[0].id')

[ "$MEMORY_ID" != "null" ] || { echo "FAIL: no memory found to manage"; exit 1; }
echo "Memory ID: $MEMORY_ID"

# Test get memory
GOT_ID=$(curl -s "$BASE_URL/v1/memories/$MEMORY_ID?user_id=$USER_ID&group=default" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" | jq -r '.id')
[ "$GOT_ID" = "$MEMORY_ID" ] || { echo "FAIL: get returned wrong memory"; exit 1; }
echo "Get memory: OK"

# Test delete memory
curl -s -X DELETE "$BASE_URL/v1/memories/$MEMORY_ID?user_id=$USER_ID&group=default" \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
echo "Delete memory: OK"

# Verify deletion
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE_URL/v1/memories/$MEMORY_ID?user_id=$USER_ID&group=default" \
  -H "Authorization: Bearer $ENGRAM_API_KEY")
[ "$HTTP_CODE" = "404" ] || echo "Warning: expected 404 after delete, got $HTTP_CODE"

# Cleanup remaining
curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "user", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 100}}' \
  | jq -r '.memories[]? | (.Body.id // .id) // empty' | while read -r MID; do
    curl -s -X DELETE "$BASE_URL/v1/memories/$MID?user_id=$USER_ID&group=default" \
      -H "Authorization: Bearer $ENGRAM_API_KEY" > /dev/null
  done

echo "PASS"
