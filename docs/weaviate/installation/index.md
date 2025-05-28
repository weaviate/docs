---
title: How to install Weaviate
sidebar_position: 0
image: og/docs/installation.jpg
# tags: ['installation']
---

Weaviate is available as a hosted service, [Weaviate Cloud (WCD)](https://console.weaviate.cloud/), or as a self managed instance. If you manage your own instance, you can host it locally or with a cloud provider. Self-managed instances use the same Weaviate Database as WCD.

If you are upgrading from a previous version of Weaviate, see the [Migration Guide](docs/deploy/migration/index.md) for any changes that may affect your installation.

## Installation methods

To install and configure Weaviate, see the following:

- **[Weaviate Cloud](../../cloud/quickstart.mdx)**: Managed services for development and production environments.
- **[Docker Compose](docs/deploy/installation-guides/docker-installation.md)**: Docker containers are well suited for development and testing.
- **[Kubernetes](docs/deploy/installation-guides/k8s-installation.md)**: Kubernetes is ideal for scalable, production deployments.
- **[AWS Marketplace](./aws-marketplace.md)**: Deploy Weaviate directly from the AWS Marketplace.
- **[Snowpark Container Services](./spcs-integration.mdx)** Deploy Weaviate in Snowflake's Snowpark environment.
- **[Embedded Weaviate](./embedded.md)**: Experimental. Embedded Weaviate is a client based tool.

:::caution Native Windows support

Although Weaviate can be used on Windows via containerized environments like [Docker](docs/deploy/installation-guides/docker-installation.md) or [WSL](https://learn.microsoft.com/en-us/windows/wsl/), we don't offer native Windows support at this time.

:::

## Configuration files

Docker Compose and Kubernetes use yaml files to configure Weaviate instances. Docker uses the [`docker-compose.yml`](docs/deploy/installation-guides/docker-installation.md) file. Kubernetes relies on [Helm charts](docs/deploy/installation-guides/k8s-installation.md#weaviate-helm-chart) and the `values.yaml` file. The Weaviate documentation also calls these files `configuration yaml files`.

If you are self-hosting, consider experimenting on a small scale with Docker and then transferring your configuration to Kubernetes Helm charts when you are more familiar with Weaviate.

## Unreleased versions

import RunUnreleasedImages from '/_includes/configuration/run-unreleased.mdx'

<RunUnreleasedImages />

When you try upcoming features, please provide [feedback](https://github.com/weaviate/weaviate/issues/new/choose). Your comments are appreciated and help us to make Weaviate more useful for you.

## Related pages
- [Connect to Weaviate](../connections/index.mdx)
- [Weaviate Quickstart](../quickstart/index.md)
- [Weaviate Cloud Quickstart](../../cloud/quickstart.mdx)
- [References: Configuration](../configuration/index.mdx)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
