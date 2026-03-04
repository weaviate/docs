---
title: Concepts
sidebar_position: 2
description: "Core concepts in Engram: memories, topics, groups, scoping, pipelines, retrieval types, and runs."
---

Engram organizes and processes memories for your AI applications. Here's how the core concepts work together.

| Concept                                 | Description                                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Memories](memories.md)                 | Discrete pieces of information stored in Engram, automatically embedded as vectors for semantic search.                                                                                    |
| [Groups](groups.md)                     | A named configuration bundle. Each group contains topics (what to remember) and a pipeline (how to process). Most projects start with a single group.                                      |
| [Topics](topics.md)                     | A category of memory within a group. Each topic defines what kind of information to extract, like "preferences" or "conversation_summaries".                                               |
| [Scopes](scopes.md)                     | Controls memory visibility. Every memory belongs to a project. Topics can additionally require a user ID (user-scoped) or conversation ID (conversation-scoped).                           |
| [Input data types](input-data-types.md) | The three content formats Engram accepts: `string`, `pre-extracted`, and `conversation`.                                                                                                   |
| [Pipelines](pipelines.md)               | The processing flow that turns raw input into stored memories. Steps include extracting facts, transforming with context, and committing to storage. _Will be configurable in the future._ |
| [Search](search.md)                     | Search retrieval strategies for finding memories: vector, BM25, and hybrid.                                                                                                                |

## How concepts relate

Below is an overview of Engram's key concepts and how they relate to each other:

![Weaviate Engram Concepts](../_includes/concepts.png "Weaviate Engram Concepts")

- You send [**input data**](input-data-types.md) (text, a conversation, or pre-extracted facts) along with [**scope**](scopes.md) parameters (`user_id`, `conversation_id`) that identify who the memories belong to.
- The input is routed to a [**group**](groups.md), which bundles [**topics**](topics.md) with a [**pipeline**](pipelines.md) — one group per use case.
- **Topics** tell the pipeline what kinds of information to extract (e.g. "user preferences", "conversation summaries") and which **scopes** are required.
- The **pipeline** extracts facts from the input, deduplicates and merges them with existing data, and commits the results to storage.
- The output is a set of [**memories**](memories.md) — vector-embedded, categorized by topic, and isolated by scope so each user's data stays separate.

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
