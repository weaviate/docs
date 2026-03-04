---
title: Quickstart
sidebar_position: 1
description: "Get started with Engram by creating a project, generating an API key, storing a memory, and searching it."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!./_includes/quickstart.py';
import CurlCode from '!!raw-loader!./_includes/quickstart.sh';

This guide walks you through the core Engram workflow: create a project, get an API key, store a memory, and search for it.

## Prerequisites

- A [Weaviate Cloud](https://console.weaviate.cloud) account
- `curl` or install the [Python SDK](https://pypi.org/project/weaviate-engram/):

<Tabs groupId="python-install">
<TabItem value="pip" label="pip">

```bash
pip install weaviate-engram
```

</TabItem>
<TabItem value="uv" label="uv">

```bash
uv add weaviate-engram
```

</TabItem>
</Tabs>

## Step 1: Create a project

Every memory in Engram belongs to a project. Create one in the [Weaviate Cloud console](https://console.weaviate.cloud).

You can select a predefined template when creating a project. For this tutorial, use the **Personalization template**.

The template provides you with a default [group](concepts/groups.md) called `personalization` and a default [topic](concepts/topics.md) called `preferences` (description: *"Stable user preferences, defaults, and behavioral patterns"*). This is enough to get started — you can customize them later.

<details>

<summary>Concepts to learn</summary>

Here are the key concepts:

- **[Topics](concepts/topics.md)** — Named categories that control what kinds of information Engram extracts. The topic's description guides the LLM during extraction.
- **[Groups](concepts/groups.md)** — Containers of topics. Each group maps to a use case (e.g. personalization, continual learning).
- **[Scopes](concepts/scopes.md)** — Control who memories belong to. The default topic `preferences` is user-scoped, meaning you must provide a `user_id` so each user's memories stay separate.

Visit the [concepts section](concepts/index.md) to learn more about how these work together.

</details>

## Step 2: Create an API key

Generate an API key for your project in the Weaviate Cloud console. The full key is only shown once — save it securely.

:::warning
Copy and store the API key immediately. You cannot retrieve it again after it is displayed.
:::

The console also provides your project's Engram API URL. Set both as environment variables for the examples below:

```bash
export ENGRAM_API_KEY="eng_abcdef123456..."
```

## Step 3: Connect to Engram

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py" label="Python">

Initialize the client with your API key.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START Connect"
  endMarker="# END Connect"
  language="py"
/>

</TabItem>
<TabItem value="curl" label="cURL">

Set your API key as an environment variable. All `curl` commands below use `$ENGRAM_API_KEY`.

```bash
export ENGRAM_API_KEY="eng_abcdef123456..."
```

</TabItem>
</Tabs>

## Step 4: Store a memory

Send content to Engram using the memory API. This example sends a plain text string.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START AddMemory"
  endMarker="# END AddMemory"
  language="py"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START AddMemory"
  endMarker="# END AddMemory"
  language="bash"
/>

</TabItem>
</Tabs>

Engram processes memories asynchronously. The response includes a `run_id` you can use to check the pipeline status.

<details>

<summary>Example response</summary>

```json
{
  "run_id": "run-uuid",
  "status": "running"
}
```

</details>

## Step 5: Check run status

Poll the run endpoint to confirm your memory has been committed.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START CheckRun"
  endMarker="# END CheckRun"
  language="py"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START CheckRun"
  endMarker="# END CheckRun"
  language="bash"
/>

</TabItem>
</Tabs>

<details>

<summary>Example response</summary>

```json
{
  "run_id": "run-uuid",
  "status": "completed",
  "group_id": "group-uuid",
  "user_id": "user-uuid",
  "starting_step": 1,
  "input_type": "string",
  "committed_operations": {
    "created": [
      {
        "memory_id": "memory-uuid",
        "committed_at": "2025-01-01T00:00:01Z"
      }
    ]
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:01Z"
}
```

</details>

## Step 6: Search memories

Search for relevant memories using a natural language query.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START SearchMemory"
  endMarker="# END SearchMemory"
  language="py"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START SearchMemory"
  endMarker="# END SearchMemory"
  language="bash"
/>

</TabItem>
</Tabs>

<details>

<summary>Example response</summary>

```json
{
  "memories": [
    {
      "Body": {
        "id": "memory-uuid",
        "project_id": "project-uuid",
        "user_id": "user-uuid",
        "content": "The user prefers dark mode.",
        "topic": "preferences",
        "group": "default",
        "created_at": "2025-01-01T00:00:01Z",
        "updated_at": "2025-01-01T00:00:01Z",
        "score": 1
      }
    },
    {
      "Body": {
        "id": "memory-uuid-2",
        "project_id": "project-uuid",
        "user_id": "user-uuid",
        "content": "The user uses VS Code as their primary editor.",
        "topic": "preferences",
        "group": "default",
        "created_at": "2025-01-01T00:00:01Z",
        "updated_at": "2025-01-01T00:00:01Z",
        "score": 1
      }
    }
  ],
  "total": 2
}
```

</details>

## Next steps

- Learn about [core concepts](concepts/index.md) like topics, groups, and pipelines.
- Explore different ways to [store memories](guides/store-memories.md), including conversations and pre-extracted data.
- See all [search options](guides/search-memories.md) including vector, BM25, and hybrid retrieval.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
