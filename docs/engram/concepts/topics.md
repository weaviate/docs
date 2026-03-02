---
title: Topics
sidebar_position: 3
description: "Topics in Engram: named categories within a group that control extraction and scoping."
---

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

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
