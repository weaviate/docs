---

title: Async Replication

---

import AsyncReplicationPerCollectionConfig from '/_includes/async-replication-per-collection-config.mdx';

Introduced to GA in the 1.29 release, Async Replication is a mechanism used to ensure eventual consistency across nodes in a distributed cluster. It works as a background process that automatically keeps nodes in sync without requiring user queries. Previously, consistency was achieved through "read repair" which involved nodes comparing data during a read request and exchanging missing or outdated information. This approach guarantees eventual consistency without requiring read operations. 

:::info

This applies solely to data objects, as metadata consistency is treated differently (through RAFT consensus).
:::

### Under the Hood

- Async replication operates as a background process either per tenant (in a multi-tenant collection) or per shard (in a non-multi-tenant collection).
- It is disabled by default but can be enabled through collection configuration changes, similar to setting the replication factor. 

## Environment Variable Deep Dive

These environment variables can be used to fine-tune behavior for your specific use case or deployment environment. 

:::tip
The optimal values for these variables will ultimately depend on factors like: data size, network conditions, write patterns, and the desired level of eventual consistency.
:::

<AsyncReplicationPerCollectionConfig />

## Use Cases

### General

<details>

<summary> Feature Control </summary>
#### `ASYNC_REPLICATION_DISABLED`
Globally disables the entire async replication feature.

- Its default value is `false`. 
- **Use case**: This is useful when you have many tenants or collections where a temporary global disable is needed, like during debugging or critical maintenance. 
- **Special Considerations**:
  - This overrides any collection configuration.

</details>

<details>
<summary> Cluster Worker Limits </summary>

#### `ASYNC_REPLICATION_CLUSTER_MAX_WORKERS`
Sets the maximum number of concurrent async replication workers across the entire cluster.

- Its default value is `30`.
- **Use case**: Limits the total number of concurrent replication workers to prevent resource exhaustion in large clusters with many collections or tenants.
- **Special Considerations**:
  - This is a cluster-wide cap. Individual collections can set their own `maxWorkers` via the per-collection [`asyncConfig`](/weaviate/config-refs/collections#async-config), but the total across all collections will not exceed this cluster limit.

</details>

<details>
<summary>Replication Control </summary>

#### `ASYNC_REPLICATION_PROPAGATION_LIMIT`
Defines the maximum number of objects that will be propagated in a single async replication iteration (after one hash tree comparison).
  - By default is set to 10,000.
  - **Use Case(s)**: Can be adjusted based on network capacity and the desired rate of convergence.
  - **Considerations**: Even if more than this number of differences are detected, only this many objects will be propagated in the current iteration. Subsequent iterations will handle the remaining differences.


#### `ASYNC_REPLICATION_PROPAGATION_DELAY`
Introduces a delay before considering an object for propagation. Only objects older than this delay are considered.
  - Its default value is `30s`. The value requires a time unit suffix (e.g. `30s`, `1m`).
  - **Use Case(s)**: If an object is inserted into one node but the insertion is still in progress, the hash comparison might detect it. This delay prevents the async replication from trying to propagate it before the local write operation is fully complete.
  - **Considerations**: This should be set based on the typical write latency of the system.
</details>

<details>
<summary> Operational Visibility </summary>

#### `ASYNC_REPLICATION_LOGGING_FREQUENCY`
Controls how often the background async replication process logs its activity.
  - Its default value is `60s`. The value requires a time unit suffix (e.g. `30s`, `2m`).
  - **Use Case(s)**: Increasing the frequency provides more detailed logs, while decreasing it reduces log verbosity.
</details>

### Performance Tuning

<details>

<summary> Memory Optimization </summary>

#### `ASYNC_REPLICATION_HASHTREE_HEIGHT`
Customizes the height of the hash tree built by each node to represent its locally stored data. 
- By default the value is set to `16` for single-tenant collections (~2MB of RAM per shard on each node) and `10` for multi-tenant collections (~16KB per tenant per node).
- **Use case(s)**: 
  - In multi-tenant setups with a large number of tenants, reducing the hash tree would minimize the memory footprint. 
  - For very large collections, a larger hash tree could be more beneficial for more efficient identification of differing data ranges. 
- **Special Considerations**:
  - Modification of the hash tree height requires rebuilding the hash tree on each node, which involves iterating over all existing objects. 

</details>

<details>

<summary> Throughput and Concurrency </summary>

#### `ASYNC_REPLICATION_PROPAGATION_CONCURRENCY`
Controls the number of concurrent goroutines (or threads) used to send batches of objects during the propagation phase.
  - By default it is set to 5.
  - **Considerations**: Increasing concurrency can improve propagation speed, but needs to be balanced with potential resource contention (CPU, network).

</details>

<details>

<summary> Batch Processing </summary>

#### `ASYNC_REPLICATION_DIFF_BATCH_SIZE`
Sets the number of object metadata fetched per request during the comparison phase.
  - By default it is set to 1000.
  - **Use Case(s)**: May be increased to potentially improve performance if network latency is low and nodes can handle larger requests.
  - **Considerations**: Fetching metadata in batches optimizes network communication.


#### `ASYNC_REPLICATION_PROPAGATION_BATCH_SIZE`
Sets the maximum number of objects included in each batch when propagating data to a remote node.
  - By default is set to 100.
  - **Use Case(s)**: 
    - For large objects, reducing the batch size can help manage memory usage during propagation. The batch size could be similar to the batch size used during initial data insertion.
    - For smaller objects, increasing the batch size might improve propagation efficiency by reducing the overhead of individual requests, but needs to be balanced with potential memory pressure.
  - **Considerations**: This setting is particularly important for large objects, as larger batches can lead to higher memory consumption during transmission. Multiple batches may be sent within a single iteration to reach the `ASYNC_REPLICATION_PROPAGATION_LIMIT`.

</details>

### Consistency Tuning

<details>

<summary> Synchronization Frequency </summary>
#### `ASYNC_REPLICATION_FREQUENCY`
Defines how often each node initiates the process of comparing its local data (via the hash tree) with other nodes storing the same shard. This regularly checks for inconsistencies, even if no changes have been explicitly triggered.
- Its default value is `30s`. The value requires a time unit suffix (e.g. `30s`, `1m`).
- **Use Case(s)**
  - Decreasing the frequency can be beneficial for applications that require faster convergence to eventual consistency. 
  - Increasing the frequency can be beneficial for reducing the load on the system by relaxing the eventual consistency. 

#### `ASYNC_REPLICATION_FREQUENCY_WHILE_PROPAGATING`
Defines a shorter frequency for subsequent comparison and propagation attempts when a previous propagation cycle did not complete (i.e., not all detected differences were synchronized).
  - Its default value is `3s`. The value requires a time unit suffix (e.g. `3s`, `1m`).
  -  **Use Case(s)**: When inconsistencies are known to exist, this expedites the synchronization process.
  - **Considerations**: This is activated after a propagation cycle detects differences but does not propagate all of them due to limits. 

</details>

<details>
<summary> Node Status Monitoring </summary>

#### `ASYNC_REPLICATION_ALIVE_NODES_CHECKING_FREQUENCY`
Defines the frequency at which the system checks for changes in the availability of nodes within the cluster.
  - Its default value is `5s`. The value requires a time unit suffix (e.g. `5s`, `1m`).
  - **Use Case(s)**: When a node rejoins the cluster after a period of downtime, it is highly likely to be out of sync. This setting ensures that the replication process is initiated promptly.

</details>

<details>
<summary>Timeout Management </summary>

#### `ASYNC_REPLICATION_DIFF_PER_NODE_TIMEOUT`
Defines the maximum time to wait for a response when requesting object metadata from a remote node during the comparison phase, this prevents indefinite blocking if a node is unresponsive.
  - Its default value is `10s`. The value requires a time unit suffix (e.g. `10s`, `1m`).
  - **Use Case(s)**: May need to be increased in environments with high network latency or potentially slow-responding nodes.

#### `ASYNC_REPLICATION_PRE_PROPAGATION_TIMEOUT`
Sets a delay before propagation begins to allow in-progress write operations to complete across nodes. This prevents propagation from starting before all nodes have finished processing recent writes.
  - Its default value is `5m`. The value requires a time unit suffix (e.g. `5m`, `10m`).
  - **Use Case(s)**: May need to be increased in environments with slow write operations or high write latency across nodes.
  - **Considerations**: This timeout applies before the propagation phase begins. If writes typically take longer to replicate, increasing this value helps avoid premature propagation.

#### `ASYNC_REPLICATION_PROPAGATION_TIMEOUT`
Sets the maximum time allowed for a single propagation request (sending actual object data) to a remote node.
  - Its default value is `1m`. The value requires a time unit suffix (e.g. `30s`, `2m`).
  - **Use Case(s)**: May need to be increased in scenarios with high network latency, large object sizes (e.g., images, vectors), or when sending large batches of objects.
  - **Considerations**: Network latency, batch size, and the size of the objects being propagated can all affect timeouts.

</details>



### Further Resources

- [Concepts: Replication](/weaviate/concepts/replication-architecture/consistency)

- [Replication How-To](/deploy/configuration/replication.md#async-replication-settings)

- [Environment Variables](/deploy/configuration/env-vars/index.md#async-replication)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
