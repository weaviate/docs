---
title: Resource Planning
sidebar_position: 90
description: "CPU, memory, and GPU resource planning guidelines for optimal Weaviate performance at scale."
image: og/docs/concepts.jpg
# tags: ['architecture', 'resource', 'cpu', 'memory', 'gpu']
---

Size a Weaviate deployment from the number of vectors you will index, the properties you will search or filter, and the traffic it must serve. A document can produce several chunks, and each chunk can have several vectors. Object count alone does not establish how much memory or SSD capacity you need. CPU and memory are the primary resources for Weaviate instances. Depending on the modules you use, GPUs may also play a role.

Start with the [worked sizing example](#size-a-hybrid-search-workload), then measure a representative import and query workload before choosing production hardware.


## Limit available resources

You can set [environment variables](/deploy/configuration/env-vars/index.md) to manage Weaviate's Go runtime resource usage. These settings do not cap total process memory or guarantee that imports cannot run out of memory.

- [`LIMIT_RESOURCES`](/deploy/configuration/env-vars/index.md#LIMIT_RESOURCES): Set the literal value `true` to have Weaviate set `GOMAXPROCS` at startup from a detected cgroup CPU quota unless you set it explicitly. This overrides Go's default parallelism when a quota is detected; it does not reserve a CPU core. By default, the automatic Go memory limit is 80% of the cgroup memory limit. An explicit `GOMEMLIMIT` normally takes precedence. If the cgroup has no memory limit, automatic setup may leave the Go memory limit unset. On setup error, Weaviate uses 80% of host memory, which can exceed the container's allocation.
- [`GOMEMLIMIT`](/deploy/configuration/env-vars/index.md#GOMEMLIMIT): Sets a soft memory limit for the Go runtime that influences garbage collection. Leave separate headroom for file mappings, non-Go allocations, and operating-system memory.
- [`GOMAXPROCS`](/deploy/configuration/env-vars/index.md#GOMAXPROCS): Limits how much Go code can execute simultaneously. It does not reserve physical cores or cap the number of OS threads.


## The role of CPUs

HNSW search and index construction can be CPU-intensive when the needed vectors and graph are in memory. A complete request can also be limited by cache misses, fetching objects, storage I/O, or an indexing backlog. You can [tune HNSW settings](../config-refs/indexing/vector-index.mdx) per collection.

HNSW graph traversal is largely single-threaded, but a complete request can include parallel work such as candidate rescoring. If you make multiple searches or inserts at the same time, Weaviate can make use of multiple threads. [Batch inserts](/weaviate/manage-objects/import) use multiple threads to process data in parallel. Multiple shards can expose more import parallelism, including on one node, but they add overhead.

### When to add more CPUs

Add CPUs when measurements show CPU is the bottleneck. Check cache behavior, storage I/O, and indexing queues first: adding CPUs does not resolve those limits.

## The role of memory

:::tip Rule of thumb
For in-memory HNSW, available memory limits the size of the index you can keep resident. Compression and disk-based indexing change the memory, recall, and latency trade-offs.
:::

The HNSW graph is stored in memory. Its size grows with the number of indexed vectors and their connections, while vector compression reduces the vector payload. [Rotational quantization (RQ)](../configuration/compression/rq-compression.md), PQ, SQ, and BQ offer different memory/recall trade-offs. If memory is your main constraint, the disk-based [HFresh index](/weaviate/concepts/vector-index#hfresh-index) is another option: it keeps a compressed centroid index in memory and compressed posting lists on disk, trading peak query throughput for memory efficiency.

Vector residency depends on compression and [cache settings](#vector-cache). Even when fewer vectors are cached, the HNSW graph still occupies memory.

Weaviate also uses [memory-mapped files](https://en.wikipedia.org/wiki/Memory-mapped_file) for data stored on disks. Memory-mapped files are efficient, but disk storage is much slower than in-memory storage.

### Which factors drive memory usage?

For HNSW, estimate the vector and graph working sets separately:

- **The total number and size of vectors**. Count vectors after chunking, rather than source documents. Include each configured vector representation when planning named-vector or multi-vector collections. Dimensions and compression determine the vector payload size.
- **The HNSW graph**. [`maxConnections`](../config-refs/indexing/vector-index.mdx) limits connections per node in the upper layers; the base layer allows `2 * maxConnections`. Graph memory also includes nodes, layer metadata, and allocation overhead. A fixed bytes-per-connection multiplier does not estimate the full graph.

These vector-index components are not the entire process memory footprint. Also budget for [object and inverted-index data structures](./storage.md#object-and-inverted-index-store), resident metadata, caches, the Go runtime and garbage collection, and allocations during queries and imports. Replication creates additional copies across nodes; account for the [shard and replica layout](./replication-architecture/index.md#replication-vs-sharding) when sizing a cluster.

### An example calculation

:::note
The following calculation is a rough planning heuristic for uncompressed HNSW with all vectors in memory, not a measured whole-process RAM requirement. Do not apply the same multiplier to compressed vectors or HFresh. For HNSW vector-cache trade-offs, see [Vector Cache](#vector-cache) below.
:::

For one copy of an uncompressed HNSW index with all vectors cached, a rough starting heuristic is `2 * (raw float32 vector bytes)`. One million 384-dimensional vectors contain `1e6 * 384 * 4 B = 1.536 GB` of raw values. Doubling gives `3.072 GB` (about `2.86 GiB`).

The multiplier does not size graph allocations, property indexes, caches, or peak runtime memory separately. It does not guarantee enough headroom for garbage collection or concurrent work. Measure those costs and account for shard and replica placement before choosing capacity.

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

If you are using **Weaviate Cloud**, check the cluster's [optimization profile and plan](/cloud/manage-clusters/default-settings). **Cost Optimized** defaults new collections to HFresh with built-in compression; **Performance Optimized** defaults them to HNSW with RQ. The free tier uses Cost Optimized and enforces its index type and compression. For an existing collection, check its actual index configuration. The calculations below describe a self-managed deployment, not a Cloud instance size or price estimate.

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
| RAM for the vector index | Add graph links and cache bookkeeping to the cached code payload. Do not treat link bytes as the full graph footprint. | Budget centroid codes, the centroid graph, posting metadata, per-vector version state, and the file pages used to read postings and rescore candidates. |
| Persistent SSD for the vector index | Count retained originals, codes, and on-disk graph data, not just one compressed copy. | Count retained originals, posting codes and metadata, and centroid data. |
| Other RAM and SSD | For either design, budget objects, searchable text and filter indexes separately. Measure resident data, file cache and Go runtime memory during queries and import; do not count the same file-backed pages twice. Leave SSD headroom for ingestion, compaction and recovery apart from backup storage. | Same inputs; measure them in the target configuration. |

For example, **64 GiB RAM and 512 GiB SSD per node** are test allocations, not recommendations. In the all-codes-cached HNSW case, 31.04 GB of codes is about 28.9 GiB, leaving about 35.1 GiB for everything else on a 64 GiB node. Original vectors occupy about 114.4 GiB before any other disk use. These subtotals tell you what to check first; nothing here establishes that the remaining budget fits the graph, indexed text, or import peaks. Use the same initial hardware for HFresh if you want to compare the layouts, then tune the allocation using observed peaks and query results.

### Validate before choosing production hardware

- **Measure steady search and import separately.** Track memory and SSD high-water marks during bulk import, compaction, restart, and steady search. Repeat with concurrent writes if the workload needs them. `GOMEMLIMIT` is a Go runtime control, not a cap on all process memory.
- **Use representative hybrid queries and filters.** Pin the Weaviate version and record the index settings. Hold the corpus, embedding model, filter selectivity and concurrency constant. For each index, tune against the same recall or judged relevance target and record p95/p99 latency, throughput and storage read activity. The payload calculations do not tell you how much SSD I/O an index needs.
- **Test the replica layout under failure.** Check where copies are placed and whether the remaining nodes can serve the target traffic at your chosen [consistency levels](./replication-architecture/consistency.md). A shard with only one copy has no data redundancy; replication is not a backup.

## Effects of garbage collection

Weaviate is written in Go, which is a garbage-collected language. This means some memory is not immediately available for reuse when it is no longer needed. The application has to wait for an asynchronous process, the garbage collector, to free up the memory. This has two distinct effects on memory use:

- [Memory overhead](#memory-overhead-for-the-garbage-collector)
- [Out-of-memory issues](#out-of-memory-issues-due-to-garbage-collection)

### Memory overhead for the garbage collector
Imports and queries allocate temporary memory that Go's garbage collector frees asynchronously. Leave headroom above the measured resident working set. The amount depends on allocation rate, concurrency, and runtime settings; the `2 ×` heuristic is not a bound on peak memory.

### Out-of-Memory issues due to garbage collection
In rare situations - typically on large machines with very high import speeds - Weaviate can allocate memory faster than the garbage collector can free it. When this happens, the system kernel can trigger an `out of memory kill (OOM-Kill)`. This is a known issue that Weaviate is actively working on.

### Data import
To manage Go runtime memory pressure during imports, set `LIMIT_RESOURCES=true` or configure `GOMEMLIMIT`. Monitor actual memory use and tune import pressure if needed. These settings do not replace workload sizing or prevent every OOM. See [Environment variables](/deploy/configuration/env-vars/index.md).

## Strategies to reduce memory usage

The following tactics can help to reduce Weaviate's memory usage:

- **Use vector compression**. For HNSW, [RQ](../configuration/compression/rq-compression.md) is a starting point; [PQ, SQ, and BQ](./vector-quantization.md) are also available. Test the recall, latency, and memory trade-offs on your dataset before using a configuration in production. Check [Cloud defaults](/cloud/manage-clusters/default-settings) before assuming your collection is uncompressed.

- **Consider a disk-based index**. [HFresh](/weaviate/concepts/vector-index#hfresh-index) keeps most vector-index data on disk and rebalances as data changes. It uses mandatory RQ compression, supports `cosine` and `l2-squared` (not dot product), and trades peak query throughput for memory efficiency.

- **Reduce the dimensionality of your vectors.** If you have high dimension vectors, consider using a model that uses fewer dimensions. Fewer dimensions reduce the vector payload. Total memory savings and retrieval quality also depend on the embedding model, index settings, and other allocations.
- **Reduce [`maxConnections`](../config-refs/indexing/vector-index.mdx) for HNSW.** A smaller connection budget can reduce graph memory but can also lower recall. When tuning, `efConstruction` controls construction work and can affect the graph's query behavior; `ef` controls the query-time search budget.
- **Tune the [vector cache](#vector-cache).** Holding fewer vectors in memory can trade memory for storage reads.

## Vector Cache

The following guidance concerns HNSW vector caching. HFresh has a different [centroid and posting-list layout](/weaviate/concepts/vector-index#hfresh-index).

[`vectorCacheMaxObjects`](../config-refs/indexing/vector-index.mdx) sets an entry-count threshold for each applicable vector-index cache. It defaults to one trillion (`1e12`) entries. Shards and named-vector indexes have separate caches, and replicas add copies. Cache maintenance does not enforce an instantaneous allocation limit. The setting is not a byte budget, a process memory cap, or protection against out-of-memory failures.

Keeping the vector representations you search in memory avoids storage lookups. A smaller cache may help if queries mostly touch a subset of vectors, but it can also increase cache churn and disk reads. Measure import throughput and query latency separately under representative load before choosing a cache size.

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
