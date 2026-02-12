---
title: Manage memories
sidebar_position: 3
description: "How to get and delete individual memories in Engram by ID."
---

You can retrieve and delete individual memories using their ID.

## Get a memory

Retrieve a single memory by its ID.

```bash
curl $ENGRAM_API_URL/v1/memories/{id}?user_id={user-uuid}&topic={topic-name}&group={group-name} \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
```

### Query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User scope (required if the topic is user-scoped) |
| `conversation_id` | string | Conversation scope (required if the topic is conversation-scoped) |
| `topic` | string | The topic the memory belongs to |
| `group` | string | The memory group name |

### Response

```json
{
  "id": "memory-uuid",
  "project_id": "project-uuid",
  "user_id": "user-uuid",
  "conversation_id": null,
  "content": "The user prefers dark mode",
  "topic": "user_facts",
  "group": "default",
  "tags": ["preference", "ui"],
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "score": null
}
```

## Delete a memory

Remove a memory permanently by its ID.

```bash
curl -X DELETE $ENGRAM_API_URL/v1/memories/{id}?user_id={user-uuid}&topic={topic-name}&group={group-name} \
  -H "Authorization: Bearer $ENGRAM_API_KEY"
```

The query parameters are the same as for the get request. You must provide the correct scoping parameters to identify the memory.

:::warning
Deleting a memory is permanent and cannot be undone.
:::

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
