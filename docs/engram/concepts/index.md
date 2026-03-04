---
title: Concepts
sidebar_position: 2
description: "Core concepts in Engram: memories, topics, groups, scoping, pipelines, retrieval types, and runs."
---

Engram organizes and processes memories for your AI applications. Here's how the core concepts work together.

| Concept                                 | Description                                                                                                                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Memories](memories.md)                 | Discrete pieces of information stored in Engram, automatically embedded as vectors for semantic search.                                                          |
| [Groups](groups.md)                     | A named configuration bundle. Each group contains topics (what to remember) and a pipeline (how to process). Most projects start with a single group.            |
| [Topics](topics.md)                     | A category of memory within a group. Each topic defines what kind of information to extract, like "preferences" or "conversation_summaries".                     |
| [Scopes](scopes.md)                     | Controls memory visibility. Every memory belongs to a project. Topics can additionally require a user ID (user-scoped) or conversation ID (conversation-scoped). |
| [Input data types](input-data-types.md) | The three content formats Engram accepts: string, pre-extracted, and conversation.                                                                               |
| [Pipelines](pipelines.md)               | The processing flow that turns raw input into stored memories. Steps include extracting facts, transforming with context, and committing to storage.             |
| [Retrieval](retrieval.md)               | Search strategies for finding memories: vector, BM25, and hybrid.                                                                                                |

## How concepts relate

import EngramArchitecture from "/docs/engram/\_includes/concepts.png";

<div class="row">
  <div class="col col--10">
    <div class="card">
      <div class="card__image">
        <img src={EngramArchitecture} alt="Engram Architecture" />
      </div>
      <div class="card__body">
        Overview of Engram's key concepts and how they relate to each other.
      </div>
    </div>
  </div>
</div>
 <br/>

- A [**Group**](groups.md) bundles a [**Pipeline**](pipelines.md) with one or more [**Topics**](topics.md) — one group per use case.
- [**Input data**](input-data-types.md) (string, conversation, or pre-extracted) is sent to a group for processing along with the required [**Scope**](scopes.md) information (project, user, conversation).
- **Topics** guide the pipeline on what to extract and define which **scopes** are required.
- The pipeline produces [**Memories**](memories.md), which are isolated according to the scope rules.

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
