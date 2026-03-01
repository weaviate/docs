---
title: Cluster status and metadata
sidebar_position: 70
image: og/docs/configuration.jpg
# tags: ['status', 'nodes', 'metadata', 'reference', 'configuration']
---

Monitor the health, status, and metadata of your Weaviate cluster.

## Liveness

The `live` endpoint checks if the application is alive. You can use it for a Kubernetes liveness probe.

#### Usage

The endpoint accepts a `GET` request:

```js
GET /v1/.well-known/live
```

The endpoint returns HTTP status code `200` if the application is able to respond to HTTP requests.

#### Example

import WellKnownLive from '/_includes/code/wellknown.live.mdx';

<WellKnownLive/>

The endpoint returns HTTP status code `200` if the application is able to respond to HTTP requests.

## Readiness

The `ready` endpoint checks if the application is ready to receive traffic. You can use it for Kubernetes readiness probe.

#### Usage

The discovery endpoint accepts a `GET` request:

```js
GET /v1/.well-known/ready
```

The endpoint returns HTTP status code `200` if the application is able to respond to HTTP requests. If the application is currently unable to serve traffic, the endpoint returns HTTP status code `503`.

If the application is unavailable and you have horizontal replicas of Weaviate that can receive traffic, redirect traffic to one of the replicas.

#### Example

import WellknownReady from '/_includes/code/wellknown.ready.mdx';

<WellknownReady/>

## Operational modes

:::info Added in `v1.35.0`
:::

Each Weaviate node can be set to one of the following operational modes, limiting the types of operations it can handle:
- `ReadWrite`: (default) There are no restrictions; the node can handle both read and write operations.
- `WriteOnly`: The node is limited to write operations.
- `ReadOnly`: The node is limited to read operations and backup creation via the `/backups` endpoints.
- `ScaleOut`: The same as `ReadOnly`, with additional CUD operations on `/replication` endpoints allowed.

These modes can be configured using the `OPERATIONAL_MODE` [environment variable](./env-vars/index.md), or the equivalent `operational_mode` [runtime configuration](./env-vars/runtime-config.md).

## Schema synchronization

The `v1/schema/cluster-status` endpoint displays the status of the schema synchronization. The endpoint returns the following fields:

- `healthy`: The status of the schema synchronization.
- `hostname`: The hostname of the Weaviate instance.
- `ignoreSchemaSync`: Whether to ignore the cluster check at startup (for recovery from an out-of-sync situation).
- `nodeCount`: The number of nodes in the cluster.

Example response:

```js
{
    "healthy": true,
    "hostname": "node1",
    "ignoreSchemaSync": false,
    "nodeCount": 3
}
```

## Cluster node data

You can retrieve information about individual nodes in a Weaviate cluster. The query can be for the entire cluster, or for a particular collection.

### Parameters

| Name | Location | Type | Description |
| ---- | -------- | ---- | ----------- |
| `output` | body | string | How much information to include in the output. Options:  `minimal` (default) and `verbose` (includes shard information). |

### Returned data:

import APIOutputs from '/_includes/rest/node-endpoint-info.mdx';

<APIOutputs />

### Example

The following command will retrieve summary information about all nodes in the cluster:

import Nodes from '/_includes/code/nodes.mdx';

<Nodes/>

Example output:

```json
{
  "nodes": [
    {
      "batchStats": {
        "ratePerSecond": 0
      },
      "gitHash": "e6b37ce",
      "name": "weaviate-0",
      "stats": {
        "objectCount": 0,
        "shardCount": 2
      },
      "status": "HEALTHY",
      "version": "1.22.1"
    },
    {
      "batchStats": {
        "ratePerSecond": 0
      },
      "gitHash": "e6b37ce",
      "name": "weaviate-1",
      "stats": {
        "objectCount": 1,
        "shardCount": 2
      },
      "status": "HEALTHY",
      "version": "1.22.1"
    },
    {
      "batchStats": {
        "ratePerSecond": 0
      },
      "gitHash": "e6b37ce",
      "name": "weaviate-2",
      "stats": {
        "objectCount": 1,
        "shardCount": 2
      },
      "status": "HEALTHY",
      "version": "1.22.1"
    }
  ]
}
```

## Cluster metadata

You can retrieve metadata about the Weaviate instance, such as:

- `hostname`: The location of the Weaviate instance.
- `version`: The version of Weaviate.
- `modules`: Module specific info.

### Example

import Meta from '/_includes/code/meta.mdx';

<Meta/>

returns:

```json
{
  "hostname": "http://[::]:8080",
  "modules": {
    "text2vec-contextionary": {
      "version": "en0.16.0-v0.4.21",
      "wordCount": 818072
    }
  },
  "version": "1.0.0"
}
```

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
