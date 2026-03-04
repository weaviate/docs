---
title: Memories
sidebar_position: 1
description: "What memories are in Engram: content, topic, group, scope, and vector embeddings."
---

A memory is a discrete piece of information stored in Engram. Each memory has:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier for the memory |
| `content` | The text of the memory (e.g. "The user prefers dark mode") |
| [`topic`](topics.md) | The category it belongs to (e.g. `preferences`) |
| [`group`](groups.md) | The memory group that defines how it was processed |
| `project_id` | The project this memory belongs to |
| [`user_id`](scopes.md) | The user this memory is scoped to (if user-scoped) |
| [`conversation_id`](scopes.md) | The conversation this memory is scoped to (if conversation-scoped) |
| `created_at` | When the memory was created (RFC 3339) |
| `updated_at` | When the memory was last updated (RFC 3339) |
| `score` | Relevance score (only present in search results) |

Memories are automatically embedded as vectors, making them searchable by meaning.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
