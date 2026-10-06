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

OIDC authentication does not work in this release. See [Known limitations](#known-limitations).

### Create a collection and import data

The following example connects to a local instance, [creates a collection](../../manage-collections/index.mdx) whose text properties are vectorized server-side, and [imports](../../manage-objects/import.mdx) three objects:

<FilteredTextBlock
  text={GoV6QuickstartCode}
  startMarker="// START LocalCreate"
  endMarker="// END LocalCreate"
  language="go6"
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
- **Collection configuration.** `collection.Config` is the API for reading and changing a collection's configuration. Most of its update calls fail in this release. See [Known limitations](#known-limitations).
- **Vector index configuration.** You can configure an HNSW, flat, dynamic, or HFresh vector index, with compression, when you create a collection. Compression needs an explicit index type. See [Known limitations](#known-limitations).
- **More vectorizers.** The `modules/openai`, `modules/google`, and `modules/huggingface` packages configure those providers' text vectorizers.
- **Aggregation with search.** Aggregations can run over a near text, near object, near media, or hybrid search.
- **Typed results.** Query results can be decoded into your own types.

Where an operation is not yet available, the Go v6 tab shows a short "Coming soon" note. To compare the two clients side by side, open the [connection pages](/weaviate/connections/index.mdx) and [how-to guides](../../guides.mdx) and switch between the Go and Go v6 tabs.

## Known limitations

The following behaviors are present in `v6.0.0-rc.0`.

### Calls that crash, hang, or fail

| Call | Failure | Workaround |
| :--- | :------ | :--------- |
| `Config.UpdateVectorConfig`, `UpdateInvertedIndexConfig`, `UpdateReplicationConfig`, `UpdateMultiTenancyConfig`, `UpdateObjectTTLConfig`, and `SetPropertyDescription` | On a collection without named vectors, `UpdateVectorConfig` panics with `assignment to entry in nil map`. Otherwise the update calls fail with HTTP 422 on any collection that has a property, and on any HNSW or dynamic index. `Config.AddProperty`, `Config.AddReference`, and `Config.DropPropertyIndex` are not affected | Treat these calls as unusable in this release. Change the configuration with the REST API or another client |
| Canceling the context of a batch stream (`collection.Batch(...)`) while `Close()` is draining | Panics the process with `close of closed channel` in 7 of 10 test runs. The panic comes from a client goroutine, so your code cannot recover it | None known |
| A batch stream carrying a reference via `b.Reference(...)` | `Close()` never returns, and `Wait()` on the reference's task never returns, even though the reference is written | Use the batch stream for objects only, and write references with `Data.AddReferences` |
| A batch stream `Add` with a context that is already canceled | In 6 of 10 test runs, `Add` returned `context canceled`. `Close()` then hung, and later objects were not written. In the other 4 runs, `Add` returned no error and the canceled object was written anyway | None known |
| OIDC authentication with `WithBearerToken`, `WithClientCredentials`, or `WithResourceOwnerPasswordCredentials` | The client requests tokens from the discovery document URL and gets `oauth2: "HTTP 404 Not Found"`. Client credentials, password credentials, and a bearer token without `ExpiresIn` fail in `NewClient`. With `ExpiresIn` set, every call fails from 30 seconds before the access token expires | Use an API key, or create a new client with a fresh token before the old one expires |

### Calls that return wrong results without an error

| Call | Behavior | Workaround |
| :--- | :------- | :--------- |
| Any filter on a `date` property, including in `Data.DeleteSelected` | The filter value is truncated to whole seconds, so the wrong objects match. `Data.DeleteSelected` with such a filter deletes the wrong objects | None known |
| `Data.Insert` and the batch stream `Object` call with a `date` or `date[]` property | Sub-second precision is dropped. `03:04:05.678` is stored as `03:04:05` | None known |
| A `VectorConfig` with `Compression` but no `Index` | The compression is dropped. The collection is created without it, and no error is returned | Set `Index` explicitly, for example `vectorindex.HNSW{}` |
| `Query.NearVector` with a nil `Target`, or a `NearVector` with a nil `Target` nested in `Query.Hybrid` | The standalone query returns every object in the collection, ignores `Distance` and `Certainty`, and returns no error. The nested one is dropped, so the hybrid search vectorizes the query text instead, or fails on a collection without a vectorizer | Set a vector target |
| `Data.Insert` and the batch stream `Object` call | The client changes the `Properties` map you pass in. Array values are removed, and `time.Time` and `uuid.UUID` values become strings. Inserting the same map again stores fewer properties | Build a new properties map for each insert |
| `Aggregate` requests with a `Filter` in the search | The filter is ignored. Counts and metrics cover every object the search matches. `Aggregate.OverAll` has no filter option | None known |
| `Config.Get` (and `Collections.GetConfig`) | Compression reads back as an arbitrary quantizer type that can differ between runs, whether or not one is enabled. `Dynamic.Threshold` reads `0`. A flat index has no `Distance` field | None known |
| `Roles.Create`, `Roles.Get`, and `Roles.List` with `Nodes` or `Roles` permissions | `Create` drops them and returns `nil`. `Get` and `List` return them with every action flag `false` | None known |
| A `vectorindex.Muvera` encoder on a multi-vector index | The encoder is accepted on create but stored disabled. No error is returned | None known |

### Other caveats

- A `types.Vector` with an empty `Name` is not resolved to the collection's vector on writes. `Data.Insert`, `Data.Replace`, and `Data.Update` fail with `does not have configuration for vector`. Set `Name`, for example to `default`.
- In a batch stream, a second `Add` with the same UUID returns `batch.ErrDuplicatedTask` only while the first is still in flight. Once the first object has been flushed, the second `Add` is accepted and overwrites it.
- `Config.ListShards` returns no shard status, so a read-only shard does not show as read-only.
- `Data.DeleteSelected` always reports `Took` as `0s` and returns no successful or failed counts. Per-object failures come back as a `data.DeleteError` error.
- `Data.Update` with a cross-reference adds the reference to the existing list rather than replacing it.
- A batch task's `Wait()` does not return until its batch is flushed. Called before `Close()`, it blocked for more than 10 seconds in testing with one object in the batch. Call `Close()` first, then `Wait()`.
- `Roles.AddPermissions` with only `Nodes` or `Roles` permissions fails with HTTP 400.
- With `KeepAlive.PermitWithoutStream` set to `true`, a default Weaviate server closes the idle connection after about three minutes with `too_many_pings`. The next call reconnects.
- When the client fails to marshal a request locally, for example a property whose type it does not know, the error message is prefixed with a long `%!s(int32=...)` dump of the request. Server-side errors are not affected.
- The `Hybrid.Alpha` godoc published on pkg.go.dev has the semantics inverted. An `Alpha` of `0` is pure keyword search and `1` is pure vector search, as described in these docs and implemented by the server.
- The client does not check the server version. On a server older than the supported minimum, `query.AllTokensMatchCross` and the `query/boost` package can be silently ignored.

Please [open an issue](https://github.com/weaviate/weaviate-go-client/issues) if you hit another limitation.

## Releases

Go to the [GitHub releases page](https://github.com/weaviate/weaviate-go-client/releases) to see the history of the Go client library releases and change logs. Pre-releases of `v6` are tagged there alongside the stable `v5` releases.

The client and server compatibility table on the [Go client page](./index.md#releases) tracks the `v5` client. For `v6`, see [Installation](#installation).

## Code examples & further resources

import CodeExamples from "/_includes/clients/code-examples.mdx";

<CodeExamples />

## Questions and feedback

import DocsFeedback from "/_includes/docs-feedback.mdx";

<DocsFeedback />
