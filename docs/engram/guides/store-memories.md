---
title: Store memories
sidebar_position: 1
description: "How to store memories in Engram using string, pre-extracted, or conversation content types."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/store_memories.py';

Engram supports three content types for storing memories. Each triggers a different extraction pipeline.

All requests go to the same endpoint:

```
POST /v1/memories
```

## String content

Send raw text and let Engram extract structured memories from it.

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# StoreString"
  endMarker="# END StoreString"
  language="py"
/>

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl -X POST $ENGRAM_API_URL/v1/memories \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "string",
      "content": "The user prefers dark mode and works primarily in Python. They are building a RAG application."
    },
    "user_id": "user-uuid",
    "group": "default"
  }'
```

</TabItem>
</Tabs>

The pipeline extracts individual facts from the text (e.g. "prefers dark mode", "works in Python") and stores them as separate memories.

## Pre-extracted content

If you've already extracted structured content, send it directly. This skips the LLM extraction step and goes straight to storage.

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# StorePreExtracted"
  endMarker="# END StorePreExtracted"
  language="py"
/>

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl -X POST $ENGRAM_API_URL/v1/memories \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "pre_extracted",
      "content": "User prefers dark mode"
    },
    "user_id": "user-uuid",
    "group": "default"
  }'
```

</TabItem>
</Tabs>

## Conversation content

Send a multi-turn conversation and let Engram extract memories from the full exchange.

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# StoreConversation"
  endMarker="# END StoreConversation"
  language="py"
/>

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl -X POST $ENGRAM_API_URL/v1/memories \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "conversation",
      "conversation": {
        "id": "conversation-uuid",
        "messages": [
          {
            "role": "user",
            "content": "I just moved to Berlin and I am looking for a good coffee shop."
          },
          {
            "role": "assistant",
            "content": "Welcome to Berlin! Here are some popular coffee shops in the city..."
          },
          {
            "role": "user",
            "content": "I prefer specialty coffee, not chains."
          }
        ]
      }
    },
    "user_id": "user-uuid",
    "conversation_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "group": "default"
  }'
```

</TabItem>
</Tabs>

The pipeline analyzes the full conversation and extracts relevant facts (e.g. "lives in Berlin", "prefers specialty coffee").

## Response

All three content types return the same response format:

```json
{
  "run_id": "run-uuid",
  "status": "running"
}
```

Use the `run_id` to [check the pipeline status](check-run-status.md).

## Optional parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | Scope the memory to a specific user |
| `conversation_id` | string (UUID) | Scope the memory to a specific conversation. Must be a valid UUID. |
| `group` | string | Memory group name (defaults to `default`) |
| `root` | string | Pipeline root name (for advanced pipeline configurations) |

:::info
Which parameters are required depends on the topic's scoping configuration. If a topic is user-scoped, you must include `user_id`. If a topic is conversation-scoped, you must include `conversation_id` when storing (it is optional when searching).
:::

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
