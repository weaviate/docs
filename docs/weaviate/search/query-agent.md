---
title: Query Agent search
sidebar_position: 45
image: og/docs/howto.jpg
# tags: ['how to', 'query agent', 'agents']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/query_agent.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/query_agent.mts';

<span class="badge badge--primary">Weaviate Cloud only</span>

The Weaviate Query Agent answers natural language queries by automatically translating them into Weaviate searches.

Instead of manually constructing search queries, you provide a question in natural language, and the Query Agent handles query planning, execution, and response generation.

:::info Prerequisites
The Query Agent requires a Weaviate Cloud instance and the Query Agent client library. See the [full setup guide](/agents/query/usage) for installation and instantiation details.
:::

## Basic search

Use `search` to retrieve relevant objects based on a natural language query:

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START BasicSearchQuery"
  endMarker="# END BasicSearchQuery"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// START BasicSearchQuery"
  endMarker="// END BasicSearchQuery"
  language="ts"
/>
</TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The response includes retrieved objects with their properties:

```python
Product: Vintage Scholar Turtleneck - $55.0
Product: Glide Platforms - $69.0
Product: Sky Shimmer Sneaks - $69.0
```

</details>

## Ask with answer generation

Use `ask` to get a generated answer based on your data:

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START BasicAskQuery"
  endMarker="# END BasicAskQuery"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// START BasicAskQuery"
  endMarker="// END BasicAskQuery"
  language="ts"
/>
</TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The response includes a generated answer plus supporting information:

```text
📝 Final Answer:
For vintage clothing under $60, you might like the Vintage Philosopher
Midi Dress by Echo & Stitch. It features deep green velvet fabric with
antique gold button details, tailored fit, and pleated skirt.

For nice shoes under $60, consider the Glide Platforms by Vivid Verse.
These are high-shine pink platform sneakers with cushioned soles.

🔭 Searches Executed:
- queries=['vintage clothing'], filters=[[price < 60]], collection='ECommerce'
- queries=['nice shoes'], filters=[[price < 60]], collection='ECommerce'

📊 Usage Statistics:
- LLM Requests: 5
- Input Tokens: 288
- Output Tokens: 17
- Total Time: 7.58s
```

</details>

## Paginate search results

Search supports pagination for large result sets:

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START SearchPagination"
  endMarker="# END SearchPagination"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// START SearchPagination"
  endMarker="// END SearchPagination"
  language="ts"
/>
</TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

Results are returned page by page:

```text
Page 1:
  Glide Platforms - $90.0
  Garden Haven Tote - $58.0
  Sky Shimmer Sneaks - $69.0

Page 2:
  Garden Haven Tote - $58.0
  Celestial Step Platform Sneakers - $90.0
  Eloquent Satchel - $59.0
```

</details>

## Multi-turn conversations

Build conversational flows by passing message history:

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START ConversationalQuery"
  endMarker="# END ConversationalQuery"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// START ConversationalQuery"
  endMarker="// END ConversationalQuery"
  language="ts"
/>
</TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The agent uses conversation history for context:

```text
User: What's the weather like?
Assistant: The average temperature is 15°C with moderate humidity.

User: Is that good for outdoor activities?
Assistant: Yes, 15°C is comfortable for most outdoor activities.
The moderate humidity levels make it pleasant for hiking, cycling, or sports.
```

</details>

## Stream responses

Stream responses to receive answers as they are generated:

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START StreamResponse"
  endMarker="# END StreamResponse"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// START StreamResponse"
  endMarker="// END StreamResponse"
  language="ts"
/>
</TabItem>
</Tabs>

<details>
  <summary>Example output</summary>

Responses are streamed as they're generated:

```text
Searching... ⏳
Processing results... 🔍
For vintage... clothing... under $60... you might like... the Vintage...
Philosopher Midi Dress... by Echo & Stitch...
✓ Complete
```

</details>

## Override collections at query time

Override the configured collections for a specific query:

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START QueryAgentAskBasicCollectionSelection"
  endMarker="# END QueryAgentAskBasicCollectionSelection"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// START QueryAgentAskBasicCollectionSelection"
  endMarker="// END QueryAgentAskBasicCollectionSelection"
  language="ts"
/>
</TabItem>
</Tabs>

## Configure collections in detail

Specify additional collection options like target vectors, properties, tenants, and filters:

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START QueryAgentAskCollectionConfig"
  endMarker="# END QueryAgentAskCollectionConfig"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// START QueryAgentAskCollectionConfig"
  endMarker="// END QueryAgentAskCollectionConfig"
  language="ts"
/>
</TabItem>
</Tabs>

## Apply user-defined filters

Apply persistent filters that combine with agent-generated filters using logical `AND`:

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START UserDefinedFilters"
  endMarker="# END UserDefinedFilters"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// START UserDefinedFilters"
  endMarker="// END UserDefinedFilters"
  language="ts"
/>
</TabItem>
</Tabs>

<details>
  <summary>Example behavior</summary>

User-defined filters are always applied in addition to agent-generated filters:

```python
# Configuration: price < 100
# User query: "red shoes"
# Actual query: (semantic search for "red shoes") AND (price < 100) AND (color = "red")
```

</details>

## Inspect response details

Access detailed information about searches performed, aggregations, and token usage:

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# START InspectResponseExample"
  endMarker="# END InspectResponseExample"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// START InspectResponseExample"
  endMarker="// END InspectResponseExample"
  language="ts"
/>
</TabItem>
</Tabs>

<details>
  <summary>Example output</summary>

Response inspection reveals the agent's execution details:

```text
=== Query Agent Response ===
Original Query: vintage style clothing

🔍 Final Answer Found:
For vintage-style clothing under $60, I recommend the Vintage Scholar
Turtleneck priced at $55. It features soft, stretchable fabric with
timeless pleated details, perfect for a Dark Academia-inspired look.

However, no shoes under $60 were found based on available information.

🔍 Searches Executed:
- query: 'vintage style clothing'
- filters: price < 60
- collection: 'ECommerce'

- query: 'nice shoes'
- filters: price < 60
- collection: 'ECommerce'

⚠️ Answer is Partial - Missing Information:
- No recommendations were provided for nice shoes under $60
```

</details>

## Further resources

- [Query Agent full documentation](/agents/query/usage) - Complete guide with setup and advanced features
- [Connect to Weaviate Cloud](/cloud/manage-clusters/connect)
- [Weaviate Cloud documentation](/cloud)
- [AI agents framework](/agents)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
