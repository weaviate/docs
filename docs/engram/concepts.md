---
title: Concepts
sidebar_position: 2
description: "Core concepts in Engram: memories, topics, groups, scoping, pipelines, retrieval types, and runs."
---

This page explains the core concepts behind Engram's memory system.

## Memories

A memory is a discrete piece of information stored in Engram. Each memory has:

- **Content** — The text of the memory (e.g. "The user prefers dark mode").
- **Topic** — The category it belongs to (e.g. `user_facts`, `preferences`).
- **Group** — The memory group that defines how it was processed.
- **Scope** — The project, user, and conversation it belongs to.
- **Tags** — Optional string labels for additional classification.

Memories are automatically embedded as vectors, making them searchable by meaning.

## Topics

Topics are named categories within a group. They tell Engram what kinds of information to extract and how to scope it.

Each topic has:

| Property | Description |
|----------|-------------|
| `name` | Unique identifier within the group (e.g. `user_facts`) |
| `description` | Natural language description used in LLM prompts during extraction (e.g. "What food the user likes to eat") |
| `scoping` | Whether the topic requires a `user_id` and/or `conversation_id` |
| `is_bounded` | Whether the topic has size constraints |

The topic `description` is important — it's what the extraction pipeline uses to decide how to categorize information. For example, a travel agent might have separate topics with descriptions like "The places the user would like to visit" and "What food the user likes to eat" so the pipeline can route extracted facts to the right topic.

When you create a project, Engram sets up a default group with a default topic automatically.

## Groups

A group bundles a pipeline definition with one or more topics. Each project can have multiple named groups, but most use cases only need the `default` group.

Groups provide:

- A stable UUID identifier for the pipeline configuration
- Topic definitions that control what gets extracted
- Pipeline steps that define the processing flow
- Topic name isolation — different groups can have topics with the same name without collision (e.g. two agents can each have a `user_preferences` topic in separate groups)

## Scoping

Engram uses a multi-level scoping system to isolate memories:

- **Project** — Always required. Every memory belongs to a project, identified by the API key.
- **User** — Required for user-scoped topics. Memories are strictly isolated between users.
- **Conversation** — Required when storing to conversation-scoped topics. Optional when searching (see below).

Which scopes are required depends on the topic configuration:

### User-scoped topics

User-scoped topics store memories that belong to an individual user, such as preferences or personal details. Memories are strictly isolated between users — a query for one `user_id` never returns another user's memories. Both storing and searching require the `user_id`.

### Project-wide topics

Topics that are not user-scoped are shared across the entire project. These are useful for procedural memory — things an agent learns about how to perform a task, regardless of which user it is working with. No `user_id` is needed for storing or searching.

### Conversation-scoped topics

Conversation-scoped topics associate memories with a specific conversation. When **storing**, you must provide the `conversation_id`. When **searching**, the `conversation_id` is optional:

- **With `conversation_id`** — Returns only memories from that conversation (e.g. to get a summary of a specific chat).
- **Without `conversation_id`** — Returns memories across all conversations (e.g. to find everything a user has discussed).

Conversation-scoped topics are typically also user-scoped (e.g. conversation summaries are private to a user).

### Multiple topics in one request

A single request can interact with multiple topics. When it does, the required scope parameters are the union of each topic's requirements. For example, if one topic requires `user_id` and another requires `conversation_id`, the request must include both.

## Pipelines

When you send content to Engram, it runs through an asynchronous pipeline that extracts, transforms, and commits memories. Pipelines are defined as a directed acyclic graph (DAG) of steps.

### Input types

Engram accepts three types of input content:

| Type | Description | Use case |
|------|-------------|----------|
| `string` | Raw text | Free-form notes, agent observations |
| `pre_extracted` | Already-structured content | When you've done your own extraction |
| `conversation` | Multi-turn messages with roles | Chat transcripts, agent conversations |

### Pipeline steps

Each pipeline processes content through a sequence of steps:

1. **Extract** — Pulls structured memories from the input content. The extraction method depends on the input type (`ExtractFromString`, `ExtractFromConversation`, or `ExtractFromPreExtracted`).
2. **Transform** — Refines extracted memories using existing context. Steps like `TransformWithContext` and `TransformOperations` deduplicate, merge, and resolve conflicts with existing memories.
3. **Commit** — Finalizes the operations (create, update, delete) and persists them to storage.

## Retrieval types

Engram supports three search strategies:

| Type | Description | Best for |
|------|-------------|----------|
| `vector` | Pure semantic search using embeddings | Finding conceptually related memories |
| `bm25` | Full-text keyword search | Exact term matching |
| `hybrid` | Combination of vector and BM25 | General-purpose search (recommended) |

You specify the retrieval type in the `retrieval_config` when searching.

## Runs

Each call to store memories creates a **run** — a trackable unit of pipeline execution. Runs have four possible states:

| Status | Meaning |
|--------|---------|
| `running` | Pipeline is actively processing |
| `in_buffer` | Queued and waiting to start |
| `completed` | All operations committed successfully |
| `failed` | An error occurred during processing |

When a run completes, its `committed_operations` field shows exactly which memories were created, updated, or deleted.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
