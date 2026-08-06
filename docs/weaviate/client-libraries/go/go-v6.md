---
title: Go client v6
sidebar_label: Go v6
description: "Install and use the beta Weaviate Go client v6: connect to Weaviate, create a collection, import objects, and run a semantic search with the collections-first Go API."
image: og/docs/client-libraries.jpg
# tags: ['go', 'go v6', 'client library']
---

import FilteredTextBlock from "@site/src/components/Documentation/FilteredTextBlock";
import QuickLinks from "/src/components/QuickLinks";
import GoV6ConnectCode from "!!raw-loader!/_includes/code/go-v6/connect_test.go";
import GoV6QuickstartCode from "!!raw-loader!/_includes/code/go-v6/quickstart_test.go";

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

:::caution Beta release

The Go `v6` client is a pre-release: the API can still change, and `v6` does not yet cover the whole Weaviate feature set. For production work, use the [`v5` client](./index.md).

:::

:::note Go v6 client (SDK)

The latest Go v6 client is version `v6.0.0-beta.1`.

<QuickLinks items={goV6CardsData} />

:::

This page covers the Weaviate Go client `v6`, a ground-up redesign of the [Go client](./index.md) built around a collections-first API — see [what changed](#what-changed-in-the-v6-client). For usage information that is not specific to the Go client, such as code examples, see the relevant pages in the [How-to manuals & Guides](../../guides.mdx).

## Installation

```bash
go get github.com/weaviate/weaviate-go-client/v6@v6.0.0-beta.1
```

Pin the version. `v6` is published to the public Go module proxy, so a bare `go get` resolves to the newest pre-release today, but it will move you onto `v6.0.0` without warning the moment that version ships.

The client lives at the module root and its package is named `weaviate`:

```go
import weaviate "github.com/weaviate/weaviate-go-client/v6"
```

<details>
  <summary>Requirements: Go and Weaviate version compatibility & gRPC</summary>

#### Go version

The `v6` client module requires Go `1.25.8` or higher.

#### Weaviate version compatibility

The `v6` client requires Weaviate `1.38.8` or higher. Earlier servers truncate leading zero bytes in the gRPC `id_as_bytes` field, so the client rejects the whole search response with `invalid UUID (got 15 bytes)`. Around one object in 256 has an affected ID, and every search that returns that object fails until you upgrade. Generally, we encourage you to use the latest version of the Go client and the Weaviate Database.

#### gRPC

The `v6` client uses remote procedure calls (RPCs) under-the-hood. It needs both the REST and the gRPC endpoint of your instance to be reachable, so a port for gRPC must be open to your Weaviate server.

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

:::caution Bearer credentials require TLS

API keys and OIDC tokens are sent as bearer credentials over gRPC, which requires transport-level security. Passing `WithAPIKey`, `WithBearerToken`, or any other token source alongside a plaintext `http` endpoint fails while the client is being constructed, in `NewClient`, with `credentials require transport level security`. Authenticate against an `https` endpoint. `NewLocal` defaults to `http`, so a local instance needs both `weaviate.WithScheme("https")` and TLS terminated in front of Weaviate.

:::

### Create a collection and import data

The following example connects to a local instance, [creates a collection](../../manage-collections/index.mdx) whose text properties are vectorized server-side, and [imports](../../manage-objects/import.mdx) three objects:

<FilteredTextBlock
  text={GoV6QuickstartCode}
  startMarker="// START LocalCreate"
  endMarker="// END LocalCreate"
  language="go6"
/>

### Search

Run a [semantic search](../../search/index.mdx) over the collection. The collection has exactly one vector, so the query resolves to it; with several vectors, name one with the `Target` field:

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
- **Grouped sub-clients.** Cluster-wide concerns, such as collections, roles, users, backups, and replication, and per-collection concerns, such as data, query, aggregation, and tenants, are grouped under dedicated sub-clients.
- **Typed results.** Query results can be decoded into your own types.

Where an operation is not yet available, the `Go v6` tab shows a short "Coming soon" note. To compare the two clients side by side, open the [connection pages](/weaviate/connections/index.mdx) and [how-to guides](../../guides.mdx) and switch between the `Go` and `Go v6` tabs.

## Known limitations

Four exported methods compile but fail at runtime in `v6.0.0-beta.1`:

| Method | Failure | Workaround |
| :----- | :------ | :--------- |
| `Data.Replace` | The server rejects the request with HTTP 422 `field 'id' is immutable` | Delete the object with `Data.Delete`, then insert it again with the same ID |
| `Data.DeleteSelected` | Panics | Query for the IDs you want to remove, then delete them one at a time with `Data.Delete` |
| `Tenants.Get` | Panics | None in `v6` |
| `Query.Hybrid`, when given a `NearVector` | Panics | Run the vector search on its own with `Query.NearVector`, which is unaffected |

Please [open an issue](https://github.com/weaviate/weaviate-go-client/issues) if you hit another.

## Releases

Go to the [GitHub releases page](https://github.com/weaviate/weaviate-go-client/releases) to see the history of the Go client library releases and change logs. Pre-releases of `v6` are tagged there alongside the stable `v5` releases.

The client and server compatibility table on the [Go client page](./index.md#releases) tracks the `v5` client. For `v6`, see [Installation](#installation).

## Code examples & further resources

import CodeExamples from "/_includes/clients/code-examples.mdx";

<CodeExamples />

## Questions and feedback

import DocsFeedback from "/_includes/docs-feedback.mdx";

<DocsFeedback />
