---
title: Reranking
sidebar_position: 75
image: og/docs/howto.jpg
description: "Rerank search results for improved relevance with code examples in Python, TypeScript, Go, Java, and C#."
# tags: ['how to', 'rank']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.rerank.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/search.rerank-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.rerank.ts';
import SimilarityPyCode from '!!raw-loader!/_includes/code/howto/search.similarity.py';
import SimilarityPyCodeV3 from '!!raw-loader!/_includes/code/howto/search.similarity-v3.py';
import SimilarityTSCode from '!!raw-loader!/_includes/code/howto/search.similarity.ts';
import GoV5Code from '!!raw-loader!/_includes/code/howto/go/docs/mainpkg/search-rerank_test.go';
import GoV6Code from '!!raw-loader!/_includes/code/go-v6/search_rerank_test.go';
import GoV6SimilarityCode from '!!raw-loader!/_includes/code/go-v6/search_test.go';
import DecisionPyCode from '!!raw-loader!/docs/weaviate/model-providers/_includes/provider.reranker.decision.py';
import BoostNote from '/_includes/feature-notes/boost.mdx';

Reranking modules reorder the search result set according to a different set of criteria or a different (e.g. more expensive) algorithm.

<details>
  <summary>
    Additional information
  </summary>

**Configure reranking**

To rerank search results, enable a reranker [model integration](../model-providers/index.md) for your collection.

A collection uses one reranker, set in the collection configuration.

</details>

import QueryAgentTip from '/_includes/query-agent-tip.mdx';

<QueryAgentTip/>

## Rerank query requirements

Starting in `v1.41`, Weaviate checks the rerank request before the search runs. A request that fails a check returns an error, whether or not the search would return objects. These checks apply to client (gRPC) queries, for every reranker.

- **The rerank query is required.** A missing or blank rerank query fails with `rerank: query is required`. Before `v1.41`, Weaviate sent an empty query to the reranker.
- **The rerank property must be a `text` or `blob` property.** Any other type fails before the search. Name a top-level property of the collection. For example: `rerank: property "tags" of collection "Tickets" is of type text[]; a rerank reads a text or blob property`.
- **Only decision-model rerankers rank images.** The [TypeSafe AI](../model-providers/typesafeai/reranker.md) and [OpenAI](../model-providers/openai/reranker.md) rerankers judge images in a `blob` property. Other rerankers send the base64 string to the provider as text, so don't use them on a `blob` property.

When two results get the same rerank score, they stay in the order the search returned them.

### Pagination

A reranker reorders only the objects of the requested page. The next page is the next set of search results, sorted on its own. So an object can appear on two pages, or on none.

## Named vectors

Any vector-based search on collections with [named vectors](../config-refs/collections.mdx#named-vectors) configured must include a `target` vector name in the query. This allows Weaviate to find the correct vector to compare with the query vector.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={SimilarityPyCode}
      startMarker="# NamedVectorNearTextPython"
      endMarker="# END NamedVectorNearTextPython"
      language="python"
    />
  </TabItem>


  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={SimilarityTSCode}
      startMarker="// NamedVectorNearText"
      endMarker="// END NamedVectorNearText"
      language="ts"
    />
  </TabItem>


  <TabItem value="gov5" label="Go (v5)">
    <FilteredTextBlock
      text={GoV5Code}
      startMarker="// START NamedVectorNearText"
      endMarker="// END NamedVectorNearText"
      language="gonew"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoV6SimilarityCode}
      startMarker="// START NamedVectorNearText"
      endMarker="// END NamedVectorNearText"
      language="go6"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={SimilarityPyCodeV3}
      startMarker="# NamedVectorNearTextGraphql"
      endMarker="# END NamedVectorNearTextGraphql"
      language="graphql"
    />
  </TabItem>
</Tabs>

## Rerank vector search results

To rerank the results of a vector search, configure the object properties to sort on.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START nearTextRerank Python"
      endMarker="# END nearTextRerank Python"
      language="py"
    />
  </TabItem>


  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RerankNearText"
      endMarker="// END RerankNearText"
      language="ts"
    />
  </TabItem>


  <TabItem value="gov5" label="Go (v5)">
    <FilteredTextBlock
      text={GoV5Code}
      startMarker="// START RerankNearText"
      endMarker="// END RerankNearText"
      language="gonew"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoV6Code}
      startMarker="// START RerankVectorResults"
      endMarker="// END RerankVectorResults"
      language="go6"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START nearTextRerank GraphQL"
      endMarker="# END nearTextRerank GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The response should look like this:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# START Expected nearTextRerank results"
    endMarker="# END Expected nearTextRerank results"
    language="json"
  />

</details>

## Rerank keyword search results

To rerank the results of a keyword search, configure the object properties to sort on.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START bm25Rerank Python"
      endMarker="# END bm25Rerank Python"
      language="py"
    />
  </TabItem>


  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START bm25Rerank"
      endMarker="// END bm25Rerank"
      language="ts"
    />
  </TabItem>


  <TabItem value="gov5" label="Go (v5)">
    <FilteredTextBlock
      text={GoV5Code}
      startMarker="// START bm25Rerank"
      endMarker="// END bm25Rerank"
      language="gonew"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoV6Code}
      startMarker="// START RerankKeywordResults"
      endMarker="// END RerankKeywordResults"
      language="go6"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START bm25Rerank GraphQL"
      endMarker="# END bm25Rerank GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The response should look like this:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# START Expected bm25Rerank results"
    endMarker="# END Expected bm25Rerank results"
    language="json"
  />

</details>

## Rerank with a condition (decision models)

A [decision model](../concepts/reranking.md#decision-models) judges a condition instead of scoring relevance. In this example, a hybrid search finds tickets about refunds. The decision model then ranks them by how likely the customer is to churn.

:::info Python client release
The Python example in this section needs the next Python client release. See the [Python client releases](https://github.com/weaviate/weaviate-python-client/releases).
:::

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={DecisionPyCode}
      startMarker="# START RerankerDecisionQuery"
      endMarker="# END RerankerDecisionQuery"
      language="py"
    />
  </TabItem>
</Tabs>

The collection must use a decision-model reranker. See the [TypeSafe AI](../model-providers/typesafeai/reranker.md) and [OpenAI](../model-providers/openai/reranker.md) reranker pages for setup, images, limits and errors.

## Soft-rank with Boost

<BoostNote/>

For lightweight result reordering based on filters, property values, or time / numeric decay (without calling an external rerank model), use [Boost](./boost.md). Rerank and Boost can be used independently. Pick rerank when you need a smarter model to re-rank the top-N, and Boost when you want to bias by simple signals already on the objects.

## Related pages

- [Connect to Weaviate](/weaviate/connections/index.mdx)
- [API References: GraphQL - Additional properties](../api/graphql/additional-properties.md#rerank)
- [API References: GraphQL - Sorting](/weaviate/api/graphql/additional-operators#sorting-api)
- [Concepts: Reranking](../concepts/reranking.md)
- [Model providers integrations](../model-providers/index.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
