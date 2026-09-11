---
title: Deployment Troubleshooting Guide
---

import SkipLink from '/src/components/SkipValidationLink'

So you've deployed Weaviate and you're fully immersed in the world of vectors when suddenly you encounter a puzzling mystery. This page will serve as your handbook for when things go awry in "Vector Land!"

Consider every error message a clue to solving the mystery you're encountering. The [LOG_LEVEL](/deploy/configuration/env-vars#LOG_LEVEL) environment variable helps you to solve any mysteries you encounter. The various levels of logging will allow you to right-size the precise amount of information you need to solve any Vector Land mysteries.

## Common issues and solutions

Looking up one specific message? The [error message reference](/errors) lists Weaviate's error and warning messages by text and by message id, with the cause and the fix for each. Newer Weaviate versions link to it straight from the log entry, through a `docs_url` field, and from the error a client receives.

### The cluster is not accepting new information and there are disk space or `read-only` error messages in the logs.

<details>

<summary>Answer</summary>

#### Identifying the issue

As a first step, you'll want to examine your cluster's logs to identify the problem. If after checking the logs of your cluster you see error messages that include phrases like "read-only" or "disk space," then your cluster is more than likely in a `read-only` state due to insufficient disk space.

#### Resolving the issue

To solve this mystery, you'll need to increase the available disk space for your nodes. Once the disk space is increased, then you'll need to manually mark the affected shards or collections as writeable again.
You can also set the [`MEMORY_WARNING_PERCENTAGE`](/deploy/configuration/env-vars/index.md#MEMORY_WARNING_PERCENTAGE) environment variable to issue warnings when the memory limit is near.

</details>

### You're receiving inconsistent query results.

<details>

<summary> Answer </summary>

#### Identifying the issue

To confirm and identify the issue, you'll want to first run the same query multiple times to confirm that the results are inconsistent. If the inconsistent results are persisting, then you probably have asynchronous replication disabled for your deployment.

#### Resolving the issue

Check whether asynchronous replication is enabled. If `ASYNC_REPLICATION_DISABLED` is set to `true`, set it to `false`. Once async replication is enabled, the logs will show successful peer checks and node synchronization.

</details>

### Your nodes won't communicate, join a cluster, or maintain consensus.

<details>

<summary> Answer </summary>

#### Identifying the issue

Start with the logs of a node that is failing to join. A membership problem reads differently from a data problem: you'll see repeated attempts to contact the founding member, gossip timeouts, or Raft messages about an election that never settles on a leader. A node in this state can still pass its own health checks, so if the <SkipLink href="/weaviate/api/rest#tag/well-known/GET/.well-known/live">live endpoint</SkipLink> answers while the node stays outside the cluster, the process is healthy and the problem is membership.

To confirm it, query the <SkipLink href="/weaviate/api/rest#tag/cluster/get/cluster/statistics">`/v1/cluster/statistics`</SkipLink> endpoint. If it reports fewer nodes than you expect, or the top-level `synchronized` field is `false`, then your cluster has not reached consensus.

#### Resolving the issue

Work outward from each node's own identity to the network between the nodes.

- Point every joining node at the founding member with [`CLUSTER_JOIN`](/deploy/configuration/env-vars/index.md#CLUSTER_JOIN). The value is the service name and gossip port of that founding member, such as `weaviate-node-1:7100`, and every joining node must name the same one.
- Set [`CLUSTER_HOSTNAME`](/deploy/configuration/env-vars/index.md#CLUSTER_HOSTNAME) explicitly on every node. If you leave the hostname to the operating system and it changes across a restart, the node rejoins under a new name while the cluster is still holding a place for the old one. If the hostname cannot be resolved through DNS, set [`CLUSTER_ADVERTISE_ADDR`](/deploy/configuration/env-vars/index.md#CLUSTER_ADVERTISE_ADDR) to advertise the node's address directly.
- Give each node a [`CLUSTER_GOSSIP_BIND_PORT`](/deploy/configuration/env-vars/index.md#CLUSTER_GOSSIP_BIND_PORT), used to exchange network state information, and a [`CLUSTER_DATA_BIND_PORT`](/deploy/configuration/env-vars/index.md#CLUSTER_DATA_BIND_PORT), used to exchange data. By convention the data port is one higher than the gossip port. Then confirm that every node can actually reach every other node on both of those ports. A firewall rule, an unpublished container port, or a network policy that only exposes the HTTP port will let a node start up perfectly well and still leave it unable to find anyone.
- For consensus specifically, check the Raft settings. [`RAFT_JOIN`](/deploy/configuration/env-vars/index.md#RAFT_JOIN) names the voter nodes, and [`RAFT_BOOTSTRAP_EXPECT`](/deploy/configuration/env-vars/index.md#RAFT_BOOTSTRAP_EXPECT) sets how many voters the cluster waits for at bootstrap. If you set `RAFT_JOIN`, you must adjust `RAFT_BOOTSTRAP_EXPECT` by hand to match the number of voters you listed. When the two disagree, the cluster waits for a member that will never arrive.

Once the nodes are talking, check `/v1/cluster/statistics` again. Every node should appear in the response, and `synchronized` should be `true`.

</details>

### You've downgraded and now your clusters won't reach the `Ready` state.

<details>

<summary> Answer </summary>

#### Identifying the issue

If you have a multi-node instance running `1.28.13+`, `1.29.5+`, or `1.30.2+` and have downgraded to a `v1.27.x` version earlier than `1.27.26`.

#### Resolving the issue

If you need to downgrade Weaviate to `v1.27.x`, use `1.27.26` or higher.

- [Migration guides](../migration/index.md)

</details>

As you continue your adventures in Vector Land, remember that even the most seasoned vector detectives encounter mysterious cases from time to time. Behind every error message lies not just a problem, but the clue you need to run Weaviate in its most optimal form!

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
