#!/bin/bash
set -euo pipefail

BASE_URL="${ENGRAM_BASE_URL:-https://api.engram.weaviate.io}"
USER_ID="test-curl-$(uuidgen | tr '[:upper:]' '[:lower:]' | head -c 8)"

: <<'DOCSNIPPETS'
# START BasicSearch
curl -X POST https://api.engram.weaviate.io/v1/memories/search \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What programming language does the user prefer?",
    "user_id": "user-uuid",
    "group": "default",
    "retrieval_config": {
      "retrieval_type": "hybrid",
      "limit": 5
    }
  }'
# END BasicSearch

# START VectorSearch
curl -X POST https://api.engram.weaviate.io/v1/memories/search \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What programming language does the user prefer?",
    "user_id": "user-uuid",
    "group": "default",
    "retrieval_config": {
      "retrieval_type": "vector",
      "limit": 10
    }
  }'
# END VectorSearch

# START BM25Search
curl -X POST https://api.engram.weaviate.io/v1/memories/search \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Python",
    "user_id": "user-uuid",
    "group": "default",
    "retrieval_config": {
      "retrieval_type": "bm25",
      "limit": 10
    }
  }'
# END BM25Search

# START HybridSearch
curl -X POST https://api.engram.weaviate.io/v1/memories/search \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What programming language does the user prefer?",
    "user_id": "user-uuid",
    "group": "default",
    "retrieval_config": {
      "retrieval_type": "hybrid",
      "limit": 10
    }
  }'
# END HybridSearch

# START TopicFilter
curl -X POST https://api.engram.weaviate.io/v1/memories/search \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "user preferences",
    "topics": ["UserKnowledge"],
    "user_id": "user-uuid",
    "group": "default",
    "retrieval_config": {
      "retrieval_type": "hybrid",
      "limit": 10
    }
  }'
# END TopicFilter
DOCSNIPPETS

# --- Test execution below ---

# Seed memories for search tests
RUN_ID=$(curl -s -X POST "$BASE_URL/v1/memories" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "string": {
        "content": ["The user works primarily in Python and prefers dark mode. They are building a RAG application with FastAPI."]
      }
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
    -d '{"query": "Python dark mode", "user_id": "'"$USER_ID"'", "group": "default", "retrieval_config": {"retrieval_type": "hybrid", "limit": 1}}')
  WARMUP_COUNT=$(echo "$WARMUP" | jq '.memories | length' 2>/dev/null || echo "0")
  [ "$WARMUP_COUNT" -ge 1 ] 2>/dev/null && break
  sleep 3
done

# Test basic search
COUNT=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What programming language does the user prefer?",
    "user_id": "'"$USER_ID"'",
    "group": "default",
    "retrieval_config": {"retrieval_type": "hybrid", "limit": 5}
  }' | jq '.memories | length')
[ "$COUNT" -ge 1 ] || { echo "FAIL: basic search returned 0 results"; exit 1; }
echo "Basic search: $COUNT results"

# Test vector search
COUNT=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What programming language does the user prefer?",
    "user_id": "'"$USER_ID"'",
    "group": "default",
    "retrieval_config": {"retrieval_type": "vector", "limit": 10}
  }' | jq '.memories | length')
[ "$COUNT" -ge 1 ] || { echo "FAIL: vector search returned 0 results"; exit 1; }
echo "Vector search: $COUNT results"

# Test BM25 search
COUNT=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Python",
    "user_id": "'"$USER_ID"'",
    "group": "default",
    "retrieval_config": {"retrieval_type": "bm25", "limit": 10}
  }' | jq '.memories | length')
[ "$COUNT" -ge 1 ] || { echo "FAIL: BM25 search returned 0 results"; exit 1; }
echo "BM25 search: $COUNT results"

# Test hybrid search
COUNT=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What programming language does the user prefer?",
    "user_id": "'"$USER_ID"'",
    "group": "default",
    "retrieval_config": {"retrieval_type": "hybrid", "limit": 10}
  }' | jq '.memories | length')
[ "$COUNT" -ge 1 ] || { echo "FAIL: hybrid search returned 0 results"; exit 1; }
echo "Hybrid search: $COUNT results"

# Test topic filter search — dynamically discover topic name from existing memories
TOPIC_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "user preferences",
    "user_id": "'"$USER_ID"'",
    "group": "default",
    "retrieval_config": {"retrieval_type": "hybrid", "limit": 5}
  }')
FIRST_TOPIC=$(echo "$TOPIC_RESPONSE" | jq -r '.memories[0].topic // empty' 2>/dev/null)
if [ -n "$FIRST_TOPIC" ]; then
  COUNT=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
    -H "Authorization: Bearer $ENGRAM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "user preferences",
      "topics": ["'"$FIRST_TOPIC"'"],
      "user_id": "'"$USER_ID"'",
      "group": "default",
      "retrieval_config": {"retrieval_type": "hybrid", "limit": 10}
    }' | jq '.memories | length')
  [ "$COUNT" -ge 1 ] || { echo "FAIL: topic filter search returned 0 results"; exit 1; }
  echo "Topic filter search (topic=$FIRST_TOPIC): $COUNT results"
else
  echo "Topic filter search: skipped (no topics found)"
fi

# Differential check: BM25 with no lexical overlap should return 0 results.
# Catches the regression where the server silently ignores retrieval_type.
BM25_NO_OVERLAP=$(curl -s -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "submarine periscope rotation",
    "user_id": "'"$USER_ID"'",
    "group": "default",
    "retrieval_config": {"retrieval_type": "bm25", "limit": 10}
  }' | jq '.memories | length')
[ "$BM25_NO_OVERLAP" -eq 0 ] || { echo "FAIL: BM25 with no lexical overlap returned $BM25_NO_OVERLAP, expected 0"; exit 1; }
echo "BM25 no-overlap differential: OK"

# Differential check: a non-existent topic must restrict to 0 results.
# Catches the regression where the topics parameter is silently dropped.
NONEXIST_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/memories/search" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "user preferences",
    "topics": ["DefinitelyNotARealTopicXYZ"],
    "user_id": "'"$USER_ID"'",
    "group": "default",
    "retrieval_config": {"retrieval_type": "hybrid", "limit": 10}
  }')
NONEXIST_CODE=$(echo "$NONEXIST_RESP" | tail -n1)
NONEXIST_BODY=$(echo "$NONEXIST_RESP" | sed '$d')
if [ "$NONEXIST_CODE" -ge 200 ] && [ "$NONEXIST_CODE" -lt 300 ]; then
  NONEXIST_COUNT=$(echo "$NONEXIST_BODY" | jq '.memories | length')
  [ "$NONEXIST_COUNT" -eq 0 ] || { echo "FAIL: non-existent topic returned $NONEXIST_COUNT, expected 0"; exit 1; }
elif [ "$NONEXIST_CODE" -lt 400 ] || [ "$NONEXIST_CODE" -ge 500 ]; then
  echo "FAIL: unexpected status $NONEXIST_CODE for non-existent topic filter"; exit 1
fi
echo "Non-existent topic differential: OK"

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
