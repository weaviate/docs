---
title: Input Data Types
sidebar_position: 5
description: "The three content types Engram accepts: string, pre-extracted, and conversation."
---

Engram accepts three types of input content when storing memories:

| Type | Description | Use case |
|------|-------------|----------|
| `string` | Raw text | Free-form notes, agent observations |
| `pre_extracted` | Already-structured content | When you've done your own extraction |
| `conversation` | Multi-turn messages with roles | Chat transcripts, agent conversations |

## String

Send raw text and let Engram's pipeline extract structured memories from it. This is the simplest input type — suitable for free-form notes, agent observations, or any unstructured text.

## Pre-extracted

Send already-structured content when you've done your own extraction or want to bypass Engram's extraction step. The content is passed through directly to the transform and commit stages.

## Conversation

Send multi-turn messages with roles (e.g. `user`, `assistant`) for chat transcripts and agent conversations. The pipeline uses conversation-aware extraction to pull memories from the dialogue context.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
