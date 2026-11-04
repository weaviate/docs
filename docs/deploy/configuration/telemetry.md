---
title: Telemetry
sidebar_position: 80
image: og/docs/configuration.jpg
# tags: ['telemetry', 'reference', 'configuration']
---

To help us improve Weaviate and understand community usage trends, Weaviate collects telemetry data by default. This includes basic information like your server version, operating system, the number of objects in your instance, cluster topology, which client libraries talk to it, and cloud metadata. We may use this data to identify potential customers for our commercial services and may share it with third parties for this purpose. For full details, see our [privacy policy](https://weaviate.io/privacy).

We do **not** collect your data objects, collection names, property names, tenant names, or any content from your datasets. Only the information listed below is collected.

## When data is sent

Each Weaviate node sends its own telemetry payload. A node sends a payload:

- once on startup (payload type `INIT`),
- every 24 hours while running (payload type `UPDATE`), and
- once on graceful shutdown (payload type `TERMINATE`).

The startup payload does not include the object count, because shards may not be loaded yet. Client usage counters (see below) are reset after every payload, so each payload covers only the period since the previous one.

Payloads are sent as an HTTPS `POST` to `https://telemetry.weaviate.io/weaviate-telemetry`.

## Data collected

The table lists every field in the payload and the Weaviate version that introduced it. Fields are only ever added; older servers send a subset.

| Field | Description | Since |
| --- | --- | --- |
| `machineId` | A random UUID generated when the process starts. It changes on every restart. | — |
| `type` | `INIT`, `UPDATE`, or `TERMINATE` (see above). | — |
| `version` | The Weaviate server version. | — |
| `os`, `arch` | Host operating system and CPU architecture, as reported by the Go runtime (for example `linux` and `amd64`). | — |
| `usedModules` | Names of the modules referenced in your collection definitions (vectorizers, generative, reranker, and so on). For Google modules, the name also indicates whether Vertex AI or AI Studio is used. Module *configuration* is not sent. | — |
| `objs` | The number of objects on this node. | — |
| `collectionsCount` | The number of collections in the schema. | — |
| `clientUsage` | The number of requests received in the period, grouped by client library and client library version. The library is identified from the `X-Weaviate-Client` header that the official Weaviate clients send. Requests without that header are not counted. | `v1.36` |
| `clientIntegrationUsage` | The number of requests received in the period, grouped by integration name and version, taken from the `X-Weaviate-Client-Integration` header. Integrations such as framework connectors set this header to identify themselves. Requests without that header are not counted. | `v1.38` |
| `cloudProvider`, `uniqueID` | The cloud provider (`AWS`, `GCP`, or `Azure`) and the account identifier for that provider. See [Cloud metadata](#cloud-metadata) for details and exact versions. | `v1.33` |
| `nodeId` | The name of this node, which is the value of [`CLUSTER_HOSTNAME`](/deploy/configuration/env-vars/index.md). If `CLUSTER_HOSTNAME` is not set, Weaviate uses the host's operating-system hostname. | `v1.39` |
| `clusterId` | A random UUID generated once per cluster and stored in the cluster's Raft state. Unlike `machineId`, it is the same on every node and persists across restarts. | `v1.39` |
| `nodeCount` | The number of nodes in the cluster. | `v1.39` |
| `maxReplicationFactor`, `replicationEnabled` | The highest replication factor of any collection, and whether it is greater than one. | `v1.39` |
| `mtCollectionCount` | The number of collections with multi-tenancy enabled. | `v1.39` |
| `namedVectorCollectionCount` | The number of collections that use named vectors. | `v1.39` |
| `asyncIndexingEnabled` | Whether [`ASYNC_INDEXING`](/deploy/configuration/env-vars/index.md) is on. | `v1.39` |
| `vectorIndexTypeCounts` | The number of vector indexes of each type (for example `hnsw`, `flat`, `dynamic`). | `v1.39` |

Each payload is also logged at `info` level with `action=telemetry_push`, so you can see exactly what your node sent.

## Other requests to weaviate.io

When telemetry is enabled, Weaviate also makes these requests. They stop when telemetry is disabled.

- **Startup banner.** Since `v1.39.4`, each node fetches the art for the startup banner from `https://weaviate.io/banner/v1.json` on startup and again every [`BANNER_INTERVAL`](/deploy/configuration/env-vars/index.md). The request carries the Weaviate version in its `User-Agent` header. You can keep telemetry on but turn off the banner with [`DISABLE_STARTUP_BANNER`](/deploy/configuration/env-vars/index.md).
- **Cluster ID in documentation links.** Since `v1.39`, links to `docs.weaviate.io` that Weaviate writes into log lines, error responses, and the startup banner carry the `clusterId` as a `?clusterid=` query parameter. Following such a link sends the cluster ID to the docs site. Nothing is sent unless the link is opened.

## Disabling telemetry data

To disable telemetry, add this line to your [system configuration](/deploy/configuration/env-vars/index.md) file:

```bash
DISABLE_TELEMETRY=true
```

This stops the telemetry payloads, the cloud metadata lookup, the banner fetch, and the cluster ID in documentation links. Set it on every node.

Two further variables adjust telemetry without disabling it: [`TELEMETRY_PUSH_INTERVAL`](/deploy/configuration/env-vars/index.md) changes how often `UPDATE` payloads are sent, and [`TELEMETRY_URL`](/deploy/configuration/env-vars/index.md) redirects payloads to your own endpoint, for example to inspect them.

## Cloud metadata

Since Weaviate version `v1.33.13`, `v1.34.12`, `v1.35.4`, and `v1.36.0`, Weaviate will, when available, collect basic metadata from metadata endpoints it has access to on selected cloud providers (Google Cloud, Amazon Web Services, Azure). On startup, Weaviate probes each provider's metadata endpoint with a one-second timeout and logs a notice when one responds.

More information about the metadata endpoints:

* [AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html)
* [GCP](https://docs.cloud.google.com/compute/docs/metadata/overview)
* [Azure](https://learn.microsoft.com/en-us/azure/virtual-machines/instance-metadata-service)

The cloud metadata contains:

* AWS: [AWS Account ID](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-identifiers.html)
* GCP: [Project ID](https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects)
* Azure: [Subscription ID](https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
