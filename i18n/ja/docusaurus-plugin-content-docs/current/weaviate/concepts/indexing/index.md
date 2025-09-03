---
title: Indexing
sidebar_position: 0
description: "Overview of Weaviate's indexing systems for optimized search performance and data retrieval efficiency."
image: og/docs/concepts.jpg
# tags: ['basics']
---

Weaviate supports several types of indexes.

1. **[Vector indexes](./vector-index.md)** - a vector index (e.g. HNSW or flat) is used to serve all vector-search queries.
   - **HNSW** - an approximate nearest neighbor (ANN) search-based vector index. HNSW indexes scale well with large datasets.
   - **Flat** - a vector index that is used for brute-force searches. This is useful for small datasets.
   - **Dynamic** - a vector index that is flat when the dataset is small and switches to HNSW when the dataset is large.
1. **[Inverted indexes](./inverted-index.md)** - inverted indexes enable BM25 queries or speed up filtering.

You can configure indexes in Weaviate per collection.

:::tip Tips for indexing

Especially for large datasets, configuring the indexes is important because the more you index, the more storage is needed. A rule of thumb - if you don't query over a specific field or vector space, don't index it.

:::
