---
title: Storage
sidebar_position: 18
description: "Persistent, fault-tolerant storage architecture for objects, vectors, and inverted index management, including HNSW snapshots and commit log compaction."
image: og/docs/concepts.jpg
# tags: ['architecture', 'storage']
---

Weaviate is a persistent and fault-tolerant database. This page gives you an overview of how objects and vectors are stored within Weaviate and how an inverted index is created at import time.

The components mentioned on this page aid Weaviate in creating some of its unique features:

* Each write operation is immediately persisted and also tolerant to application and system crashes.
* On a vector search query, Weaviate returns the entire object (in other databases sometimes called a "document"), not just a reference, such as an ID.
* When combining structured search with vector search, filters are applied prior to performing the vector search. This means that you will always receive the specified number of elements as opposed to post-filtering when the final result count is unpredictable.
* Objects and their vectors can be updated or deleted at will, even while reading from the database.

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

Object storage and inverted index storage implement the LSM algorithm, they use segmentation. The vector index uses a different storage algorithm. The vector index does not use segmentation.

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

The [`HNSW_STARTUP_WAIT_FOR_VECTOR_CACHE`](/deploy/configuration/env-vars#HNSW_STARTUP_WAIT_FOR_VECTOR_CACHE) environment variable controls whether vector cache prefill is synchronous (blocking) or asynchronous (background) at startup. Its default changed to `true` in v1.36.6.

For collections where lazy shard loading is active, vector cache prefill is always **asynchronous** — the `HNSW_STARTUP_WAIT_FOR_VECTOR_CACHE` value is overridden to `false` regardless of the configured value. For eagerly-loaded collections, the configured value applies (default: `true`, meaning synchronous prefill).

:::note Behavior change from v1.36.6
Prior to v1.36.6, lazy shard loading was enabled by default for all collections. From v1.36.6 onward, shards are **eagerly loaded by default** until a multi-tenant collection crosses the count or size threshold. This may increase startup time for smaller deployments but provides better reliability during rollouts.
:::

## Persistence and Crash Recovery

### Write-Ahead-Log

Both the LSM stores used for object and inverted storage, as well as the HNSW vector index store make use of memory at some point of the ingestion journey. To prevent data loss on a crash, each operation is additionally written into a **[Write-Ahead-Log (WAL)](https://martinfowler.com/articles/patterns-of-distributed-systems/wal.html)** (also known as a *commit log*). WALs are append-only files that are very efficient to write to and that are rarely a bottleneck for ingestion.

By the time Weaviate has responded with a successful status to your ingestion request, an LSM store WAL entry will have been created. If a WAL entry could not be created - for example because the disks are full - Weaviate will respond with an error to the insert or update request. The HNSW vector index keeps its own commit log, described [below](#hnsw-snapshots). It is written on the same request path, and the two differ in when they are synced to disk.

The LSM stores will try to flush a segment on an orderly shutdown. Only if the operation is successful, will the WAL be marked as "complete". This means that if an unexpected crash happens and Weaviate encounters an "incomplete" WAL, it will recover from it. As part of the recovery process, Weaviate will flush a new segment based on the WAL and mark it as complete. As a result, future restarts will no longer have to recover from this WAL.

For the HNSW vector index, the Write-Ahead-Log (WAL) is a critical component for disaster recovery and persisting the most recent changes. The cost in building up an HNSW index is in figuring out where to place a new object and how to link it with its neighbors. The WAL contains only the result of those calculations.

The entire HNSW index state can be reconstructed by replaying these WAL entries.

For very large indexes of tens or hundreds of millions of objects, this can be time-consuming. To avoid replaying the entire commit log on every restart, Weaviate writes **[HNSW snapshots](#hnsw-snapshots)**.

### HNSW snapshots

import HnswSnapshots from '/_includes/feature-notes/hnsw-snapshots.mdx';

<HnswSnapshots/>

A snapshot represents a point-in-time state of the HNSW index. When Weaviate starts, it loads the most recent snapshot and replays only the commit log entries written after it. This significantly reduces startup time, because the number of entries that have to be replayed no longer grows with the age of the index.

The commit log records every change to the index as it happens. Entries are written to the log as batches are processed, and a log file is synced to disk when it is rotated. Even with a fresh snapshot, Weaviate typically still has to load at least one subsequent commit log file.

Starting in `v1.39`, snapshots are part of how the vector index is stored rather than an optional speedup. A background process called the commit log compactor owns the on-disk lifecycle of the index: it compacts newly flushed commit logs, merges them together, and writes a new snapshot when doing so is worthwhile. Snapshots and commit logs live in the same directory, and a snapshot replaces the commit logs it covers rather than duplicating them, so the commit logs left on disk hold only the delta since the last snapshot. This keeps the disk footprint proportional to the size of the index. Snapshots are also written as a stream. Weaviate still loads the snapshot it supersedes into memory, but the commit log delta and the new snapshot itself are streamed rather than also held there, as they were before `v1.39`.

Upgrading to `v1.39` reduces the disk space the vector index uses, in some cases substantially. Earlier versions keep the full commit log alongside the snapshot, and a snapshot is a more compact representation of the same index than the commit logs it replaces, because compaction keeps only the final state of each vector's connections instead of every change made to them.

A few caveats apply. The saving appears once the compactor has run its first cycles on each loaded shard rather than at the moment you upgrade, and inactive tenants do not shrink until they are next activated. Plan headroom for the peak rather than the steady state: while a snapshot is being written, the directory transiently holds the previous snapshot, the files being merged, and the new snapshot as it is assembled, so disk usage during snapshot creation is meaningfully above the size the index settles at.

Weaviate protects this on-disk state in several ways. Snapshots and compacted commit logs are written to a temporary path and atomically renamed into place, so an interrupted write can never be mistaken for a complete file, and orphaned temporary files are cleaned up on the next startup. When a new snapshot is written, the snapshot it supersedes and the commit logs it covers are removed only after the new one is durably on disk.

Commit logs are self-healing. If a crash leaves the last entry of a log incomplete, the file is truncated back to its last valid entry. The entries written before the tear are retained and the file becomes valid again for later compaction, so only the incomplete tail is lost.

Snapshots are handled differently. A snapshot is stored in a checksummed block format and every block is verified when it is read, but unlike a commit log, a snapshot is not truncated or repaired.

In the rare case that the current snapshot cannot be read, restore the affected data from a [backup](/deploy/configuration/backups.md), which includes the snapshot. Weaviate does not load a partial index, and because the commit logs the snapshot covers have already been removed, nothing remains on the node to replay in its place.

That failure is scoped to the shard that owns the snapshot: the shard fails to load, and so does every other vector index on it. If that shard uses [dynamic lazy shard loading](#dynamic-lazy-shard-loading), the node stays up and requests to the shard return an error. If the shard is loaded eagerly, which is the default for single-tenant collections and for multi-tenant collections below the auto-detection thresholds, node startup fails instead.

Weaviate creates and maintains snapshots automatically, so there is nothing to enable, disable, schedule, or tune. [`PERSISTENCE_HNSW_MAX_LOG_SIZE`](/deploy/configuration/env-vars/index.md#PERSISTENCE_HNSW_MAX_LOG_SIZE) still influences the size at which commit log files are rotated, and therefore how often there is new material to compact, but it does not configure snapshots.

The environment variables that configured snapshots before `v1.39` are deprecated. That version and later still recognize `PERSISTENCE_HNSW_DISABLE_SNAPSHOTS` and the `PERSISTENCE_HNSW_SNAPSHOT_*` variables, so an existing deployment starts without a configuration error, but their values are ignored. For each of these variables that is set, Weaviate logs a warning at startup stating that the variable has no effect and will be removed in a future version. If these options are set through a configuration file rather than as environment variables, they are ignored in the same way, but no startup warning is logged. Remove the variables from your deployment configuration to clear the warnings.

#### Snapshot configuration before `v1.39` {#pre-v1-39-configuration}

In `v1.31` through `v1.38`, snapshots are an optional feature layered on top of the commit log rather than part of it, and the `PERSISTENCE_HNSW_SNAPSHOT_*` environment variables control when Weaviate creates them. Snapshots are enabled by default starting in `v1.36`, and disabled by default in `v1.31` through `v1.35`. Weaviate can create one at startup and periodically thereafter, once enough new commit log data has accumulated since the last snapshot. Only commit log files that have been rotated count toward that threshold, so changes still in the active file are not considered until the next rotation. If a snapshot cannot be read in these versions, it is discarded and Weaviate replays the full commit log instead. For the variables themselves, including their defaults and deprecation status, see [`PERSISTENCE_HNSW_DISABLE_SNAPSHOTS`](/deploy/configuration/env-vars/index.md#PERSISTENCE_HNSW_DISABLE_SNAPSHOTS) and the rows that follow it.

<details>
  <summary>Periodic snapshot conditions and memory requirements</summary>

Periodic snapshot creation is governed by three variables, and **all** of the following conditions must be met before Weaviate creates a snapshot:

- `PERSISTENCE_HNSW_SNAPSHOT_INTERVAL_SECONDS` — the minimum time since the previous snapshot has elapsed (default `21600` seconds, or six hours).
- `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_NUMBER` — enough new commit log files have been created since the last snapshot (default `1`).
- `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_SIZE_PERCENTAGE` — the new commit logs are large enough, measured as a percentage of the previous snapshot's size (default `5`). This condition does not apply to the first snapshot, when there is no previous snapshot to measure against.

Meeting these conditions makes a snapshot eligible rather than guaranteed. The background process that condenses and combines commit log files is also the one that writes the snapshot, so a snapshot can be created on a later pass than the one where the conditions are first met.

In these versions, before creating a new snapshot, Weaviate loads the previous snapshot and the commit log difference into memory, so the node needs enough memory to accommodate both.

</details>

## Conclusions

This page introduced you to the storage mechanisms of Weaviate. It outlined how all writes are persisted to a log before they are acknowledged and outlined the patterns used within Weaviate to make datasets scale well. For structured data, Weaviate makes use of segmentation to keep the write times constant. For the HNSW vector index, Weaviate avoids segmentation to keep query times efficient.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
