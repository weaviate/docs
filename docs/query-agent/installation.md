---
title: Installation
description: "Install the Weaviate client with the agents extra to use the Query Agent."
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'getting-started']
---

<CloudOnlyBadge />

Install the Query Agent client package alongside the regular Weaviate client. Below are the prerequisites and the install commands for Python and JavaScript/TypeScript, and how to connect to the MCP server.

## Prerequisites

:::info What does the Query Agent have access to?

The Query Agent derives its access credentials from the Weaviate client object passed to it. This can be further restricted by the collection names provided to the Query Agent.

For example, if the associated Weaviate credentials' user has access to only a subset of collections, the Query Agent will only be able to access those collections.

:::

The Query Agent is available exclusively for use with a Weaviate Cloud instance. [See the page on Weaviate Cloud for more detail](/cloud/index.mdx).

You can try this Weaviate Agent with a free cluster on [Weaviate Cloud](/go/console?utm_content=agents).

:::note Supported languages
At this time, the Query Agent clients are available only for Python and JavaScript/TypeScript. Support for other languages will be added in the future.
:::

## Python client

For Python, you can install the Weaviate client library with the optional `agents` extras to use the Query Agent. This will install the `weaviate-agents` package along with the `weaviate-client` package.

Install the client library using the following command:

```shell
pip install -U "weaviate-client[agents]"
```

[See the Python Client installation page for more detail](./clients/python.md#installation).

#### Troubleshooting: Force `pip` to install the latest version

For existing installations, even `pip install -U "weaviate-client[agents]"` may not upgrade `weaviate-agents` to the [latest version](https://pypi.org/project/weaviate-agents/). If this occurs, additionally try to explicitly upgrade the `weaviate-agents` package:

```shell
pip install -U weaviate-agents
```

Or install a [specific version](https://github.com/weaviate/weaviate-agents-python-client/tags):

```shell
pip install -U weaviate-agents==||site.agents_python_version||
```

## JavaScript/TypeScript client

You can install for TypeScript or JavaScript via `npm`:

```shell
npm install weaviate-agents@latest
```

## MCP server

To use the Query Agent from an MCP-compatible tool or agent, such as Claude Code, Cursor, or LangChain, you don't need to install anything. Connect your MCP client to the hosted server:

| Setting | Value |
| --- | --- |
| Server URL | `https://api.agents.weaviate.io/mcp` |
| Transport | Streamable HTTP |
| Headers | `Authorization: Bearer <WEAVIATE_API_KEY>` and `X-Weaviate-Cluster-Url: <WEAVIATE_URL>` |

[See the MCP server page for more detail](./clients/mcp.md#connection-details).

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
