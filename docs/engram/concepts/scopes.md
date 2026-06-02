---
title: Scopes
sidebar_position: 4
description: "Engram's multi-level scoping system: project, user, and custom property isolation for memories."
---

Engram uses a multi-level scoping system to isolate memories:

- **Project** — Inherited from the API key. Every memory belongs to exactly one project, so you never set it explicitly.
- **User** — Required for user-scoped [topics](topics.md). Memories are strictly isolated between users.
- **Custom properties** — Arbitrary `key: value` pairs (e.g. `conversation_id`, `session_id`, `tenant_id`) that topics can require for additional isolation.

Which scopes a request must provide depends on the topic configuration.

## Project-wide topics

Topics that are not user-scoped are shared across the entire project. These are useful for procedural memory — things an agent learns about how to perform a task, regardless of which user it is working with. No `user_id` is needed.

## User-scoped topics

User-scoped topics store memories that belong to an individual user, such as preferences or personal details. Memories are strictly isolated between users — a query for one `user_id` never returns another user's memories. Both storing and searching require the `user_id`.

```python
client.memories.add(
    "The user prefers dark mode.",
    user_id="alice",
)

results = client.memories.search(
    query="What does the user prefer?",
    user_id="alice",
)
```

## Custom property scopes

Topics can declare additional `properties` they are scoped by. For example, a `conversation_summary` topic might be scoped by `conversation_id`, or a `tenant_facts` topic might be scoped by `tenant_id`. The property key is arbitrary — it just has to match what the topic was configured with.

When storing or searching memories for a property-scoped topic, pass the values in the `properties` map:

```python
client.memories.add(
    ConversationInput(messages=[...]),
    user_id="alice",
    properties={"conversation_id": "abc-123"},
)

# Search within a single conversation
results = client.memories.search(
    query="What did we discuss?",
    user_id="alice",
    properties={"conversation_id": "abc-123"},
)
```

When **storing**, every property the target topic is scoped by must be present.

When **searching**:

- Including a property narrows results to memories matching that value.
- Omitting a property searches across all values (e.g. omit `conversation_id` to find a user's memories across all conversations).

## Per-topic property filters

When searching across multiple topics with different scope requirements, the per-topic `properties` filter lets you set different values per topic, or clear an inherited global filter on a specific topic:

```python
from engram import Topic

results = client.memories.search(
    query="...",
    user_id="alice",
    properties={"conversation_id": "abc-123"},  # default for all topics
    topics=[
        "user_facts",                                          # not conversation-scoped, ignores the filter
        Topic(name="conversation_summary"),                    # uses the global filter (abc-123)
        Topic(name="messages", properties={"conversation_id": None}),  # clear filter — search all conversations
    ],
)
```

## Multiple topics in one request

A single request can target multiple topics at once.

**When adding memories**, you must provide the scope parameters that every targeted topic requires, which is the **union** of their requirements. If any targeted topic needs `user_id`, you must pass `user_id`. If any needs `properties.conversation_id`, you must pass `properties.conversation_id`. If you omit a parameter that a targeted topic requires, the request is rejected.

**When searching**, scope parameters are optional. They act as filters that narrow results to a specific user or property value, so you only pass the ones you want to filter by.

For example, imagine a customer support agent with two topics in the same group:

- `user_facts` — user-scoped, stores per-user facts like "prefers email over phone".
- `conversation_summary` — scoped by `conversation_id`, keeps a running summary of each conversation.

To search across both for a specific user and conversation, pass `user_id` and `properties.conversation_id` as filters:

```python
results = client.memories.search(
    query="What does the user want and where did we leave off?",
    user_id="alice",
    properties={"conversation_id": "abc-123"},
    topics=["user_facts", "conversation_summary"],
)
```

Topics that don't use a given parameter simply ignore it — `user_facts` doesn't filter on `conversation_id`, but `conversation_summary` uses it to pick the right summary.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
