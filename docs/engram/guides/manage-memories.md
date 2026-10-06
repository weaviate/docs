---
title: Manage memories
description: "How to list memories in an Engram project, and get or delete individual memories by ID."
image: og/docs/engram.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/manage_memories.py';
import AsyncPyCode from '!!raw-loader!../_includes/manage_memories_async.py';
import CurlCode from '!!raw-loader!../_includes/manage_memories.sh';

You can list the [memories](../concepts/memories.md) in a project, and retrieve or delete individual ones by ID.

<details>
<summary>All examples below use a connected <code>client</code></summary>

See [Connect to Engram](../quickstart.md#step-3-connect-to-engram) for how to instantiate one.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START Connect"
  endMarker="# END Connect"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START Connect"
  endMarker="# END Connect"
  language="py"
/>

</TabItem>
<TabItem value="curl" label="cURL">

```bash
export ENGRAM_API_KEY="eng_..."
```

</TabItem>
</Tabs>

</details>

## List memories

`POST /v1/memories/list` returns memories without a search query. Use it when you want everything in a scope rather than the best matches for a question — enumerating one user's memories for a privacy request, filling a "what do you remember about me?" panel, or checking what a pipeline produced.

:::caution REST only
There is no `memories.list()` in the Python SDK (as of `weaviate-engram` 1.0.1), so call the endpoint directly with `curl` or an HTTP client. Do not reach for [`memories.search()`](search-memories.md) as a substitute: a search ranks against a query and returns the top matches, so it is not a complete listing.
:::

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START ListMemories"
  endMarker="# END ListMemories"
  language="bash"
/>

### Body parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User [scope](../concepts/scopes.md) to filter by. Required when the listed topics are user-scoped. |
| `group` | string | The memory [group](../concepts/groups.md) name (defaults to `default`) |
| `topics` | array | Restrict the listing to these [topics](../concepts/topics.md). Each entry is a topic name, or an object with `name` and a per-topic `properties` filter. |
| `properties` | object | Property filter applied across topics, such as `{"conversation_id": "abc-123"}` |
| `limit` | integer | Maximum number of memories to return. Defaults to 20, maximum 100. |

The endpoint has no pagination, so `limit` is a ceiling rather than a page size: 100 memories is the most a single call can return.

### Response

```json
{
  "memories": [
    {
      "id": "memory-uuid",
      "project_id": "project-uuid",
      "user_id": "alice",
      "content": "The user prefers dark mode.",
      "topic": "UserKnowledge",
      "group": "default",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "memory-uuid-2",
      "project_id": "project-uuid",
      "user_id": "alice",
      "content": "The user is planning a trip to Lisbon.",
      "topic": "ConversationSummary",
      "group": "default",
      "properties": { "conversation_id": "abc-123" },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 2
}
```

`properties` appears only on memories whose [topic](../concepts/topics.md) declares those scope properties. `UserKnowledge` is user-scoped only, so it has no `properties` key at all — even when the request that created it carried a `conversation_id`.

`total` is the number of memories in this response, not the number that exist.

## Get a memory

Retrieve a single memory by its ID.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START GetMemory"
  endMarker="# END GetMemory"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START GetMemory"
  endMarker="# END GetMemory"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START GetMemory"
  endMarker="# END GetMemory"
  language="bash"
/>

</TabItem>
</Tabs>

### Query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User [scope](../concepts/scopes.md) (required if the topic is user-scoped) |
| `group` | string | The memory [group](../concepts/groups.md) name (defaults to `default`) |

### Response

```json
{
  "id": "memory-uuid",
  "project_id": "project-uuid",
  "user_id": "alice",
  "content": "The user prefers dark mode.",
  "topic": "UserKnowledge",
  "group": "default",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

A `UserKnowledge` memory is user-scoped only, so there is no `properties` key. It is present only on memories whose [topic](../concepts/topics.md) declares scope properties, such as `ConversationSummary`.

## Delete a memory

Remove a memory permanently by its ID.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START DeleteMemory"
  endMarker="# END DeleteMemory"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START DeleteMemory"
  endMarker="# END DeleteMemory"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START DeleteMemory"
  endMarker="# END DeleteMemory"
  language="bash"
/>

</TabItem>
</Tabs>

The query parameters are the same as for the get request. You must provide the correct scoping parameters to identify the memory.

:::warning
Deleting a memory is permanent and cannot be undone.
:::

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
