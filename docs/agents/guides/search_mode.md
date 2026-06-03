---
title: Search Mode
description: "Use Search Mode to retrieve raw results from Weaviate without generating an answer."
image: og/docs/agents.jpg
# tags: ['agents', 'query-agent', 'modes']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/code/search_mode.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/code/search_mode.mts';

<CloudOnlyBadge />

Search Mode transforms your query into actionable searches and returns the matching Weaviate objects directly — without generating an LLM-authored answer.

For example, you could ask:

> "Find me some vintage shoes under $70"

And the agent will perform semantic search for `vintage shoes`, apply a filter for `price < 70`, and return the matching objects from your collections, ready for you to render or post-process.

For more details, see the page for [the Python client](https://weaviate-python-client.readthedocs.io/en/stable/weaviate-agents-python-client/docs/weaviate_agents.query.html#weaviate_agents.query.QueryAgent.search) or [the Typescript Client](https://weaviate.github.io/agents-typescript-client/classes/QueryAgent.html#search).

## Usage

Like all features of the Query Agent, it requires instantiation of the `QueryAgent` class, which is connected to your Weaviate `client`. [See the class instantiation page for more detail](../reference/instantiation.md).


Note, locally running Weaviate instances do not support the Query Agent.


<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicSearchMode"
            endMarker="# END BasicSearchMode"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicSearchMode"
            endMarker="// END BasicSearchMode"
            language="ts"
        />
    </TabItem>
</Tabs>

Make sure to include your API keys in your environment, and specify whichever collection you want to search over.

:::note Async
In Python, the Query Agent supports both synchronous and asynchronous usage. The Python examples on this page use the synchronous client, but can be easily replaced with the async equivalents — see the [async section](#async) for details. In JavaScript/TypeScript, all calls are asynchronous by default and use `await`.
:::

### Parameters

The `.search()` method accepts several arguments:

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">
| Parameter | Type | Description |
| --- | --- | --- |
| `query` | `str \| list[ChatMessage]` | The user query you want the agent to search with. This can be a simple string (`"Find me some vintage shoes under $70"`) or a list of chat messages (for conversational context). [See the page on multi-turn conversations for more detail](../reference/multi_turn_conversations.md). |
| `collections` | `list[str \| QueryAgentCollectionConfig] \| None` | The name(s) of the collections to search. You can pass one or many collection names as a list of strings (e.g., `["ECommerce", "BookSales"]`), or provide collection configuration objects for more control. If specified in the `ask` method, it will overwrite those defined in the instantiation of `QueryAgent`. [See the page on collection configuration for more detail](../reference/advanced_collections.md). |
| `limit` | `int` | The maximum number of results returned in this page of results. Defaults to `20`. Use [`.next()`](#pagination) to fetch additional pages. |
| `filtering` | `Literal["recall", "precision"]` | Either `"recall"` or `"precision"` to control filter generation. `"recall"` favors more results across filter interpretations; `"precision"` favors strict intent match. See [Customized filtering](#customized-filtering) below. |
| `diversity_weight` | `float \| None` | A value between `0.0` and `1.0` that biases the result ranking towards diversity using Maximal Marginal Relevance (MMR). See [Diversity ranking](#diversity-ranking) below. |

</TabItem>
<TabItem value="ts_agents" label="JavaScript/TypeScript">
| Parameter | Type | Description |
| --- | --- | --- |
| `query` | `string \| ChatMessage[]` | The user query you want the agent to search with. This can be a simple string (`"Find me some vintage shoes under $70"`) or a list of chat messages (for conversational context). [See the page on multi-turn conversations for more detail](../reference/multi_turn_conversations.md). |
| `collections` | `(string \| QueryAgentCollectionConfig)[]` | The name(s) of the collections to search. You can pass one or many collection names as a list of strings (e.g., `["ECommerce", "BookSales"]`), or provide collection configuration objects for more control. If specified in the `ask` method, it will overwrite those defined in the instantiation of `QueryAgent`. [See the page on collection configuration for more detail](../reference/advanced_collections.md). |
| `limit` | `number` | The maximum number of results returned in this page of results. Defaults to `20`. Use [`.next()`](#pagination) to fetch additional pages. |
| `filtering` | `"recall" \| "precision"` | Either `"recall"` or `"precision"` to control filter generation. `"recall"` favors more results across filter interpretations; `"precision"` favors strict intent match. See [Customized filtering](#customized-filtering) below. |
| `diversityWeight` | `number` | A value between `0.0` and `1.0` that biases the result ranking towards diversity using Maximal Marginal Relevance (MMR). See [Diversity ranking](#diversity-ranking) below. |

</TabItem>
</Tabs>

For more advanced searches, you can also specify _additional filters_ within the collection configuration. [See the page on additional filters for more detail](../reference/additional_filters.md).

### Customized filtering

Search Mode uses query rewriting to transform your original query into one or multiple Weaviate queries, each with either a search query, metadata filters, or both. The `filtering` parameter controls how many Weaviate queries are generated.

- **`"recall"`** (default): Generates multiple Weaviate queries spanning different filters and interpretations of the user query. You should use these when you prefer to get results, even if they don't match every criteria in your query.

- **`"precision"`**: Generates a single Weaviate query targeting the most likely interpretation of the user query. You should use this when you want the results to follow your query intent closely, even if that means potentially receiving no results.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START FilteringExample"
            endMarker="# END FilteringExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START FilteringExample"
            endMarker="// END FilteringExample"
            language="ts"
        />
    </TabItem>

</Tabs>

### Diversity ranking

`Search` supports adding diversity weighting to result rankings using Maximal Marginal Relevance (MMR). This is enabled by passing a `diversity_weight` parameter in the range of `0.0` to `1.0` — higher values favor more varied results over the most relevant ones.

To use diversity ranking with target vectors, set the single target vector you want to use in the Query Agent's constructor. Diversity ranking is not yet supported with collections using multi-vector embeddings, and will only work across multiple collections if they share the same embedding model.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START DiversityRanking"
            endMarker="# END DiversityRanking"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START DiversityRanking"
            endMarker="// END DiversityRanking"
            language="ts"
        />
    </TabItem>
</Tabs>

## Response
The Search Mode response has the following properties:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">

| Field | Type | Description |
| --- | --- | --- |
| `searches` | `list[QueryResultWithCollectionNormalized]` | A list of searches the agent carried out. Each contains the search query, filters, and the collection the search was run against. |
| `usage` | `ModelUnitUsage` | A `ModelUnitUsage` instance providing detail on the model units used during the run. The `model_units` are effectively token usage measurements normalized by cost. |
| `total_time` | `float` | Total time taken (seconds). |
| `search_results` | `QueryReturn` | A `QueryReturn` object whose `.objects` field is the list of matching Weaviate objects, each with `properties` and `metadata` (including the relevance `score`). |
| `next(limit, offset)` | `SearchModeResponse` | A method that returns the next page of results, reusing the same underlying searches for consistency. See [Pagination](#pagination) below. |

[See the client documentation for more detail.](https://weaviate-python-client.readthedocs.io/en/latest/weaviate-agents-python-client/docs/weaviate_agents.classes.html#weaviate_agents.classes.SearchModeResponse)
</TabItem>

<TabItem value="ts_agents" label="JavaScript/TypeScript">
    <FilteredTextBlock
        text={TSCode}
        startMarker="// START ImportSearchResponse"
        endMarker="// END ImportSearchResponse"
        language="ts"
    />

| Field | Type | Description |
| --- | --- | --- |
| `searches` | `Search[]` | A list of searches the agent carried out. Each contains the search query, filters, and the collection the search was run against. |
| `usage` | `ModelUnitUsage` | A `ModelUnitUsage` object providing detail on the model units used during the run. The `modelUnits` are effectively token usage measurements normalized by cost. |
| `totalTime` | `number` | Total time taken (seconds). |
| `searchResults` | `WeaviateReturnWithCollection` | A `WeaviateReturnWithCollection` object whose `.objects` field is the list of matching Weaviate objects, each with `properties` and `metadata` (including the relevance `score`). |
| `next({ limit, offset })` | `Promise<SearchModeResponse>` | A method that returns the next page of results, reusing the same underlying searches for consistency. See [Pagination](#pagination) below. |

[See the client documentation for more detail.](https://weaviate.github.io/agents-typescript-client/types/SearchModeResponse.html)

</TabItem>

</Tabs>

:::note Result scores
The `search_results` / `searchResults` field reuses Weaviate's native `QueryReturn` / `WeaviateReturnWithCollection` type, so results have the same shape as a standard Weaviate query. However, the `score` in each object's metadata is replaced with Search Mode's own ranking score rather than the original Weaviate search score.
:::


### Pagination

Search returns results one page at a time. To fetch additional pages, call `.next()` on the previous response — the underlying searches are reused so results stay consistent across pages.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SearchPagination"
            endMarker="# END SearchPagination"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SearchPagination"
            endMarker="// END SearchPagination"
            language="ts"
        />
    </TabItem>
</Tabs>

## Async


<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">

In Python, the above examples use the synchronous client, but Search Mode can also be called asynchronously. This requires the `AsyncQueryAgent` class (instantiated the same way as its sync counterpart) together with an async Weaviate client.

<FilteredTextBlock
    text={PyCode}
    startMarker="# START AsyncInstantiation"
    endMarker="# END AsyncInstantiation"
    language="py"
/>

The `.search()` method must be awaited:
<FilteredTextBlock
    text={PyCode}
    startMarker="# START AsyncSearch"
    endMarker="# END AsyncSearch"
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
