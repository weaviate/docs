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
import PyCode from '!!raw-loader!/docs/agents/_includes/query_agent.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/query_agent.mts';

# Weaviate Query Agent: Usage

:::caution Technical Preview

![This Weaviate Agent is in technical preview.](../_includes/agents_tech_preview_light.png#gh-light-mode-only "This Weaviate Agent is in technical preview.")
![This Weaviate Agent is in technical preview.](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "This Weaviate Agent is in technical preview.")

[Sign up here](https://events.weaviate.io/weaviate-agents) for notifications on Weaviate Agents, or visit [this page](https://weaviateagents.featurebase.app/) to see the latest updates and provide feedback.

:::

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
At this time, this Agent is available only for Python and JavaScript. Support for other languages will be added in the future.
:::

For Python, you can install the Weaviate client library with the optional `agents` extras to use Weaviate Agents. This will install the `weaviate-agents` package along with the `weaviate-client` package. For  JavaScript, you can install the `weaviate-agents` package alongside the `weaviate-client` package.

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
- Target Weaviate Cloud instance details (e.g. the `WeaviateClient` object).
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

### Async Python client

For usage example with the async Python client, see the [Async Python client section](#usage---async-python-client).

## Perform queries

Provide a natural language query to the Query Agent. The Query Agent will process the query, perform the necessary searches in Weaviate, and return the answer.

This is a synchronous operation. The Query Agent will return the answer to the user as soon as it is available.

:::tip Consider your query carefully
The Query Agent will formulate its strategy based on your query. So, aim to be unambiguous, complete, yet concise in your query as much as possible.
:::

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicQuery"
            endMarker="# END BasicQuery"
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

### Configure collections at runtime

The list of collections to be queried can be overridden at query time, as a list of names, or with further configurations:

#### Specify collection names only

This example overrides the configured Query Agent collections for this query only.

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentRunBasicCollectionSelection"
            endMarker="# END QueryAgentRunBasicCollectionSelection"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START QueryAgentRunBasicCollectionSelection"
            endMarker="// END QueryAgentRunBasicCollectionSelection"
            language="ts"
        />
    </TabItem>

</Tabs>

#### Configure collections in detail

This example overrides the configured Query Agent collections for this query only, specifying additional options where relevant, such as:
- Target vector
- Properties to view
- Target tenant

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentRunCollectionConfig"
            endMarker="# END QueryAgentRunCollectionConfig"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START QueryAgentRunCollectionConfig"
            endMarker="// END QueryAgentRunCollectionConfig"
            language="ts"
        />
    </TabItem>

</Tabs>

### Follow-up queries

The Query Agent can even handle follow-up queries, using the previous response as additional context.

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START FollowUpQuery"
            endMarker="# END FollowUpQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START FollowUpQuery"
            endMarker="// END FollowUpQuery"
            language="ts"
        />
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
            startMarker="# START BasicQuery"
            endMarker="# END BasicQuery"
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

This will print the response and a summary of the supporting information found by the Query Agent.

<details>
  <summary>Example output</summary>

```text
╭──────────────────────────────────────────────────────── 🔍 Original Query ─────────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ I like vintage clothes and and nice shoes. Recommend some of each below $60.                                                       │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────────── 📝 Final Answer ──────────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ For vintage clothes under $60, here are some great options:                                                                        │
│                                                                                                                                    │
│ 1. **Vintage Scholar Turtleneck** - $55.00: This piece from the Dark Academia collection offers comfort with a stylish pleated     │
│ detail, perfect for a scholarly wardrobe (available in black and grey).                                                            │
│ 2. **Retro Pop Glitz Blouse** - $46.00: Part of the Y2K collection, this blouse adds shimmer and features a dramatic collar for a  │
│ pop culture-inspired look (available in silver).                                                                                   │
│ 3. **Retro Glitz Halter Top** - $29.98: Embrace early 2000s glamour with this halter top, suitable for standing out with its shiny │
│ pastel fabric (available in pink and purple).                                                                                      │
│ 4. **Metallic Pastel Dream Cardigan** - $49.00: This cardigan features a metallic sheen and is perfect for a colorful, nostalgic   │
│ touch (available in blue and pink).                                                                                                │
│                                                                                                                                    │
│ For nice shoes under $60:                                                                                                          │
│                                                                                                                                    │
│ 1. **Mystic Garden Strappy Flats** - $59.00: These gold flats feature delicate vine and floral patterns, ideal for adding a touch  │
│ of magic to your outfit.                                                                                                           │
│ 2. **Garden Serenade Sandals** - $56.00: These sandals from the Cottagecore collection have ivy-green straps with cream floral     │
│ patterns, embodying a romantic countryside aesthetic.                                                                              │
│ 3. **Forest Murmur Sandals** - $59.00: With a soft green hue and gold accents, these sandals from the Fairycore collection are     │
│ both elegant and whimsical.                                                                                                        │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────── 🔭 Searches Executed 1/2 ─────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ QueryResultWithCollection(                                                                                                         │
│     queries=['vintage clothes'],                                                                                                   │
│     filters=[[IntegerPropertyFilter(property_name='price', operator=<ComparisonOperator.LESS_THAN: '<'>, value=60.0)]],            │
│     filter_operators='AND',                                                                                                        │
│     collection='Ecommerce'                                                                                                         │
│ )                                                                                                                                  │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────── 🔭 Searches Executed 2/2 ─────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ QueryResultWithCollection(                                                                                                         │
│     queries=['nice shoes'],                                                                                                        │
│     filters=[[IntegerPropertyFilter(property_name='price', operator=<ComparisonOperator.LESS_THAN: '<'>, value=60.0)]],            │
│     filter_operators='AND',                                                                                                        │
│     collection='Ecommerce'                                                                                                         │
│ )                                                                                                                                  │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ 📊 No Aggregations Run                                                                                                             │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────── 📚 Sources ────────────────────────────────────────────────────────────╮
│                                                                                                                                    │
│  - object_id='3e3fc965-0a08-4095-b538-5362404a4aab' collection='Ecommerce'                                                         │
│  - object_id='3ce04def-fe06-48bd-ba0e-aa491ba2b3c5' collection='Ecommerce'                                                         │
│  - object_id='cece6613-0ad8-44a5-9da3-a99bcbe67141' collection='Ecommerce'                                                         │
│  - object_id='1be234ae-7665-4e8c-9758-07ba87997ca1' collection='Ecommerce'                                                         │
│  - object_id='5ee7874b-e70b-4af7-b053-cce74c10e406' collection='Ecommerce'                                                         │
│  - object_id='c7dd08d3-fe8e-44c2-8f99-8271c3ba24ee' collection='Ecommerce'                                                         │
│  - object_id='5f35dc8f-18f5-4388-845d-0383927dfee0' collection='Ecommerce'                                                         │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯


   📊 Usage Statistics
┌────────────────┬──────┐
│ LLM Requests:  │ 4    │
│ Input Tokens:  │ 8621 │
│ Output Tokens: │ 504  │
│ Total Tokens:  │ 9125 │
└────────────────┴──────┘

Total Time Taken: 15.80s
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

:::caution Technical Preview

![This Weaviate Agent is in technical preview.](../_includes/agents_tech_preview_light.png#gh-light-mode-only "This Weaviate Agent is in technical preview.")
![This Weaviate Agent is in technical preview.](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "This Weaviate Agent is in technical preview.")

[Sign up here](https://events.weaviate.io/weaviate-agents) for notifications on Weaviate Agents, or visit [this page](https://weaviateagents.featurebase.app/) to see the latest updates and provide feedback.

:::

### Usage limits

import UsageLimits from "/_includes/agents/query-agent-usage-limits.mdx";

<UsageLimits />

### Custom collection descriptions

import CollectionDescriptions from "/_includes/agents/query-agent-collection-descriptions.mdx";

<CollectionDescriptions />

### Execution times

import ExecutionTimes from "/_includes/agents/query-agent-execution-times.mdx";

<ExecutionTimes />

## Questions and feedback

:::info Changelog and feedback
The official changelog for Weaviate Agents can be [found here](https://weaviateagents.featurebase.app/changelog). If you have feedback, such as feature requests, bug reports or questions, please [submit them here](https://weaviateagents.featurebase.app/), where you will be able to see the status of your feedback and vote on others' feedback.
:::

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
