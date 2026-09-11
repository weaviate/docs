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

The latest Go v6 client is version `v6.0.0-beta.2`.

<QuickLinks items={goV6CardsData} />

:::

This page covers the Weaviate Go client `v6`, a ground-up redesign of the [Go client](./index.md) built around a collections-first API — see [what changed](#what-changed-in-the-v6-client). For usage information that is not specific to the Go client, such as code examples, see the relevant pages in the [How-to manuals & Guides](../../guides.mdx).

## Installation

```bash
go get github.com/weaviate/weaviate-go-client/v6@v6.0.0-beta.2
```

Pin the version. `v6` is published to the public Go module proxy, so a bare `go get` resolves to the newest pre-release today, but it will move you onto `v6.0.0` without warning the moment that version ships.

:::info Which client version the examples target

The `Go v6` code examples throughout the documentation are written against the client's `v6` branch at commit [`dc3715f`](https://github.com/weaviate/weaviate-go-client/tree/dc3715f). Features merged after `v6.0.0-beta.2` do not compile against the published beta.

:::

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

The following behaviors are present in `v6.0.0-beta.2`.

### Calls that crash or hang

| Call | Failure | Workaround |
| :--- | :------ | :--------- |
| `Query.NearObject` with `ExcludeSelf: true` | Panics the calling process with `uuid.UUID are not supported`, on every call and for every input | Leave `ExcludeSelf` unset and drop the source object from the results yourself |
| A batch stream (`collection.Batch(...)`) carrying a reference via `b.Reference(...)` | `Close()` never returns and the stream's goroutine leaks, even though the reference is written. Errors on this path are swallowed, and `Wait()` can report a failure for a reference that actually succeeded | Use the batch stream for objects only, and write references with `Data.AddReferences` |
| `Query.Hybrid` with a nested `NearVector` whose `Target` is empty | Panics (nil dereference). A `NearVector` with a populated `Target` works | Set a vector target on the nested `NearVector`, or run the vector search on its own with `Query.NearVector` |

### Calls that silently return the wrong thing

| Call | Behavior | Workaround |
| :--- | :------- | :--------- |
| `Query.NearMedia` with an unset `Media` | Runs no similarity search at all: it returns arbitrary objects with a `nil` error, and any `Distance` or `Certainty` cutoff is dropped | Always set `Media`, using `query.Image`, `query.Audio`, `query.Video`, `query.Depth`, `query.Thermal`, or `query.IMU` |
| Any query using `query.AllTokensMatchCross` or the `query/boost` package | The client sends these to every server without checking its version. `AllTokensMatchCross` is ignored below Weaviate `1.37.15` / `1.38.8` / `1.39.0` and the search silently behaves as plain OR; a `Boost` is ignored below `1.38.0`. Same rows, same scores, no error | Check your Weaviate version before relying on either feature |
| Two objects with the same UUID inside one batch stream | Both `Add` calls succeed, one task is orphaned and blocks forever, `Close()` returns `nil`, and the write that survives is the *losing* one | Keep object IDs distinct within a single stream |
| A batch delete (`Data.DeleteSelected`) | `Matches`, `Successful`, and `Failed` are discarded and `Took` is always `0s` | Set `Verbose: true` and read the `Errors` map to see which objects were affected |
| `Tenants.Get` | Tenant activity statuses are not folded, so a HOT tenant compares equal to `tenant.Hot`, not to `tenant.Active` | Compare against the specific status values |

### Other caveats

- `Data.Replace` rejects an object that carries cross-references with HTTP 422 `invalid object: reference property is not a map`. Replace the object without its references, then add them back with `Data.AddReferences`.
- When the client fails to marshal a request locally — for example an empty vector target, or a property whose type it does not know — the error message is prefixed with a long `%!s(int32=...)` dump of the request. Server-side errors are not affected.
- The `Hybrid.Alpha` godoc published on pkg.go.dev has the semantics inverted. An `Alpha` of `0` is pure keyword search and `1` is pure vector search, as described in these docs and implemented by the server.

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
