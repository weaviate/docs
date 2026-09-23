---
title: Migration and Upgrades 
sidebar_position: 0
image: og/docs/more-resources.jpg
# tags: ['migration']
---

## Upgrades

Weaviate is under active development, with new features and improvements being added regularly, including bugfixes. To take advantage of these updates, we recommend upgrading your Weaviate instance regularly.

### General upgrade instructions

When upgrading Weaviate, we recommend that you:

1. Create a complete [backup](/deploy/configuration/backups.md) of your current Weaviate instance before beginning any upgrade process.
1. Plan to upgrade one minor version at a time, always using the latest patch version of each minor release.

This approach of upgrading one minor version at a time helps to minimize the risk of issues during the upgrade process, by mirroring our testing and release process. Upgrading to the latest patch version of each minor release ensures that you have the latest bugfixes and improvements.

### Version-specific migration guides

These guides cover upgrades that need steps beyond swapping the image:

| Guide | Applies when |
| --- | --- |
| [1.25 (for Kubernetes users)](./weaviate-1-25.md) | Upgrading a Kubernetes deployment to `1.25.x` from `1.24.x` or lower. |
| [1.30 (BlockMax WAND migration)](./weaviate-1-30.md) | Moving collections created before `1.30` to the BlockMax WAND inverted index format. |
| [Archive](./archive.md) | Versions `1.19` and older. |

Two further notes apply to versions without their own guide:

- When upgrading to version `1.25.x` from `1.24.x` (or lower), you must perform a [Raft migration](#raft-migration-v1250).
- When upgrading to version `1.26.x` or higher (from the preceding version), ensure that the cluster metadata is synchronized.
    - To do so, poll the `/cluster/statistics` endpoint, and check that the correct number of nodes are reporting statistics, and the `synchronized` flag is showing `true`, before proceeding with the upgrade.
    - For an example implementation, see the [`wait_for_raft_sync` function here](https://github.com/weaviate/weaviate-local-k8s/blob/main/utilities/helpers.sh).

:::tip Scenario: upgrading from `v1.25.10` to `v1.27`

Between `v1.25` and `v1.27`, there are two minor versions, `v1.26` and `v1.27`. So:
<br/>

1. Create a backup of your current Weaviate instance.
1. Go to the [Weaviate releases page](https://github.com/weaviate/weaviate/tags):
    1. Find the latest `v1.26` patch version (e.g.: `1.26.11`).
    1. Find the latest `v1.27` patch version (e.g.: `1.27.5`).
1. Upgrade to the latest patch version of `v1.26`.
1. Upgrade to the latest patch version of `v1.27`.

:::

### Vector configuration defaults (v1.39.1+, v1.40+) {#vector-config-defaults}

Two defaults for **new** collections changed. Existing collections are untouched, and there is no migration step.

- From `v1.39.1`, [auto-schema](/weaviate/config-refs/collections.mdx#auto-schema) creates a single named vector called `default` with the vectorizer set to `none`, instead of a [single vector collection](/weaviate/config-refs/collections.mdx#single-vector-collections). [`DEFAULT_VECTORIZER_MODULE`](/deploy/configuration/env-vars/index.md#DEFAULT_VECTORIZER_MODULE) is not applied to it, so supply the vectors yourself for auto-created collections or [add a vector](/weaviate/manage-collections/vector-config.mdx#add-new-named-vectors) after the collection is created.
- From `v1.40`, a collection definition that sets no vector parameters at all creates a [collection without a vector](/weaviate/config-refs/collections.mdx#no-vector). Previously the server defaults filled in the top-level parameters and created a single vector collection. A definition that sets `vectorizer`, `vectorIndexType` or `vectorIndexConfig` is unaffected and still gets the defaults.

The `v1.40` change is only visible with a client that omits `vectorIndexType` when you do not set one. A client that still sends `vectorIndexType: hnsw` on every collection create keeps getting a single vector collection. The Python client stopped sending it in `v4.21.2`.

### Raft Migration (v1.25.0+)

Weaviate `v1.25.0` introduced Raft [as the consensus algorithm for cluster metadata](/weaviate/concepts/replication-architecture/cluster-architecture#metadata-replication-raft). This requires a one-time migration of the cluster metadata.

In [Docker-based self-hosted instances](/deploy/installation-guides/docker-installation.md), the migration is automatic.

In [Kubernetes-based self-hosted instances](/deploy/installation-guides/k8s-installation.md), you must perform a manual migration step. For more information, see the [Weaviate `v1.25.0` migration guide](./weaviate-1-25.md).

This was a significant change to the Weaviate architecture. Accordingly, we suggest performing another backup after upgrading to `v1.25.latest`, before proceeding with further upgrades to ensure that you have a recent backup.

### Backup Restoration Fix (v1.23.13+)

Before `v1.23.13`, there was a bug with the backup restoration process, which could lead to data not being stored correctly.

If you are upgrading from a version before `v1.23.13`, we recommend that you:

1. Create a backup of your current Weaviate instance.
2. Upgrade to at least `v1.23.13` (preferably to `v1.23.16`) or higher, using the [general upgrade instructions above](#general-upgrade-instructions).
3. Restore your backup to the upgraded instance.

## Downgrades

### RAFT Snapshots (v1.28.13+, v1.29.5+, v1.30.2+)

Multi-node instances of Weaviate running `1.28.13+`, `1.29.5+`, or `1.30.2+` may experience problems if downgraded to a `v1.27.x` version earlier than `1.27.26`. The cluster may not reach a **Ready** state due to a change in the way that RAFT snapshots are stored in the database.

The fix shipped in `1.27.26`, which safely handles the downgrade path to `1.27`.

If you need to downgrade Weaviate to `v1.27.x`, use `1.27.26` or higher.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
