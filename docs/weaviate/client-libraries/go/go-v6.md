---
title: Go client v6
sidebar_label: Go v6
description: "Install and use the release candidate of the Weaviate Go client v6: connect to Weaviate, create a collection, import objects, and run a semantic search with the collections-first Go API."
image: og/docs/client-libraries.jpg
# tags: ['go', 'go v6', 'client library']
---

import FilteredTextBlock from "@site/src/components/Documentation/FilteredTextBlock";
import QuickLinks from "/src/components/QuickLinks";
import GoV6ConnectCode from "!!raw-loader!/_includes/code/go-v6/connect_test.go";
import GoV6QuickstartCode from "!!raw-loader!/_includes/code/go-v6/quickstart_test.go";
import GoV6LocalCreateCode from "!!raw-loader!/_includes/code/go-v6/quickstart/local_create/main.go";

export const goV6CardsData = [
  {
    title: "weaviate/weaviate-go-client",
    link: "https://github.com/weaviate/weaviate-go-client",
    icon: "fa-brands fa-github",
  },
  {
    title: "Reference manual",
    link: "https://pkg.go.dev/github.com/weaviate/weaviate-go-client/v6",
    icon: "fa-solid fa-book",
  },
];

:::caution Release candidate

The Go `v6` client is a release candidate. The API can still change before the final release. `v6` does not yet cover the whole Weaviate feature set. For example, it has no generative search or reranking. For production work, use the [`v5` client](./index.md).

:::

:::note Go v6 client (SDK)

The latest Go v6 client is version `v6.0.0-rc.0`. The Go v6 code examples in the documentation are written for and tested against this release.

<QuickLinks items={goV6CardsData} />

:::

This page covers the Weaviate Go client `v6`, a ground-up redesign of the [Go client](./index.md) built around a collections-first API. See [what changed](#what-changed-in-the-v6-client). For usage information that is not specific to the Go client, such as code examples, see the relevant pages in the [How-to manuals & Guides](../../guides.mdx).

## Installation

```bash
go get github.com/weaviate/weaviate-go-client/v6@v6.0.0-rc.0
```

Pin the version. An unpinned `go get` picks up whatever pre-release or final release is newest, and its API can differ from the one these docs describe.

The client lives at the module root and its package is named `weaviate`:

```go
import weaviate "github.com/weaviate/weaviate-go-client/v6"
```

<details>
  <summary>Requirements: Go and Weaviate version compatibility & gRPC</summary>

#### Go version

The `v6` client module requires Go `1.26.0` or higher. On an older Go with the default `GOTOOLCHAIN=auto`, `go get` downloads a Go 1.26 toolchain and raises the `go` line in your `go.mod` to `1.26.0` without asking. With `GOTOOLCHAIN=local`, it fails with `requires go >= 1.26.0`.

#### Weaviate version compatibility

The `v6` client requires Weaviate `1.38.8` or higher. Earlier servers truncate leading zero bytes in the gRPC `id_as_bytes` field, so the client rejects the whole search response with `invalid UUID (got 15 bytes)`. Around one object in 256 has an affected ID, and every search that returns that object fails until you upgrade. Generally, we encourage you to use the latest version of the Go client and the Weaviate Database.

#### gRPC

The `v6` client uses remote procedure calls (RPCs) under the hood. It needs both the REST and the gRPC endpoint of your instance to be reachable, so a port for gRPC must be open to your Weaviate server. Creating the client and `client.IsReady` only check the REST endpoint. If the gRPC port is unreachable, the first data or query call fails with `code = Unavailable`.

<details>
  <summary>docker-compose.yml example</summary>

If you are running Weaviate with Docker, you can map the default port (`50051`) by adding the following to your `docker-compose.yml` file:

```yaml
ports:
  - 8080:8080
  - 50051:50051
```

</details>

</details>

## Get started

import BasicPrereqs from "/_includes/prerequisites-quickstart.md";

<BasicPrereqs />

### Connect to Weaviate

The client holds a gRPC connection, so always close it with `defer client.Close()`. Use `client.IsReady(ctx)` to check whether the instance is serving.

Connect to a local instance on the default ports (REST on `localhost:8080`, gRPC on `localhost:50051`):

<FilteredTextBlock
  text={GoV6ConnectCode}
  startMarker="// START LocalNoAuth"
  endMarker="// END LocalNoAuth"
  language="go6"
/>

To set the REST and gRPC endpoints yourself:

<FilteredTextBlock
  text={GoV6ConnectCode}
  startMarker="// START CustomURL"
  endMarker="// END CustomURL"
  language="go6"
/>

### Authentication

Connect to Weaviate Cloud with an API key. Pass the cluster hostname only, without a scheme:

<FilteredTextBlock
  text={GoV6ConnectCode}
  startMarker="// START APIKeyWCD"
  endMarker="// END APIKeyWCD"
  language="go6"
/>

`WithAPIKey` also works against a plain `http` endpoint, such as a local instance.

### Create a collection and import data

The following example connects to a local instance, [creates a collection](../../manage-collections/index.mdx) whose text properties are vectorized server-side, and [imports](../../manage-objects/import.mdx) three objects:

<FilteredTextBlock
  text={GoV6LocalCreateCode}
  startMarker="// START LocalCreate"
  endMarker="// END LocalCreate"
  language="go6full"
/>

### Search

Run a [semantic search](../../search/index.mdx) over the collection. The collection has exactly one vector, so the query resolves to it. With several vectors, name one with the `Target` field:

<FilteredTextBlock
  text={GoV6QuickstartCode}
  startMarker="// START NearText"
  endMarker="// END NearText"
  language="go6"
/>

## What changed in the v6 client

The most visible changes are:

- **Collections-first.** Operations are organized around collections. You get a handle for a collection once, then read, write, and search through it, rather than naming the collection on every request.
- **Context first, with no terminator call.** Every operation takes a request context and returns a result and an error directly. The trailing call that executed a builder chain is gone.
- **Named vectors by default.** Vectors are represented as named vectors throughout, which keeps single-vector and multi-vector collections consistent.
- **Grouped sub-clients.** Cluster-wide concerns are grouped under dedicated sub-clients: collections, aliases, roles, users, groups, backups, cluster, and replication. So are per-collection concerns: data, query, aggregation, configuration, and tenants.
- **Collection configuration.** `collection.Config` is the API for reading and changing a collection's configuration.
- **Vector index configuration.** You can configure an HNSW, flat, dynamic, or HFresh vector index, with compression, when you create a collection. Set the index type explicitly when you configure compression.
- **More vectorizers.** The `modules/openai`, `modules/google`, and `modules/huggingface` packages configure those providers' text vectorizers.
- **Aggregation with search.** Aggregations can run over a near text, near object, near media, or hybrid search.
- **Typed results.** Query results can be decoded into your own types.

Where an operation is not yet available, the Go v6 tab shows a short "Coming soon" note. To compare the two clients side by side, open the [connection pages](/weaviate/connections/index.mdx) and [how-to guides](../../guides.mdx) and switch between the Go and Go v6 tabs.

## Releases

Go to the [GitHub releases page](https://github.com/weaviate/weaviate-go-client/releases) to see the history of the Go client library releases and change logs. Pre-releases of `v6` are tagged there alongside the stable `v5` releases.

The client and server compatibility table on the [Go client page](./index.md#releases) tracks the `v5` client. For `v6`, see [Installation](#installation).

## Code examples & further resources

import CodeExamples from "/_includes/clients/code-examples.mdx";

<CodeExamples />

## Questions and feedback

import DocsFeedback from "/_includes/docs-feedback.mdx";

<DocsFeedback />
