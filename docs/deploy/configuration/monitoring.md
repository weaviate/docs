---
title: Monitoring
image: og/docs/configuration.jpg
# tags: ['configuration', 'operations', 'monitoring', 'observability']
---

Weaviate can expose Prometheus-compatible metrics for monitoring. A standard
Prometheus/Grafana setup can be used to visualize metrics on various
dashboards.

Metrics can be used to measure request latencies, import
speed, time spent on vector vs object storage, memory usage, application usage,
and more.

## Configure Monitoring

### Enable within Weaviate

To tell Weaviate to collect metrics and expose them in a Prometheus-compatible
format, all that's required is to set the following [environment variable](./env-vars/index.md#PROMETHEUS_MONITORING_ENABLED):

```sh
PROMETHEUS_MONITORING_ENABLED=true
```

By default, Weaviate will expose the metrics at `<hostname>:2112/metrics`. You
can optionally change the port to a custom port using the following environment
variable:

```sh
PROMETHEUS_MONITORING_PORT=3456
```

<details>
  <summary>Advanced metrics configuration options</summary>

These are all the variables that shape the metrics Weaviate exposes. They take effect only while `PROMETHEUS_MONITORING_ENABLED` is `true`:

| Variable | Description | Default |
| --- | --- | --- |
| [`PROMETHEUS_MONITORING_ENABLED`](./env-vars/index.md#PROMETHEUS_MONITORING_ENABLED) | Collect metrics and serve them at `/metrics`. | `false` |
| [`PROMETHEUS_MONITORING_PORT`](./env-vars/index.md#PROMETHEUS_MONITORING_PORT) | Port the metrics endpoint listens on. | `2112` |
| [`PROMETHEUS_MONITORING_GROUP`](./env-vars/index.md#PROMETHEUS_MONITORING_GROUP) | Group metrics for the same collection across all shards, rather than reporting one series per shard. The `class_name` and `shard_name` labels collapse to `n/a`, and the per-segment LSM and vector-dimension metrics are not reported. | `false` |
| [`PROMETHEUS_MONITORING_METRIC_NAMESPACE`](./env-vars/index.md#PROMETHEUS_MONITORING_METRIC_NAMESPACE) | Namespace reserved for metric names. | `""` |
| [`PROMETHEUS_MONITOR_CRITICAL_BUCKETS_ONLY`](./env-vars/index.md#PROMETHEUS_MONITOR_CRITICAL_BUCKETS_ONLY) | Report per-segment LSM metrics only for the objects bucket and the compressed-vector buckets. Cuts cardinality on clusters with many collections or tenants. | `false` |

</details>

### Scrape metrics from Weaviate

Metrics are typically scraped into a time-series database, such as Prometheus.
How you consume metrics depends on your setup and environment.

The [`weaviate/grafana-dashboard-weaviate`](https://github.com/weaviate/grafana-dashboard-weaviate)
repository holds a Docker Compose stack you can start with a single command to see the whole pipeline
working locally. It wires together:

- a multi-node Weaviate cluster with `PROMETHEUS_MONITORING_ENABLED` set, as described above;
- a Prometheus instance configured to scrape every node;
- a Grafana instance with Prometheus as its datasource and the [dashboards](#sample-dashboards) below
  already provisioned.

In Kubernetes, the [Weaviate Helm chart](/deploy/installation-guides/k8s-installation.md) can create
the scrape target for you: set `serviceMonitor.enabled=true` alongside
`env.PROMETHEUS_MONITORING_ENABLED=true` and the Prometheus Operator discovers every pod.

### Multi-tenancy

When using multi-tenancy, we suggest setting the `PROMETHEUS_MONITORING_GROUP` [environment variable](./env-vars/index.md#PROMETHEUS_MONITORING_GROUP) as `true` so that data across all tenants are grouped together for monitoring.

With grouping on, metrics that carry `class_name` and `shard_name` report both labels as `n/a`, and the per-segment LSM metrics and the `vector_dimensions_sum` / `vector_segments_sum` gauges are not reported at all. That keeps the number of series manageable on a cluster with many collections or tenants, at the cost of being able to break a metric down by collection or shard.

## Obtainable Metrics

:::info Versioning & breaking changes

Be aware that metrics do not follow the semantic versioning guidelines of other Weaviate features. Weaviate's main APIs are stable and breaking changes are extremely rare. Metrics, however, have shorter feature lifecycles. It can sometimes be necessary to introduce an incompatible change or entirely remove a metric, for example, because the cost of observing a specific metric in production has grown too high. As a result, it is possible that a Weaviate minor release contains a breaking change for the Monitoring system. If so, it will be clearly highlighted in the [release notes](https://github.com/weaviate/weaviate/releases).

:::

The list of metrics that are obtainable through Weaviate's metric system is constantly being expanded. The tables below describe the metrics a release exposes, but the definitive list for the version you are running is the output of the endpoint itself:

```sh
curl -s localhost:2112/metrics | grep '^# HELP'
```

Metrics are declared across a couple of dozen files in [`weaviate/weaviate`](https://github.com/weaviate/weaviate); [`usecases/monitoring/prometheus.go`](https://github.com/weaviate/weaviate/blob/main/usecases/monitoring/prometheus.go) holds most of them, with the rest next to the subsystem they measure.

Which metrics appear depends on how the node is configured. Module metrics (vectorizers, backup backends, usage, tenant offload) exist only while the corresponding module is enabled, and a metric for a feature the node has never exercised is absent until it is used for the first time.

This page describes metrics and their uses. Typically metrics are quite granular, as they can always be aggregated later on. For example if the granularity is "shard", you could aggregate all "shard" metrics of the same "class" (collection) to obtain a class metrics, or aggregate all metrics to obtain the metric for the entire Weaviate instance.

### General & build information

| Metric                                      | Description                                                                                                                   | Labels                                       | Type    |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------- |
| `weaviate_build_info`                       | Provides general information about the build (What version is currently running? How long has this version been running, etc) | `version`, `revision`, `branch`, `tags`, `goversion`, `goos`, `goarch` | `Gauge` |
| `weaviate_runtime_config_hash`              | Hash value of the currently active runtime configuration, useful for tracking when new configurations take effect             | `sha256`                                     | `Gauge` |
| `weaviate_runtime_config_last_load_success` | Indicates whether the last loading attempt was successful (`1` for success, `0` for failure)                                  | None                                         | `Gauge` |
| `weaviate_schema_collections`               | Shows the total number of collections at any given point                                                                      | `nodeID`, `collection_namespace`             | `Gauge` |
| `weaviate_schema_shards`                    | Shows the total number of shards at any given point                                                                           | `nodeID`, `status` (HOT, COLD, WARM, FROZEN, or empty for collections without multi-tenancy) | `Gauge` |

### Object and query operations

#### Batch operations

| Metric                          | Description                                                                                                                                                                                             | Labels                                  | Type        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------- |
| `batch_durations_ms`            | Duration of a single batch operation in ms. The `operation` label further defines what operation as part of the batch (e.g. object, inverted, vector) is being used. Granularity is a shard of a class. | `operation`, `class_name`, `shard_name` | `Histogram` |
| `batch_delete_durations_ms`     | Duration of a batch delete in ms. The `operation` label further defines what operation as part of the batch delete is being measured. Granularity is a shard of a class                                 | `operation`, `class_name`, `shard_name` | `Summary`   |
| `batch_size_bytes`              | Size of a raw batch request batch in bytes                                                                                                                                                              | `api`                                   | `Summary`   |
| `batch_size_objects`            | Number of objects in a batch                                                                                                                                                                            | None                                    | `Summary`   |
| `batch_size_tenants`            | Number of unique tenants referenced in a batch                                                                                                                                                          | None                                    | `Summary`   |
| `batch_objects_processed_total` | Number of objects processed in a batch                                                                                                                                                                  | `class_name`, `shard_name`              | `Counter`   |
| `batch_objects_processed_bytes` | Number of bytes processed in a batch                                                                                                                                                                    | `class_name`, `shard_name`              | `Counter`   |
| `weaviate_batch_streaming_enqueued_objects_total` | Total number of objects and references enqueued for processing across all streams. | None | `Gauge` |
| `weaviate_batch_streaming_open_streams` | Number of currently open batch streaming connections. | None | `Gauge` |
| `weaviate_batch_streaming_processing_throughput_ema` | Exponential moving average of the throughput (objects / second) for the internal processing queue. | None | `Histogram` |
| `weaviate_batch_streaming_total_errors` | Total number of errors reported across all streams. | None | `Counter` |
| `weaviate_batch_streaming_total_streams` | Total number of batch streaming connections started. | None | `Counter` |

#### Object operations

| Metric                 | Description                                                                                                                                                                                                                                  | Labels                                          | Type      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------- |
| `object_count`         | Numbers of objects present. Granularity is a shard of a class                                                                                                                                                                                | `class_name`, `shard_name`                      | `Gauge`   |
| `objects_durations_ms` | Duration of an individual object operation, such as `put`, `delete`, etc. as indicated by the `operation` label, also as part of a batch. The `step` label adds additional precision to each `operation`. Granularity is a shard of a class. | `operation`, `step`, `class_name`, `shard_name` | `Summary` |

#### Query operations

| Metric                                 | Description                                                                                                  | Labels                                      | Type        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ----------- |
| `concurrent_queries_count`             | Number of concurrently running query operations                                                              | `class_name`, `query_type`                  | `Gauge`     |
| `queries_durations_ms`                 | Duration of queries in milliseconds                                                                          | `class_name`, `query_type`                  | `Histogram` |
| `queries_filtered_vector_durations_ms` | Duration of queries in milliseconds                                                                          | `class_name`, `shard_name`, `operation`     | `Summary`   |
| `requests_total`                       | Metric that tracks all user requests to determine if it was successful or failed                             | `status`, `class_name`, `api`, `query_type` | `Gauge`     |
| `query_dimensions_total`               | The vector dimensions used by any read-query that involves vectors                                           | `query_type`, `operation`, `class_name`     | `Counter`   |
| `query_dimensions_combined_total`      | The vector dimensions used by any read-query that involves vectors, aggregated across all classes and shards | None                                        | `Counter`   |
| `graphql_namespaces_blocked_requests_total` | Requests rejected at the GraphQL endpoint because namespaces are enabled, which makes the GraphQL API unavailable. | None | `Counter` |
| `query_admission_grant_size` | Distribution of granted budget per admitted query. | None | `Histogram` |
| `query_admission_inflight` | Number of queries currently holding an admission grant. | None | `Gauge` |
| `query_admission_shed_total` | Total queries shed because the node was overloaded and the wait queue was full. | None | `Counter` |
| `query_admission_used_budget` | Currently granted goroutine-equivalent budget across all admitted queries. | None | `Gauge` |
| `query_admission_wait_duration_seconds` | Time queued queries spent waiting before admission or cancellation. | None | `Histogram` |
| `query_admission_waiting` | Number of queries currently waiting for admission. | None | `Gauge` |

#### Object TTL

These metrics track the background job that deletes expired objects for collections with a [time-to-live](/weaviate/manage-collections/time-to-live.mdx) configured. A cycle looks up the UUIDs of expired objects, then deletes them in batches, so the three families below measure consecutive stages of the same work.

| Metric | Description | Labels | Type |
| --- | --- | --- | --- |
| `weaviate_objects_ttl_deletion_batchdeletes_count` | Completed batch deletes of expired objects. | None | `Counter` |
| `weaviate_objects_ttl_deletion_batchdeletes_duration_seconds` | Duration of a batch delete of expired objects. | None | `Histogram` |
| `weaviate_objects_ttl_deletion_batchdeletes_failure_count` | Batch deletes of expired objects that ended in error. | None | `Counter` |
| `weaviate_objects_ttl_deletion_batchdeletes_objects_deleted` | Expired objects deleted, per shard or tenant. | None | `Counter` |
| `weaviate_objects_ttl_deletion_batchdeletes_running` | Batch deletes of expired objects currently running. | None | `Gauge` |
| `weaviate_objects_ttl_deletion_db_count` | Completed TTL deletion cycles across the database. | None | `Counter` |
| `weaviate_objects_ttl_deletion_db_duration_seconds` | Duration of a TTL deletion cycle across the database. | None | `Histogram` |
| `weaviate_objects_ttl_deletion_db_failure_count` | TTL deletion cycles that ended in error. | None | `Counter` |
| `weaviate_objects_ttl_deletion_db_objects_deleted` | Expired objects deleted across the database. | None | `Counter` |
| `weaviate_objects_ttl_deletion_db_running` | TTL deletion cycles currently running. | None | `Gauge` |
| `weaviate_objects_ttl_deletion_finduuids_count` | Completed lookups of the UUIDs of expired objects. | None | `Counter` |
| `weaviate_objects_ttl_deletion_finduuids_duration_seconds` | Duration of a lookup of the UUIDs of expired objects. | None | `Histogram` |
| `weaviate_objects_ttl_deletion_finduuids_failure_count` | Expired-object lookups that ended in error. | None | `Counter` |
| `weaviate_objects_ttl_deletion_finduuids_objects_found` | Expired objects found, per shard or tenant. | None | `Counter` |
| `weaviate_objects_ttl_deletion_finduuids_running` | Expired-object lookups currently running. | None | `Gauge` |

#### HTTP and gRPC servers

Server-side request metrics for the REST and gRPC APIs. The `route` label on the HTTP metrics is the matched route template, not the raw path, so it stays bounded.

| Metric | Description | Labels | Type |
| --- | --- | --- | --- |
| `weaviate_grpc_server_request_duration_seconds` | Time (in seconds) spent serving requests. | `grpc_service`, `method`, `status` | `Histogram` |
| `weaviate_grpc_server_request_size_bytes` | Size (in bytes) of the request received. | `grpc_service`, `method` | `Histogram` |
| `weaviate_grpc_server_requests_inflight` | Current number of inflight requests. | `grpc_service`, `method` | `Gauge` |
| `weaviate_grpc_server_response_size_bytes` | Size (in bytes) of the response sent. | `grpc_service`, `method` | `Histogram` |
| `weaviate_http_request_duration_seconds` | Time (in seconds) spent serving requests. | `method`, `route`, `status_code` | `Histogram` |
| `weaviate_http_request_size_bytes` | Size (in bytes) of the request received. | `method`, `route` | `Histogram` |
| `weaviate_http_requests_inflight` | Current number of inflight requests. | `method`, `route` | `Gauge` |
| `weaviate_http_response_size_bytes` | Size (in bytes) of the response sent. | `method`, `route` | `Histogram` |

### Vector index

#### General vector index

| Metric                                                 | Description                                                                                                                                                                                    | Labels                                          | Type      |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------- |
| `vector_index_size`                                    | The total capacity of the vector index. Typically larger than the number of vectors imported as it grows proactively.                                                                          | `class_name`, `shard_name`                      | `Gauge`   |
| `vector_index_operations`                              | Total number of mutating operations on the vector index. The operation itself is defined by the `operation` label.                                                                             | `operation`, `class_name`, `shard_name`         | `Gauge`   |
| `vector_index_durations_ms`                            | Duration of regular vector index operation, such as insert or delete. The operation itself is defined through the `operation` label. The `step` label adds more granularity to each operation. | `operation`, `step`, `class_name`, `shard_name` | `Summary` |
| `vector_index_maintenance_durations_ms`                | Duration of a sync or async vector index maintenance operation. The operation itself is defined through the `operation` label.                                                                 | `operation`, `class_name`, `shard_name`         | `Summary` |
| `vector_index_tombstones`                              | Number of currently active tombstones in the vector index. Will go up on each incoming delete and go down after a completed repair operation.                                                  | `class_name`, `shard_name`                      | `Gauge`   |
| `vector_index_tombstone_cleanup_threads`               | Number of currently active threads for repairing/cleaning up the vector index after deletes have occurred.                                                                                     | `class_name`, `shard_name`                      | `Gauge`   |
| `vector_index_tombstone_cleaned`                       | Total number of deleted and removed vectors after repair operations.                                                                                                                           | `class_name`, `shard_name`                      | `Counter` |
| `vector_index_tombstone_unexpected_total`              | Total number of unexpected tombstones that were found, for example because a vector was not found for an existing id in the index                                                              | `class_name`, `shard_name`, `operation`         | `Counter` |
| `vector_index_tombstone_cycle_start_timestamp_seconds` | Unix epoch timestamp of the start of the current tombstone cleanup cycle                                                                                                                       | `class_name`, `shard_name`                      | `Gauge`   |
| `vector_index_tombstone_cycle_end_timestamp_seconds`   | Unix epoch timestamp of the end of the last tombstone cleanup cycle. A negative value indicates that the cycle is still running                                                                | `class_name`, `shard_name`                      | `Gauge`   |
| `vector_index_tombstone_cycle_progress`                | A ratio (percentage) of the progress of the current tombstone cleanup cycle. 0 indicates the very beginning, 1 is a complete cycle.                                                            | `class_name`, `shard_name`                      | `Gauge`   |
| `vector_dimensions_sum`                                | Total dimensions in a shard                                                                                                                                                                    | `class_name`, `shard_name`                      | `Gauge`   |
| `vector_segments_sum`                                  | Total segments in a shard if quantization enabled                                                                                                                                              | `class_name`, `shard_name`                      | `Gauge`   |
| `vector_index_background_operations_count` | Total number of background operations (split, merge, reassign). | `class_name`, `operation`, `shard_name` | `Gauge` |
| `weaviate_vector_index_memory_allocation_rejected_total` | Total number of batch operations rejected per node due to insufficient memory. | None | `Counter` |

#### Vector index (IVF-specific)

| Metric                                            | Description                                                                         | Labels                                  | Type        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------- | ----------- |
| `vector_index_postings`                           | The size of the vector index postings. Typically much lower than number of vectors. | `class_name`, `shard_name`              | `Gauge`     |
| `vector_index_posting_size_vectors`               | The size of individual vectors in each posting list                                 | `class_name`, `shard_name`              | `Histogram` |
| `vector_index_pending_background_operations`      | Number of background operations yet to be processed                                 | `operation`, `class_name`, `shard_name` | `Gauge`     |
| `vector_index_background_operations_durations_ms` | Duration of typical vector index background operations (split, merge, reassign)     | `operation`, `class_name`, `shard_name` | `Summary`   |
| `vector_index_store_operations_durations_ms`      | Duration of store operations (put, append, get)                                     | `operation`, `class_name`, `shard_name` | `Summary`   |

#### Async index queue

| Metric                                   | Description                                                 | Labels                                      | Type        |
| ---------------------------------------- | ----------------------------------------------------------- | ------------------------------------------- | ----------- |
| `queue_size`                             | Number of records in the queue                              | `class_name`, `shard_name`                  | `Gauge`     |
| `queue_disk_usage`                       | Disk usage of the queue                                     | `class_name`, `shard_name`                  | `Gauge`     |
| `queue_paused`                           | Number of paused queues                                     | None                                        | `Gauge`     |
| `queue_count`                            | Number of queues                                            | None                                        | `Gauge`     |
| `queue_partition_processing_duration_ms` | Duration in ms of a single partition processing             | `class_name`, `shard_name`                  | `Histogram` |
| `vector_index_queue_insert_count`        | Number of insert operations added to the vector index queue | `class_name`, `shard_name`, `target_vector` | `Counter`   |
| `vector_index_queue_delete_count`        | Number of delete operations added to the vector index queue | `class_name`, `shard_name`, `target_vector` | `Counter`   |

#### Tombstone management

| Metric                             | Description                                              | Labels                     | Type      |
| ---------------------------------- | -------------------------------------------------------- | -------------------------- | --------- |
| `tombstone_find_local_entrypoint`  | Total number of tombstone delete local entrypoint calls  | `class_name`, `shard_name` | `Counter` |
| `tombstone_find_global_entrypoint` | Total number of tombstone delete global entrypoint calls | `class_name`, `shard_name` | `Counter` |
| `tombstone_reassign_neighbors`     | Total number of tombstone reassign neighbor calls        | `class_name`, `shard_name` | `Counter` |
| `tombstone_delete_list_size`       | Delete list size of tombstones                           | `class_name`, `shard_name` | `Gauge`   |

### LSM store

The following sections provide detailed metrics for LSM (Log-Structured Merge-tree) bucket operations and replication functionality.

#### General LSM store

| Metric                                     | Description                                                                                                     | Labels                                                          | Type      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------- |
| `lsm_active_segments`                      | Number of currently present segments per shard. Granularity is shard of a class. Grouped by `strategy`.         | `strategy`, `class_name`, `shard_name`, `path`                  | `Gauge`   |
| `lsm_objects_bucket_segment_count`         | Number of segments per shard in the objects bucket                                                              | `strategy`, `class_name`, `shard_name`, `path`                  | `Gauge`   |
| `lsm_compressed_vecs_bucket_segment_count` | Number of segments per shard in the vectors_compressed bucket                                                   | `strategy`, `class_name`, `shard_name`, `path`                  | `Gauge`   |
| `lsm_segment_count`                        | Number of segments by level                                                                                     | `strategy`, `class_name`, `shard_name`, `path`, `level`         | `Gauge`   |
| `lsm_segment_size`                         | Size of LSM segment by level and unit                                                                           | `strategy`, `class_name`, `shard_name`, `path`, `level`, `unit` | `Gauge`   |
| `lsm_segment_unloaded`                     | Number of unloaded segments                                                                                     | `strategy`, `class_name`, `shard_name`, `path`                  | `Gauge`   |
| `lsm_memtable_size`                        | Size of memtable by path                                                                                        | `strategy`, `class_name`, `shard_name`, `path`                  | `Gauge`   |
| `lsm_memtable_durations_ms`                | Time in ms for a bucket operation to complete                                                                   | `strategy`, `class_name`, `shard_name`, `path`, `operation`     | `Summary` |
| `lsm_bitmap_buffers_usage`                 | Number of bitmap buffers used by size                                                                           | `size`, `operation`                                             | `Counter` |
| `rangeable_inmemory_rebuild_degraded_total` | Number of times the rangeable in-memory rebuild at reindex finalize degraded to disk serving instead of activating in-memory acceleration. | `class_name`, `property`, `shard_name` | `Counter` |

#### LSM bucket operations

These metrics track read and write operations on LSM buckets, providing detailed visibility into database performance.

| Metric                                        | Description                                                 | Labels                                                                             | Type        |
| --------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------- |
| `weaviate_lsm_bucket_read_operation_count`             | Total number of LSM bucket read operations requested        | `operation` (get), `component` (active_memtable, flushing_memtable, segment_group) | `Counter`   |
| `weaviate_lsm_bucket_read_operation_ongoing`           | Number of LSM bucket read operations currently in progress  | `operation` (get), `component` (active_memtable, flushing_memtable, segment_group) | `Gauge`     |
| `weaviate_lsm_bucket_read_operation_failure_count`     | Number of failed LSM bucket read operations                 | `operation` (get), `component` (active_memtable, flushing_memtable, segment_group) | `Counter`   |
| `weaviate_lsm_bucket_read_operation_duration_seconds`  | Duration of LSM bucket read operations in seconds           | `operation` (get), `component` (active_memtable, flushing_memtable, segment_group) | `Histogram` |
| `weaviate_lsm_bucket_write_operation_count`            | Total number of LSM bucket write operations requested       | `operation` (put, delete)                                                          | `Counter`   |
| `weaviate_lsm_bucket_write_operation_ongoing`          | Number of LSM bucket write operations currently in progress | `operation` (put, delete)                                                          | `Gauge`     |
| `weaviate_lsm_bucket_write_operation_failure_count`    | Number of failed LSM bucket write operations                | `operation` (put, delete)                                                          | `Counter`   |
| `weaviate_lsm_bucket_write_operation_duration_seconds` | Duration of LSM bucket write operations in seconds          | `operation` (put, delete)                                                          | `Histogram` |

#### LSM bucket lifecycle

These metrics track the initialization and shutdown of LSM buckets.

| Metric                                 | Description                                                | Labels     | Type        |
| -------------------------------------- | ---------------------------------------------------------- | ---------- | ----------- |
| `weaviate_lsm_bucket_init_count`                | Total number of LSM bucket initializations requested       | `strategy` | `Counter`   |
| `weaviate_lsm_bucket_init_in_progress`          | Number of LSM bucket initializations currently in progress | `strategy` | `Gauge`     |
| `weaviate_lsm_bucket_init_failure_count`        | Number of failed LSM bucket initializations                | `strategy` | `Counter`   |
| `weaviate_lsm_bucket_init_duration_seconds`     | Duration of LSM bucket initialization in seconds           | `strategy` | `Histogram` |
| `weaviate_lsm_bucket_shutdown_count`            | Total number of LSM bucket shutdowns requested             | `strategy` | `Counter`   |
| `weaviate_lsm_bucket_shutdown_in_progress`      | Number of LSM bucket shutdowns currently in progress       | `strategy` | `Gauge`     |
| `weaviate_lsm_bucket_shutdown_duration_seconds` | Duration of LSM bucket shutdown in seconds                 | `strategy` | `Histogram` |
| `weaviate_lsm_bucket_shutdown_failure_count`    | Number of failed LSM bucket shutdowns                      | `strategy` | `Counter`   |

#### LSM bucket cursors

These metrics track cursor usage patterns in LSM buckets.

| Metric                               | Description                                         | Labels     | Type        |
| ------------------------------------ | --------------------------------------------------- | ---------- | ----------- |
| `weaviate_lsm_bucket_opened_cursors`          | Number of opened LSM bucket cursors                 | `strategy` | `Counter`   |
| `weaviate_lsm_bucket_open_cursors`            | Number of currently open LSM bucket cursors         | `strategy` | `Gauge`     |
| `weaviate_lsm_bucket_cursor_duration_seconds` | Duration of LSM bucket cursor operations in seconds | `strategy` | `Histogram` |

#### LSM segment metrics

These metrics provide visibility into LSM segment storage and size distribution.

| Metric                          | Description                          | Labels     | Type        |
| ------------------------------- | ------------------------------------ | ---------- | ----------- |
| `weaviate_lsm_bucket_segment_total`      | Total number of LSM bucket segments  | `strategy` | `Gauge`     |
| `weaviate_lsm_bucket_segment_size_bytes` | Size of LSM bucket segments in bytes | `strategy` | `Histogram` |

#### LSM compaction

These metrics track compaction operations that merge and optimize LSM segments.

| Metric                                   | Description                                                                              | Labels     | Type        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- | ---------- | ----------- |
| `weaviate_lsm_bucket_compaction_count`            | Total number of LSM bucket compactions requested                                         | `strategy` | `Counter`   |
| `weaviate_lsm_bucket_compaction_in_progress`      | Number of LSM bucket compactions currently in progress                                   | `strategy` | `Gauge`     |
| `weaviate_lsm_bucket_compaction_failure_count`    | Number of failed LSM bucket compactions                                                  | `strategy` | `Counter`   |
| `weaviate_lsm_bucket_compaction_noop_count`       | Number of times the periodic LSM bucket compaction task ran but found nothing to compact | `strategy` | `Counter`   |
| `weaviate_lsm_bucket_compaction_duration_seconds` | Duration of LSM bucket compaction in seconds                                             | `strategy` | `Histogram` |

#### LSM memtable operations

These metrics track memtable flush operations that persist in-memory data to disk.

| Metric                                | Description                                     | Labels     | Type        |
| ------------------------------------- | ----------------------------------------------- | ---------- | ----------- |
| `weaviate_lsm_memtable_flush_total`            | Total number of LSM memtable flushes            | `strategy` | `Counter`   |
| `weaviate_lsm_memtable_flush_in_progress`      | Number of LSM memtable flushes in progress      | `strategy` | `Gauge`     |
| `weaviate_lsm_memtable_flush_failures_total`   | Total number of failed LSM memtable flushes     | `strategy` | `Counter`   |
| `weaviate_lsm_memtable_flush_duration_seconds` | Duration of LSM memtable flush in seconds       | `strategy` | `Histogram` |
| `weaviate_lsm_memtable_flush_size_bytes`       | Size of LSM memtable at flushing time, in bytes | `strategy` | `Histogram` |

#### LSM WAL recovery

These metrics track Write-Ahead Log (WAL) recovery operations during startup.

| Metric                                     | Description                                               | Labels     | Type        |
| ------------------------------------------ | --------------------------------------------------------- | ---------- | ----------- |
| `weaviate_lsm_bucket_wal_recovery_count`            | Total number of LSM bucket WAL recoveries requested       | `strategy` | `Counter`   |
| `weaviate_lsm_bucket_wal_recovery_in_progress`      | Number of LSM bucket WAL recoveries currently in progress | `strategy` | `Gauge`     |
| `weaviate_lsm_bucket_wal_recovery_failure_count`    | Number of failed LSM bucket WAL recoveries                | `strategy` | `Counter`   |
| `weaviate_lsm_bucket_wal_recovery_duration_seconds` | Duration of LSM bucket WAL recovery in seconds            | `strategy` | `Histogram` |

### Schema & cluster consensus

#### Schema & RAFT consensus

| Metric                            | Description                                                   | Labels | Type      |
| --------------------------------- | ------------------------------------------------------------- | ------ | --------- |
| `schema_writes_seconds`           | Duration of schema writes (which always involve the leader)   | `type` | `Summary` |
| `schema_reads_local_seconds`      | Duration of local schema reads that do not involve the leader | `type` | `Summary` |
| `schema_reads_leader_seconds`     | Duration of schema reads that are passed to the leader        | `type` | `Summary` |
| `schema_wait_for_version_seconds` | Duration of waiting for a schema version to be reached        | `type` | `Summary` |
| `weaviate_distributed_tasks_running` | Number of active distributed tasks running per namespace. | `namespace` | `Gauge` |
| `weaviate_distributed_tasks_unrecognized_status` | Number of distributed tasks in a status this build does not recognize, per namespace. | `namespace` | `Gauge` |

#### Cluster store (RAFT FSM)

The cluster store is the state machine RAFT replicates the schema into. These metrics show how far its local copy has been applied, which is what a node has to catch up on after a restart.

| Metric | Description | Labels | Type |
| --- | --- | --- | --- |
| `weaviate_cluster_store_fsm_apply_duration_seconds` | Time to apply cluster store FSM state in local node. | `nodeID` | `Histogram` |
| `weaviate_cluster_store_fsm_apply_failures_total` | Total failure count of cluster store FSM state apply in local node. | `nodeID` | `Counter` |
| `weaviate_cluster_store_fsm_last_applied_index` | Current applied index of cluster store FSM in local node. This includes commands without config changes. | `nodeID` | `Gauge` |
| `weaviate_cluster_store_fsm_startup_applied_index` | Previous applied index of the cluster store FSM in local node that any restart would try to catch up. | `nodeID` | `Gauge` |
| `weaviate_cluster_store_leader_fsm_barriers_total` | Catch-up barriers issued by this node after winning an election. | `nodeID` | `Counter` |
| `weaviate_cluster_store_raft_last_applied_index` | Current applied index of a raft cluster in local node. This includes every commands including config changes. | `nodeID` | `Gauge` |

#### RAFT metrics (internal)

| Metric                                                        | Description                                                                                                                          | Labels                    | Type      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | --------- |
| `weaviate_internal_counter_raft_apply`                        | Number of transactions in the configured interval                                                                                    | None                      | `Counter` |
| `weaviate_internal_counter_raft_state_candidate`              | Number of times the raft server initiated an election                                                                                | None                      | `Counter` |
| `weaviate_internal_counter_raft_state_follower`               | Number of times in the configured interval that the raft server became a follower                                                    | None                      | `Counter` |
| `weaviate_internal_counter_raft_state_leader`                 | Number of times the raft server became a leader                                                                                      | None                      | `Counter` |
| `weaviate_internal_counter_raft_transition_heartbeat_timeout` | Number of times that the node transitioned to `candidate` state after not receiving a heartbeat message from the last known leader   | None                      | `Counter` |
| `weaviate_internal_gauge_raft_commitNumLogs`                  | Number of logs processed for application to the finite state machine in a single batch                                               | None                      | `Gauge`   |
| `weaviate_internal_gauge_raft_leader_dispatchNumLogs`         | Number of logs committed to disk in the most recent batch                                                                            | None                      | `Gauge`   |
| `weaviate_internal_gauge_raft_leader_oldestLogAge`            | The number of milliseconds since the oldest log in the leader's log store was written                                                | None                      | `Gauge`   |
| `weaviate_internal_gauge_raft_peers`                          | The number of peers in the raft cluster configuration                                                                                | None                      | `Gauge`   |
| `weaviate_internal_sample_raft_boltdb_logBatchSize`           | Measures the total size in bytes of logs being written to the db in a single batch                                                   | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_boltdb_logSize`                | Measures the size of logs being written to the db                                                                                    | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_boltdb_logsPerBatch`           | Measures the number of logs being written per batch to the db                                                                        | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_boltdb_writeCapacity`          | Theoretical write capacity in terms of the number of logs that can be written per second                                             | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_thread_fsm_saturation`         | An approximate measurement of the proportion of time the Raft FSM goroutine is busy and unavailable to accept new work               | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_thread_main_saturation`        | An approximate measurement of the proportion of time the main Raft goroutine is busy and unavailable to accept new work (percentage) | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_raft_boltdb_getLog`                  | Measures the amount of time spent reading logs from the db (in ms)                                                                   | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_raft_boltdb_storeLogs`               | Time required to record any outstanding logs since the last request to append entries for the given node                             | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_raft_commitTime`                     | Time required to commit a new entry to the raft log on the leader node                                                               | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_raft_fsm_apply`                      | Number of logs committed by the finite state machine since the last interval                                                         | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_raft_fsm_enqueue`                    | Time required to queue up a batch of logs for the finite state machine to apply                                                      | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_raft_leader_dispatchLog`             | Time required for the leader node to write a log entry to disk                                                                       | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_counter_raft_barrier` | Barrier operations issued to confirm the leader has applied all preceding log entries. | None | `Counter` |
| `weaviate_internal_counter_raft_replication_appendEntries_logs` | Log entries replicated to the follower named by `peer_id`. | `peer_id` | `Counter` |
| `weaviate_internal_timer_raft_fsm_store_config` | Time spent storing a cluster configuration change in the FSM. | None | `Summary` |
| `weaviate_internal_timer_raft_net_getRPCType` | Time spent reading the type byte of an inbound RAFT RPC. | None | `Summary` |
| `weaviate_internal_timer_raft_net_rpcDecode` | Time spent decoding an inbound RAFT RPC of the type given by `rpcType`. | `rpcType` | `Summary` |
| `weaviate_internal_timer_raft_net_rpcEnqueue` | Time an inbound RAFT RPC waits to be handed to the consumer. | `rpcType` | `Summary` |
| `weaviate_internal_timer_raft_net_rpcRespond` | Time spent writing the response to an inbound RAFT RPC. | `rpcType` | `Summary` |
| `weaviate_internal_timer_raft_replication_appendEntries_rpc` | Round-trip time of `AppendEntries` RPCs to the follower named by `peer_id`. | `peer_id` | `Summary` |
| `weaviate_internal_timer_raft_replication_heartbeat` | Round-trip time of leader heartbeats to the follower named by `peer_id`. | `peer_id` | `Summary` |
| `weaviate_internal_timer_raft_rpc_appendEntries` | Time the node spends handling an inbound `AppendEntries` RPC. | None | `Summary` |
| `weaviate_internal_timer_raft_rpc_appendEntries_processLogs` | Time spent applying log entries from an inbound `AppendEntries` RPC. | None | `Summary` |
| `weaviate_internal_timer_raft_rpc_appendEntries_storeLogs` | Time spent persisting log entries from an inbound `AppendEntries` RPC. | None | `Summary` |
| `weaviate_internal_timer_raft_rpc_processHeartbeat` | Time the node spends handling an inbound heartbeat. | None | `Summary` |

#### Memberlist (internal)

| Metric                                                 | Description                                                          | Labels                    | Type      |
| ------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------- | --------- |
| `weaviate_internal_sample_memberlist_queue_broadcasts` | Shows the number of messages in the broadcast queue of Memberlist    | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_memberlist_gossip`            | Shows the latency distribution of the each gossip made in Memberlist | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_counter_memberlist_degraded_probe` | Health probes sent while the local node considered itself degraded. | None | `Counter` |
| `weaviate_internal_counter_memberlist_msg_alive` | Gossip messages received announcing a node as alive. | None | `Counter` |
| `weaviate_internal_counter_memberlist_msg_dead` | Gossip messages received announcing a node as dead. | None | `Counter` |
| `weaviate_internal_counter_memberlist_tcp_accept` | Inbound gossip TCP connections accepted. | None | `Counter` |
| `weaviate_internal_counter_memberlist_tcp_connect` | Outbound gossip TCP connections opened. | None | `Counter` |
| `weaviate_internal_counter_memberlist_tcp_sent` | Bytes sent over gossip TCP connections. | None | `Counter` |
| `weaviate_internal_counter_memberlist_udp_received` | Bytes received over gossip UDP. | None | `Counter` |
| `weaviate_internal_counter_memberlist_udp_sent` | Bytes sent over gossip UDP. | None | `Counter` |
| `weaviate_internal_gauge_memberlist_health_score` | Local health score. `0` is healthy; a higher score means the node is failing probes and gossip is slowed down. | None | `Gauge` |
| `weaviate_internal_gauge_memberlist_node_instances` | Nodes known to the gossip layer, broken down by state through the `node_state` label. | `node_state` | `Gauge` |
| `weaviate_internal_gauge_memberlist_size_local` | Size in bytes of the local node's gossip state. | None | `Gauge` |
| `weaviate_internal_timer_memberlist_probeNode` | Time taken to probe another node for liveness. | None | `Summary` |
| `weaviate_internal_timer_memberlist_pushPullNode` | Time taken by a full state push/pull exchange with another node. | None | `Summary` |

#### Inter-node connections

Weaviate pools the gRPC connections it opens to other nodes. One pool serves general inter-node traffic and a second, whose metrics carry the `repl_` prefix, serves replica movement.

| Metric | Description | Labels | Type |
| --- | --- | --- | --- |
| `repl_weaviate_weaviate_grpc_conn_close_total` | Connections closed in the replication gRPC pool. | None | `Counter` |
| `repl_weaviate_weaviate_grpc_conn_create_total` | Connections created in the replication gRPC pool. | None | `Counter` |
| `repl_weaviate_weaviate_grpc_conn_open` | Open connections in the replication gRPC pool. | None | `Gauge` |
| `repl_weaviate_weaviate_grpc_conn_reuse_total` | Times an existing pooled connection was reused instead of dialing a new one. | None | `Counter` |
| `weaviate_connection_evictions_total` | Total number of connection evictions, labeled by reason. | `reason` | `Counter` |
| `weaviate_connection_rejected_total` | Total number of connection creations rejected, labeled by reason. | `reason` | `Counter` |
| `weaviate_weaviate_grpc_conn_close_total` | Connections closed in the inter-node gRPC pool. | None | `Counter` |
| `weaviate_weaviate_grpc_conn_create_total` | Connections created in the inter-node gRPC pool. | None | `Counter` |
| `weaviate_weaviate_grpc_conn_open` | Open connections in the inter-node gRPC pool. | None | `Gauge` |
| `weaviate_weaviate_grpc_conn_reuse_total` | Times an existing pooled connection was reused instead of dialing a new one. | None | `Counter` |

### System resources

#### File I/O & memory

| Metric                       | Description                           | Labels                  | Type      |
| ---------------------------- | ------------------------------------- | ----------------------- | --------- |
| `file_io_writes_total_bytes` | Total number of bytes written to disk | `operation`, `strategy` | `Summary` |
| `file_io_reads_total_bytes`  | Total number of bytes read from disk  | `operation`             | `Summary` |
| `mmap_operations_total`      | Total number of mmap operations       | `operation`, `strategy` | `Counter` |
| `mmap_proc_maps`             | Number of entries in /proc/self/maps  | None                    | `Gauge`   |

#### Async operations

| Metric                     | Description                                                                                                  | Labels                                          | Type    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ------- |
| `async_operations_running` | Number of currently running async operations. The operation itself is defined through the `operation` label. | `operation`, `class_name`, `shard_name`, `path` | `Gauge` |
| `weaviate_background_process_active` | Number of currently running instances of a background process (0 = idle). | `process` | `Gauge` |
| `weaviate_background_process_duration_seconds` | Wall-clock duration of finished background process runs, in seconds. | `process` | `Histogram` |
| `weaviate_background_process_failures_total` | Number of background process runs that ended in error (cancellations excluded). | `process` | `Counter` |

#### Checksum

| Metric                                 | Description                                     | Labels | Type      |
| -------------------------------------- | ----------------------------------------------- | ------ | --------- |
| `checksum_validation_duration_seconds` | Duration of checksum validation                 | None   | `Summary` |
| `checksum_bytes_read`                  | Number of bytes read during checksum validation | None   | `Summary` |

#### Startup

| Metric                      | Description                                                                                                                                                                     | Labels                                  | Type      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | --------- |
| `startup_progress`          | A ratio (percentage) of startup progress for a particular component in a shard                                                                                                  | `operation`, `class_name`, `shard_name` | `Gauge`   |
| `startup_durations_ms`      | Duration of individual startup operations in ms. The operation itself is defined through the `operation` label.                                                                 | `operation`, `class_name`, `shard_name` | `Summary` |
| `startup_diskio_throughput` | Disk I/O throughput in bytes/s at startup operations, such as reading back the HNSW index or recovering LSM segments. The operation itself is defined by the `operation` label. | `operation`, `class_name`, `shard_name` | `Summary` |
| `database_buckets_loading` | LSM buckets currently being loaded from disk. | None | `Gauge` |
| `database_buckets_waiting_for_permit_to_load` | LSM buckets blocked waiting for a slot in the load limiter. | None | `Gauge` |
| `database_shards_loading` | Shards currently being loaded from disk. | None | `Gauge` |
| `database_shards_waiting_for_permit_to_load` | Shards blocked waiting for a slot in the load limiter. | None | `Gauge` |
| `weaviate_lazy_shard_warmup_decisions_total` | Number of shards the startup warmup sweep considered, by what it did with each. | `outcome` | `Counter` |
| `weaviate_startup_shards_loaded` | Shards loaded so far during startup. Compare with `weaviate_startup_shards_to_load` to follow progress. | None | `Gauge` |
| `weaviate_startup_shards_to_load` | Shards this node has to load before it is ready. | None | `Gauge` |

#### Backup & restore

| Metric                                    | Description                                                                 | Labels                       | Type        |
| ----------------------------------------- | --------------------------------------------------------------------------- | ---------------------------- | ----------- |
| `backup_restore_ms`                       | Duration of a backup restore                                                | `backend_name`, `class_name` | `Summary`   |
| `backup_restore_class_ms`                 | Duration restoring class                                                    | `class_name`                 | `Summary`   |
| `backup_store_to_backend_ms`              | File transfer stage of a backup store                                       | `backend_name`, `class_name` | `Summary`   |
| `bucket_pause_durations_ms`               | Bucket pause durations                                                      | `bucket_dir`                 | `Summary`   |
| `backup_restore_data_transferred`         | Total number of bytes transferred during a backup restore                   | `backend_name`, `class_name` | `Counter`   |
| `backup_store_data_transferred`           | Total number of bytes transferred during a backup store                     | `backend_name`, `class_name` | `Counter`   |
| `weaviate_restore_phase_duration_seconds` | Duration of restore phases (prepare, object_storage_download, schema_apply) | `phase`                      | `Histogram` |
| `backup_dedupe_fallback_total` | Replica-dedupe fallbacks by reason. | `reason` | `Counter` |
| `backup_dedupe_planning_ms` | Wall time of replica-dedupe convergence planning per backup. | None | `Summary` |
| `backup_dedupe_restore_anomalies_total` | Fan-out restore shards without a normal source, by reason (no_holder = nothing restored, multi_holder = deterministic pick among duplicates, schema_source_fallback = shard membership derived from local snapshots). | `reason` | `Counter` |
| `backup_dedupe_shards_total` | Shards planned by replica-dedupe backups, by outcome (designated = archived once, fallback = archived by every replica). | `outcome` | `Counter` |

#### Shard management

| Metric                                                | Description                                  | Labels                                                  | Type        |
| ----------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------- | ----------- |
| `shards_loaded`                                       | Number of shards loaded                      | None                                                    | `Gauge`     |
| `shards_unloaded`                                     | Number of shards not loaded                  | None                                                    | `Gauge`     |
| `shards_loading`                                      | Number of shards in process of loading       | None                                                    | `Gauge`     |
| `shards_unloading`                                    | Number of shards in process of unloading     | None                                                    | `Gauge`     |
| `weaviate_index_shards_total`                         | Total number of shards per index status      | `status` (READONLY, INDEXING, LOADING, READY, SHUTDOWN) | `Gauge`     |
| `weaviate_index_shard_status_update_duration_seconds` | Time taken to update shard status in seconds | `status` (READONLY, INDEXING, LOADING, READY, SHUTDOWN) | `Histogram` |
| `migration_records_not_understood_total` | Reindex migration records a shard load could not read, decode or place. Each one withholds every promoting and destructive reindex action on its shard; the log line names the file and the reason. | None | `Counter` |
| `migration_records_wedged_total` | Reindex migration records a reconciliation pass left standing, either wedged for a reason no later load can change or with a reconciliation that errored. The log line for each names the record and the shard. | None | `Counter` |
| `shard_halt_for_transfer_force_resume_total` | Halt-for-transfer inactivity watchdog firings. Non-zero indicates a transfer was force-resumed mid-stream. | None | `Counter` |
| `weaviate_shards` | Shards on this node, broken down by `registration` and `state`. | `registration`, `state` | `Gauge` |

#### Export

Metrics for collection exports. Coordination and the scan/upload phase are measured separately, so a slow export can be attributed to one or the other.

| Metric | Description | Labels | Type |
| --- | --- | --- | --- |
| `weaviate_export_coordination_duration_seconds` | Duration of the export two-phase commit coordination (prepare all nodes, write metadata, commit all nodes). Does not include the scan and upload phase. | None | `Histogram` |
| `weaviate_export_duration_seconds` | Duration of the export scan and upload phase on a participant node. | None | `Histogram` |
| `weaviate_export_objects_total` | Total number of objects exported. | None | `Counter` |
| `weaviate_export_operations_total` | Total number of export operations by terminal status. | `status` | `Counter` |

### Modules & extensions

#### Vectorization (Text2Vec)

| Metric                             | Description                                                      | Labels                    | Type        |
| ---------------------------------- | ---------------------------------------------------------------- | ------------------------- | ----------- |
| `t2v_concurrent_batches`           | Number of batches currently running                              | `vectorizer`              | `Gauge`     |
| `t2v_batch_queue_duration_seconds` | Time of a batch spend in specific portions of the queue          | `vectorizer`, `operation` | `Histogram` |
| `t2v_request_duration_seconds`     | Duration of an individual request to the vectorizer              | `vectorizer`              | `Histogram` |
| `t2v_tokens_in_batch`              | Number of tokens in a user-defined batch                         | `vectorizer`              | `Histogram` |
| `t2v_tokens_in_request`            | Number of tokens in an individual request sent to the vectorizer | `vectorizer`              | `Histogram` |
| `t2v_rate_limit_stats`             | Rate limit stats for the vectorizer                              | `vectorizer`, `stat`      | `Gauge`     |
| `t2v_repeat_stats`                 | Why batch scheduling is repeated                                 | `vectorizer`, `stat`      | `Gauge`     |
| `t2v_requests_per_batch`           | Number of requests required to process an entire (user) batch    | `vectorizer`              | `Histogram` |

#### Tokenizer

| Metric                                  | Description                                      | Labels      | Type        |
| --------------------------------------- | ------------------------------------------------ | ----------- | ----------- |
| `tokenizer_duration_seconds`            | Duration of a tokenizer operation                | `tokenizer` | `Histogram` |
| `tokenizer_initialize_duration_seconds` | Duration of a tokenizer initialization operation | `tokenizer` | `Histogram` |
| `token_count_total`                     | Number of tokens processed                       | `tokenizer` | `Counter`   |
| `token_count_per_request`               | Number of tokens processed per request           | `tokenizer` | `Histogram` |

#### Module & external API

| Metric                                     | Description                                                    | Labels                                    | Type        |
| ------------------------------------------ | -------------------------------------------------------------- | ----------------------------------------- | ----------- |
| `weaviate_module_requests_total`           | Number of module requests to external APIs                     | `op`, `api`                               | `Counter`   |
| `weaviate_module_request_duration_seconds` | Duration of an individual request to a module external API     | `op`, `api`                               | `Histogram` |
| `weaviate_module_requests_per_batch`       | Number of items in a batch                                     | `op`, `api`                               | `Histogram` |
| `weaviate_module_request_size_bytes`       | Size (in bytes) of the request sent to an external API         | `op`, `api`                               | `Histogram` |
| `weaviate_module_response_size_bytes`      | Size (in bytes) of the response received from an external API  | `op`, `api`                               | `Histogram` |
| `weaviate_vectorizer_request_tokens`       | Number of tokens in the request sent to an external vectorizer | `inout`, `api`                            | `Histogram` |
| `weaviate_module_request_single_count`     | Number of single-item external API requests                    | `op`, `api`                               | `Counter`   |
| `weaviate_module_request_batch_count`      | Number of batched module requests                              | `op`, `api`                               | `Counter`   |
| `weaviate_module_error_total`              | Number of module errors                                        | `op`, `module`, `endpoint`, `status_code` | `Counter`   |
| `weaviate_module_call_error_total`         | Number of module errors (related to external calls)            | `module`, `endpoint`, `status_code`       | `Counter`   |
| `weaviate_module_response_status_total`    | Number of API response statuses                                | `op`, `endpoint`, `status`                | `Counter`   |
| `weaviate_module_batch_error_total`        | Number of batch errors                                         | `operation`, `class_name`                 | `Counter`   |
| `weaviate_module_request_resends_total` | Number of module requests to external APIs sent again after their connection broke. | None | `Counter` |

#### Tenants & offload

Auto-tenant creation, and moving inactive tenants to and from cold storage with the [offload module](/deploy/configuration/tenant-offloading.md).

| Metric | Description | Labels | Type |
| --- | --- | --- | --- |
| `weaviate_auto_tenant_duration_seconds` | Time spent in auto tenant operations. | `operation` | `Histogram` |
| `weaviate_auto_tenant_total` | Total number of tenants processed. | None | `Counter` |
| `weaviate_tenant_offload_fetched_bytes_total` | Bytes downloaded from the offload backend. | None | `Counter` |
| `weaviate_tenant_offload_operation_duration_seconds` | Duration of a tenant offload operation. The `operation` label names the phase and `status` reports the outcome. | `operation`, `status` | `Histogram` |
| `weaviate_tenant_offload_transferred_bytes_total` | Bytes uploaded to the offload backend. | None | `Counter` |

#### Usage Tracking

| Metric                                               | Description                                  | Labels                                                 | Type        |
| ---------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ | ----------- |
| `weaviate_usage_{gcs\|s3}_operations_total`          | Total number of operations for module labels | `operation` (collect/upload), `status` (success/error) | `Counter`   |
| `weaviate_usage_{gcs\|s3}_operation_latency_seconds` | Latency of usage operations in seconds       | `operation` (collect/upload)                           | `Histogram` |
| `weaviate_usage_{gcs\|s3}_resource_count`            | Number of resources tracked by module        | `resource_type` (collections/shards/backups)           | `Gauge`     |
| `weaviate_usage_{gcs\|s3}_uploaded_file_size_bytes`  | Size of the uploaded usage file in bytes     | None                                                   | `Gauge`     |
| `weaviate_usage_gcs_operations_total` | Usage module operations against GCS, by `operation` and `status`. | `operation`, `status` | `Counter` |
| `weaviate_usage_gcs_resource_count` | Resources counted in the most recent usage report, by `resource_type`. | `resource_type` | `Gauge` |
| `weaviate_usage_gcs_uploaded_file_size_bytes` | Size of the most recent usage report uploaded to GCS. | None | `Gauge` |
| `weaviate_usage_s3_operations_total` | Usage module operations against S3, by `operation` and `status`. | `operation`, `status` | `Counter` |
| `weaviate_usage_s3_resource_count` | Resources counted in the most recent usage report, by `resource_type`. | `resource_type` | `Gauge` |
| `weaviate_usage_s3_uploaded_file_size_bytes` | Size of the most recent usage report uploaded to S3. | None | `Gauge` |

---

### Replication

#### Async replication

These metrics track asynchronous replication operations for maintaining data consistency across replicas.

:::note Changed in `v1.38`
As of Weaviate `v1.38`, async replication runs through a centralized scheduler with a bounded worker pool (replacing the previous per-shard goroutines). The `async_replication_scheduler_*` metrics below are new in `v1.38`, and the `async_replication_goroutines_running` metric has been removed.
:::

| Metric                                                   | Description                                                              | Labels                                | Type        |
| -------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------- | ----------- |
| `weaviate_async_replication_scheduler_worker_pool_size`           | Current target size of the scheduler worker pool                         | None                                  | `Gauge`     |
| `weaviate_async_replication_scheduler_workers_active`             | Number of scheduler worker goroutines currently executing a hashbeat cycle | None                                | `Gauge`     |
| `weaviate_async_replication_scheduler_shards_registered`          | Number of shards currently registered with the async replication scheduler | None                                | `Gauge`     |
| `weaviate_async_replication_scheduler_queue_depth`                | Number of shards waiting in the scheduler heap (not in-flight)           | None                                  | `Gauge`     |
| `weaviate_async_replication_hashtree_init_count`                  | Count of async replication hashtree initializations                      | None                                  | `Counter`   |
| `weaviate_async_replication_hashtree_init_running`                | Number of currently running hashtree initializations                     | None                                  | `Gauge`     |
| `weaviate_async_replication_hashtree_init_failure_count`          | Count of async replication hashtree initialization failures              | None                                  | `Counter`   |
| `weaviate_async_replication_hashtree_init_duration_seconds`       | Duration of hashtree initialization in seconds                           | None                                  | `Histogram` |
| `weaviate_async_replication_iteration_count`                      | Count of async replication comparison iterations                         | None                                  | `Counter`   |
| `weaviate_async_replication_iteration_failure_count`              | Count of async replication iteration failures                            | None                                  | `Counter`   |
| `weaviate_async_replication_iteration_duration_seconds`           | Duration of async replication comparison iterations in seconds           | None                                  | `Histogram` |
| `weaviate_async_replication_iteration_running`                    | Number of currently running async replication iterations                 | None                                  | `Gauge`     |
| `weaviate_async_replication_hashtree_diff_duration_seconds`       | Duration of async replication hashtree diff computation in seconds       | None                                  | `Histogram` |
| `weaviate_async_replication_object_digests_diff_duration_seconds` | Duration of async replication object digests diff computation in seconds | None                                  | `Histogram` |
| `weaviate_async_replication_objects_diff_total`                   | Total objects found in diff per hashbeat cycle (queued for propagation or locally deleted before propagation) | None             | `Counter`   |
| `weaviate_async_replication_propagation_count`                    | Count of async replication propagation executions                        | None                                  | `Counter`   |
| `weaviate_async_replication_propagation_failure_count`            | Count of async replication propagation failures                          | None                                  | `Counter`   |
| `weaviate_async_replication_propagation_object_count`             | Count of objects propagated by async replication                         | None                                  | `Counter`   |
| `weaviate_async_replication_propagation_duration_seconds`         | Duration of async replication propagation in seconds                     | None                                  | `Histogram` |
| `weaviate_async_replication_local_deletions_total`                | Total local object deletions applied due to remote-deleted verdicts or deletion-conflict responses during async replication | None | `Counter`   |
| `weaviate_async_replication_reconcile_failures_total`             | Number of indices that failed to reconcile async replication with the global `ASYNC_REPLICATION_DISABLED` flag | None             | `Counter`   |
| `weaviate_async_checkpoint_active` | Shards on this node currently holding an active checkpoint. Replacements don't change the count. | None | `Gauge` |
| `weaviate_async_checkpoint_create_failure_total` | Checkpoint creations that were refused, because the requested `createdAt` was stale or because async replication was not active. | None | `Counter` |
| `weaviate_async_checkpoint_create_total` | Local async-replication checkpoints created, including replacements of an existing one. | None | `Counter` |
| `weaviate_async_checkpoint_delete_total` | Explicit deletions that cleared an active checkpoint. Clears caused by stopping or disabling async replication are not counted. | None | `Counter` |
| `weaviate_async_checkpoint_lifetime_seconds` | Time a checkpoint stayed active before being cleared (explicit delete, replacement, or stop/disable). | None | `Histogram` |
| `weaviate_async_replication_rebuild_failures_total` | Number of failed hashtree rebuild attempts; a growing rate means shards are out of the repair mesh while retrying. | None | `Counter` |
| `weaviate_async_replication_rebuild_total` | Number of completed hashtree rebuilds (a shard picked up a changed hashtree height). | None | `Counter` |
| `weaviate_async_replication_rebuild_yields_total` | Rebuild attempts that stood down for a schema apply, teardown, transfer halt, or drain timeout; spinning with rebuild_total flat means a rebuild is starved. | None | `Counter` |
| `weaviate_async_replication_root_compare_rpc_total` | Batched hashtree-root compare RPCs by outcome. | `result` | `Counter` |
| `weaviate_async_replication_root_prefilter_batch_size` | Number of shards compared in one batched hashtree-root pre-filter RPC group. | None | `Histogram` |
| `weaviate_async_replication_root_prefilter_skips_total` | Shard cycles short-circuited as in-sync by the batched hashtree-root pre-filter. | None | `Counter` |
| `weaviate_async_replication_scheduler_workers_live` | Number of live scheduler worker goroutines (spawned but not yet exited). | None | `Gauge` |
| `weaviate_async_replication_target_skip_count` | Count of async replication targets skipped as retry-later, by reason. | `reason` | `Counter` |

#### Replication coordinator

These metrics track the replication coordinator's read and write operations across replicas.

| Metric                                            | Description                                                                    | Labels | Type        |
| ------------------------------------------------- | ------------------------------------------------------------------------------ | ------ | ----------- |
| `weaviate_replication_coordinator_writes_succeed_all`      | Count of requests succeeding a write to all replicas                           | None   | `Counter`   |
| `weaviate_replication_coordinator_writes_succeed_some`     | Count of requests succeeding a write to some replicas > CL but less than all   | None   | `Counter`   |
| `weaviate_replication_coordinator_writes_failed`           | Count of requests failing due to consistency level                             | None   | `Counter`   |
| `weaviate_replication_coordinator_reads_succeed_all`       | Count of requests succeeding a read from CL replicas                           | None   | `Counter`   |
| `weaviate_replication_coordinator_reads_succeed_some`      | Count of requests succeeding a read from some replicas < CL but more than zero | None   | `Counter`   |
| `weaviate_replication_coordinator_reads_failed`            | Count of requests failing due to read from replicas                            | None   | `Counter`   |
| `weaviate_replication_read_repair_count`                   | Count of read repairs started                                                  | None   | `Counter`   |
| `weaviate_replication_read_repair_failure`                 | Count of read repairs failed                                                   | None   | `Counter`   |
| `weaviate_replication_coordinator_writes_duration_seconds` | Duration in seconds of write operations to replicas                            | None   | `Histogram` |
| `weaviate_replication_coordinator_reads_duration_seconds`  | Duration in seconds of read operations from replicas                           | None   | `Histogram` |
| `weaviate_replication_read_repair_duration_seconds`        | Duration in seconds of read repair operations                                  | None   | `Histogram` |

#### Replication engine

The replication engine runs replica movement operations. Each operation moves one shard replica between nodes and advances through the states tracked by `weaviate_replication_operation_fsm_ops_by_state`.

| Metric | Description | Labels | Type |
| --- | --- | --- | --- |
| `weaviate_replication_cancelled_operations` | Number of cancelled replication operations. | `node` | `Counter` |
| `weaviate_replication_complete_operations` | Number of successfully completed replication operations. | `node` | `Counter` |
| `weaviate_replication_engine_consumer_running_status` | The replication engine consumer running status (0: not running, 1: running). | `node` | `Gauge` |
| `weaviate_replication_engine_producer_running_status` | The replication engine producer running status (0: not running, 1: running). | `node` | `Gauge` |
| `weaviate_replication_engine_running_status` | The Replication engine running status (0: not running, 1: running). | `node` | `Gauge` |
| `weaviate_replication_failed_operations` | Number of failed replication operations. | `node` | `Counter` |
| `weaviate_replication_ongoing_operations` | Number of replication operations currently in progress. | `node` | `Gauge` |
| `weaviate_replication_operation_cleanup_deleted_total` | Total number of stale replication operations removed by the cleanup sweep. | `state` | `Counter` |
| `weaviate_replication_operation_cleanup_failures_total` | Total number of failed replication cleanup batches. A lost election is not a failure. | None | `Counter` |
| `weaviate_replication_operation_cleanup_ineligible` | Replication operations that are age-eligible for cleanup but excluded. Only refreshed by the current leader. | `reason` | `Gauge` |
| `weaviate_replication_operation_fsm_ops_by_state` | Current number of replication operations in each state of the FSM lifecycle. | `state` | `Gauge` |
| `weaviate_replication_pending_operations` | Number of replication operations pending processing. | `node` | `Gauge` |

### MCP server

Added in `v1.38`. These metrics track tool traffic, latency, auth failures, and the live state of the runtime write-access flag for the built-in [Weaviate MCP server](/weaviate/configuration/mcp-server.mdx).

| Metric                                    | Description                                                                                       | Labels           | Type        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| `weaviate_mcp_tool_calls_total`           | Total MCP tool invocations.                                                                       | `tool`, `status` | `Counter`   |
| `weaviate_mcp_tool_call_duration_seconds` | Latency of MCP tool calls (LatencyBuckets histogram).                                             | `tool`, `status` | `Histogram` |
| `weaviate_mcp_tool_calls_inflight`        | In-flight MCP tool calls per tool. Catches one slow tool starving the rest.                       | `tool`           | `Gauge`     |
| `weaviate_mcp_auth_failures_total`        | MCP authentication and authorization failures.                                                    | `reason`         | `Counter`   |
| `weaviate_mcp_tools_listed_total`         | `tools/list` calls, labeled with whether the write tool was visible in the response.              | `write_access`   | `Counter`   |
| `weaviate_mcp_write_access_enabled`       | Live state of `MCP_SERVER_WRITE_ACCESS_ENABLED`, polled at scrape time. Reflects runtime toggles. | None             | `Gauge`     |

Label values:

- **`tool`**: the MCP tool name (e.g. `weaviate-query-hybrid`, `weaviate-objects-upsert`).
- **`status`**: `success` · `error` · `denied` · `write_disabled`. `denied` covers authorization failures classified via the `Forbidden` / `Unauthenticated` error families. `write_disabled` is emitted when a write call hits the runtime guard.
- **`reason`**: `missing_token` · `invalid_token` · `forbidden` · `unauthenticated`. `missing_token` and `invalid_token` are detected at the principal-extraction step; `forbidden` and `unauthenticated` are detected at authorization time.
- **`write_access`**: `enabled` / `disabled`, matching the live state of `MCP_SERVER_WRITE_ACCESS_ENABLED` at the time of the `tools/list` call.

---

<!-- TODO[g-despot] First we need to create this guide for adding metrics - Extending Weaviate with new metrics is very easy. To suggest a new metric, see the [contributor guide](/contributor-guide).-->


## What to alert on

Most of the metrics above are for investigating a problem you already know about. This shortlist is for finding out you have one. Every metric named here is defined in a table on this page.

| Alert on | Metric | Why |
| --- | --- | --- |
| A node has gone read-only | `weaviate_index_shards_total{status="READONLY"}` above `0` | Writes are being rejected. Usually disk or memory pressure — see [disk pressure warnings and limits](./persistence.md#disk-pressure-warnings-and-limits). |
| Requests are failing | `requests_total{status="failed"}` rising | The broadest signal that clients are seeing errors. Break it down by `class_name` and `api`. |
| Writes cannot reach a consistency level | `weaviate_replication_coordinator_writes_failed` rising | Replicas are down or unreachable, so writes at the requested consistency level fail. |
| Replicas are drifting apart | `weaviate_async_replication_propagation_failure_count` rising, or `weaviate_async_replication_scheduler_queue_depth` growing steadily | Background repair is failing or falling behind, so replicas stay out of sync. |
| Vector indexing is falling behind | `queue_size` growing steadily while `queue_paused` is `0` | New objects are searchable by keyword but not yet by vector. |
| Deletes are not being cleaned up | `vector_index_tombstones` rising while `vector_index_tombstone_cleaned` is flat | Tombstones accumulate, costing memory and search quality. |
| The store cannot persist | `weaviate_lsm_memtable_flush_failures_total` or `weaviate_lsm_bucket_compaction_failure_count` rising | Disk-level failures. Left alone, they end in a read-only node. |
| Memory mappings are running out | `mmap_proc_maps` approaching the host's `vm.max_map_count` | Shards stop loading once the limit is near — see [not enough memory mappings](/errors/cluster-resources#not-enough-memory-mappings). |
| Runtime overrides stopped applying | `weaviate_runtime_config_last_load_success` equal to `0` | The overrides file is unreadable, so the cluster is running the last good configuration. |
| A model provider is rate-limiting you | `weaviate_module_response_status_total{status="429"}` rising | Imports slow down or fail while a provider throttles requests. |

## OpenTelemetry tracing

:::caution Experimental
OpenTelemetry tracing is experimental. The variables below, and the spans they produce, may change or be removed in any release.
:::

Alongside Prometheus metrics, Weaviate can export traces over OTLP to an OpenTelemetry collector. Tracing is off by default. Turn it on and point it at your collector:

```sh
EXPERIMENTAL_OTEL_ENABLED=true
EXPERIMENTAL_OTEL_EXPORTER_OTLP_ENDPOINT=otel-collector:4317
```

By default Weaviate uses the gRPC protocol and samples 1% of traces. The [`EXPERIMENTAL_OTEL_*` environment variables](./env-vars/index.md#opentelemetry-tracing) cover the protocol, the service name and environment reported on each span, the sampling rate, and the export batching.


## Sample Dashboards

Weaviate does not install any dashboards for you. The
[`weaviate/grafana-dashboard-weaviate`](https://github.com/weaviate/grafana-dashboard-weaviate)
repository holds a set of Grafana dashboards covering the metrics on this page. They come with no
support attached; treat them as a starting point for dashboards that fit your own use.

| Dashboard | What it covers |
| --- | --- |
| Overview | Start here: cluster health, traffic, latency and resources across all nodes. |
| API & Protocols | REST, gRPC, streaming batch, GraphQL and the MCP server. |
| Importing | Batch import throughput, latency and batch shape, plus the index work they cause. |
| Object Operations | Single-object CRUD latency, batch deletes and object counts. |
| Querying | Query latency, concurrency, admission control and vector dimensions read. |
| Vector Index | Vector index size, operations and latency (HNSW, flat, dynamic). |
| Async Indexing | The async vector indexing queue. |
| Tombstones | HNSW tombstones and the cleanup cycle. |
| HFresh | The `hfresh` vector index: postings and background split, merge and reassign work. |
| LSM Store | Segments, memtables, bucket I/O, compaction, flushes, WAL recovery, mmap and disk I/O. |
| Shards & Loading | Shard status, lazy loading and the shard/bucket load limiter. |
| Startup | Node startup: shard loading progress, durations and disk throughput. |
| Replication | Async replication, the replication coordinator and replica movement. |
| Cluster & RAFT | RAFT, the schema FSM, memberlist, inter-node gRPC connections, distributed tasks, runtime config. |
| Schema | Schema reads and writes, and collection counts. |
| Data Lifecycle | Object TTL, export, tenant offload, auto-tenant, background processes, index migrations. |
| Backup & Restore | Backup and restore durations, bytes transferred, restore phases, incremental backups. |
| Usage | Stored objects and vector dimensions, and the `usage-s3` / `usage-gcs` modules. |
| Modules & Vectorizers | Requests to model providers, text2vec batching, tokenizers. |
| Go Runtime & Process | Go runtime and process metrics per node. |
| Kubernetes | StatefulSet readiness, restarts and OOM kills, CPU and memory against limits, PVC fill level, pod placement. |

The repository also ships two dashboards meant for local development: a node-exporter view for macOS, and an explorer for browsing any series by name.

### Loading the dashboards

Each dashboard picks its Prometheus source through a `$datasource` variable, so none of them is tied
to a particular datasource UID.

- **Grafana UI**: **Dashboards → New → Import**, then upload the JSON files.
- **File provisioning**: point a dashboard provider at the `dashboards/` directory.
- **kube-prometheus-stack**: the Grafana sidecar loads any ConfigMap labelled `grafana_dashboard: "1"`.

  ```sh
  kubectl -n monitoring create configmap weaviate-dashboards --from-file=dashboards/
  kubectl -n monitoring label configmap weaviate-dashboards grafana_dashboard=1
  ```

  The [Weaviate Helm chart](/deploy/installation-guides/k8s-installation.md) creates the scrape target
  when you set `serviceMonitor.enabled=true` alongside `env.PROMETHEUS_MONITORING_ENABLED=true`.

### Where the dashboards work

Weaviate's metrics do not depend on where it runs: every node serves `:2112/metrics` in Docker, on
bare metal and in Kubernetes alike. The only location labels come from Prometheus — `job` and
`instance`, plus `namespace`, `pod` and `service` when the target is discovered through a
ServiceMonitor. Every dashboard except **Kubernetes** uses Weaviate metrics only, and so behaves the
same in all three environments.

The **Kubernetes** dashboard is the exception. It reads `kube_pod_*` and `kube_statefulset_*` from
kube-state-metrics and `container_*` and `kubelet_volume_stats_*` from the kubelet, both of which
kube-prometheus-stack installs.

:::note "Node" means two different things
A *Weaviate node* is one Weaviate process, which in Kubernetes is one pod. A *Kubernetes node* is the
host machine that pod runs on. Every dashboard but **Kubernetes** knows only Weaviate nodes, so
questions about hosts — noisy neighbours, zone imbalance, or two replicas sharing a machine — are
answered on the Kubernetes dashboard.
:::

Two Weaviate labels collide with the target labels a ServiceMonitor adds: `namespace` on the
distributed-task metrics, and `endpoint` on the module metrics. Prometheus keeps its own label and
renames Weaviate's copy to `exported_namespace` and `exported_endpoint`.

## Query profiling

For per-query performance analysis, Weaviate provides [query profiling](/weaviate/search/query-profile.md). Unlike Prometheus metrics which show aggregate performance, query profiling provides per-shard timing breakdowns for individual queries, which is useful for diagnosing specific slow queries.

## `nodes` API Endpoint

To get collection details programmatically, use the [`nodes`](/deploy/configuration/status.md#cluster-node-data) REST endpoint.

import APIOutputs from '/\_includes/rest/node-endpoint-info.mdx';

<APIOutputs />

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
