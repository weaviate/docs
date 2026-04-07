---
title: Release Notes
sidebar_position: 0
description: "Changelog and release notes for Weaviate Database stable releases and client libraries. Covers supported versions, latest patch updates, minor version history, and upgrade guidance."
image: og/docs/more-resources.jpg
# tags: ['release notes']
---

## Version support policy

Weaviate supports the **latest three minor versions** of Weaviate Database with bug fixes and security patches. Older minor versions are not actively maintained.

We recommend always running the **latest stable patch version** of your current minor release, and upgrading to newer minor versions regularly to stay within the supported range.

For instructions on upgrading Weaviate one minor version at a time, see the [Migration and Upgrades guide](/deploy/migration/index.md).

import QuickLinks from "/src/components/QuickLinks";

export const pythonCardsData = [
{
title: "v1.36",
link: "https://github.com/weaviate/weaviate/releases/tag/v1.36.0",
icon: "fa fa-tags",
},
{
title: "v1.35",
link: "https://weaviate.io/blog/weaviate-1-35-release",
icon: "fa fa-tags",
},
{
title: "v1.34",
link: "https://weaviate.io/blog/weaviate-1-34-release",
icon: "fa fa-tags",
},
{
title: "v1.33",
link: "https://weaviate.io/blog/weaviate-1-33-release",
icon: "fa fa-tags",
},
{
title: "v1.32",
link: "https://weaviate.io/blog/weaviate-1-32-release",
icon: "fa fa-tags",
},
];

<QuickLinks items={pythonCardsData} />

This page lists [developer release notes](https://github.com/weaviate/weaviate/releases) for Weaviate Database.

- To see the GitHub release notes for a particular version, click on the version number.
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
