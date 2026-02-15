---
title: Quickstart
sidebar_position: 1
description: "Get started with Engram by creating a project, generating an API key, storing a memory, and searching it."
---

This guide walks you through the core Engram workflow: create a project, get an API key, store a memory, and search for it.

## Prerequisites

- A [Weaviate Cloud](https://console.weaviate.cloud) account
- `curl` or any HTTP client

## Step 1: Create a project

Every memory in Engram belongs to a project. Create one in the [Weaviate Cloud console](https://console.weaviate.cloud).

Creating a project also sets up a default memory group and topic automatically.

## Step 2: Create an API key

Generate an API key for your project in the Weaviate Cloud console. The full key is only shown once — save it securely.

:::warning
Copy and store the API key immediately. You cannot retrieve it again after it is displayed.
:::

The console also provides your project's Engram API URL. Set both as environment variables for the examples below:

```bash
export ENGRAM_API_URL="https://your-project.engram.weaviate.cloud"
export ENGRAM_API_KEY="eng_abcdef123456..."
```

## Step 3: Store a memory

Send content to Engram using the memory API. This example sends a plain text string.

```bash
curl -X POST $ENGRAM_API_URL/v1/memories \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "string",
      "content": "The user prefers dark mode and uses VS Code as their primary editor."
    },
    "user_id": "user-uuid",
    "group": "default"
  }'
```

Engram processes memories asynchronously. The response includes a `run_id` you can use to check the pipeline status.

```json
{
  "run_id": "run-uuid",
  "status": "running"
}
```

## Step 4: Check run status

Poll the run endpoint to confirm your memory has been committed.

```bash
curl $ENGRAM_API_URL/v1/runs/run-uuid \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
```

```json
{
  "run_id": "run-uuid",
  "status": "completed",
  "committed_operations": {
    "created": [
      {
        "memory_id": "memory-uuid",
        "committed_at": "2025-01-01T00:00:01Z"
      }
    ],
    "updated": [],
    "deleted": []
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:01Z"
}
```

## Step 5: Search memories

Search for relevant memories using a natural language query.

```bash
curl -X POST $ENGRAM_API_URL/v1/memories/search \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What editor does the user prefer?",
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
      "content": "The user prefers dark mode and uses VS Code as their primary editor.",
      "topic": "default",
      "group": "default",
      "score": 0.92,
      "created_at": "2025-01-01T00:00:01Z",
      "updated_at": "2025-01-01T00:00:01Z"
    }
  ],
  "total": 1
}
```

## Next steps

- Learn about [core concepts](concepts.md) like topics, groups, and pipelines.
- Explore different ways to [store memories](guides/store-memories.md), including conversations and pre-extracted data.
- See all [search options](guides/search-memories.md) including vector, BM25, and hybrid retrieval.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
