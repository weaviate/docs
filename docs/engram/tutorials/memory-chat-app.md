---
title: "Add Long-Term Memory to a Chat App"
sidebar_position: 1
description: "Build a chatbot with persistent memory across sessions using Engram with Anthropic or OpenAI."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/tutorial_memory_chat_app.py';

LLMs are stateless — every API call starts from scratch with no memory of past conversations. Engram adds persistent memory so your chatbot can remember user preferences, past discussions, and context across sessions.

In this tutorial, you'll build a chat app that:
- Stores conversations as memories after each exchange
- Retrieves relevant memories before generating a response
- Personalizes responses based on what it remembers about the user

## Prerequisites

- An Engram project with an API key ([Quickstart](../quickstart.md))
- An [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/) API key
- Python packages: `pip install weaviate-engram anthropic openai`

Set your environment variables:

```bash
export ENGRAM_API_URL="https://your-project.engram.weaviate.cloud"
export ENGRAM_API_KEY="eng_..."
export ANTHROPIC_API_KEY="sk-ant-..."  # or OPENAI_API_KEY
```

## Step 1: Set up the Engram client

Initialize the Engram client with your API key. The `user_id` parameter scopes all memories to a specific user, so different users get isolated memory stores.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START Setup"
  endMarker="# END Setup"
  language="py"
/>

## Step 2: Create a chat completion function

Create a helper function that sends messages to your LLM provider and returns the response. This function accepts a `system_prompt` parameter — you'll use it later to inject memory context.

<Tabs groupId="providers">
<TabItem value="anthropic" label="Anthropic">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START ChatFunctionAnthropic"
  endMarker="# END ChatFunctionAnthropic"
  language="py"
/>

</TabItem>
<TabItem value="openai" label="OpenAI">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START ChatFunctionOpenAI"
  endMarker="# END ChatFunctionOpenAI"
  language="py"
/>

</TabItem>
</Tabs>

## Step 3: Store conversations as memories

After each conversation, send the messages to Engram. The pipeline extracts discrete facts (e.g. "lives in Berlin", "prefers specialty coffee") and stores them as individual memories.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START StoreConversation"
  endMarker="# END StoreConversation"
  language="py"
/>

`memories.add()` accepts a list of message dicts with `role` and `content` keys — the same format used by Anthropic and OpenAI. The call returns a `run_id` for tracking the asynchronous pipeline. `runs.wait()` blocks until processing completes.

## Step 4: Retrieve relevant memories

Before generating a response, search Engram for memories relevant to the user's current message. Format the results into a system prompt that gives the LLM context about the user.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START SearchMemories"
  endMarker="# END SearchMemories"
  language="py"
/>

Hybrid search combines semantic similarity with keyword matching, so it finds relevant memories even when the wording doesn't match exactly.

## Step 5: Build the full chat loop

Here's the complete script that ties everything together. Each iteration of the loop:

1. Searches Engram for memories relevant to the user's input
2. Builds a system prompt with the retrieved context
3. Sends the message to the LLM with memory-augmented context
4. Stores the new exchange as a memory for future retrieval

<Tabs groupId="providers">
<TabItem value="anthropic" label="Anthropic">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START FullLoopAnthropic"
  endMarker="# END FullLoopAnthropic"
  language="py"
/>

</TabItem>
<TabItem value="openai" label="OpenAI">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START FullLoopOpenAI"
  endMarker="# END FullLoopOpenAI"
  language="py"
/>

</TabItem>
</Tabs>

## Step 6: Test it

Run the script and have a multi-turn conversation. Then stop and restart it — the assistant remembers context from the previous session.

**Session 1:**

```text
You: I just moved to Berlin and I'm looking for a good coffee shop.
Assistant: Welcome to Berlin! Here are some popular spots...

You: I prefer specialty coffee, not chains.
Assistant: Great taste! For specialty coffee in Berlin, check out...

You: quit
```

**Session 2 (after restart):**

```text
You: Any new coffee recommendations?
Assistant: Since you mentioned preferring specialty coffee in Berlin,
I'd suggest checking out...
```

The assistant remembers the user's location and coffee preferences from the previous session because those facts were extracted and stored as memories in Engram.

## Next steps

- **[Context Window Management](context-window-management.md)** — Learn how memory search replaces full conversation history to reduce token costs.
- **[Personalized RAG](personalized-rag-multi-tenant.md)** — Combine a Weaviate knowledge base with per-user memory for personalized responses.
- **[Search memories](../guides/search-memories.md)** — Explore vector, BM25, and hybrid retrieval options.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
