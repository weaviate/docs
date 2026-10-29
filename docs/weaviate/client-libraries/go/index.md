---
title: Go client
sidebar_label: Go
description: "Official Go client library documentation for integrating Weaviate with Go applications and services."
image: og/docs/client-libraries.jpg
# tags: ['go', 'go v6', 'client library']
---

import FilteredTextBlock from "@site/src/components/Documentation/FilteredTextBlock";
import QuickLinks from "/src/components/QuickLinks";
import GoV6GetStartedCode from "!!raw-loader!/_includes/code/go-v6/quickstart/get_started/main.go";

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

:::note Go v6 client (SDK)

The latest Go client is version `v||site.go_client_version||`.

<QuickLinks items={goV6CardsData} />

:::

This page covers the Weaviate Go client `v6`, a ground-up redesign of the [`v5` Go client](./go-v5.md) built around a collections-first API. For usage information that is not specific to the Go client, such as code examples, see the relevant pages in the [How-to manuals & Guides](../../guides.mdx).

## Installation

```bash
go get github.com/weaviate/weaviate-go-client/v6
```

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

The following code demonstrates how to:

1. [Connect](../../connections/index.mdx) to a local Weaviate instance.
1. [Create a new collection](../../manage-collections/index.mdx).
1. [Import data](../../manage-objects/import.mdx) and vectorize it.
1. Perform a [vector search](../../search/index.mdx).

<FilteredTextBlock
  text={GoV6GetStartedCode}
  startMarker="// START GetStarted"
  endMarker="// END GetStarted"
  language="gofull"
/>

For more code examples, check out the [How-to manuals & Guides](../../guides.mdx) section. Where an operation is not yet available in the `v6` client, the Go tab shows a short "Coming soon" note.

## Releases

Go to the [GitHub releases page](https://github.com/weaviate/weaviate-go-client/releases) to see the history of the Go client library releases and change logs.

The client and server compatibility table on the [Go (v5) page](./go-v5.md#releases) tracks the `v5` client. For `v6`, see [Weaviate version compatibility](#weaviate-version-compatibility).

## Code examples & further resources

import CodeExamples from "/_includes/clients/code-examples.mdx";

<CodeExamples />

## Questions and feedback

import DocsFeedback from "/_includes/docs-feedback.mdx";

<DocsFeedback />
