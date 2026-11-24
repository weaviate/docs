---
title: Reranking
sidebar_position: 28
description: "Search result reordering techniques using alternative models to improve search relevance and accuracy."
image: og/docs/concepts.jpg
# tags: ['basics']
---

Reranking seeks to improve search relevance by reordering the result set returned by a search with a different model.

Most rerankers compute a relevance score between the query and each data object, and return the objects sorted from the most to the least relevant. [Decision models](#decision-models) score a condition instead. Computing this score for all `(query, data_object)` pairs would typically be prohibitively slow, which is why reranking is used as a second stage after retrieving the relevant objects first.

As the reranker works on a smaller subset of data after retrieval, different, potentially more computationally expensive approaches can be used to improve search relevance.

:::info

Learn how to [set up a reranker for your collection](../manage-collections/generative-reranker-models.mdx#specify-a-reranker-model-integration) and [apply reranking to your search results](../search/rerank.md).

:::

## Reranking in Weaviate

With our reranker modules, you can conveniently perform [multi-stage searches](https://weaviate.io/blog/cross-encoders-as-reranker) without leaving Weaviate.

In other words, you can perform a search - for example, a vector search - and then use a reranker to re-rank the results of that search. Our reranker modules are compatible with all of vector, bm25, and hybrid searches.

### An example query with a reranker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.rerank.py';

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START nearTextRerank Python"
      endMarker="# END nearTextRerank Python"
      language="py"
    />
  </TabItem>
</Tabs>

This query retrieves 10 results from the `JeopardyQuestion` collection, using a vector search with the query "flying". It then reranks the results on the `question` property, with the rerank query "publication".

You choose which property of the collection the reranker reads. Each result comes back with the score from the reranker.

## Decision models

Most reranker models are relevance rerankers. They score how well an object answers a query. A decision model works differently. It scores whether a statement is true of the object.

With a decision model, the rerank query is a condition, a statement about the object. For example, "The customer is about to churn". The model judges whether the condition holds for each object. The rerank score is the probability that the condition holds, from 0 to 1.

Write the rerank query as a statement, not as search terms. "The review complains about the breakfast" works. "breakfast complaint" does not.

The search query and the rerank query do different jobs, so they usually differ. The search query picks the candidates. The rerank query judges them. For example, a hybrid search for "refund not received" finds support tickets about refunds. The condition "The customer is about to churn" then ranks them by how likely each customer is to leave.

Decision models can also judge images stored in a `blob` property. For example, the condition "The product has visible damage, such as a crack, chip or dent" ranks product photos. No other reranker ranks images.

Weaviate integrates with these decision models from `v1.41`:

- [TypeSafe AI](../model-providers/typesafeai/reranker.md) (`reranker-typesafeai`)
- [OpenAI](../model-providers/openai/reranker.md) (`reranker-openai`)

See [Rerank with a condition](../search/rerank.md#rerank-with-a-condition-decision-models) for an example.

## Further resources

:::info Related pages
- [API References: GraphQL - Additional properties](../api/graphql/additional-properties.md#rerank)
- [How-to search: Rerank](../search/rerank.md)
- [Cohere reranker integration](../model-providers/cohere/reranker.md)
- [Transformers reranker integration](../model-providers/transformers/reranker.md)
- [VoyageAI reranker integration](../model-providers/voyageai/reranker.md)
- [TypeSafe AI reranker integration](../model-providers/typesafeai/reranker.md)
- [OpenAI reranker integration](../model-providers/openai/reranker.md)
:::

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
