---
title: Search memories
sidebar_position: 2
description: "How to search memories in Engram using vector, BM25, and hybrid retrieval with filtering and scoping."
---

Search stored memories using the search endpoint:

```
POST /v1/memories/search
```

## Basic search

Provide a query and Engram returns the most relevant memories.

```bash
curl -X POST $ENGRAM_API_URL/v1/memories/search \
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
```

```json
{
  "memories": [
    {
      "id": "memory-uuid",
      "content": "The user works primarily in Python",
      "topic": "user_facts",
      "group": "default",
      "score": 0.89,
      "tags": [],
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

## Retrieval types

Specify the retrieval type in `retrieval_config`:

### Vector search

Pure semantic search using embeddings. Finds memories that are conceptually similar to your query, even without matching keywords.

```json
{
  "retrieval_config": {
    "retrieval_type": "vector",
    "limit": 10
  }
}
```

### BM25 search

Full-text keyword search. Best for finding memories that contain specific terms.

```json
{
  "retrieval_config": {
    "retrieval_type": "bm25",
    "limit": 10
  }
}
```

### Hybrid search

Combines vector and BM25 for the best of both approaches. This is the recommended retrieval type for most use cases.

```json
{
  "retrieval_config": {
    "retrieval_type": "hybrid",
    "limit": 10
  }
}
```

## Filter by topic

Restrict your search to specific topics by providing a `topics` array.

```bash
curl -X POST $ENGRAM_API_URL/v1/memories/search \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "user preferences",
    "topics": ["user_facts", "preferences"],
    "user_id": "user-uuid",
    "group": "default",
    "retrieval_config": {
      "retrieval_type": "hybrid",
      "limit": 10
    }
  }'
```

If you omit `topics`, Engram searches across all topics in the group.

## Scoping

Search results are scoped to match the parameters you provide:

- **`user_id`** — Required for user-scoped topics. Only returns memories for this user.
- **`conversation_id`** — Optional for conversation-scoped topics. Include it to filter to a single conversation, or omit it to search across all conversations.
- **`group`** — Search within this group. Defaults to `default`.

:::tip
For user-scoped topics, always include the `user_id` you used when storing the memories. For conversation-scoped topics, you can omit `conversation_id` to search across all conversations at once.
:::

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
