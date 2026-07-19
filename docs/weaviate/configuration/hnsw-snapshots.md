---
title: HNSW Snapshots
sidebar_position: 47
sidebar_label: HNSW Snapshots
description: Learn how Weaviate uses HNSW snapshots for faster startup times, and how they were configured in versions before v1.39.
---

import HnswSnapshots from '/_includes/feature-notes/hnsw-snapshots.mdx';

<HnswSnapshots/>

HNSW (Hierarchical Navigable Small World) snapshots significantly reduce startup times for instances with large vector indexes.

:::info Concepts: HNSW snapshots
See this [concepts page](../concepts/storage.md#hnsw-snapshots) for a detailed description.
:::

## Snapshots in `v1.39` and later

Starting in `v1.39`, HNSW snapshots are always enabled and are not configurable.

The commit log compactor owns the on-disk lifecycle of the vector index, and snapshots are one of the file formats it produces. Weaviate creates and maintains them automatically, so there is nothing to enable, disable, schedule, or tune.

### Environment variables that no longer have an effect

The following environment variables are still recognized, so existing deployments continue to start without a configuration error. However, they are ignored:

- `PERSISTENCE_HNSW_DISABLE_SNAPSHOTS`
- `PERSISTENCE_HNSW_SNAPSHOT_INTERVAL_SECONDS`
- `PERSISTENCE_HNSW_SNAPSHOT_ON_STARTUP`
- `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_NUMBER`
- `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_SIZE_PERCENTAGE`

If any of these variables is set, Weaviate logs a warning at startup that names the variable and states that it has no effect and will be removed in a future version. Variables that are not set produce no warning. To clear the warnings, remove the variables from your deployment configuration.

Setting the equivalent options in a YAML or JSON configuration file is also accepted and also ignored, but it does not produce a startup warning.

## Configuring snapshot creation in versions before `v1.39`

:::note
This section applies to `v1.31` through `v1.38` only. In `v1.39` and later, the environment variables below are ignored.
:::

In these versions, HNSW snapshotting is an optional feature layered on top of the commit log, and the following environment variables control it.

HNSW snapshotting is **enabled by default** starting in `v1.36`. To disable it, set `PERSISTENCE_HNSW_DISABLE_SNAPSHOTS` to `true`. In versions prior to `v1.36`, HNSW snapshotting is disabled by default. Set `PERSISTENCE_HNSW_DISABLE_SNAPSHOTS` to `false` to enable it.

:::note
Before creating a new snapshot, the previous snapshot and the commit log difference need to be loaded into memory. Make sure you have enough memory to accommodate this process. This requirement does not apply in `v1.39` and later, where snapshots are merged from disk as a stream.
:::

### Snapshot on startup

Enable or disable snapshot creation on startup:

- `PERSISTENCE_HNSW_SNAPSHOT_ON_STARTUP`: If `true`, Weaviate will try to create a new snapshot during startup if there are changes in the commit log since the last snapshot. If there are no changes, then the existing snapshot will be loaded.
  - **Default:** `true`

### Periodic snapshots

Set the following to configure periodic snapshot creation. Note **all** of the following conditions must be met to trigger a snapshot:

1.  **A time interval has passed:**

    - `PERSISTENCE_HNSW_SNAPSHOT_INTERVAL_SECONDS`: The minimum time in seconds since the previous snapshot.
      - **Default:** `21600` seconds (6 hours)

2.  **Sufficient new commit logs (by number):**

    - `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_NUMBER`: The minimum number of new commit log files created since the last snapshot.
      - **Default:** `1`

3.  **Sufficient new commit logs (by size percentage):**
    - `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_SIZE_PERCENTAGE`: The minimum total size of new commit logs (as a percentage of the previous snapshot's size) required to trigger a new snapshot.
      - **Default:** `5` (meaning 5% of the previous snapshot's size in new commit logs). For example, if the previous snapshot was 1000MB, at least 50MB of new commit log data is required.

## Further resources

- [Concepts: Storage - Persistence and Crash Recovery](../concepts/storage.md#persistence-and-crash-recovery)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
