---
title: Store memories
description: "How to store memories in Engram using string, pre-extracted, or conversation content types."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/store_memories.py';
import AsyncPyCode from '!!raw-loader!../_includes/store_memories_async.py';
import CurlCode from '!!raw-loader!../_includes/store_memories.sh';

Engram supports three [content types](../concepts/input-data-types.md) for storing memories. Each content type is a different entrypoint into the same [pipeline](../concepts/pipelines.md).

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

## String content

Send raw text and let Engram extract structured memories from it.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START StoreString"
  endMarker="# END StoreString"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START StoreString"
  endMarker="# END StoreString"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START StoreString"
  endMarker="# END StoreString"
  language="bash"
/>

</TabItem>
</Tabs>

The pipeline extracts individual facts from the text (e.g. "prefers dark mode", "works in Python") and stores them as separate memories.

## Conversation content

Send multi-turn messages and let Engram extract memories from the dialogue. You can send new messages as they happen — there is no need to wait until a conversation is finished.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START StoreConversation"
  endMarker="# END StoreConversation"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START StoreConversation"
  endMarker="# END StoreConversation"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START StoreConversation"
  endMarker="# END StoreConversation"
  language="bash"
/>

</TabItem>
</Tabs>

The pipeline reads the messages and extracts relevant facts (e.g. "lives in Berlin", "prefers specialty coffee").

## Pre-extracted content

If you've already extracted structured content, send it directly. This bypasses the LLM extraction step, but the content still passes through the transform and commit pipeline stages.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START StorePreExtracted"
  endMarker="# END StorePreExtracted"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START StorePreExtracted"
  endMarker="# END StorePreExtracted"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START StorePreExtracted"
  endMarker="# END StorePreExtracted"
  language="bash"
/>

</TabItem>
</Tabs>

## Response

All three content types return the same response format:

```json
{
  "run_id": "run-uuid",
  "status": "running"
}
```

A successful response means the pipeline has started, not that the memories have been committed. In most cases you don't need to do anything else, since memories become available once the pipeline finishes. If you have a specific reason to confirm completion, you can use the `run_id` to [check the pipeline status](check-run-status.md).

## Optional parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | [Scope](../concepts/scopes.md) the memory to a specific user. Required if the target topic is user-scoped. |
| `properties` | object\<string, string\> | Custom [scope properties](../concepts/scopes.md) (e.g. `{"conversation_id": "abc-123"}`). Must include every key any target topic is scoped by. |
| `group` | string | Memory [group](../concepts/groups.md) name (defaults to `default`) |
| `root` | string | Pipeline root name (for advanced pipeline configurations) |

:::info
Which parameters are required depends on the topic's [scoping](../concepts/scopes.md) configuration, not the content type. If a topic is user-scoped, you must include `user_id`. If a topic is scoped by a custom property (e.g. `conversation_id`), pass it in `properties`. These scoping parameters apply equally to all three content types.
:::

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
