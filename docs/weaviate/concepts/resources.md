---
title: Resource Planning
sidebar_position: 90
description: "CPU, memory, and GPU resource planning guidelines for optimal Weaviate performance at scale."
image: og/docs/concepts.jpg
# tags: ['architecture', 'resource', 'cpu', 'memory', 'gpu']
---

Size a Weaviate deployment from the number of vectors you will index, the properties you will search or filter, and the traffic it must serve. A document can produce several chunks, and each chunk can have several vectors. Object count alone does not establish how much memory or SSD capacity you need.

Start with the [worked sizing example](#size-a-hybrid-search-workload), then measure a representative import and query workload before choosing production hardware.


## Limit available resources

You can set [environment variables](/deploy/configuration/env-vars/index.md) to manage Weaviate's resource usage, as to prevent Weaviate from using all available resources. The following environment variables are available:

- [`LIMIT_RESOURCES`](/deploy/configuration/env-vars/index.md#LIMIT_RESOURCES): When set to true, Weaviate automatically limits its resource usage. It sets memory usage to 80% of the total memory and uses all but one CPU core. It overrides any `GOMEMLIMIT` values but respects `GOMAXPROCS` settings.

- [`GOMEMLIMIT`](/deploy/configuration/env-vars/index.md#GOMEMLIMIT): This sets the memory limit for the Go runtime, which should be around 80-90% of the total memory available for Weaviate. It controls the aggressiveness of the Garbage Collector as memory usage approaches this limit.

- [`GOMAXPROCS`](/deploy/configuration/env-vars/index.md#GOMAXPROCS): This sets the maximum number of threads for concurrent execution. If set, it's respected by `LIMIT_RESOURCES`, allowing users to specify the exact number of CPU cores Weaviate should use.

These settings help in optimizing Weaviate's performance by balancing resource utilization with the available system resources.


## The role of CPUs

:::tip Rule of thumb
The CPU has a direct effect on query and import speed, but does not affect dataset size.
:::

Vector search is the most CPU intensive process in Weaviate operations. Queries are CPU-bound, but imports are also CPU-bound because imports rely on vector search for indexing. Weaviate uses the HNSW (Hierarchical Navigable Small World) algorithm to index vectors. You can [tune the HNSW index](../config-refs/indexing/vector-index.mdx) on a per collection basis in order to maximize performance for your primary use case.

To use multiple CPUs efficiently, create multiple shards for your collection. For the fastest imports, create multiple shards even on a single node.

Each insert, or search, is single-threaded. However, if you make multiple searches or inserts at the same time, Weaviate can make use of multiple threads. [Batch inserts](/weaviate/manage-objects/import) use multiple threads to process data in parallel.

### When to add more CPUs

When CPU utilization is high during importing, add CPUs to increases import speed.

When search throughput is limited, add CPUs to increase the number of queries per second.

## The role of memory

:::tip Rule of thumb
For in-memory HNSW, available memory limits the size of the index you can keep resident. Compression and disk-based indexing change the memory, recall, and latency trade-offs.
:::

The HNSW graph is stored in memory. Its size grows with the number of indexed vectors and their connections, while vector compression reduces the vector payload. [Rotational quantization (RQ)](../configuration/compression/rq-compression.md), PQ, SQ, and BQ offer different memory/recall trade-offs. If memory is your main constraint, the disk-based [HFresh index](/weaviate/concepts/vector-index#hfresh-index) is another option: it keeps a compressed centroid index in memory and compressed posting lists on disk, trading peak query throughput for memory efficiency.

Weaviate lets you configure a limit to the number of vectors held in memory in order to prevent unexpected Out-of-Memory ("OOM") situations. The default value is one trillion (`1e12`) objects per collection. This is a cache configuration limit, not demonstrated dataset capacity or a memory reservation. To adjust the number of objects, update the value of [`vectorCacheMaxObjects`](../config-refs/indexing/vector-index.mdx) in your index settings.

Weaviate also uses [memory-mapped files](https://en.wikipedia.org/wiki/Memory-mapped_file) for data stored on disks. Memory-mapped files are efficient, but disk storage is much slower than in-memory storage.

### Which factors drive memory usage?

The HNSW vector index is the primary driver of memory usage. These factors influence the amount of memory Weaviate uses:

- **The total number and size of vectors**. Count vectors after chunking, rather than source documents. Include each configured vector representation when planning named-vector or multi-vector collections. Dimensions and compression determine the vector payload size.
- **The `maxConnections` HNSW index setting**. Each object in memory has at most [`maxConnections`](../config-refs/indexing/vector-index.mdx) connections per layer. Each of the connections uses 8-10B of memory. Note that the base layer allows for `2 * maxConnections`.

These vector-index components are not the entire process memory footprint. Also budget for [object and inverted-index data structures](./storage.md#object-and-inverted-index-store), resident metadata, caches, the Go runtime and garbage collection, and allocations during queries and imports. Replication creates additional copies across nodes; account for the [shard and replica layout](./replication-architecture/index.md#replication-vs-sharding) when sizing a cluster.

### An example calculation

:::note
The following calculation is a rough planning heuristic for uncompressed HNSW with all vectors in memory, not a measured whole-process RAM requirement. Do not apply the same multiplier to compressed vectors or HFresh. For HNSW vector-cache trade-offs, see [Vector Cache](#vector-cache) below.
:::

To estimate your memory needs, use the following rule of thumb:

`Memory usage = 2 * (the memory footprint of all vectors)`

For example, consider a model that has one million 384-dimensional vectors of type `float32`.

- The memory requirement for a single vector is: `384 * 4 B = 1536 B`.

- The memory requirement for one million objects is: `1e6 * 1536 B = 1.5G B`

The rule of thumb doubles the vector payload: `2 * 1e6 * 1536 B ≈ 3 GB` (decimal). Validate this estimate against the full deployment's memory use.

To make a rough connection-memory contribution explicit, include a factor for the [`maxConnections`](../config-refs/indexing/vector-index.mdx) setting instead of multiplying the base requirement by two.

For example, if `maxConnections` is 64 and the other values are the same, a partial vector-plus-connections estimate is `1e6 * (1536B + (64 * 10)) ≈ 2.2 GB`.

The estimate that includes `maxConnections` is smaller than the rule of thumb estimate. However, the `maxConnections` estimate doesn't account for garbage collection. Garbage collection adds overhead that is explained in the next section.

### Compressed vector payload is not total memory

For a 1536-dimensional vector, the RQ payload sizes below follow from the code width and [auxiliary bytes](./vector-quantization.md#rq-characteristics). This dimension count needs no rounding because it is already a multiple of 64.

| Representation | Payload calculation | Bytes per vector |
| --- | --- | --- |
| Uncompressed `float32` | `1536 * 4` | 6144 |
| 8-bit RQ | `1536 + 16` | 1552 |
| 4-bit RQ | `1536 / 2 + 16` | 784 |
| 1-bit RQ | `1536 / 8 + 8` | 200 |

For example, 4-bit RQ makes this vector payload about 7.84x smaller, not the entire HNSW index or process. Graph connections and other memory components still need a separate budget. Uncompressed vectors also remain stored for [rescoring](./vector-quantization.md#over-fetching--re-scoring), which adds retrieval and scoring work at query time.

Choose compression and rescoring settings by testing recall and latency on representative data. The recall figures on the [RQ concepts page](./vector-quantization.md#rotational-quantization) are Weaviate's internal test results, not guarantees for a different embedding model, dataset, or query mix.

## Size a hybrid search workload

Start with the same data and query targets for both designs. For example, compare **HNSW with 8-bit RQ** when query throughput is the priority with **HFresh** when memory is the tighter constraint. HNSW keeps its graph in memory; this example budgets for caching all its 8-bit codes. [HFresh](./indexing/vector-index.md#hfresh-index) searches an in-memory centroid index, reads compressed posting lists from disk, and rescores candidates against full vectors. It does not support dot product and is not designed to beat HNSW on peak query throughput.

### Calculate the vector components

This example assumes **3 million documents, 10 chunks per document, one 1,536-dimensional `float32` vector per chunk, and cosine distance**. Each object has searchable text and a filterable category. In this self-managed example, distribute 30 million vectors evenly across six shards on three nodes at replication factor 2. If each node holds four shard copies, the cluster stores 60 million vector copies and each node holds 20 million. Check the actual [shard and replica layout](./replication-architecture/index.md#replication-vs-sharding); size for the fullest node rather than the average if placement or shard sizes differ.

The following figures use decimal GB and count only the named components. They are **calculations, not measured RAM, SSD use, or hardware requirements**.

| Component | Per node | Cluster (three nodes) |
| --- | ---: | ---: |
| Original vector payload on disk, before storage overhead (both indexes): `copies × 6,144 B` | 122.88 GB | 368.64 GB |
| HNSW 8-bit RQ code payload in memory, if all codes are cached: `copies × 1,552 B` | 31.04 GB | 93.12 GB |
| HFresh 1-bit posting code payload on disk, **if** each vector occurs in four postings: `copies × 4 × 200 B` | 16.00 GB | 48.00 GB |

The HFresh row illustrates the effect of membership count, not measured posting occupancy or the size of the posting files. A posting record also needs identifiers and other metadata. HFresh's `replicas` setting controls posting-list membership, not node replicas. It does not provide high availability. Count the centroid codes and graph separately; they depend on how many centroids the index builds. Do not reuse the HNSW memory multiplier for HFresh.

### Turn the calculation into a test-node budget

| Budget | HNSW with 8-bit RQ | HFresh |
| --- | --- | --- |
| RAM for the vector index | Add graph links and cache bookkeeping to the cached code payload. Do not treat link bytes as the full graph footprint. | Budget centroid codes, the centroid graph, posting metadata, and the file pages used to read postings and rescore candidates. |
| Persistent SSD for the vector index | Count retained originals, codes, and on-disk graph data, not just one compressed copy. | Count retained originals, posting codes and metadata, and centroid data. |
| Other RAM and SSD | For either design, budget objects, searchable text and filter indexes separately. Measure resident data, file cache and Go runtime memory during queries and import; do not count the same file-backed pages twice. Leave SSD headroom for ingestion, compaction and recovery apart from backup storage. | Same inputs; measure them in the target configuration. |

For example, **64 GiB RAM and 512 GiB SSD per node** are test allocations, not recommendations. In the all-codes-cached HNSW case, 31.04 GB of codes is about 28.9 GiB, leaving about 35.1 GiB for everything else on a 64 GiB node. Original vectors occupy about 114.4 GiB before any other disk use. These subtotals tell you what to check first; nothing here establishes that the remaining budget fits the graph, indexed text, or import peaks. Use the same initial hardware for HFresh if you want to compare the layouts, then tune the allocation using observed peaks and query results.

### Validate before choosing production hardware

- **Measure steady search and import separately.** Track memory and SSD high-water marks during bulk import, compaction, restart, and steady search. Repeat with concurrent writes if the workload needs them. `GOMEMLIMIT` is a Go runtime control, not a cap on all process memory.
- **Use representative hybrid queries and filters.** Pin the Weaviate version and record the index settings. Hold the corpus, embedding model, filter selectivity and concurrency constant. For each index, tune against the same recall or judged relevance target and record p95/p99 latency, throughput and storage read activity. The payload calculations do not tell you how much SSD I/O an index needs.
- **Test the replica layout under failure.** Check where copies are placed and whether the remaining nodes can serve the target traffic at your chosen [consistency levels](./replication-architecture/consistency.md). Replication factor 1 gives no data redundancy; replication is not a backup.

## Effects of garbage collection

Weaviate is written in Go, which is a garbage-collected language. This means some memory is not immediately available for reuse when it is no longer needed. The application has to wait for an asynchronous process, the garbage collector, to free up the memory. This has two distinct effects on memory use:

- [Memory overhead](#memory-overhead-for-the-garbage-collector)
- [Out-of-memory issues](#out-of-memory-issues-due-to-garbage-collection)

### Memory overhead for the garbage collector
The memory calculation that includes `maxConnections` describes the system state at rest. However, while Weaviate imports vectors, additional memory is allocated and eventually freed by the garbage collector. Since garbage collection is an asynchronous process, this additional memory must also be accounted for. The 'rule of thumb' formula accounts for garbage collection.

### Out-of-Memory issues due to garbage collection
In rare situations - typically on large machines with very high import speeds - Weaviate can allocate memory faster than the garbage collector can free it. When this happens, the system kernel can trigger an `out of memory kill (OOM-Kill)`. This is a known issue that Weaviate is actively working on.

### Data import
To avoid out-of-memory issues during imports, set `LIMIT_RESOURCES` to `True` or configure the `GOMEMLIMIT` environment variable. For details, see [Environment variables](/deploy/configuration/env-vars/index.md).

## Strategies to reduce memory usage

The following tactics can help to reduce Weaviate's memory usage:

- **Use vector compression**. For HNSW, [RQ](../configuration/compression/rq-compression.md) is a starting point; [PQ, SQ, and BQ](./vector-quantization.md) are also available. Test the recall, latency, and memory trade-offs on your dataset before using a configuration in production. Check [Cloud defaults](/cloud/manage-clusters/default-settings) before assuming your collection is uncompressed.

- **Consider a disk-based index**. [HFresh](/weaviate/concepts/vector-index#hfresh-index) keeps most vector-index data on disk and rebalances as data changes. It uses mandatory RQ compression, supports `cosine` and `l2-squared` (not dot product), and trades peak query throughput for memory efficiency.

- **Reduce the dimensionality of your vectors.** The most effective approach to reducing memory size, is to reduce the number of dimensions per vector. If you have high dimension vectors, consider using a model that uses fewer dimensions. For example, a model that has 384 dimensions uses far less memory than a model with 1536 dimensions.

- **Reduce the number of [`maxConnections`](../config-refs/indexing/vector-index.mdx) in your HNSW index settings**. Each object in memory has up to `maxConnections` connections. Each of those connections uses 8-10B of memory. To reduce the overall memory footprint, reduce `maxConnections`.

Reducing `maxConnections` adversely affects HNSW recall performance. To mitigate this effect, increase one or both of the `efConstruction` and `ef` parameters.

- Increasing `efConstruction` increases import time without affecting query times.
- Increasing `ef` increases query times without affecting import times.

- **Use a vector cache that is smaller than the total amount of your vectors (not recommended)**. This strategy is described under [Vector Cache](#vector-cache) below. It has a significant performance impact, and is only recommended in specific, limited situations.

## Vector Cache

The following guidance concerns HNSW vector caching. HFresh has a different [centroid and posting-list layout](/weaviate/concepts/vector-index#hfresh-index).

For optimal HNSW search and import performance, all previously imported vectors need to be held in memory. The size of the vector cache is specified by the [`vectorCacheMaxObjects`](../config-refs/indexing/vector-index.mdx) parameter in the collection definition. By default this limit is set to one trillion (`1e12`) objects when you create a new collection.

You can reduce the size of `vectorCacheMaxObjects`, but a disk lookup for a vector is orders of magnitudes slower than memory lookup. Only reduce the size of `vectorCacheMaxObjects` with care and as a last resort.

Generally we recommend that:
- During import set `vectorCacheMaxObjects` high enough that all vectors can be held in memory. Each import requires multiple searches. Import performance drop drastically when there isn't enough memory to hold all of the vectors in the cache.

- After import, when your workload is mostly querying, experiment with vector cache limits that are less than your total dataset size.

  Vectors that aren't currently in cache are added to the cache if there is still room. If the cache fills, Weaviate drops the whole cache. All future vectors have to be read from disk for the first time. Then, subsequent queries runs against the cache, until it fills again and the procedure repeats. Note that the cache can be a very valuable tool if you have a large dataset, and a large percentage of users only query a specific subset of vectors. In this case you might be able to serve the largest user group from cache while requiring disk lookups for "irregular" queries.

### When to add more Memory to your Weaviate machine or cluster

Consider adding more memory if:
- You want to import a larger dataset (more common).
- Exact lookups are disk-bound and more memory will improve page-caching (less common).

## The role of GPUs in Weaviate

Weaviate Database itself does not make use of GPUs. However, some of the models that Weaviate includes as modules are meant to run with GPUs, for example `text2vec-transformers`, `qna-transformers`, and `ner-transformers`. These modules run in isolated containers, so you can run the module containers on GPU-accelerated hardware while running Weaviate Database on low-cost CPU-only hardware.

## Disks: SSD vs Spinning Disk

Weaviate is optimized to work with Solid-State Disks (SSDs). However, spinning hard-disks can also be used with some performance penalties.

## File system

For optimal performance and reliability, avoid using `NFS` or similar file systems for the Weaviate persistent volume ([`PERSISTENCE_DATA_PATH`](/deploy/configuration/env-vars/index.md)). 

Instead, use file systems like `Ext4` or `XFS` in combination with SAN storage (e.g. `EBS`) to ensure the best performance.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
