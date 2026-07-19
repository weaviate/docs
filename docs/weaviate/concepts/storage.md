---
title: Storage
sidebar_position: 18
description: "Persistent, fault-tolerant storage architecture for objects, vectors, and inverted index management."
image: og/docs/concepts.jpg
# tags: ['architecture', 'storage']
---

Weaviate is a persistent and fault-tolerant database. This page gives you an overview of how objects and vectors are stored within Weaviate and how an inverted index is created at import time.

The components mentioned on this page aid Weaviate in creating some of its unique features:

* Each write operation is immediately persisted and also tolerant to application and system crashes.
* On a vector search query, Weaviate returns the entire object (in other databases sometimes called a "document"), not just a reference, such as an ID.
* When combining structured search with vector search, filters are applied prior to performing the vector search. This means that you will always receive the specified number of elements as opposed to post-filtering when the final result count is unpredictable.
* Objects and their vectors can be updated or deleted at will; even while reading from the database.

## Logical Storage Units: Indexes, Shards, Stores

Each class in Weaviate's user-defined schema leads to the creation of an index internally. An index is a wrapper type that is comprised of one or many shards. Shards within an index are self-contained storage units. Multiple shards can be used to distribute the load among multiple server nodes automatically.

### Components of a Shard

Each shard houses three main components:

* An object store, essentially a key-value store
* An [inverted index](https://en.wikipedia.org/wiki/Inverted_index)
* A vector index store (plugable, currently a [custom implementation of HNSW](/weaviate/config-refs/indexing/vector-index.mdx#hnsw-index))

#### Object and Inverted Index Store

Since version `v1.5.0`, the object and inverted store are implemented using an [LSM-Tree approach](https://en.wikipedia.org/wiki/Log-structured_merge-tree). This means that data can be ingested at the speed of memory and after meeting a configured threshold, Weaviate will write the entire (sorted) memtable into a disk segment. When a read request comes in, Weaviate will first check the Memtable for the latest update for a specific object. If it is not present in the memtable, Weaviate will then check all previously written segments starting with the newest. To avoid checking segments which don't contain the desired objects, [Bloom filters](https://en.wikipedia.org/wiki/Bloom_filter) are used.

Weaviate periodically merges smaller, older segments to make larger segments. Since the segments are already sorted, this is a relatively cheap operation. It happens constantly in the background. Fewer, larger segments make lookups more efficient. In the inverted index data is rarely replaced, but it is often appended. Merging means that, instead of checking all past segments and aggregating potential results, Weaviate can check a single segment (or a few large segments) and immediately find all the relevant object pointers. In addition, segments are used to remove earlier versions of an object that are out-dated because of a delete or a more recent update.

Considerations

Object storage and inverted index storage implement the LSM algorithm; they use segmentation. The vector index uses a different storage algorithm. The vector index does not use segmentation.

Weaviate versions before `v1.5.0` use a B+Tree storage mechanism. The LSM method is faster, it works in constant time, and it improves write performance.

To learn more about Weaviate's LSM store, see the LSM library documentation in the [Go package repository](https://pkg.go.dev/github.com/weaviate/weaviate/adapters/repos/db/lsmkv)

#### HNSW Vector Index Storage

Each shard contains a vector index that corresponds to the object and inverted index stores. The vector store and the other stores are independent. The vector store does not have to manage segmentation.

By grouping a vector index with the object storage within a shard, Weaviate can make sure that each shard is a fully self-contained unit which can independently serve requests for the data it owns. By placing the vector index next to the object store (instead of within), Weaviate can avoid the downsides of a segmented vector index.

Furthermore, its persistence and loading at startup are optimized through a combination of Write-Ahead-Logging and HNSW snapshots, detailed in the [Persistence and Crash Recovery](#persistence-and-crash-recovery) section.

### Shard Components Optimizations

Weaviate's storage mechanisms use segmentation for structured/object data. Segments are cheap to merge and even unmerged segments can be navigated efficiently thanks to Bloom filters. In turn, ingestion speed is high and does not degrade over time.

Weaviate keeps the vector index as large as possible within a shard. HNSW indexes cannot be merged efficiently. Querying a single large index is more efficient than sequentially querying many small indexes.

To use multiple CPUs efficiently, create multiple shards for your collection. For the fastest imports, create multiple shards even on a single node.

### Lazy shard loading

When Weaviate starts, it loads data from all of the shards in your deployment. This process can take a long time. Since every tenant is a shard, multi-tenant deployments with many tenants can have reduced availability after a restart.

Lazy shard loading allows you to start working with your data sooner. After a restart, shards load in the background. If the shard you want to query is already loaded, you can get your results sooner. If the shard is not loaded yet, Weaviate prioritizes loading that shard and returns a response when it is ready.

#### Dynamic lazy shard loading

:::info Added in `v1.36.6`
:::

Starting in v1.36.6, Weaviate automatically decides **per collection** whether to use lazy shard loading. Auto-detection only applies to **multi-tenant** collections and is based on two thresholds:

- **Shard count threshold** ([`LAZY_LOAD_SHARD_COUNT_THRESHOLD`](/docs/deploy/configuration/env-vars/index.md#LAZY_LOAD_SHARD_COUNT_THRESHOLD)): Number of shards (tenants) in a collection. Default: `1000`.
- **Shard size threshold** ([`LAZY_LOAD_SHARD_SIZE_THRESHOLD_GB`](/docs/deploy/configuration/env-vars/index.md#LAZY_LOAD_SHARD_SIZE_THRESHOLD_GB)): Total shard size for a collection. Default: `100` GB.

If either threshold is exceeded, that collection's shards are lazy-loaded at startup. Otherwise, shards are loaded eagerly (synchronously) before Weaviate reports ready. Single-tenant collections are always eagerly loaded unless `LAZY_LOAD_SHARD_COUNT_THRESHOLD` is set to `0`, which forces lazy loading for all collections.

This change improves reliability during rolling restarts and upgrades. Eager loading eliminates the increased query and ingestion latency that lazy loading can introduce for smaller deployments during rollouts.

#### Vector cache prefill behavior

The [`HNSW_STARTUP_WAIT_FOR_VECTOR_CACHE`](/deploy/configuration/env-vars#hnsw_startup_wait_for_vector_cache) environment variable controls whether vector cache prefill is synchronous (blocking) or asynchronous (background) at startup. Its default changed to `true` in v1.36.6.

For collections where lazy shard loading is active, vector cache prefill is always **asynchronous** — the `HNSW_STARTUP_WAIT_FOR_VECTOR_CACHE` value is overridden to `false` regardless of the configured value. For eagerly-loaded collections, the configured value applies (default: `true`, meaning synchronous prefill).

:::note Behavior change from v1.36.6
Prior to v1.36.6, lazy shard loading was enabled by default for all collections. From v1.36.6 onward, shards are **eagerly loaded by default** until a multi-tenant collection crosses the count or size threshold. This may increase startup time for smaller deployments but provides better reliability during rollouts.
:::

## Persistence and Crash Recovery

### Write-Ahead-Log

Both the LSM stores used for object and inverted storage, as well as the HNSW vector index store make use of memory at some point of the ingestion journey. To prevent data loss on a crash, each operation is additionally written into a **[Write-Ahead-Log (WAL)](https://martinfowler.com/articles/patterns-of-distributed-systems/wal.html)** (also known as a *commit log*). WALs are append-only files that are very efficient to write to and that are rarely a bottleneck for ingestion.

By the time Weaviate has responded with a successful status to your ingestion request, a WAL entry will have been created. If a WAL entry could not be created - for example because the disks are full - Weaviate will respond with an error to the insert or update request.

The LSM stores will try to flush a segment on an orderly shutdown. Only if the operation is successful, will the WAL be marked as "complete". This means that if an unexpected crash happens and Weaviate encounters an "incomplete" WAL, it will recover from it. As part of the recovery process, Weaviate will flush a new segment based on the WAL and mark it as complete. As a result, future restarts will no longer have to recover from this WAL.

For the HNSW vector index, the Write-Ahead-Log (WAL) is a critical component for disaster recovery and persisting the most recent changes. The cost in building up an HNSW index is in figuring out where to place a new object and how to link it with its neighbors. The WAL contains only the result of those calculations.

The entire HNSW index state can be reconstructed by replaying these WAL entries.

For very large indexes of tens or hundreds of millions of objects, this can be time-consuming. To avoid replaying the entire WAL on every restart, Weaviate periodically writes **[HNSW snapshots](../configuration/hnsw-snapshots.md)**.

### HNSW snapshots

import HnswSnapshots from '/_includes/feature-notes/hnsw-snapshots.mdx';

<HnswSnapshots/>

For very large HNSW vector indexes, HNSW snapshots significantly reduce the startup time.

A snapshot represents a point-in-time state of the HNSW index. When Weaviate starts, if a snapshot exists, it is loaded first, and only the changes made after the snapshot was taken are replayed from the WAL. This significantly reduces startup time, because the number of WAL entries that have to be processed no longer grows with the age of the index.

The WAL is still used to persist every change immediately, guaranteeing that any acknowledged write is durable. Even with a fresh snapshot, the server typically still has to load at least one subsequent commit log file.

Starting in `v1.39`, snapshots are part of how the vector index is stored rather than an optional speedup, and Weaviate manages them automatically. A background compactor owns the on-disk lifecycle of the index: it converts each newly flushed commit log into a sorted file, merges sorted files together, and writes a new snapshot when doing so is worthwhile. Snapshot and commit log files live in the same directory, and a snapshot replaces the files it covers rather than duplicating them, which keeps the disk footprint proportional to the size of the index.

Because the merge reads its inputs as sorted streams from disk, only the most recently flushed commit log is processed in memory. That step has a fixed cost regardless of how large the graph is, so snapshot creation no longer requires enough memory to hold the previous snapshot plus the commit log delta.

Weaviate protects this on-disk state in several ways. New files are written to a temporary path and atomically renamed into place, so an interrupted write can never be mistaken for a complete file, and orphaned temporary files are cleaned up on the next startup. Snapshots are stored in a checksummed block format. If a file cannot be read in full, whether it is a commit log with a torn tail after a crash or a compacted segment damaged on disk, it is truncated back to its last valid entry. The entries written before the damage are retained, and the file becomes valid again so that later compaction can read it. Only the damaged tail is lost, and it is unrecoverable in any case.

See **[the HNSW snapshots configuration](../configuration/hnsw-snapshots.md)** for version-specific details.

:::note Behavior before `v1.39`
In `v1.31` through `v1.38`, snapshots are an optional feature layered on top of the commit log, and are configured with the `PERSISTENCE_HNSW_SNAPSHOT_*` environment variables. They are enabled by default starting in `v1.36`, and disabled by default in `v1.31` through `v1.35`. In these versions, Weaviate creates a snapshot at startup if the commit log changed since the last snapshot, and periodically once a configured time interval has passed and enough new commit log data has accumulated. If a snapshot cannot be loaded, it is removed and Weaviate falls back to loading the full commit log from the beginning. In `v1.39` and later, a snapshot that cannot be read is a startup error instead, because the commit logs it covers no longer exist as a separate copy.
:::

## Conclusions

This page introduced you to the storage mechanisms of Weaviate. It outlined how all writes are persisted immediately and outlined the patterns used within Weaviate to make datasets scale well. For structured data, Weaviate makes use of segmentation to keep the write times constant. For the HNSW vector index, Weaviate avoids segmentation to keep query times efficient.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
