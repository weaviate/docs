#!/bin/bash
set -euo pipefail

BASE_URL="${ENGRAM_BASE_URL:-https://api.engram.weaviate.io}"
USER_ID="test-curl-$(uuidgen | tr '[:upper:]' '[:lower:]' | head -c 8)"

: <<'DOCSNIPPETS'
# START PollRun
curl https://api.engram.weaviate.io/v1/runs/{run-id} \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
# END PollRun
DOCSNIPPETS

# --- Test execution below ---

# Create a memory to get a run_id
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

echo "Run ID: $RUN_ID"

# Poll until completed
for i in $(seq 1 30); do
  STATUS=$(curl -s "$BASE_URL/v1/runs/$RUN_ID" \
    -H "Authorization: Bearer $ENGRAM_API_KEY" | jq -r '.status')
  echo "Status: $STATUS"
  [ "$STATUS" = "completed" ] && break
  sleep 2
done
[ "$STATUS" = "completed" ] || { echo "FAIL: run did not complete"; exit 1; }

# Verify committed_operations
CREATED_COUNT=$(curl -s "$BASE_URL/v1/runs/$RUN_ID" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" | jq '.committed_operations.created | length')
[ "$CREATED_COUNT" -ge 1 ] || { echo "FAIL: expected at least 1 created memory"; exit 1; }
echo "Created memories: $CREATED_COUNT"

# Cleanup
for i in $(seq 1 10); do
  WARMUP=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
    -H "Authorization: Bearer $ENGRAM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query": "dark mode", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 1}}')
  WARMUP_COUNT=$(echo "$WARMUP" | jq '.memories | length' 2>/dev/null || echo "0")
  [ "$WARMUP_COUNT" -ge 1 ] 2>/dev/null && break
  sleep 3
done

curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "user", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 100}}' \
  | jq -r '.memories[]? | .id // empty' | while read -r MID; do
    curl -s -X DELETE "$BASE_URL/v1/memories/$MID?user_id=$USER_ID&group=default" \
      -H "Authorization: Bearer $ENGRAM_API_KEY" > /dev/null
  done

echo "PASS"
