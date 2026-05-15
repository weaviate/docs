---
title: Installation
sidebar_position: 20
description: "Set up and install."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started']
---

# Weaviate Query Agent: Installation

## Prerequisites

:::info What does the Query Agent have access to?

The Query Agent derives its access credentials from the Weaviate client object passed to it. This can be further restricted by the collection names provided to the Query Agent.

For example, if the associated Weaviate credentials' user has access to only a subset of collections, the Query Agent will only be able to access those collections.

:::

This Agent is available exclusively for use with a Weaviate Cloud instance. Refer to the [Weaviate Cloud documentation](/cloud/index.mdx) for more information on how to set up a Weaviate Cloud instance.

You can try this Weaviate Agent with a free Sandbox instance on [Weaviate Cloud](/go/console?utm_content=agents).

:::note Supported languages
At this time, this Agent is available only for Python and TypeScript/JavaScript. Support for other languages will be added in the future.
:::

### Python Client

For Python, you can install the Weaviate client library with the optional `agents` extras to use Weaviate Agents. This will install the `weaviate-agents` package along with the `weaviate-client` package. For TypeScript/JavaScript, you can install the `weaviate-agents` package alongside the `weaviate-client` package.

Install the client library using the following command:

```shell
pip install -U "weaviate-client[agents]"
```

[See the Python Client installation section for more details.](./clients/python.md#installation)

#### Troubleshooting: Force `pip` to install the latest version

For existing installations, even `pip install -U "weaviate-client[agents]"` may not upgrade `weaviate-agents` to the [latest version](https://pypi.org/project/weaviate-agents/). If this occurs, additionally try to explicitly upgrade the `weaviate-agents` package:

```shell
pip install -U weaviate-agents
```

Or install a [specific version](https://github.com/weaviate/weaviate-agents-python-client/tags):

```shell
pip install -U weaviate-agents==||site.weaviate_agents_version||
```

### TypeScript/JavaScript Client

You can install for TypeScript or JavaScript via `npm`:

```shell
npm install weaviate-agents@latest
```
