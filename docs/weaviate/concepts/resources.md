---
title: Resource Planning
sidebar_position: 90
description: "CPU, memory, and GPU resource planning guidelines for optimal Weaviate performance at scale."
image: og/docs/concepts.jpg
# tags: ['architecture', 'resource', 'cpu', 'memory', 'gpu']
---

Weaviate scales well for large projects. Smaller projects, less than 1M objects, do not require resource planning. For medium and large-scale projects, you should plan how to get the best performance from your resources. While you design you system, keep in mind CPU and memory management. CPU and memory are the primary resources for Weaviate instances. Depending on the modules you use, GPUs may also play a role.


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
