---
title: Input data types
sidebar_position: 5
description: "The three content types Engram accepts: string, pre-extracted, and conversation."
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

Send raw text and let Engram's [pipeline](pipelines.md) extract structured memories from it. `content` is an array, so you can send multiple unrelated strings in one call — each becomes its own pipeline input.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START InputString"
  endMarker="# END InputString"
  language="py"
/>

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

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
