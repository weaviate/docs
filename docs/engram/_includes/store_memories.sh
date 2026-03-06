#!/bin/bash
set -euo pipefail

BASE_URL="${ENGRAM_BASE_URL:-https://api.engram.weaviate.io}"
USER_ID="test-curl-$(uuidgen | tr '[:upper:]' '[:lower:]' | head -c 8)"
CONVERSATION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

: <<'DOCSNIPPETS'
# START StoreString
curl -X POST https://api.engram.weaviate.io/v1/memories \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "string",
      "content": "The user prefers dark mode and works primarily in Python. They are building a RAG application."
    },
    "user_id": "user-uuid",
    "group": "default"
  }'
# END StoreString

# START StorePreExtracted
curl -X POST https://api.engram.weaviate.io/v1/memories \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "pre_extracted",
      "content": "User prefers dark mode",
      "topic": "preferences"
    },
    "user_id": "user-uuid",
    "group": "default"
  }'
# END StorePreExtracted

# START StoreConversation
curl -X POST https://api.engram.weaviate.io/v1/memories \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "conversation",
      "conversation": {
        "messages": [
          {
            "role": "user",
            "content": "I just moved to Berlin and I am looking for a good coffee shop."
          },
          {
            "role": "assistant",
            "content": "Welcome to Berlin! Here are some popular coffee shops in the city..."
          },
          {
            "role": "user",
            "content": "I prefer specialty coffee, not chains."
          }
        ]
      }
    },
    "user_id": "user-uuid",
    "group": "default"
  }'
# END StoreConversation
DOCSNIPPETS

# --- Test execution below ---

# Store string content
RUN_ID=$(curl -s -X POST "$BASE_URL/v1/memories" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "string",
      "content": "The user prefers dark mode and works primarily in Python. They are building a RAG application."
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
[ "$STATUS" = "completed" ] || { echo "FAIL: string store run did not complete"; exit 1; }

# Wait for indexing
for i in $(seq 1 10); do
  WARMUP=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
    -H "Authorization: Bearer $ENGRAM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query": "Python dark mode", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 1}}')
  WARMUP_COUNT=$(echo "$WARMUP" | jq '.memories | length' 2>/dev/null || echo "0")
  [ "$WARMUP_COUNT" -ge 1 ] 2>/dev/null && break
  sleep 3
done

COUNT=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Python RAG dark mode", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 5}}' \
  | jq '.memories | length')
[ "$COUNT" -ge 1 ] || { echo "FAIL: expected at least 1 result for string store"; exit 1; }
echo "String store: $COUNT memories"

# Store pre-extracted content
RUN_ID=$(curl -s -X POST "$BASE_URL/v1/memories" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "pre_extracted",
      "content": "User prefers dark mode",
      "topic": "preferences"
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
[ "$STATUS" = "completed" ] || { echo "FAIL: pre-extracted store run did not complete"; exit 1; }

COUNT=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "dark mode preference", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 5}}' \
  | jq '.memories | length')
[ "$COUNT" -ge 1 ] || { echo "FAIL: expected at least 1 result for pre-extracted store"; exit 1; }
echo "Pre-extracted store: $COUNT memories"

# Store conversation content
RUN_ID=$(curl -s -X POST "$BASE_URL/v1/memories" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "conversation",
      "conversation": {
        "messages": [
          {"role": "user", "content": "I just moved to Berlin and I am looking for a good coffee shop."},
          {"role": "assistant", "content": "Welcome to Berlin! Here are some popular coffee shops in the city..."},
          {"role": "user", "content": "I prefer specialty coffee, not chains."}
        ]
      }
    },
    "user_id": "'"$USER_ID"'",
    "conversation_id": "'"$CONVERSATION_ID"'",
    "group": "default"
  }' | jq -r '.run_id')

for i in $(seq 1 30); do
  STATUS=$(curl -s "$BASE_URL/v1/runs/$RUN_ID" \
    -H "Authorization: Bearer $ENGRAM_API_KEY" | jq -r '.status')
  [ "$STATUS" = "completed" ] && break
  sleep 2
done
[ "$STATUS" = "completed" ] || { echo "FAIL: conversation store run did not complete"; exit 1; }

COUNT=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Berlin coffee specialty", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 5}}' \
  | jq '.memories | length')
[ "$COUNT" -ge 1 ] || { echo "FAIL: expected at least 1 result for conversation store"; exit 1; }
echo "Conversation store: $COUNT memories"

# Cleanup
curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "user", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 100}}' \
  | jq -r '.memories[]? | .id // empty' | while read -r MID; do
    curl -s -X DELETE "$BASE_URL/v1/memories/$MID?user_id=$USER_ID&group=default" \
      -H "Authorization: Bearer $ENGRAM_API_KEY" > /dev/null
  done

echo "PASS"
