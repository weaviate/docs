---
title: "Context Window Management"
sidebar_position: 2
description: "Reduce LLM token usage and cost by replacing full conversation history with Engram memory search."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/tutorial_context_window_mgmt.py';

Every time you call an LLM, you pay for every token in the request — including the full conversation history. As conversations grow, so does your cost and latency. A 50-turn conversation can easily exceed 10,000 input tokens per request.

Engram solves this by extracting discrete facts from conversations and storing them as searchable memories. Instead of sending the entire history, you search for relevant memories and send only those — keeping context size flat regardless of conversation length.

This tutorial builds on the [Memory Chat App](memory-chat-app.md) pattern and shows you how to:
- Measure the token cost of sending full conversation history
- Replace history with memory search for constant-size context
- Compare the two approaches side-by-side

## Prerequisites

- An Engram project with an API key ([Quickstart](../quickstart.md))
- An [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/) API key
- Python packages: `pip install weaviate-engram anthropic openai`

## Step 1: The naive approach

The most common pattern is to append every message to a list and send the full list with each API call. This works for short conversations but becomes expensive fast.

<Tabs groupId="providers">
<TabItem value="anthropic" label="Anthropic">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START NaiveChatAnthropic"
  endMarker="# END NaiveChatAnthropic"
  language="py"
/>

</TabItem>
<TabItem value="openai" label="OpenAI">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START NaiveChatOpenAI"
  endMarker="# END NaiveChatOpenAI"
  language="py"
/>

</TabItem>
</Tabs>

The `messages` list grows by two entries every turn (user + assistant). By turn 50, you're sending 100 messages in every request.

## Step 2: Measure the cost

Token usage grows linearly with the naive approach. Here's a simple approximation:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START TokenCount"
  endMarker="# END TokenCount"
  language="py"
/>

:::tip
For more accurate token counting, use the `tiktoken` library (`pip install tiktoken`):
```python
import tiktoken
encoder = tiktoken.encoding_for_model("gpt-4o")
token_count = len(encoder.encode(text))
```
:::

The key insight: you're paying for the same messages over and over. Turn 1's messages are re-sent at turn 2, 3, 4, and every subsequent turn.

## Step 3: Store conversations as memories

Instead of keeping messages in a growing list, send them to Engram after each exchange. Engram extracts discrete facts and stores them as searchable memories.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START StoreMemories"
  endMarker="# END StoreMemories"
  language="py"
/>

From a 6-message conversation, Engram might extract memories like:
- "The user is a software engineer"
- "The user works primarily in Python"
- "The user uses FastAPI with PostgreSQL"
- "The user prefers async patterns"
- "The user uses Redis for caching and Celery for background tasks"

Each fact is stored once and retrieved only when relevant.

## Step 4: Replace history with memory search

Instead of sending the full conversation history, search Engram for relevant memories and keep only the last 2-3 exchanges for conversational continuity.

<Tabs groupId="providers">
<TabItem value="anthropic" label="Anthropic">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START MemoryAugmentedChatAnthropic"
  endMarker="# END MemoryAugmentedChatAnthropic"
  language="py"
/>

</TabItem>
<TabItem value="openai" label="OpenAI">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START MemoryAugmentedChatOpenAI"
  endMarker="# END MemoryAugmentedChatOpenAI"
  language="py"
/>

</TabItem>
</Tabs>

The context window now contains:
- **System prompt**: ~5 retrieved memories (~50 tokens)
- **Recent messages**: Last 3 exchanges (~6 messages, ~750 tokens)
- **Total**: ~800 tokens — flat, regardless of conversation length

## Step 5: Compare side-by-side

Here's a comparison of token usage as conversation length grows:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START SideBySide"
  endMarker="# END SideBySide"
  language="py"
/>

```text
Turn   Naive (tokens)     Memory (tokens)    Savings
----------------------------------------------------------
1      125                175                -40%
5      625                425                32%
10     1,250              425                66%
20     2,500              425                83%
50     6,250              425                93%
```

At turn 1, the memory approach has slight overhead from the search. By turn 10, it saves 66%. By turn 50, it saves 93% of input tokens.

## Step 6: Advanced patterns

### Topic filtering

If your project has multiple topics, filter search results to specific topics for more precise retrieval:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START TopicFiltering"
  endMarker="# END TopicFiltering"
  language="py"
/>

### Hybrid search tuning

Adjust the `retrieval_config` to control how memories are ranked:

```python
# Pure semantic search — best for conceptual similarity
RetrievalConfig(retrieval_type="vector", limit=5)

# Keyword search — best for exact terms
RetrievalConfig(retrieval_type="bm25", limit=5)

# Hybrid (recommended) — combines both approaches
RetrievalConfig(retrieval_type="hybrid", limit=10)
```

### Dual-memory pattern

For the best balance of continuity and context, combine both approaches:

1. **Recent messages** (last 2-3 exchanges) — Maintains conversational flow
2. **Engram memory search** — Provides relevant historical context

This is the pattern used in Step 4. The recent messages handle references like "that" and "it", while Engram provides the long-term context that makes the assistant feel like it truly remembers.

## Summary

| Approach | Token growth | Cost at 50 turns | Remembers past sessions |
|----------|-------------|-------------------|------------------------|
| Full history | Linear (O(n)) | ~$0.019/request | No |
| Memory search | Constant (O(1)) | ~$0.001/request | Yes |

Memory search reduces token usage by 90%+ for long conversations and adds cross-session persistence — the assistant remembers facts from previous conversations automatically.

## Next steps

- **[Memory Chat App](memory-chat-app.md)** — The foundational tutorial for integrating Engram with a chat app.
- **[Personalized RAG](personalized-rag-multi-tenant.md)** — Add a knowledge base alongside per-user memory.
- **[Store memories](../guides/store-memories.md)** — Learn about all three content types (string, conversation, pre-extracted).

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
