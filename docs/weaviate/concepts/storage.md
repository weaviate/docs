---
title: Storage
sidebar_position: 18
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
* A vector index store (plugable, currently a [custom implementation of HNSW](/docs/weaviate/config-refs/schema/vector-index#hnsw-indexes))

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

### Shard Components Optimizations

Weaviate's storage mechanisms use segmentation for structured/object data. Segments are cheap to merge and even unmerged segments can be navigated efficiently thanks to Bloom filters. In turn, ingestion speed is high and does not degrade over time.

Weaviate keeps the vector index as large as possible within a shard. HNSW indexes cannot be merged efficiently. Querying a single large index is more efficient than sequentially querying many small indexes.

To use multiple CPUs efficiently, create multiple shards for your collection. For the fastest imports, create multiple shards even on a single node.

### Lazy shard loading

:::info Added in `v1.23`
:::

When Weaviate starts, it loads data from all of the shards in your deployment. This process can take a long time. Prior to v1.23, you have to wait until all of the shards are loaded before you can query your data. Since every tenant is a shard, multi-tenant deployments can have reduced availability after a restart.

Lazy shard loading allows you to start working with your data sooner. After a restart, shards load in the background. If the shard you want to query is already loaded, you can get your results sooner. If the shard is not loaded yet, Weaviate prioritizes loading that shard and returns a response when it is ready.

To enable lazy shard loading, set the `DISABLE_LAZY_LOAD_SHARDS` environment variable to `false` in your system configuration file.

:::caution Disable lazy shard loading for single-tenant collections
For single-tenant collections, lazy loading can cause import operations to slow down or partially fail. In these scenarios, we recommend disabling lazy shard loading.
:::

## Persistence and Crash Recovery

Both the LSM stores used for object and inverted storage, as well as the HNSW vector index store make use of memory at some point of the ingestion journey. To prevent data loss on a crash, each operation is additionally written into a [Write-Ahead-Log (WAL)](https://martinfowler.com/articles/patterns-of-distributed-systems/wal.html). WALs are append-only files that are very efficient to write to and that are rarely a bottleneck for ingestion.

By the time Weaviate has responded with a successful status to your ingestion request, a WAL entry will have been created. If a WAL entry could not be created - for example because the disks are full - Weaviate will respond with an error to the insert or update request.

The LSM stores will try to flush a segment on an orderly shutdown. Only if the operation is successful, will the WAL be marked as "complete". This means that if an unexpected crash happens and Weaviate encounters an "incomplete" WAL, it will recover from it. As part of the recovery process, Weaviate will flush a new segment based on the WAL and mark it as complete. As a result, future restarts will no longer have to recover from this WAL.

For the HNSW vector index, the WAL serves two purposes: It is both the disaster-recovery mechanism, as well as the primary persistence mechanism. The cost in building up an HNSW index is in figuring out where to place a new object and how to link it with its neighbors. The WAL contains only the result of those calculations. Therefore, by reading the WAL into memory, the HNSW index will be in the same state as it was prior to a shutdown.

Over time, an append only WAL will contain a lot of redundant information. For example, imagine two subsequent entries which reassign all the links of a specific node. The second operation will completely replace the result of the first operation, thus the WAL no longer needs the first entry. To keep the WALs fresh, a background process will continuously compact WAL files and remove redundant information. This keeps the disk footprint small and the startup times fast, as Weaviate does not need to store (or load) outdated information.

As a result, any change to the HNSW index is immediately persisted and there is no need for periodic snapshots.

## Conclusions

This page introduced you to the storage mechanisms of Weaviate. It outlined how all writes are persisted immediately and outlined the patterns used within Weaviate to make datasets scale well. For structured data, Weaviate makes use of segmentation to keep the write times constant. For the HNSW vector index, Weaviate avoids segmentation to keep query times efficient.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
