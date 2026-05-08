---
title: Suggest Queries
description: "Generate suggested questions or follow up queries to explore Weaviate data."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'query agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/\_includes/code/suggest_queries.py';
import TSCode from '!!raw-loader!/docs/agents/\_includes/code/suggest_queries.mts';

# Suggest Queries Mode

<CloudOnlyBadge />

The Query Agent can suggest queries based on the data in your collections. This is useful for helping users discover what kinds of questions they can ask, or for generating example queries for a new dataset.

## Usage

The method can be called with a set of instructions and/or specifications:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SuggestQueries"
            endMarker="# END SuggestQueries"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SuggestQueries"
            endMarker="// END SuggestQueries"
            language="ts"
        />
    </TabItem>
</Tabs>

Or can be called without any additional arguments, to use the defaults.
<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START IndividualCall"
            endMarker="# END IndividualCall"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START IndividualCall"
            endMarker="// END IndividualCall"
            language="ts"
        />
    </TabItem>
</Tabs>

### Parameters

The suggest queries mode can be called with the following arguments:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">

| Parameter | Description |
| --- | --- |
| `collections` | Override the collections configured at instantiation. See [the collection configuration page](../reference/advanced_collections.md) for more details. |
| `num_queries` | The number of queries to suggest (default: `3`). |
| `instructions` | Guide the style or focus of the suggested queries. This is provided in addition to any system instructions. Useful for e.g. specifying language. |

    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">

| Parameter | Description |
| --- | --- |
| `collections` | Override the collections configured at instantiation. See [the collection configuration page](../reference/advanced_collections.md) for more details. |
| `numQueries` | The number of queries to suggest (default: `3`). |
| `instructions` | Guide the style or focus of the suggested queries. This is provided in addition to any system instructions. Useful for e.g. specifying language. |

    </TabItem>
</Tabs>

## Response

The `SuggestQueryResponse` class has the following properties:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">

| Field | Description |
| --- | --- |
| `queries` | A list of `SuggestedQuery` objects, each with a single property `query`, a suggested query that the user could run against their data. |
| `collection_count` | The number of collections that were considered when generating the suggested queries. |
| `usage` | A `ModelUnitUsage` instance providing detail on the model units used during the run. The `model_units` are effectively token usage measurements normalized by cost. |
| `total_time` | Total time taken (seconds). |

    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">

| Field | Description |
| --- | --- |
| `queries` | A list of `SuggestedQuery` objects, each with a single property `query`, a suggested query that the user could run against their data. |
| `collectionCount` | The number of collections that were considered when generating the suggested queries. |
| `usage` | A `ModelUnitUsage` object providing detail on the model units used during the run. The `modelUnits` are effectively token usage measurements normalized by cost. |
| `totalTime` | Total time taken (seconds). |

    </TabItem>
</Tabs>

## Async


<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">

In Python, the above examples use the synchronous client, but suggest queries can also be called asynchronously. This requires the `AsyncQueryAgent` class (instantiated the same way as its sync counterpart) together with an async Weaviate client.

<FilteredTextBlock
    text={PyCode}
    startMarker="# START AsyncInstantiation"
    endMarker="# END AsyncInstantiation"
    language="py"
/>

The `.suggest_queries()` method must be awaited:
<FilteredTextBlock
    text={PyCode}
    startMarker="# START AsyncSuggest"
    endMarker="# END AsyncSuggest"
    language="py"
/>
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">

In JavaScript/TypeScript, the `QueryAgent` is asynchronous by default — the examples in the previous sections already are asynchronous, and no separate async setup is needed.

</TabItem>
</Tabs>

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
