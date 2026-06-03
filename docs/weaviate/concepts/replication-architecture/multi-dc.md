---
title: Multi-Data center
sidebar_position: 5
description: "Running a Weaviate cluster across data centers (WAN), and the roadmap for topology-aware multi-data center replication."
image: og/docs/concepts.jpg
# tags: ['architecture']
---


Multi-Data center (Multi-DC) replication enables you to have multiple copies of the data on multiple servers across more than one data center. Since `v1.31`, Weaviate supports running a single cluster across multiple data centers. What is not yet supported is *topology-aware* Multi-DC replication, where Weaviate places replicas with awareness of data center topology — for example, automatically keeping a copy of the data in each region. If you are interested in topology-aware Multi-DC, upvote [this GitHub issue](https://github.com/weaviate/weaviate/issues/2436) and tell us about your use case so we can incorporate it into our roadmap.

Multi-DC replication is beneficial if you have user groups spread over different geographical locations (e.g. Iceland and Australia). When you place nodes in different local regions of user groups, latency can be decreased.
Multi-DC replication also comes with the additional benefit that data is redundant on more physical locations, which means that in the rare case of an entire  data center going down, data can still be served from another location.

In most deployments, you can work under the assumption that all replica nodes are in the same  data center. The advantage of this is that network requests between nodes are cheap and fast. The downside is that if the entire  data center fails, there is no redundancy. Topology-aware Multi-DC replication will solve this, [when implemented](https://github.com/weaviate/weaviate/issues/2436).

It is, however, possible to run a single Weaviate cluster whose nodes are spread across data centers by tuning the cluster networking for high-latency links. This is a networking-layer capability only — Weaviate still treats every node as part of one flat cluster and is not yet aware of data center topology when placing replicas. See [Running a single cluster across data centers (WAN)](#running-a-single-cluster-across-data-centers-wan) below.

<p align="center"><img src="/img/docs/replication-architecture/replication-regional-proximity-3.png" alt="Replication multi-dc" width="75%"/></p>

## Running a single cluster across data centers (WAN)

Weaviate can operate a single cluster across data centers (a wide-area network, or WAN) by adjusting its inter-node communication for high-latency, lower-reliability links.

:::info Networking only — not topology-aware replication
This configures how nodes discover and talk to each other across data centers. It does **not** make replication data center-aware (for example, keeping a replica in each region). The topology-aware Multi-DC replication feature described above remains on the [roadmap](https://github.com/weaviate/weaviate/issues/2436).
:::

### Enabling WAN mode

Set the `CLUSTER_ADVERTISE_ADDR` environment variable to enable WAN mode. When it is set, Weaviate switches its internal [memberlist](https://github.com/hashicorp/memberlist) configuration to `DefaultWANConfig`, which increases timeouts and relaxes failure-detection thresholds so they are suitable for cross-data center communication.

### Key environment variables

| Variable | Description | Required |
| --- | --- | --- |
| `CLUSTER_ADVERTISE_ADDR` | The public IP address that other nodes should use to reach this node. Setting this enables WAN mode. Must be a valid IP address (hostnames are rejected). | Yes (for WAN) |
| `CLUSTER_ADVERTISE_PORT` | The port to advertise to other nodes. If not set, it defaults to `CLUSTER_GOSSIP_BIND_PORT`. If set, it must be between `1024` and `65535`. | No |
| `CLUSTER_BIND_ADDR` | The local address to bind to. Defaults to `0.0.0.0`. | No |
| `CLUSTER_GOSSIP_BIND_PORT` | The port used for gossip (memberlist) traffic. Defaults to `7946`. | No |
| `CLUSTER_DATA_BIND_PORT` | The port used for data traffic. Defaults to `CLUSTER_GOSSIP_BIND_PORT + 1`. | No |
| `CLUSTER_JOIN` | A comma-separated list of `host:port` addresses of existing cluster members to join. | Yes (for joining) |

### Example configuration

Below is an example environment configuration for a node intended to participate in a cross-data center cluster:

```yaml
environment:
  - CLUSTER_HOSTNAME=weaviate-0
  - CLUSTER_ADVERTISE_ADDR=203.0.113.10 # Public IP of this node
  - CLUSTER_JOIN=203.0.113.20:7946 # Public IP:Port of a node in another DC
  - CLUSTER_BIND_ADDR=0.0.0.0 # Optional; this is already the default bind address
  - CLUSTER_GOSSIP_BIND_PORT=7946
  - CLUSTER_DATA_BIND_PORT=7947
  - RAFT_BOOTSTRAP_EXPECT=3 # Use an odd number > 1 across DCs for faster, more reliable elections
  - RAFT_JOIN=203.0.113.20:8300 # Join an existing Raft voter (default Raft port is 8300)
```

### Notes

- **Latency**: Cross-data center operations inherently have higher latency. Make sure your application timeouts account for this.
- **Security**: Gossip and data traffic are not encrypted by default. For cross-data center communication over the public internet, use a VPN or other secure tunnel, or make sure `CLUSTER_ADVERTISE_ADDR` is only reachable over a private network (for example, VPC peering).

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
