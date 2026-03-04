---
title: Manage memories
sidebar_position: 3
description: "How to get and delete individual memories in Engram by ID."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/manage_memories.py';
import CurlCode from '!!raw-loader!../_includes/manage_memories.sh';

You can retrieve and delete individual [memories](../concepts/memories.md) using their ID.

## Get a memory

Retrieve a single memory by its ID.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START GetMemory"
  endMarker="# END GetMemory"
  language="py"
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
| `conversation_id` | string | Conversation [scope](../concepts/scopes.md) (required if the topic is conversation-scoped) |
| `group` | string | The memory [group](../concepts/groups.md) name |

### Response

```json
{
  "id": "memory-uuid",
  "project_id": "project-uuid",
  "user_id": "user-uuid",
  "content": "The user prefers dark mode.",
  "topic": "preferences",
  "group": "default",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

## Delete a memory

Remove a memory permanently by its ID.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START DeleteMemory"
  endMarker="# END DeleteMemory"
  language="py"
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
