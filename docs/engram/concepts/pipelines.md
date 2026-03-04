---
title: Pipelines and runs
sidebar_position: 6
description: "Engram's async processing pipelines: extract, transform, and commit steps, plus run tracking."
---

When you send content to Engram, it runs through an asynchronous pipeline that extracts, transforms, and commits memories. Pipelines are defined as a directed acyclic graph (DAG) of steps. 

:::info Pipeline configuration

Pipelines will be configurable in the future.

:::

## Pipeline steps

Each pipeline processes content through a sequence of steps:

1. **Extract** — Pulls structured memories from the input content. The extraction method depends on the input type (`ExtractFromString`, `ExtractFromConversation`, or `ExtractFromPreExtracted`).
2. **Transform** — Refines extracted memories using existing context. Steps like `TransformWithContext` and `TransformOperations` deduplicate, merge, and resolve conflicts with existing memories.
3. **Commit** — Finalizes the operations (create, update, delete) and persists them to storage.

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
