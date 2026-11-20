---
title: Resource Planning
sidebar_position: 90
description: "CPU, memory, and GPU resource planning guidelines for optimal Weaviate performance at scale."
image: og/docs/concepts.jpg
# tags: ['architecture', 'resource', 'cpu', 'memory', 'gpu']
---

Plan CPU, memory, and disk capacity for your vector count, dimensions, index type, compression, and query workload. For semantic search and RAG, count the vectors produced by chunking and any named or multi-vector embeddings, not just source documents. Even small collections can need resource planning when vectors are large or query concurrency is high. Depending on the modules you use, GPUs may also play a role.


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

Vector search and indexing can be CPU-intensive. For in-memory HNSW workloads, CPU capacity affects both queries and imports because inserting a vector requires searching the graph. Disk-backed indexes such as HFresh also depend on storage I/O and cache behavior, so adding CPUs alone may not resolve a bottleneck. You can [tune the vector index](../config-refs/indexing/vector-index.mdx) on a per collection basis for your use case.

To use multiple CPUs efficiently, create multiple shards for your collection. For the fastest imports, create multiple shards even on a single node.

Each insert, or search, is single-threaded. However, if you make multiple searches or inserts at the same time, Weaviate can make use of multiple threads. [Batch inserts](/weaviate/manage-objects/import) use multiple threads to process data in parallel.

### When to add more CPUs

When CPU utilization is high during importing, add CPUs to increases import speed.

When search throughput is limited, add CPUs to increase the number of queries per second.

## The role of memory

Memory requirements depend on the index type and what is cached. An HNSW index keeps its graph in memory and normally caches vectors in memory for search and import performance. [Vector compression](/weaviate/starter-guides/managing-resources/compression) reduces the vector portion, not the HNSW graph. The disk-backed [HFresh index](/weaviate/concepts/vector-index#hfresh-index) instead keeps a compressed centroid index in memory and reads posting lists from disk. HNSW sizing rules do not apply to HFresh.

Memory also affects query speed when it changes cache hit rates or causes disk reads. Weaviate uses [memory-mapped files](https://en.wikipedia.org/wiki/Memory-mapped_file) for disk-backed data, so account for the operating system's page cache as well as the Go heap.

### Which factors drive memory usage?

Budget these components separately:

- **Vector data and caches**: vector count, dimensions, encoding, and cache settings determine the vector footprint. Compressed indexes still store original vectors on disk for rescoring; caching those originals uses additional memory.
- **HNSW graph**: [`maxConnections`](../config-refs/indexing/vector-index.mdx) controls connections per layer, with up to twice that number in the base layer. Connections and node bookkeeping use memory independently of vector dimensions and quantization.
- **Objects and inverted indexes**: object properties, filter and keyword indexes, and their caches add disk and memory usage. They are not included in vector-byte arithmetic.
- **Shards and replicas**: size each node for the shards and replicas it hosts. Replicas hold additional copies of data and indexes; sharding distributes data rather than removing its resource requirements.
- **Runtime and workload overhead**: allow for concurrent queries, import buffers, background maintenance, and garbage collection. Peak usage during import can exceed steady-state usage.

The [`vectorCacheMaxObjects`](../config-refs/indexing/vector-index.mdx) setting is an entry-count setting, not a cap on total process memory or the HNSW graph. It is not an OOM guarantee, and compressed-cache initialization does not uniformly honor a smaller configured value. See [Vector Cache](#vector-cache) for the version-specific caveat before reducing it.

### An example calculation

For 5,000,000 vectors with 1,024 dimensions, the dimension payload alone is:

| Encoding | Calculation | Payload size (decimal GB) |
| --- | --- | --- |
| Float32 | `5,000,000 * 1,024 * 4 bytes` | 20.48 GB |
| 8-bit codes | `5,000,000 * 1,024 * 1 byte` | 5.12 GB |
| 4-bit codes | `5,000,000 * 1,024 * 0.5 bytes` | 2.56 GB |

This is encoding arithmetic, not a measured deployment requirement, resident memory (RSS), cost, or latency estimate. The code sizes exclude quantizer metadata and padding. They also exclude the HNSW graph, objects, inverted indexes, caches, replicas, and runtime headroom listed above. The original float32 vectors remain on disk when compression is enabled. A 4x or 8x reduction in dimension payload is not a 4x or 8x reduction in total RAM.

For an uncompressed HNSW index caching all vectors, a rough starting heuristic is twice the raw float32 vector bytes, or 40.96 GB in this example. That heuristic combines allowances for graph and runtime overhead, including garbage collection; it does not measure those components or guarantee sufficient capacity. Do not apply it to compressed HNSW or HFresh, or treat it as a complete node-sizing formula. Validate steady-state and peak memory with representative imports and queries before choosing capacity.

## Effects of garbage collection

Weaviate is written in Go, which is a garbage-collected language. This means some memory is not immediately available for reuse when it is no longer needed. The application has to wait for an asynchronous process, the garbage collector, to free up the memory. This has two distinct effects on memory use:

- [Memory overhead](#memory-overhead-for-the-garbage-collector)
- [Out-of-memory issues](#out-of-memory-issues-due-to-garbage-collection)

### Memory overhead for the garbage collector
Vector and graph sizes alone do not include garbage-collection headroom. Imports and queries allocate additional memory that is eventually freed by the garbage collector. Since collection is asynchronous, measure peak usage as well as steady-state usage. The uncompressed HNSW heuristic above includes a rough allowance for this overhead, not a fixed or guaranteed amount.

### Out-of-Memory issues due to garbage collection
In rare situations - typically on large machines with very high import speeds - Weaviate can allocate memory faster than the garbage collector can free it. When this happens, the system kernel can trigger an `out of memory kill (OOM-Kill)`. This is a known issue that Weaviate is actively working on.

### Data import
To avoid out-of-memory issues during imports, set `LIMIT_RESOURCES` to `True` or configure the `GOMEMLIMIT` environment variable. For details, see [Environment variables](/deploy/configuration/env-vars/index.md).

## Strategies to reduce memory usage

The following tactics can help to reduce Weaviate's memory usage:

- **Use vector compression**. Quantization reduces the vector footprint but not the HNSW graph. Compare supported methods, such as 8-bit RQ and PQ, using your embedding model and recall target. See [Compression](/weaviate/starter-guides/managing-resources/compression) for trade-offs and configuration links.

- **Consider HFresh when memory is the main constraint**. Its disk-backed posting lists avoid keeping the full vector dataset and graph in memory. Validate recall, storage I/O, and latency for your workload; see [HFresh](/weaviate/concepts/vector-index#hfresh-index) for limitations.

- **Reduce the dimensionality of your vectors.** The most effective approach to reducing memory size, is to reduce the number of dimensions per vector. If you have high dimension vectors, consider using a model that uses fewer dimensions. For example, a model that has 384 dimensions uses far less memory than a model with 1536 dimensions.

- **Reduce the number of [`maxConnections`](../config-refs/indexing/vector-index.mdx) in your HNSW index settings**. Each object in memory has up to `maxConnections` connections. Each of those connections uses 8-10B of memory. To reduce the overall memory footprint, reduce `maxConnections`.

Reducing `maxConnections` adversely affects HNSW recall performance. To mitigate this effect, increase one or both of the `efConstruction` and `ef` parameters.

- Increasing `efConstruction` increases import time without affecting query times.
- Increasing `ef` increases query times without affecting import times.

- **Use a vector cache that is smaller than the total amount of your vectors (not recommended)**. This strategy is described under [Vector Cache](#vector-cache) below. It has a significant performance impact, and is only recommended in specific, limited situations.

## Vector Cache

This guidance concerns the HNSW vector cache, not HFresh's disk-backed posting lists. For HNSW search and import performance, size the cache to hold the vectors used during graph traversal. With quantization, these are compressed vectors rather than the original float32 vectors. The [`vectorCacheMaxObjects`](../config-refs/indexing/vector-index.mdx) parameter is an entry-count setting with a default of one trillion (`1e12`), not a byte or total-process-memory cap.

In v1.40.6, some compressed-cache initialization paths do not apply a smaller configured value. For example, a newly created HNSW index using RQ without centering initializes its compressed-vector cache with a limit of `1e12` entries. Later updates and dynamic-index conversion use different paths. Verify effective cache sizing for your version and quantization configuration before relying on a reduced limit.

The following cache-reduction guidance applies to uncompressed HNSW. You can reduce `vectorCacheMaxObjects`, but a disk lookup for a vector is orders of magnitudes slower than memory lookup. Only reduce it with care and as a last resort.

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
