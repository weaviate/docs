---
title: Search
description: "Engram search retrieval types: vector, BM25, hybrid, and fetch, with their defaults and limits."
image: og/docs/engram.png
---

Engram supports four retrieval types for finding memories:

| Type | Description | Best for |
|------|-------------|----------|
| `vector` | Pure semantic search using embeddings | Finding conceptually related memories |
| `bm25` | Full-text keyword search | Exact term matching |
| `hybrid` | Combination of vector and BM25 | General-purpose search (recommended) |
| `fetch` | No query at all — returns the memories in the scope you ask for | Reading a [bounded topic](topics.md) such as `ConversationSummary`, where there is one memory per scope and ranking is pointless |

You specify the retrieval type in the `retrieval_config` when [searching](../guides/search-memories.md).

## Fetch

`vector`, `bm25`, and `hybrid` all rank memories against your query. `fetch` does not: it applies the [scope](scopes.md) and topic filters you pass and returns what matches, with no embedding, no keyword scoring, and no ordering by relevance.

That makes it the right choice when the scope already identifies the memory you want. A [bounded topic](topics.md) holds at most one memory per scope, so searching it with a query only adds latency and a chance of ranking the wrong thing — `fetch` with the topic and scope returns exactly that memory. The [Context window management](../tutorials/context-window-management.md) tutorial uses it to pull a `ConversationSummary` for the current conversation.

The `query` field is still required by the API and must not be empty, even though `fetch` ignores its value. Send any placeholder.

## Defaults and limits

If you omit `retrieval_config` entirely, Engram uses **hybrid** search with a limit of **10**.

`limit` caps how many memories a search returns. It accepts **1 to 100** and defaults to **10**; a value outside that range is rejected with a `422`. There is no pagination, so a limit of 100 is the most one search can return — narrow the [scope](scopes.md) or the topics rather than paging.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
