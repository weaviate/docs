---
title: Release Notes
description: "Changelog and release notes for Weaviate Database stable releases and client libraries. Covers supported versions, latest patch updates, minor version history, and upgrade guidance."
image: og/docs/more-resources.jpg
# tags: ['release notes']
---

## Version support policy

Weaviate supports the **latest three minor versions** of Weaviate Database with bug fixes and security patches. Older minor versions are not actively maintained.

We recommend always running the **latest stable patch version** of your current minor release, and upgrading to newer minor versions regularly to stay within the supported range.

For instructions on upgrading Weaviate one minor version at a time, see the [Migration and Upgrades guide](/deploy/migration/index.md).

These are the supported minor versions and their latest patch releases:

| Minor version | Latest patch | Status |
| --- | --- | --- |
| `1.39` | [`v1.39.5`](https://github.com/weaviate/weaviate/releases/tag/v1.39.5) | Latest release |
| `1.38` | [`v1.38.15`](https://github.com/weaviate/weaviate/releases/tag/v1.38.15) | Supported |
| `1.37` | [`v1.37.17`](https://github.com/weaviate/weaviate/releases/tag/v1.37.17) | Supported |

`1.36` and older are no longer maintained. Upgrade to a supported version.

This page lists [developer release notes](https://github.com/weaviate/weaviate/releases) for Weaviate Database.

- To see the GitHub release notes for a particular version, click on the patch number.
- For more information on upgrading Weaviate, see the [Migration guide](/deploy/migration/index.md).

:::note Feature version notes

Feature pages in the documentation include notes indicating which version a feature was introduced in. For information on features before `v1.30`, refer to the [documentation archive](https://archive.docs.weaviate.io/). However, we highly recommend upgrading to a newer, supported version of Weaviate.

:::

## Weaviate Database and client releases

import ReleaseHistory from '/\_includes/release-history.md';

<ReleaseHistory />

## Client library release notes

Refer to the GitHub release notes for the corresponding client library for more information.

- [Python](https://github.com/weaviate/weaviate-python-client/releases)
- [TypeScript/JavaScript](https://github.com/weaviate/typescript-client/releases)
- [Go](https://github.com/weaviate/weaviate-go-client/releases)
- [Java](https://github.com/weaviate/java-client/releases)
- [C#/.NET](https://github.com/weaviate/csharp-client/releases)
