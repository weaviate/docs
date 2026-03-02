---
title: Scopes
sidebar_position: 4
description: "Engram's multi-level scoping system: project, user, and conversation isolation for memories."
---

Engram uses a multi-level scoping system to isolate memories:

- **Project** — Always required. Every memory belongs to a project, identified by the API key.
- **User** — Required for user-scoped topics. Memories are strictly isolated between users.
- **Conversation** — Required when storing to conversation-scoped topics. Optional when searching (see below).

Which scopes are required depends on the topic configuration.

## User-scoped topics

User-scoped topics store memories that belong to an individual user, such as preferences or personal details. Memories are strictly isolated between users — a query for one `user_id` never returns another user's memories. Both storing and searching require the `user_id`.

## Project-wide topics

Topics that are not user-scoped are shared across the entire project. These are useful for procedural memory — things an agent learns about how to perform a task, regardless of which user it is working with. No `user_id` is needed for storing or searching.

## Conversation-scoped topics

Conversation-scoped topics associate memories with a specific conversation. When **storing**, you must provide the `conversation_id`. When **searching**, the `conversation_id` is optional:

- **With `conversation_id`** — Returns only memories from that conversation (e.g. to get a summary of a specific chat).
- **Without `conversation_id`** — Returns memories across all conversations (e.g. to find everything a user has discussed).

Conversation-scoped topics are typically also user-scoped (e.g. conversation summaries are private to a user).

## Multiple topics in one request

A single request can interact with multiple topics. When it does, the required scope parameters are the union of each topic's requirements. For example, if one topic requires `user_id` and another requires `conversation_id`, the request must include both.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
