---
title: Topics
description: "Topics in Engram: named categories within a group that control extraction and scoping."
---

Topics are named categories within a [group](groups.md). They tell Engram what kinds of information to extract and how to scope it.

Each topic has:

| Property | Description |
|----------|-------------|
| `name` | Unique identifier within the group (e.g. `user_facts`) |
| `description` | Natural language description used in LLM prompts during extraction (e.g. "What food the user likes to eat") |
| `scoping` | Which scopes the topic requires: `user_scoped` (requires `user_id`) and a list of custom `scope_properties` keys (e.g. `conversation_id`). See [scopes](scopes.md). |
| `is_bounded` | If true, the topic holds at most **one** memory per [scope](scopes.md). Useful for things like running conversation summaries or per-user profiles. |

The topic `description` is important — it's what the [pipeline](pipelines.md) uses to decide how to categorize information. For example, a travel agent might have separate topics with descriptions like "The places the user would like to visit" and "What food the user likes to eat" so the pipeline can route extracted facts to the right topic.

## Bounded topics

A **bounded topic** holds at most one memory per unique scope. The pipeline derives the memory's ID deterministically from the topic name and scope, so subsequent writes update the same memory rather than creating new ones.

This is the right shape for a running summary that should always have a single canonical version. For example:

- A `ConversationSummary` topic scoped by `user_id` + `properties.conversation_id` keeps one summary per conversation. New messages update that summary in place.
- A `UserProfile` topic scoped by `user_id` keeps one profile per user.

The pipeline's [transform steps](pipelines.md) honor the bound: when a transform would otherwise produce multiple memories for the same scope, it consolidates them down to one.

Unbounded topics (the default) generate a fresh ID for every memory, so the same scope can accumulate many memories over time.

:::info

Topics are defined at project creation time as part of a group's configuration. When you create a project, Engram sets up a default group; if you use a project template, the template also seeds that group with its starter topics. To use custom topics, define them in the group configuration when creating the project.

:::

## Examples

A **travel agent** might define three topics within a single group:

- `"destinations"` — description: *"Places the user wants to visit or has visited"*
- `"food_preferences"` — description: *"What food the user likes to eat"*
- `"travel_style"` — description: *"How the user prefers to travel (budget, luxury, solo, group)"*

When a user says *"I love sushi and visit Tokyo every spring"*, the extraction pipeline reads each topic's description and routes the facts accordingly — "loves sushi" goes to `food_preferences` and "visits Tokyo every spring" goes to `destinations`.

At search time, you can restrict results to specific topics. Searching with `topics: ["food_preferences"]` only returns food-related memories, while omitting `topics` searches across all topics in the group.

A **coding assistant** might use topics differently:

- `"UserKnowledge"` — *"Anything relating to the user personally: their personal details, preferences, what they've done or plan to do"*
- `"tech_stack"` — *"Programming languages, frameworks, and libraries the user works with"*

This lets the assistant retrieve just the user's tech stack when helping with a code review, or just their personal context when configuring a new environment.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
