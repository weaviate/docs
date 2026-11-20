---
title: Filtering
sidebar_position: 26
description: "Filtered vector search capabilities combining semantic similarity with structured scalar filtering."
image: og/docs/concepts.jpg
# tags: ['architecture', 'filtered vector search', 'pre-filtering']
---

import SkipLink from '/src/components/SkipValidationLink'

Weaviate provides powerful filtered vector search capabilities, allowing you to combine vector searches with structured, scalar filters. This enables you to find the closest vectors to a query vector that also match certain conditions.

Filtered vector search in Weaviate is based on the concept of pre-filtering. This means that the filter is constructed before the vector search is performed. Unlike some pre-filtering implementations, Weaviate's pre-filtering does not require a brute-force vector search and is highly efficient.

[`ACORN`](#acorn) is the built-in default for new HNSW filter configurations, subject to server defaults and explicit per-index settings. Its benefits depend on selectivity and correlation with the query vector. Because the [HFresh index](./indexing/vector-index.md#hfresh-index) uses an HNSW index for its centroids, it also benefits from ACORN when routing filtered queries.

## Post-Filtering vs Pre-Filtering

Systems that cannot make use of pre-filtering typically have to make use of post-filtering. This is an approach where a vector search is performed first and then some results are removed which do not match the filter. This leads to two major disadvantages:

1. You cannot easily predict how many elements will be contained in the search, as the filter is applied to an already reduced list of candidates.
2. If the filter is very restrictive, i.e. it matches only a small percentage of data points relative to the size of the data set, there is a chance that the original vector search does not contain any match at all.

Pre-filtering determines result eligibility before a vector search starts. Only objects on the "allow" list are eligible for results; graph traversal can still visit nonmatching nodes, depending on the strategy.

:::note
Some authors make a distinction between "pre-filtering" and "single-stage filtering" where the former implies a brute-force search and the latter does not. We do not make this distinction, as Weaviate does not have to resort to brute-force searches, even when pre-filtering due to the its combined inverted index and HNSW index.
:::

## Efficient Pre-Filtered Searches in Weaviate

In the section about Storage, [we have described in detail which parts make up a shard in Weaviate](./storage.md). Most notably, each shard contains an inverted index right next to the HNSW index. This allows for efficient pre-filtering. The process is as follows:

1. An inverted index (similar to a traditional search engine) is used to create an allow-list of eligible candidates. This list is essentially a list of `uint64` ids, so it can grow very large without sacrificing efficiency.
2. A vector search is performed where the allow-list is passed to the HNSW index. Only allow-listed objects are eligible for results. The traversal depends on the selected strategy: sweeping can traverse nonmatching nodes, while ACORN and PathSeer adapt neighborhood exploration. Search terminates according to candidate quality and search budgets, not simply after filling the requested result count.

## Filter strategy

Weaviate supports three filter strategies for the HNSW index type: `sweeping`, `acorn` and `pathseer`.

### ACORN

The Weaviate filtering algorithm `ACORN` is based on the paper [ACORN: Performant and Predicate-Agnostic Search Over Vector Embeddings and Structured Data](https://arxiv.org/html/2403.04871v1). We refer to this as `ACORN`, but the actual implementation in Weaviate is a custom implementation that is inspired by the paper. (References to `ACORN` in this document refer to the Weaviate implementation.)

The `ACORN` algorithm is designed to speed up filtered searches with the [HNSW index](./indexing/vector-index.md#hierarchical-navigable-small-world-hnsw-index) by the following:

- Objects that do not meet the filters are ignored in distance calculations.
- The algorithm reaches the relevant part of the HNSW graph faster, by using a multi-hop approach to evaluate the neighborhood of candidates.
- Additional entrypoints matching the filter are seeded to help reach eligible regions of the graph.

The `ACORN` algorithm is especially useful when the filter has low correlation with the query vector. In other words, when a filter excludes many objects in the region of the graph most similar to the query vector.

Our internal testing indicates that for lowly correlated, restrictive filters, the `ACORN` algorithm can be significantly faster, especially for large datasets. If this has been a bottleneck for your use case, we recommend enabling the `ACORN` algorithm.

### Sweeping

The `sweeping` strategy is based on the concept of "sweeping" through the HNSW graph.

Sweeping follows the normal HNSW traversal, using the allow list for result admission. A nonmatching node can still be a traversal candidate; it is excluded from results, not necessarily from the walk. Candidate quality and the `ef` search budget govern termination before the result list is trimmed to the requested limit.

The `sweeping` algorithm can be enabled by setting the `filterStrategy` field for the relevant HNSW vector index [in the collection configuration](../manage-collections/vector-config.mdx#set-vector-index-parameters).

### PathSeer

:::info Added in `v1.40`
:::

`PathSeer` comes from the SIGMOD 2026 paper <SkipLink href="https://doi.org/10.1145/3802098">PathSeer: Adaptive Neighbor Handling for Efficient Filtered ANN Search</SkipLink> by Zhiyue Li, Guangyan Zhang and colleagues. The paper's first author contributed the implementation to Weaviate.

`PathSeer` searches the bottom layer of the HNSW graph like `sweeping`, with two additions. While the result set is still filling, it also checks the filter on the neighbors of each candidate's neighbors and computes distances only for the ones that match, like `ACORN`. Once the result set is full, it skips the non-matching neighbors of a non-matching candidate without computing their distance. The decision is made per node, so there is no selectivity threshold and no new parameter to tune.

{/* TODO(ivan): link the PathSeer blog post once it is published */}
In Weaviate's benchmarks, `PathSeer` was the fastest strategy, or within a few percent of the fastest, on random, topical and combined filters. `ACORN` remains faster for sparse filters that are negatively correlated with the query, where the matching objects lie far from where the search starts.

`PathSeer` changes only how a filtered query walks the graph. It requires no additional persisted graph structure, though queries use scratch memory, and you can switch an existing collection to `pathseer` or away from it at any time without reindexing. The [flat-search cutoff](#flat-search-cutoff) still applies first. The built-in default is `acorn`, subject to server defaults and explicit per-index settings. To use `PathSeer`, set the `filterStrategy` field of the HNSW vector index to `pathseer` [in the collection configuration](../manage-collections/vector-config.mdx#set-vector-index-parameters).

:::caution Downgrading from `v1.40`
Earlier Weaviate versions do not accept `pathseer` as a filter strategy. Before you downgrade, set `filterStrategy` to `acorn` or `sweeping` on every collection that uses it.
:::

## `indexFilterable` {#indexFilterable}

The `indexFilterable` index speeds up match-based filtering through use of Roaring Bitmaps. Roaring Bitmaps employ various strategies to add efficiencies, whereby it divides data into chunks and applies an appropriate storage strategy to each one. This enables high data compression and set operations speeds, resulting in faster filtering speeds for Weaviate.

If you are dealing with a large dataset, this will likely improve your filtering performance significantly and we therefore encourage you to migrate and re-index.

In addition, our team maintains our underlying Roaring Bitmap library to address any issues and make improvements as needed.

#### `indexFilterable` for `text` properties

A roaring bitmap index for `text` properties is implemented using two separate (`filterable` & `searchable`) indexes, which replaces the existing single index. You can configure the new `indexFilterable` and `indexSearchable` parameters to determine whether to create the roaring set index and the BM25-suitable Map index, respectively. (Both are enabled by default.)

:::info Read more
To learn more about Weaviate's roaring bitmaps implementation, see the [in-line documentation](https://pkg.go.dev/github.com/weaviate/weaviate/adapters/repos/db/lsmkv/roaringset).
:::

## `indexRangeFilters`

The `indexRangeFilters` index is a range-based index for filtering by numerical ranges. This index is available for `int`, `number`, or `date` properties. The index is not available for arrays of these data types.

Internally, rangeable indexes are implemented as roaring bitmap slices. This data structure limits the index to values that can be stored as 64 bit integers.

`indexRangeFilters` is only available for new properties. Existing properties cannot be converted to use the rangeable index.

## Recall on Pre-Filtered Searches

Filtered ANN search remains approximate. Recall depends on filter selectivity, correlation with the query vector, strategy, and search parameters. Sweeping's distinction between traversal and result eligibility is useful, but it does not establish equal recall across ACORN, PathSeer, and unfiltered searches. Evaluate recall and latency on a representative workload.

## Flat-Search Cutoff

For filtered HNSW search, Weaviate can scan the matching subset instead of walking the graph when the allow-list cardinality is **strictly below** `flatSearchCutoff`. The default is **40,000 IDs per HNSW index/shard**, not a fixed percentage of the collection. Setting it to `0` disables this cutoff.

This decision occurs before selecting sweeping, ACORN, or PathSeer. Selectivity and traversal costs vary by strategy and workload; restrictive filters do not universally imply an exhaustive graph walk. The cutoff is separate from selecting a standalone flat index and does not define HFresh's cutoff behavior.

Configure it in the [HNSW vector index settings](/weaviate/config-refs/indexing/vector-index.mdx#hnsw-index).

## Further resources

- [References: GraphQL API - Filters](../api/graphql/filters.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
