---
title: Multiple vector embeddings
description: "Multiple named vector embedding configuration for complex data representations using multiple vector spaces."
image: og/docs/configuration.jpg
# tags: ['configuration', 'vector index']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';

[comment]: # ( This section is duplicated, with a link to this page, in: multi-vector-support dot mdx )

Collections can have multiple named vectors.

The vectors in a collection can have their own configurations. Each vector space can set its own index, its own compression algorithm, and its own vectorizer. This means you can use different vectorization models, and apply different distance metrics, to the same object.

To work with named vectors, adjust your queries to specify a target vector for [vector search](/weaviate/search/similarity#named-vectors) or [hybrid search](/weaviate/search/hybrid#named-vectors) queries.

## Syntax

Single vector collections are valid and continue to use the original collection syntax. However, if you configure multiple vector embeddings, you must use the new, named vector syntax to query your collections.

### Collection definition

Use the collection definition to [configure the vector spaces](../../manage-collections/vector-config.mdx#define-named-vectors) for each data object.

:::info Adding named vectors to existing collections
Currently, it is only possible to [add new named vectors](../../manage-collections/vector-config.mdx#add-new-named-vectors) to collections that were initially configured to use named vectors. 
:::

### Query a named vector

To do a vector search on a collection with named vectors, specify the vector space to search.

Use named vectors with [vector similarity searches](/weaviate/search/similarity#named-vectors) (`near_text`, `near_object`, `near_vector`, `near_image`) and [hybrid search](/weaviate/search/hybrid#named-vectors).

Named vector collections support hybrid search, but only for one vector at a time.

[Keyword search](/weaviate/search/bm25) syntax does not change if a collection has named vectors.

### Query multiple named vectors

:::info Added in `v1.26`
:::

Where multiple named vectors are defined in a collection, you can query them in a single search. This is useful for comparing the similarity of an object to multiple named vectors.

This is called a "multi-target vector search".

In a multi-target vector search, you can specify:

- The target vectors to search
- The query(ies) to compare to the target vectors
- The weights to apply to each distance (raw, or normalized) for each target vector

Read more in [How-to: Multi-target vector search](../../search/multi-vector.md).

## Related pages

- [How-to: Manage collections](../../manage-collections/vector-config.mdx#define-named-vectors): Configure vectors in collections
- [How-to: Search](../../search/index.mdx): Code examples for search
- [Weaviate academy: Named vectors](../../../academy/py/named_vectors/index.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
