---
title: Input data types
sidebar_position: 5
description: "The three content types Engram accepts: string, pre-extracted, and conversation."
---

Engram accepts three types of input content when storing memories:

| Type | Description | Use case |
|------|-------------|----------|
| `string` | Raw text (one or more strings) | Free-form notes, agent observations |
| `conversation` | Multi-turn messages with roles | Chat transcripts, agent conversations |
| `pre_extracted` | Already-structured items, each with a target topic | When you've done your own extraction |

All three are sent in the `input` field of `POST /v1/memories`. Exactly one of `string`, `conversation`, or `pre_extracted` must be set.

```json
{
  "input": {
    "string": { "content": ["..."] }
    // or "conversation": { "messages": [{ "role": "user", "content": "..." }] }
    // or "pre_extracted": { "items": [{ "content": "...", "topic": "..." }] }
  }
}
```

## String

Send raw text and let Engram's [pipeline](pipelines.md) extract structured memories from it. `content` is an array, so you can send multiple unrelated strings in one call — each becomes its own pipeline input.

```python
client.memories.add("The user prefers dark mode and uses VS Code.", user_id="alice")
```

## Conversation

Send multi-turn messages with roles for chat transcripts and agent conversations. The pipeline uses conversation-aware extraction to pull memories from the dialogue.

Messages follow the OpenAI Chat Completions format: `role` is one of `user`, `assistant`, `system`, `tool`, or `developer`. Tool calls (`tool_calls`, `tool_call_id`, `name`) are supported. The server normalizes `tool` → `user` and `developer` → `system` internally.

```python
client.memories.add(
    [
        {"role": "user", "content": "I just moved to Berlin."},
        {"role": "assistant", "content": "Welcome to Berlin!"},
        {"role": "user", "content": "I prefer specialty coffee."},
    ],
    user_id="alice",
)
```

## Pre-extracted

Send already-structured items when you've done your own extraction. Each item carries its target topic and bypasses the LLM extraction step — it still flows through the transform and commit stages.

```python
from engram import PreExtractedInput, PreExtractedItem

client.memories.add(
    PreExtractedInput(items=[
        PreExtractedItem(content="User prefers dark mode", topic="UserKnowledge"),
        PreExtractedItem(content="User works in Python",   topic="UserKnowledge"),
    ]),
    user_id="alice",
)
```

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
