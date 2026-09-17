---
title: Input data types
description: "The three content types Engram accepts: string, conversation, and pre_extracted."
image: og/docs/engram.png
---

import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/input_data_types.py';

Engram accepts three types of input content when storing memories:

| Type | Description | Use case |
|------|-------------|----------|
| `string` | Raw text (one or more strings) | Free-form notes, agent observations |
| `conversation` | Multi-turn messages with roles | Chat transcripts, agent conversations |
| `pre_extracted` | Already-structured items, each with a target topic | When you've done your own extraction |

You pass one of these three shapes as the first argument to `client.memories.add()`. Exactly one content type is used per call.

## String

Send raw text and let Engram's [pipeline](pipelines.md) extract structured memories from it. Passing a plain `str` is the shortest form:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START InputString"
  endMarker="# END InputString"
  language="py"
/>

`content` is an array on the wire, so you can send several unrelated strings in one call. In Python, wrap them in a `StringInput` to do that:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START InputMultipleStrings"
  endMarker="# END InputMultipleStrings"
  language="py"
/>

:::caution A bare Python list is a conversation, not multiple strings
`memories.add()` picks the content type from the argument you pass, and a plain `list` is serialized as a `conversation` — the SDK reads each entry as a message with a `role`. To send multiple independent strings, always use `StringInput(content=[...])`.
:::

## Conversation

Send multi-turn messages with roles for chat transcripts and agent conversations. The pipeline uses conversation-aware extraction to pull memories from the dialogue.

Messages follow the OpenAI Chat Completions format: `role` is one of `user`, `assistant`, `system`, `tool`, or `developer`. Tool calls (`tool_calls`, `tool_call_id`, `name`) are supported. The server normalizes `tool` → `user` and `developer` → `system` internally.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START InputConversation"
  endMarker="# END InputConversation"
  language="py"
/>

## Pre-extracted

Send already-structured items when you've done your own extraction. Each item carries its target topic and bypasses the LLM extraction step — it still flows through the transform and commit stages.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START InputPreExtracted"
  endMarker="# END InputPreExtracted"
  language="py"
/>

## Timestamps and metadata

By default Engram treats input as having just arrived. When you backfill history — importing an old chat log, replaying an event stream — send the real times instead, so extraction resolves relative expressions against them. Send a conversation dated 1 May 2026 and "last week" is extracted as the week of 22 April 2026, not the week before you ran the import.

:::note Input timestamps steer extraction; they are not stored
A memory's own `created_at` and `updated_at` are set when Engram ingests it, and no field on the memory carries the time you sent. So these fields change what gets extracted — you cannot sort or filter memories by when the underlying input happened.
:::

| Input | Fields |
|-------|--------|
| `StringInput` | `created_at`, `updated_at` |
| `ConversationInput` | `created_at`, `updated_at`, `metadata` |
| `MessageInput` | `created_at` (per message) |

Timestamps are [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) — pass either a string such as `"2026-05-01T09:00:00Z"` or a Python `datetime`, which the SDK formats for you. A naive `datetime` is treated as UTC. `metadata` is an arbitrary key-value map attached to a conversation.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START InputTimestamps"
  endMarker="# END InputTimestamps"
  language="py"
/>

Every field is optional; omit any of them and Engram falls back to the current time.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
