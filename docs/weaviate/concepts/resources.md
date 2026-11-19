---
title: Resource Planning
sidebar_position: 90
description: "CPU, memory, and GPU resource planning guidelines for optimal Weaviate performance at scale."
image: og/docs/concepts.jpg
# tags: ['architecture', 'resource', 'cpu', 'memory', 'gpu']
---

Plan resources from vector count and dimensions, index type and compression, object and property indexes, workload, and replication, rather than object count alone. Even small collections can require substantial resources with high-dimensional or multiple vectors. Include CPU, memory, and storage capacity and I/O in your planning. Depending on the modules you use, GPUs may also play a role.


## Limit available resources

Use [environment variables](/deploy/configuration/env-vars/index.md) to tune Go runtime resource use. These controls are not hard process containment or guarantees against out-of-memory failures:

- [`LIMIT_RESOURCES`](/deploy/configuration/env-vars/index.md#LIMIT_RESOURCES): With the literal value `true`, Weaviate attempts to derive `GOMAXPROCS` from cgroup CPU quota (v1/v2), respecting an explicit `GOMAXPROCS`. Detection can fail; it does not reserve one host CPU. It also sets a soft Go memory limit at 80% of detected memory, falling back to 80% of system memory if cgroup-aware memory detection fails. This can override `GOMEMLIMIT`.
- [`GOMEMLIMIT`](/deploy/configuration/env-vars/index.md#GOMEMLIMIT): A soft Go runtime memory limit that influences garbage collection. It is not total process RSS or a hard container limit; mapped files, non-Go allocations, and operating-system memory need separate headroom.
- [`GOMAXPROCS`](/deploy/configuration/env-vars/index.md#GOMAXPROCS): Limits simultaneous execution of Go code. It neither reserves physical CPU cores nor caps the process's total OS threads.

Monitor actual memory and CPU use, leave headroom for concurrent work, and tune import pressure as needed. Runtime limits can reduce memory pressure but cannot prevent every OOM.


## The role of CPUs

:::tip Rule of thumb
The CPU has a direct effect on query and import speed, but does not affect dataset size.
:::

HNSW vector search and insertion can be CPU-intensive when the required vectors and graph are resident in memory. Complete requests can also be limited by vector-cache misses, object retrieval, storage I/O, or indexing backlog. Other index types, such as HFresh, have different memory and I/O trade-offs. You can [tune the HNSW index](../config-refs/indexing/vector-index.mdx) on a per collection basis for your primary use case.

Multiple shards can expose import parallelism, including on one node, but add overhead. Benchmark shard counts for your chosen indexes and workload rather than assuming more shards always produce the fastest import.

HNSW graph traversal is largely single-threaded, but a complete request can include parallel work, such as candidate rescoring. Concurrent searches and inserts can also use multiple threads. [Batch inserts](/weaviate/manage-objects/import) use multiple threads to process data in parallel.

### When to add more CPUs

Consider adding CPUs when measurements show that CPU is the bottleneck during import or search. Check cache behavior, storage I/O, and indexing queues before scaling: adding CPUs does not resolve every throughput limit.

## The role of memory

:::tip Rule of thumb
Memory affects resident-index capacity, cache hit rates, and garbage collection. These can affect both latency and throughput.
:::

The HNSW graph is stored in memory; vector residency depends on compression and cache settings. Dataset size and query concurrency both matter for memory planning. You can use [`product quantization (PQ)`](/weaviate/concepts/vector-quantization#product-quantization) to reduce vector memory, but compression does not shrink the graph. If memory is your main constraint, the disk-based [HFresh index](/weaviate/concepts/vector-index#hfresh-index) is another option.

[`vectorCacheMaxObjects`](../config-refs/indexing/vector-index.mdx) configures an entry-count threshold for each applicable vector-index cache instance. It is not a byte limit or a guarantee against Out-of-Memory ("OOM") situations. Account for separate shard and named-vector index instances and their replicas, along with graph memory, other indexes, and runtime allocations.

Weaviate also uses [memory-mapped files](https://en.wikipedia.org/wiki/Memory-mapped_file) for data stored on disks. Memory-mapped files are efficient, but disk storage is much slower than in-memory storage.

### Which factors drive memory usage?

For HNSW deployments, include these components when planning memory:

- **Vectors and their representations**. Count dimensions, data type, compression, and the number of vectors per object. Cache settings determine which applicable representations remain resident.
- **The HNSW graph**. [`maxConnections`](../config-refs/indexing/vector-index.mdx) limits connections per upper layer; the base layer allows `2 * maxConnections`. Resident graph memory also includes nodes, layer metadata, and allocation overhead, so a fixed bytes-per-connection multiplier is not a complete estimate.
- **Objects and property indexes**. Objects need not all reside in the Go heap, but their size and the indexes used for filtering and keyword search affect storage and the memory working set.
- **Caches, runtime, and temporary work**. Include operating-system file cache, query concurrency, indexing buffers and queues, and import or recovery peaks.

### An example calculation

:::note
This example covers one logical copy of one uncompressed HNSW vector index, with one vector per object and all vectors cached. It is not total process or cluster memory sizing. For cache trade-offs, see [Vector Cache](#vector-cache) below.
:::

A rough starting heuristic for an uncompressed HNSW index is:

`Index planning heuristic = 2 * (the raw float32 vector bytes)`

For one million 384-dimensional vectors of type `float32`:

- A single vector contains `384 * 4 B = 1536 B` of raw values.
- The raw arrays contain `1e6 * 1536 B = 1.536 GB` (about `1.431 GiB`).
- Doubling gives `3.072 GB` (about `2.861 GiB`) as a starting heuristic, not a measured resident-memory requirement or peak bound.

Here, GB means decimal gigabytes and GiB means binary gibibytes. The heuristic does not separately size graph topology and allocations, object and property indexes, file cache, runtime overhead, or transient work. It does not apply to compressed HNSW, flat, or HFresh indexes. Measure these components and peak headroom for your workload before selecting capacity.

For a deployment estimate, account for each shard and vector index and the replicas placed on each node. Do not treat the memory summed across all copies as a per-node requirement.

## Measure capacity with your workload

Before selecting a production instance or changing an index:

1. Import a representative sample using the intended vectors, properties, shard placement, and replication factor. Include the number of named vectors and component vectors per object.
2. Measure peak memory during import, background indexing, and queries. Compare Go runtime metrics with `GOMEMLIMIT`, but also monitor process RSS and container memory, including file cache. These measurements cover different allocations; none is interchangeable with raw vector bytes.
3. Measure disk use per shard, including object properties, original vectors, index data, write-ahead logs, and indexing queues. Compression can add stored codes while retaining the original vectors, so a smaller cached representation does not imply the same reduction in disk use.
4. Run queries with representative filters, result limits, and concurrency. Record p50, p95, and p99 latency and sustained throughput, and check storage I/O and cache behavior before attributing a bottleneck to CPU.
5. Compare approximate results with an uncompressed exact reference where the index and vector format support one. Measure relevance separately: matching exact nearest neighbors does not establish that the embedding model answers the user's question.

Revisit capacity when data volume, vector configuration, concurrency, or the required quality changes. See [memory inspection tools](../best-practices/index.md#how-to-quickly-check-the-memory-usage), [index choices](./indexing/vector-index.md), and [measuring compression recall](../starter-guides/managing-resources/compression.mdx#recall).

## Effects of garbage collection

Weaviate is written in Go, which is a garbage-collected language. This means some memory is not immediately available for reuse when it is no longer needed. The application has to wait for an asynchronous process, the garbage collector, to free up the memory. This has two distinct effects on memory use:

- [Memory overhead](#memory-overhead-for-the-garbage-collector)
- [Out-of-memory issues](#out-of-memory-issues-due-to-garbage-collection)

### Memory overhead for the garbage collector
During imports and queries, Weaviate allocates temporary memory that is eventually freed by the garbage collector. Since garbage collection is asynchronous, leave headroom above the measured resident working set. The amount depends on allocation rate, concurrency, and runtime settings; the 2× index heuristic above does not guarantee sufficient garbage-collection or peak headroom.

### Out-of-Memory issues due to garbage collection
In rare situations - typically on large machines with very high import speeds - Weaviate can allocate memory faster than the garbage collector can free it. When this happens, the system kernel can trigger an `out of memory kill (OOM-Kill)`. This is a known issue that Weaviate is actively working on.

### Data import
To manage Go runtime memory pressure during imports, set `LIMIT_RESOURCES` to `true` or configure `GOMEMLIMIT`. These settings do not replace workload sizing or guarantee that the process cannot run out of memory. For details, see [Environment variables](/deploy/configuration/env-vars/index.md).

## Strategies to reduce memory usage

The following tactics can help to reduce Weaviate's memory usage:

Current choices include [PQ, BQ, SQ, and RQ quantization](./vector-quantization.md), with index-specific compatibility and recall/resource trade-offs. [Index selection](./indexing/vector-index.md) also matters: flat avoids a graph for small datasets, dynamic changes its footprint when it upgrades to HNSW, and HFresh uses disk-backed postings with built-in compression. These choices are distinct from compressing HNSW graph connections. Use the linked configuration guides and measure your workload rather than assuming one universally best method.

- **Use vector compression**. Product quantization (PQ) is a technique that reduces the size of vectors. Vector compression impacts recall performance, so we recommend testing PQ on your dataset before using it in production. <br/><br/> For more information, see [Product Quantization](/weaviate/concepts/vector-quantization). <br/> To configure PQ, see [Compression](../configuration/compression/pq-compression.md).

- **Reduce the dimensionality of your vectors.** Reducing dimensions can reduce vector payload memory, but total savings and search quality depend on the model, representation, indexes, and other allocations. If you have high dimension vectors, consider using a model that uses fewer dimensions. For example, a model that has 384 dimensions uses far less memory than a model with 1536 dimensions.

- **Choose a smaller [`maxConnections`](../config-refs/indexing/vector-index.mdx) when creating an HNSW index**. This reduces the connection budget per layer, including the base-layer budget of `2 * maxConnections`, and can reduce graph memory. The actual saving depends on graph occupancy and representation, and recall can decrease.

  `maxConnections` and `efConstruction` are immutable after creation. A higher `efConstruction` increases construction work and can change graph quality and query behavior; it is not a query-time search-budget setting. A higher `ef` increases the query search budget and may improve recall at a latency cost. Measure the trade-off rather than assuming one setting offsets another.

- **Evaluate a smaller vector cache**. Reducing the cached working set can save memory at the cost of storage reads and cache churn. Measure the effect under representative import and query loads; see [Vector Cache](#vector-cache).

## Vector Cache

For HNSW workloads, keeping the searched vector representations in memory avoids storage lookups. The [`vectorCacheMaxObjects`](../config-refs/indexing/vector-index.mdx) parameter in the collection definition sets an entry-count threshold for each applicable index cache, defaulting to one trillion (`1e12`). Separate shards and named-vector indexes have separate instances, and replicas add copies. This is not a collection-wide or process-wide memory cap, and cache maintenance is not an instantaneous allocation limit.

Reducing `vectorCacheMaxObjects` can introduce storage lookups and cache churn. The performance impact depends on the working set, file-cache state, and storage. Test changes under representative import and query loads.

For HNSW insertion, graph searches benefit from an adequately sized cache. Size the cache for the representation in use: a compressed HNSW index caches compressed representations rather than requiring every original float vector in RAM. Flat and HFresh have different layouts, so the HNSW advice is not a universal all-vectors-in-RAM requirement.

For a query-heavy workload, test a cache smaller than the dataset against the actual working set. Applicable caches can clear entries when their thresholds are reached, so subsequent queries may need storage reads to refill them. Include that churn, operating-system file cache, and storage latency in the measurement.

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
