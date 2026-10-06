---
title: MCP server
description: "Connect MCP-compatible tools and agents to the Query Agent through its hosted MCP server."
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'clients', 'mcp']
---

The Query Agent is available as a remote [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server hosted by Weaviate. Any MCP-compatible client can use it to query the data in your Weaviate Cloud cluster, with no client library to install. Examples include coding assistants such as Claude Code and Cursor, workspace assistants such as Notion AI, and agent frameworks such as LangChain or Pydantic AI.

The server exposes two tools that map to the Query Agent's [Ask Mode](../guides/ask_mode.md) and [Search Mode](../guides/search_mode.md):

| Tool | Description |
| --- | --- |
| `query_agent_ask` | Answers a natural-language question from your data, returning a written answer. |
| `query_agent_search` | Runs an AI-powered search and returns the matching objects, best match first. |

Both tools are read-only: they run searches, filtered retrieval queries and aggregations on your data, but never modify it.

## Connection details

| Setting | Value |
| --- | --- |
| Server URL | `https://api.agents.weaviate.io/mcp` |
| Transport | Streamable HTTP |

Every request must include the following HTTP headers:

| Header | Required | Value |
| --- | --- | --- |
| `Authorization` | Yes | `Bearer <WEAVIATE_API_KEY>`: an API key for your Weaviate Cloud cluster. |
| `X-Weaviate-Cluster-Url` | Yes | Your Weaviate Cloud cluster URL, such as `https://abc123.c0.us-west3.gcp.weaviate.cloud`. |
| Model provider keys, such as `X-OpenAI-Api-Key` | Only if needed | Required if your collections use a third-party model provider (such as `text2vec-openai`) for embeddings. These headers are forwarded to Weaviate, just like the [headers you pass to the Weaviate client](/weaviate/model-providers). |

:::info What does the MCP server have access to?

The MCP server uses the permissions of the API key you provide. It can only see and query the collections that this key can access. To limit what an assistant or agent can reach, use an API key whose [role](/cloud/manage-clusters/authorization) is restricted to the relevant collections.

:::

## Connect a client

To connect any MCP client, point it at the server URL using the Streamable HTTP transport, and set the headers from [Connection details](#connection-details).

For step-by-step examples, see the following recipes:

<!-- TODO: link each item to its Weaviate Recipes page once published. -->

- Claude Code (coming soon)
- Cursor (coming soon)
- Notion AI (coming soon)
- LangChain (coming soon)
- Pydantic AI (coming soon)

## Choosing collections

Both tools take a required `collections` argument. You don't need to tell the model which collections exist: when a client lists the server's tools, each tool's description ends with the collections available in your cluster. For up to 100 collections, the `collections` parameter is also restricted to these names. The model therefore picks from your actual collections instead of guessing.

Collection names are case-insensitive for the first letter (`eCommerce` resolves to `ECommerce`), matching the Query Agent client libraries.

The MCP server does not support the following collections:

- [Multi-tenant](/weaviate/manage-collections/multi-tenancy) collections
- Collections with more than one [named vector](/weaviate/config-refs/collections#named-vectors). Collections with a single named vector are supported, and that vector is used automatically.

To query these collections, use the [Python](./python.md) or [TypeScript](./typescript.md) client, which support [advanced collection configuration](../reference/advanced_collections.md).

## Tools

### `query_agent_ask`

Turns a natural-language question into searches and aggregations, then writes an answer based on the retrieved data. See [Ask Mode](../guides/ask_mode.md) for how this works.

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `query` | `string` | Required | The natural-language question to answer. |
| `collections` | `string[]` | Required | The collections to answer from. |
| `result_evaluation` | `"none"` \| `"llm"` | `"none"` | Set to `"llm"` to have the agent evaluate its own answer. See [Ask Mode parameters](../guides/ask_mode.md#parameters). |

The result always contains `final_answer`. With `result_evaluation: "llm"`, it also contains:

| Field | Description |
| --- | --- |
| `is_partial_answer` | Whether information that the query asked for is missing from the answer. |
| `missing_information` | What could not be found in the data. |
| `sources` | The objects the answer drew on, each as `{ "object_id", "collection" }`. |

```json
{
  "final_answer": "The most expensive blue t-shirt is the Neotech Noir Tee by Vivid Verse, priced at $46.00.",
  "is_partial_answer": false,
  "missing_information": [],
  "sources": [
    { "object_id": "9f9fe575-be97-46d9-a5ca-ff41ae57bef4", "collection": "ECommerce" }
  ]
}
```

### `query_agent_search`

Combines AI-powered semantic search with structured filtering and returns the matching objects directly. See [Search Mode](../guides/search_mode.md) for how this works.

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `query` | `string` | Required | The natural-language search query. |
| `collections` | `string[]` | Required | The collections to search. |
| `limit` | `integer` | `20` | Maximum number of results to return (1–100). |
| `offset` | `integer` | `0` | Number of results to skip, for pagination. |
| `effort` | `"medium"` \| `"high"` \| `"ultrahigh"` | `"medium"` | How much work the agent puts into the search. Higher effort reranks more candidates. See [Effort](../guides/search_mode.md#effort). |
| `filtering` | `"recall"` \| `"precision"` | `"recall"` | `"precision"` applies the agent's filters strictly. `"recall"` also searches without uncertain filters, so plausible matches are not filtered out. See [Customized filtering](../guides/search_mode.md#customized-filtering). |
| `diversity_weight` | `number` \| unset | unset | Value from `0` (pure relevance) to `1` (maximum diversity). See [diversity ranking](../guides/search_mode.md#diversity-ranking). |

The result contains a `results` list with the matching objects in rank order. Each object is given as a map of its property names to their values:

```json
{
  "results": [
    { "name": "Retro Runner Sneakers", "price": 64.0, "category": "Footwear" },
    { "name": "Classic Leather Loafers", "price": 59.0, "category": "Footwear" }
  ]
}
```

Search results contain object properties only. They do not include UUIDs, vectors, or search metadata.

## MCP server vs. client libraries

The MCP server is the quickest way to give an AI assistant or agent access to your data. The [Python](./python.md) and [TypeScript](./typescript.md) clients offer more control over the Query Agent. Only the client libraries support:

- [Multi-turn conversations](../reference/multi_turn_conversations.md)
- [Custom system prompts](../reference/system_prompt.md)
- [Additional filters](../reference/additional_filters.md) and [advanced collection configuration](../reference/advanced_collections.md), such as tenants and target vectors
- [Structured outputs](../reference/structured_outputs.md)
- [Streaming responses](../guides/ask_mode.md#streaming)
- [Suggest Queries mode](../guides/suggest_queries.md)

The two approaches share a single quota. Queries made through the MCP server count towards your Query Agent usage in the same way as queries made through a client library.

## Troubleshooting

| Error | Cause |
| --- | --- |
| `Missing authentication token` or `Missing cluster URL` | The `Authorization` or `X-Weaviate-Cluster-Url` header is missing, or the `Authorization` header does not start with `Bearer `. |
| `Invalid API key or cluster URL.` | The API key is not valid for the cluster, or the cluster URL is wrong. |
| `Only Weaviate Cloud clusters are supported...` | The cluster URL does not point to a Weaviate Cloud cluster. |
| `Your organization has disabled Weaviate Agents...` | Enable agents in the **Agents** section of the [Weaviate Cloud console](/go/console?utm_content=agents). |
| `Unknown or unsupported collection(s): ...` | A collection name does not exist, or the collection is multi-tenant or has multiple named vectors. The error lists the collections that the tools can query. |

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
