---
title: Search memories
description: "How to search memories in Engram using vector, BM25, and hybrid retrieval with filtering and scoping."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/search_memories.py';
import AsyncPyCode from '!!raw-loader!../_includes/search_memories_async.py';
import CurlCode from '!!raw-loader!../_includes/search_memories.sh';

You can retrieve stored memories using different search techniques. 

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

## Basic search

Provide a query and Engram returns the most relevant memories.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START BasicSearch"
  endMarker="# END BasicSearch"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START BasicSearch"
  endMarker="# END BasicSearch"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START BasicSearch"
  endMarker="# END BasicSearch"
  language="bash"
/>

</TabItem>
</Tabs>

```json
{
  "memories": [
    {
      "id": "memory-uuid",
      "project_id": "project-uuid",
      "user_id": "user-uuid",
      "content": "The user works primarily in Python.",
      "topic": "UserKnowledge",
      "group": "default",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z",
      "score": 0.89
    }
  ],
  "total": 1
}
```

## Retrieval types

Set the [retrieval type](../concepts/search.md) with `retrieval_config`. Pass a retrieval model — `VectorRetrieval`, `BM25Retrieval`, or `HybridRetrieval` — each with an optional `limit`. To use a type with its default settings, you can also pass its name as a string (`"vector"`, `"bm25"`, `"hybrid"`, or `"fetch"`).

### Vector search

Pure semantic search using embeddings. Finds memories that are conceptually similar to your query, even without matching keywords.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START VectorSearch"
  endMarker="# END VectorSearch"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START VectorSearch"
  endMarker="# END VectorSearch"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START VectorSearch"
  endMarker="# END VectorSearch"
  language="bash"
/>

</TabItem>
</Tabs>

### BM25 search

Full-text keyword search. Best for finding memories that contain specific terms.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START BM25Search"
  endMarker="# END BM25Search"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START BM25Search"
  endMarker="# END BM25Search"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START BM25Search"
  endMarker="# END BM25Search"
  language="bash"
/>

</TabItem>
</Tabs>

### Hybrid search

Combines vector and BM25 for the best of both approaches. This is the recommended retrieval type for most use cases.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START HybridSearch"
  endMarker="# END HybridSearch"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START HybridSearch"
  endMarker="# END HybridSearch"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START HybridSearch"
  endMarker="# END HybridSearch"
  language="bash"
/>

</TabItem>
</Tabs>

## Filter by topic

Restrict your search to specific [topics](../concepts/topics.md) by providing a `topics` array.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START TopicFilter"
  endMarker="# END TopicFilter"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START TopicFilter"
  endMarker="# END TopicFilter"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START TopicFilter"
  endMarker="# END TopicFilter"
  language="bash"
/>

</TabItem>
</Tabs>

If you omit `topics`, Engram searches across all topics in the group.

## Scoping

Search results are [scoped](../concepts/scopes.md) to match the parameters you provide:

- **`user_id`** — Required for user-scoped topics. Only returns memories for this user.
- **`properties`** — Optional map of custom scope properties (e.g. `{"conversation_id": "abc-123"}`). Including a key narrows results; omitting a key searches across all values for that key.
- **`group`** — Search within this group. Defaults to `default`.

:::tip
For user-scoped topics, always include the `user_id` you used when storing the memories. For property-scoped topics, you can omit a property key to search across all values — for example, omit `conversation_id` to find a user's memories across all conversations at once.
:::

### Per-topic property filters

When searching multiple topics with different scope requirements, you can override the global `properties` filter on a per-topic basis. Pass an object instead of a string in the `topics` array:

```python
from engram import Topic

results = client.memories.search(
    query="...",
    user_id="alice",
    properties={"conversation_id": "abc-123"},  # global default
    topics=[
        "user_facts",                                            # not conversation-scoped, ignores the filter
        Topic(name="conversation_summary"),                      # uses the global filter
        Topic(name="messages", properties={"conversation_id": None}),  # clear filter — all conversations
    ],
)
```

A `null` value clears an inherited global filter for that topic only.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
