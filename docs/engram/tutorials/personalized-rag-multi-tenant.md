---
title: "Personalized RAG with Per-User Memory"
sidebar_position: 3
description: "Build a multi-tenant RAG application that combines a Weaviate knowledge base with per-user Engram memory for personalized responses."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/tutorial_personalized_rag.py';

Standard RAG retrieves the same documents for every user. But a Python developer and a JavaScript developer asking "How do I use the API?" should get different answers — tailored to their language, experience level, and preferences.

This tutorial combines a **Weaviate knowledge base** (shared product documentation) with **Engram per-user memory** (individual preferences and context) to build a personalized, multi-tenant RAG assistant.

You'll learn how to:
- Search both a knowledge base and user memory in parallel
- Build prompts that merge shared knowledge with personal context
- Isolate memory between users with `user_id` scoping
- Handle concurrent users with `AsyncEngramClient`
- Manage user data for privacy compliance

## Prerequisites

- An Engram project with an API key ([Quickstart](../quickstart.md))
- A [Weaviate Cloud](https://console.weaviate.cloud) instance
- An [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/) API key
- Python packages: `pip install weaviate-engram weaviate-client anthropic openai`

## Step 1: Set up both clients

Initialize the Engram client for user memory and the Weaviate client for your knowledge base.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START SetupClients"
  endMarker="# END SetupClients"
  language="py"
/>

```python
import weaviate

weaviate_client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=weaviate.auth.AuthApiKey(os.environ["WEAVIATE_API_KEY"]),
)
```

## Step 2: Populate the knowledge base

Create a Weaviate collection with sample product documentation. This represents your shared knowledge base — the same docs are available to all users.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START PopulateKB"
  endMarker="# END PopulateKB"
  language="py"
/>

## Step 3: Store user context in Engram

Store different preferences and facts for different users. Engram extracts discrete facts and scopes them to each `user_id`.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START StoreUserContext"
  endMarker="# END StoreUserContext"
  language="py"
/>

Alice and Bob now have separate memory stores. Alice's memories include facts like "Python developer" and "prefers concise examples", while Bob's include "JavaScript developer" and "prefers detailed explanations".

## Step 4: Build the dual-search function

Create a function that searches both the Weaviate knowledge base and Engram user memory. The knowledge base provides the factual content; Engram provides the personalization context.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START DualSearch"
  endMarker="# END DualSearch"
  language="py"
/>

In production, you'd also search Weaviate here:

```python
def dual_search(query, user_id, weaviate_collection):
    # Search knowledge base
    kb_results = weaviate_collection.query.hybrid(query=query, limit=5)
    kb_docs = [obj.properties["content"] for obj in kb_results.objects]

    # Search user memory
    user_memories = engram.memories.search(
        query=query, user_id=user_id, group="default",
        retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
    )

    return {"knowledge_base": kb_docs, "user_memories": user_memories}
```

## Step 5: Construct a personalized prompt

Merge the knowledge base results and user memories into a single prompt. The LLM uses the shared docs for accuracy and the user context for personalization.

<Tabs groupId="providers">
<TabItem value="anthropic" label="Anthropic">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START BuildPromptAnthropic"
  endMarker="# END BuildPromptAnthropic"
  language="py"
/>

</TabItem>
<TabItem value="openai" label="OpenAI">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START BuildPromptOpenAI"
  endMarker="# END BuildPromptOpenAI"
  language="py"
/>

</TabItem>
</Tabs>

With this prompt structure, the same question produces different responses:
- **Alice** gets a concise Python example using the SDK's async features
- **Bob** gets a detailed explanation with JavaScript/REST examples

## Step 6: Demo with two users

Both users ask the same question, but each gets a personalized response based on their stored context.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START TwoUserDemo"
  endMarker="# END TwoUserDemo"
  language="py"
/>

Alice's search returns memories about Python and FastAPI. Bob's returns memories about JavaScript and React. The LLM uses this context to tailor its answer.

## Step 7: Add user isolation

Engram's `user_id` scoping ensures strict memory isolation. User A's memories are never returned when searching as User B, even if the query matches.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START UserIsolation"
  endMarker="# END UserIsolation"
  language="py"
/>

Alice searching for "React dashboard JavaScript" finds nothing — those memories belong to Bob. And vice versa. This isolation is enforced at the storage layer, not just filtered in application code.

:::info
User isolation is automatic when you use `user_id` with user-scoped topics. You don't need additional access control logic — Engram handles it.
:::

## Step 8: Scale with async

For production applications handling multiple concurrent users, switch to `AsyncEngramClient`. It uses the same API but supports `async`/`await` for non-blocking operations.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START AsyncSetup"
  endMarker="# END AsyncSetup"
  language="py"
/>

Use `asyncio.gather()` to handle multiple user requests concurrently:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START ConcurrentUsers"
  endMarker="# END ConcurrentUsers"
  language="py"
/>

Both searches run in parallel, reducing total latency compared to sequential calls.

## Step 9: User data management

For privacy compliance (e.g. GDPR right to deletion), you can retrieve and delete individual memories or all memories for a user.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START UserDataManagement"
  endMarker="# END UserDataManagement"
  language="py"
/>

Use `memories.search()` to find all memories for a user, then `memories.delete()` each one. After deletion, subsequent searches return no results for that user.

## Next steps

- **[Memory Chat App](memory-chat-app.md)** — The foundational tutorial for integrating Engram with a chat app.
- **[Context Window Management](context-window-management.md)** — Reduce token costs by replacing conversation history with memory.
- **[Manage memories](../guides/manage-memories.md)** — API reference for get and delete operations.
- **[Core concepts](../concepts/index.md)** — Learn about topics, groups, scoping, and pipelines.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
