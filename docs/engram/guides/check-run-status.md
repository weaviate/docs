---
title: Check run status
sidebar_position: 4
description: "How to poll pipeline run status and interpret committed operations in Engram."
---

When you store memories, Engram processes them asynchronously through a pipeline. Each request returns a `run_id` that you can use to track progress.

## Poll a run

```bash
curl $ENGRAM_API_URL/v1/runs/{run_id} \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
```

### Response

```json
{
  "run_id": "run-uuid",
  "status": "completed",
  "group_id": "group-uuid",
  "starting_step": 0,
  "input_type": "string",
  "error": null,
  "committed_operations": {
    "created": [
      {
        "memory_id": "memory-uuid-1",
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

## Run statuses

| Status | Meaning |
|--------|---------|
| `running` | Pipeline is actively processing the content |
| `in_buffer` | Run is queued and waiting to start |
| `completed` | All operations have been committed successfully |
| `failed` | An error occurred during processing |

## Committed operations

When a run completes, the `committed_operations` field tells you exactly what changed:

- **`created`** — New memories that were added to storage.
- **`updated`** — Existing memories that were modified (e.g. merged or refined).
- **`deleted`** — Memories that were removed (e.g. superseded by an update).

Each entry includes the `memory_id` and a `committed_at` timestamp.

## Handling failures

If a run fails, the `error` field contains a description of what went wrong.

```json
{
  "run_id": "run-uuid",
  "status": "failed",
  "error": "extraction failed: invalid input format",
  "committed_operations": null,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:01Z"
}
```

:::tip
For production systems, implement a polling loop that checks the run status at regular intervals (e.g. every 1-2 seconds) until the status is `completed` or `failed`.
:::

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
