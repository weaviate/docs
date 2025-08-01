---
title: Reranking
sidebar_position: 28
description: "Search result reordering techniques using alternative models to improve search relevance and accuracy."
image: og/docs/concepts.jpg
# tags: ['basics']
---

Reranking seeks to improve search relevance by reordering the result set returned by a search with a different model.

Reranking computes a relevance score between the query and each data object, and returns the list of objects sorted from the most to the least relevant. Computing this score for all `(query, data_object)` pairs would typically be prohibitively slow, which is why reranking is used as a second stage after retrieving the relevant objects first.

As the reranker works on a smaller subset of data after retrieval, different, potentially more computationally expensive approaches can be used to improve search relevance.

:::info

Learn how to [set up a reranker for your collection](../manage-collections/generative-reranker-models.mdx#specify-a-reranker-model-integration) and [apply reranking to your search results](../search/rerank.md).

:::

## Reranking in Weaviate

With our reranker modules, you can conveniently perform [multi-stage searches](https://weaviate.io/blog/cross-encoders-as-reranker) without leaving Weaviate.

In other words, you can perform a search - for example, a vector search - and then use a reranker to re-rank the results of that search. Our reranker modules are compatible with all of vector, bm25, and hybrid searches.

### An example GraphQL query with a reranker

You can use reranking in a GraphQL query as follows:

```graphql
{
  Get {
    JeopardyQuestion(
      nearText: {
        concepts: "flying"
      }
      limit: 10
    ) {
      answer
      question
      _additional {
        distance
        rerank(
          property: "answer"
          query: "floating"
        ) {
          score
        }
      }
    }
  }
}
```

This query retrieves 10 results from the `JeopardyQuestion` class, using a hybrid search with the query “flying”. It then re-ranks the results using the `answer` property, and the query “floating”.

You can specify which `property` of the `JeopardyQuestion` class you want to pass to the reranker. Note that here, the returned `score` will include the score from the reranker.

## Further resources

:::info Related pages
- [API References: GraphQL - Additional properties](../api/graphql/additional-properties.md#rerank)
- [How-to search: Rerank](../search/rerank.md)
- [Cohere reranker integration](../model-providers/cohere/reranker.md)
- [Transformers reranker integration](../model-providers/transformers/reranker.md)
- [VoyageAI reranker integration](../model-providers/voyageai/reranker.md)
:::

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
