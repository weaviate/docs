---
title: Usage
sidebar_position: 30
description: "Technical documentation and usage examples for implementing the Query Agent."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'query agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/\_includes/query_agent.py';
import TSCode from '!!raw-loader!/docs/agents/\_includes/query_agent.mts';

# Weaviate Query Agent: Usage

The Weaviate Query Agent is a pre-built agentic service designed to answer natural language queries based on the data stored in Weaviate Cloud.

The user simply provides a prompt/question in natural language, and the Query Agent takes care of all intervening steps to provide an answer.

![Weaviate Query Agent from a user perspective](../_includes/query_agent_usage_light.png#gh-light-mode-only "Weaviate Query Agent from a user perspective")
![Weaviate Query Agent from a user perspective](../_includes/query_agent_usage_dark.png#gh-dark-mode-only "Weaviate Query Agent from a user perspective")

This page describes how to use the Query Agent to answer natural language queries, using your data stored in Weaviate Cloud.

## Prerequisites

### Weaviate instance

This Agent is available exclusively for use with a Weaviate Cloud instance. Refer to the [Weaviate Cloud documentation](/cloud/index.mdx) for more information on how to set up a Weaviate Cloud instance.

You can try this Weaviate Agent with a free Sandbox instance on [Weaviate Cloud](https://console.weaviate.cloud/).

### Client library

:::note Supported languages
At this time, this Agent is available only for Python and TypeScript/JavaScript. Support for other languages will be added in the future.
:::

For Python, you can install the Weaviate client library with the optional `agents` extras to use Weaviate Agents. This will install the `weaviate-agents` package along with the `weaviate-client` package. For TypeScript/JavaScript, you can install the `weaviate-agents` package alongside the `weaviate-client` package.

Install the client library using the following command:

<Tabs groupId="languages">
<TabItem value="py_agents" label="Python">

```shell
pip install -U weaviate-client[agents]
```

#### Troubleshooting: Force `pip` to install the latest version

For existing installations, even `pip install -U "weaviate-client[agents]"` may not upgrade `weaviate-agents` to the [latest version](https://pypi.org/project/weaviate-agents/). If this occurs, additionally try to explicitly upgrade the `weaviate-agents` package:

```shell
pip install -U weaviate-agents
```

Or install a [specific version](https://github.com/weaviate/weaviate-agents-python-client/tags):

```shell
pip install -U weaviate-agents==||site.weaviate_agents_version||
```

</TabItem>
<TabItem value="ts_agents" label="JavaScript/TypeScript">

```shell
npm install weaviate-agents@latest
```

</TabItem>

</Tabs>

## Instantiate the Query Agent

### Basic instantiation

Provide:

- Target [Weaviate Cloud instance details](/cloud/manage-clusters/connect.mdx) (e.g. the `WeaviateClient` object).
- A default list of the collections to be queried

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START InstantiateQueryAgent"
            endMarker="# END InstantiateQueryAgent"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START InstantiateQueryAgent"
            endMarker="// END InstantiateQueryAgent"
            language="ts"
        />
    </TabItem>

</Tabs>

### Configure collections

The list of collections to be queried are further configurable with:

- Tenant names (required for a multi-tenant collection)
- Target vector(s) of the collection to query (optional)
- List of property names for the agent to use (optional)
- [Additional filters](#user-defined-filters) to always apply on top of agent-generated ones (optional)

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentCollectionConfiguration"
            endMarker="# END QueryAgentCollectionConfiguration"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START QueryAgentCollectionConfiguration"
            endMarker="// END QueryAgentCollectionConfiguration"
            language="ts"
        />
    </TabItem>

</Tabs>

:::info What does the Query Agent have access to?

The Query Agent derives its access credentials from the Weaviate client object passed to it. This can be further restricted by the collection names provided to the Query Agent.

For example, if the associated Weaviate credentials' user has access to only a subset of collections, the Query Agent will only be able to access those collections.

:::

### Additional options

The Query Agent can be instantiated with additional options, such as:

- `system_prompt`: A custom system prompt to replace the default system prompt provided by the Weaviate team (`systemPrompt` for JavaScript).
- `timeout`: The maximum time the Query Agent will spend on a single query, in seconds (server-side default: 60).

#### Custom system prompt

You can provide a custom system prompt to guide the Query Agent's behavior:

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SystemPromptExample"
            endMarker="# END SystemPromptExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    </TabItem>

</Tabs>

### User-defined filters

You can apply persistent filters that will always be combined with any agent-generated filters using logical `AND` operations.

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START UserDefinedFilters"
            endMarker="# END UserDefinedFilters"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    </TabItem>

</Tabs>

### Async Python client

For usage example with the async Python client, see the [Async Python client section](#usage---async-python-client).

## Querying

The Query Agent supports two query types:

- [**`Search`**](#search)
- [**`Ask`**](#ask)

### `Search`

`Search` Weaviate with the Query Agent using natural langauge. The Query Agent will process the question, perform the necessary searches in Weaviate, and return the relevant objects.

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicSearchQuery"
            endMarker="# END BasicSearchQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicQuery"
            endMarker="// END BasicQuery"
            language="ts"
        />
    </TabItem>

</Tabs>

#### `Search` response structure

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SearchModeResponseStructure"
            endMarker="# END SearchModeResponseStructure"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    </TabItem>

</Tabs>

<details>
  <summary>Example output</summary>

```
Original query: winter boots for under $100
Total time: 4.695224046707153
Usage statistics: requests=2 request_tokens=143 response_tokens=9 total_tokens=152 details=None
Search performed: queries=['winter boots'] filters=[[IntegerPropertyFilter(property_name='price', operator=<ComparisonOperator.LESS_THAN: '<'>, value=100.0)]] filter_operators='AND' collection='ECommerce'
Properties: {'name': 'Bramble Berry Loafers', 'description': 'Embrace your love for the countryside with our soft, hand-stitched loafers, perfect for quiet walks through the garden. Crafted with eco-friendly dyed soft pink leather and adorned with a subtle leaf embossing, these shoes are a testament to the beauty of understated simplicity.', 'price': 75.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.4921875, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
Properties: {'name': 'Glitter Bootcut Fantasy', 'description': "Step back into the early 2000s with these dazzling silver bootcut jeans. Embracing the era's optimism, these bottoms offer a comfortable fit with a touch of stretch, perfect for dancing the night away.", 'price': 69.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.47265625, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
Properties: {'name': 'Celestial Step Platform Sneakers', 'description': 'Stride into the past with these baby blue platforms, boasting a dreamy sky hue and cushy soles for day-to-night comfort. Perfect for adding a touch of whimsy to any outfit.', 'price': 90.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.48828125, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
Properties: {'name': 'Garden Bliss Heels', 'description': 'Embrace the simplicity of countryside elegance with our soft lavender heels, intricately designed with delicate floral embroidery. Perfect for occasions that call for a touch of whimsy and comfort.', 'price': 90.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.45703125, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
Properties: {'name': 'Garden Stroll Loafers', 'description': 'Embrace the essence of leisurely countryside walks with our soft, leather loafers. Designed for the natural wanderer, these shoes feature delicate, hand-stitched floral motifs set against a soft, cream background, making every step a blend of comfort and timeless elegance.', 'price': 90.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.451171875, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
```

</details>

#### `Search` with pagination

`Search` supports pagination to handle large result sets efficiently:

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SearchPagination"
            endMarker="# END SearchPagination"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    </TabItem>

</Tabs>

<details>
  <summary>Example output</summary>

```
Page 1:
  Glide Platforms - $90.0
  Garden Haven Tote - $58.0
  Sky Shimmer Sneaks - $69.0

Page 2:
  Garden Haven Tote - $58.0
  Celestial Step Platform Sneakers - $90.0
  Eloquent Satchel - $59.0

Page 3:
  Garden Haven Tote - $58.0
  Celestial Step Platform Sneakers - $90.0
  Eloquent Satchel - $59.0
```

</details>

### `Ask`

`Ask` the Query Agent a question using natural language. The Query Agent will process the question, perform the necessary searches in Weaviate, and return the answer.

:::tip Consider your query carefully
The Query Agent will formulate its strategy based on your query. So, aim to be unambiguous, complete, yet concise in your query as much as possible.
:::

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicAskQuery"
            endMarker="# END BasicAskQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    </TabItem>

</Tabs>

### Configure collections at runtime

The list of collections to be queried can be overridden at query time, as a list of names, or with further configurations:

#### Specify collection names only

This example overrides the configured Query Agent collections for this query only.

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentAskBasicCollectionSelection"
            endMarker="# END QueryAgentAskBasicCollectionSelection"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    </TabItem>

</Tabs>

#### Configure collections in detail

This example overrides the configured Query Agent collections for this query only, specifying additional options where relevant, such as:

- Target vector
- Properties to view
- Target tenant
- Additional filters

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentAskCollectionConfig"
            endMarker="# END QueryAgentAskCollectionConfig"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    </TabItem>

</Tabs>

### Conversational queries

The Query Agent supports multi-turn conversations by passing a list of `ChatMessage` objects. This works with both `Search` and `Ask` query types.

When building conversations with `ChatMessage` there are two available roles for messages:

- **`user`** - Represents messages from the human user asking questions or providing context
- **`assistant`** - Represents the Query Agent's responses or any AI assistant responses in the conversation history

The conversation history helps the Query Agent understand context from previous exchanges, enabling more coherent multi-turn dialogues. Always alternate between user and assistant roles to maintain a proper conversation flow.

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START ConversationalQuery"
            endMarker="# END ConversationalQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    </TabItem>

</Tabs>

## Stream responses

The Query Agent can also stream responses, allowing you to receive the answer as it is being generated.

A streaming response can be requested with the following optional parameters:

- `include_progress`: If set to `True`, the Query Agent will stream a progress update as it processes the query.
- `include_final_state`: If set to `True`, the Query Agent will stream the final answer as it is generated, rather than waiting for the entire answer to be generated before returning it.

If both `include_progress` and `include_final_state` are set to `False`, the Query Agent will only include the answer tokens as they are generated, without any progress updates or final state.

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START StreamResponse"
            endMarker="# END StreamResponse"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START StreamResponse"
            endMarker="// END StreamResponse"
            language="ts"
        />
    </TabItem>
</Tabs>

## Inspect responses

The response from the Query Agent will contain the final answer, as well as additional supporting information.

The supporting information may include searches or aggregations carried out, what information may have been missing, and how many LLM tokens were used by the Agent.

### Helper function

Try the provided helper functions (e.g. `.display()` method) to display the response in a readable format.

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicAskQuery"
            endMarker="# END BasicAskQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    </TabItem>

</Tabs>

This will print the response and a summary of the supporting information found by the Query Agent.

<details>
  <summary>Example output</summary>

```text
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────── 🔍 Original Query ────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ I like vintage clothes and nice shoes. Recommend some of each below $60.                                                                                                                                                                          │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────── 📝 Final Answer ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ For vintage clothing under $60, you might like the Vintage Philosopher Midi Dress by Echo & Stitch. It features deep green velvet fabric with antique gold button details, tailored fit, and pleated skirt, perfect for a classic vintage look.   │
│                                                                                                                                                                                                                                                   │
│ For nice shoes under $60, consider the Glide Platforms by Vivid Verse. These are high-shine pink platform sneakers with cushioned soles, inspired by early 2000s playful glamour, offering both style and comfort.                                │
│                                                                                                                                                                                                                                                   │
│ Both options combine vintage or retro aesthetics with an affordable price point under $60.                                                                                                                                                        │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────── 🔭 Searches Executed 1/2 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ QueryResultWithCollection(queries=['vintage clothing'], filters=[[]], filter_operators='AND', collection='ECommerce')                                                                                                                             │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────── 🔭 Searches Executed 2/2 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ QueryResultWithCollection(queries=['nice shoes'], filters=[[]], filter_operators='AND', collection='ECommerce')                                                                                                                                   │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ 📊 No Aggregations Run                                                                                                                                                                                                                            │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────────── 📚 Sources ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│  - object_id='a7aa8f8a-f02f-4c72-93a3-38bcbd8d5581' collection='ECommerce'                                                                                                                                                                        │
│  - object_id='ff5ecd6e-8cb9-47a0-bc1c-2793d0172984' collection='ECommerce'                                                                                                                                                                        │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯


  📊 Usage Statistics
┌────────────────┬─────┐
│ LLM Requests:  │ 5   │
│ Input Tokens:  │ 288 │
│ Output Tokens: │ 17  │
│ Total Tokens:  │ 305 │
└────────────────┴─────┘

Total Time Taken: 7.58s
```

</details>

### Inspection example

This example outputs:

- The original user query
- The answer provided by the Query Agent
- Searches & aggregations (if any) conducted by the Query Agent
- Any missing information

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START InspectResponseExample"
            endMarker="# END InspectResponseExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START InspectResponseExample"
            endMarker="// END InspectResponseExample"
            language="ts"
        />
    </TabItem>

</Tabs>

## Usage - Async Python client

If you are using the async Python Weaviate client, the instantiation pattern remains similar. The difference is use of the `AsyncQueryAgent` class instead of the `QueryAgent` class.

The resulting async pattern works as shown below:

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START UsageAsyncQueryAgent"
            endMarker="# END UsageAsyncQueryAgent"
            language="py"
        />
    </TabItem>
</Tabs>

### Streaming

The async Query Agent can also stream responses, allowing you to receive the answer as it is being generated.

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START StreamAsyncResponse"
            endMarker="# END StreamAsyncResponse"
            language="py"
        />
    </TabItem>
</Tabs>

## Limitations & Troubleshooting

### Usage limits

import UsageLimits from "/\_includes/agents/query-agent-usage-limits.mdx";

<UsageLimits />

### Custom collection descriptions

import CollectionDescriptions from "/\_includes/agents/query-agent-collection-descriptions.mdx";

<CollectionDescriptions />

### Execution times

import ExecutionTimes from "/\_includes/agents/query-agent-execution-times.mdx";

<ExecutionTimes />

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
