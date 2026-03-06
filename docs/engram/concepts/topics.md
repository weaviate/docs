---
title: Topics
sidebar_position: 3
description: "Topics in Engram: named categories within a group that control extraction and scoping."
---

Topics are named categories within a [group](groups.md). They tell Engram what kinds of information to extract and how to scope it.

Each topic has:

| Property | Description |
|----------|-------------|
| `name` | Unique identifier within the group (e.g. `user_facts`) |
| `description` | Natural language description used in LLM prompts during extraction (e.g. "What food the user likes to eat") |

The topic `description` is important — it's what the extraction [pipeline](pipelines.md) uses to decide how to categorize information. For example, a travel agent might have separate topics with descriptions like "The places the user would like to visit" and "What food the user likes to eat" so the pipeline can route extracted facts to the right topic.

:::info

Topics are defined at project creation time as part of a group's configuration. When you create a project, Engram sets up a default group with a default topic automatically. To use custom topics, define them in the group configuration when creating the project.

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
