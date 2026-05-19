---
title: Class Instantiation
sidebar_position: 10
description: "Query Agent class instantiation details."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started']
---


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/code/instantiation.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/code/instantiation.mts';

## Basic Instantiation

The Query Agent requires only a target [Weaviate cloud instance](/cloud/manage-clusters/connect.mdx) to be initialised. First, set up a Weaviate client:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START WeaviateSetup"
            endMarker="# END WeaviateSetup"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START WeaviateSetup"
            endMarker="// END WeaviateSetup"
            language="ts"
        />
    </TabItem>
</Tabs>

Then pass that client to the Query Agent, and all Weaviate calls via agents will be routed through it.

<Tabs className="code" groupId="languages">
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

:::note Async
In Python, to instantiate the async Query Agent (`AsyncQueryAgent`), you must also pass an async Weaviate Client via `weaviate.use_async_with_weaviate_cloud`. In JavaScript/TypeScript, the Query Agent is async by default.
:::

## Additional Configuration

### Parameters

The `QueryAgent` constructor accepts the following arguments:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">

| Parameter | Type | Description |
| --- | --- | --- |
| `client` | `WeaviateClient` | Required. The Weaviate client connected to a Weaviate Cloud cluster. |
| `collections` | `list[str \| QueryAgentCollectionConfig]` | Optional. The collections to query. Overridden if passed in the `run` method. |
| `system_prompt` | `str` | Optional. Prompt to provide extra instructions to the agents, as well as define the tone, format, and style of the agent's final response. See [the system prompt page](./system_prompt.md) for more detail. |
| `timeout` | `int` | Optional. The timeout for the request. Defaults to 60 seconds. |

    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">

The first argument is the Weaviate client. All other options are passed in a `QueryAgentOptions` object as the second argument.

| Parameter | Type | Description |
| --- | --- | --- |
| `client` | `WeaviateClient` | Required. The Weaviate client connected to a Weaviate Cloud cluster. |
| `collections` | `(string \| QueryAgentCollectionConfig)[]` | Optional. The collections to query. Overridden if passed to the method call. |
| `systemPrompt` | `string` | Optional. Prompt to provide extra instructions to the agents, as well as define the tone, format, and style of the agent's final response. See [the system prompt page](./system_prompt.md) for more detail. |

    </TabItem>
</Tabs>

### Collections

You can define which collections are available either
* at the instantiation of the Query Agent base class,
    <Tabs className="code" groupId="languages">
        <TabItem value="py_agents" label="Python">
            <FilteredTextBlock
                text={PyCode}
                startMarker="# START InstantiateWithCollections"
                endMarker="# END InstantiateWithCollections"
                language="py"
            />
        </TabItem>
        <TabItem value="ts_agents" label="JavaScript/TypeScript">
            <FilteredTextBlock
                text={TSCode}
                startMarker="// START InstantiateWithCollections"
                endMarker="// END InstantiateWithCollections"
                language="ts"
            />
        </TabItem>
    </Tabs>
* or at runtime of the Query Agent's methods, either ask mode or search mode.
    <Tabs className="code" groupId="languages">
        <TabItem value="py_agents" label="Python">
            <FilteredTextBlock
                text={PyCode}
                startMarker="# START InstantiateWithoutCollections"
                endMarker="# END InstantiateWithoutCollections"
                language="py"
            />
        </TabItem>
        <TabItem value="ts_agents" label="JavaScript/TypeScript">
            <FilteredTextBlock
                text={TSCode}
                startMarker="// START InstantiateWithoutCollections"
                endMarker="// END InstantiateWithoutCollections"
                language="ts"
            />
        </TabItem>
    </Tabs>

If you provide both, then the collections specified at runtime will override those specified in the base class. See [the page on collection configuration](./advanced_collections.md) for more detail.


## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
