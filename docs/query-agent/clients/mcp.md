---
title: MCP server
description: "Connect MCP-compatible tools and agents to the Query Agent through its hosted MCP server."
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'clients', 'mcp']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

## Connect an MCP client

To connect any MCP client, point it at the server URL using the Streamable HTTP transport, and set the headers from [Connection details](#connection-details).

The examples below read your cluster URL and API key from the `WEAVIATE_URL` and `WEAVIATE_API_KEY` environment variables. If your collections use a third-party model provider, add its header (such as `X-OpenAI-Api-Key`) alongside the others.

<Tabs groupId="mcp-clients">
<TabItem value="claude-code" label="Claude Code">

Add the server with the `claude mcp add` command. The `--scope user` option makes it available in every project:

```shell
claude mcp add --transport http --scope user weaviate-query-agent https://api.agents.weaviate.io/mcp \
  --header "Authorization: Bearer $WEAVIATE_API_KEY" \
  --header "X-Weaviate-Cluster-Url: $WEAVIATE_URL"
```

Your shell expands the environment variables when you run this command, so their values are stored in your user-level Claude Code configuration.

To share the server with everyone who works on a repository instead, commit an `.mcp.json` file at the repository root. Claude Code expands the `${...}` placeholders from each user's environment, so no secrets are committed:

```json
{
  "mcpServers": {
    "weaviate-query-agent": {
      "type": "http",
      "url": "https://api.agents.weaviate.io/mcp",
      "headers": {
        "Authorization": "Bearer ${WEAVIATE_API_KEY}",
        "X-Weaviate-Cluster-Url": "${WEAVIATE_URL}"
      }
    }
  }
}
```

Run `claude mcp list` to check that the server is connected, or run `/mcp` inside a Claude Code session. The tools appear as `mcp__weaviate-query-agent__query_agent_ask` and `mcp__weaviate-query-agent__query_agent_search`.

</TabItem>
<TabItem value="pydantic-ai" label="Pydantic AI">

Pass the server to a [Pydantic AI](https://ai.pydantic.dev/mcp/client/) agent as a toolset.

This example uses Pydantic AI 2.x and was written against `pydantic-ai-slim` 2.54.0. It uses the `MCPToolset` class. Older versions of Pydantic AI connected to MCP servers with `MCPServerStreamableHTTP` instead.

Save the following script as `query_agent_pydantic_ai.py`. The `# /// script` block at the top lists its dependencies, so uv installs them in an isolated environment when you run it:

```python
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pydantic-ai-slim[mcp,openai]==2.54.0",
# ]
# ///
import asyncio
import os

from pydantic_ai import Agent
from pydantic_ai.mcp import MCPToolset

query_agent = MCPToolset(
    "https://api.agents.weaviate.io/mcp",
    headers={
        "Authorization": f"Bearer {os.environ['WEAVIATE_API_KEY']}",
        "X-Weaviate-Cluster-Url": os.environ["WEAVIATE_URL"],
    },
)

agent = Agent("openai:gpt-5", toolsets=[query_agent])


async def main():
    async with agent:
        result = await agent.run("What are the most expensive blue t-shirts?")
    print(result.output)


asyncio.run(main())
```

Then run it with uv. The example uses an OpenAI model, so also set `OPENAI_API_KEY`:

```shell
uv run query_agent_pydantic_ai.py
```

</TabItem>
<TabItem value="langchain" label="LangChain">

Use the [`langchain-mcp-adapters`](https://github.com/langchain-ai/langchain-mcp-adapters) package to load the server's tools as LangChain tools, then pass them to an agent.

This example uses LangChain 1.x and was written against `langchain` 1.4.3, `langchain-mcp-adapters` 0.3.2 and `langchain-openai` 1.6.7. It uses the `create_agent` function, which was introduced in LangChain 1.0 and does not exist in LangChain 0.x.

Save the following script as `query_agent_langchain.py`. The `# /// script` block at the top lists its dependencies, so uv installs them in an isolated environment when you run it:

```python
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "langchain==1.4.3",
#     "langchain-mcp-adapters==0.3.2",
#     "langchain-openai==1.6.7",
# ]
# ///
import asyncio
import os

from langchain.agents import create_agent
from langchain_mcp_adapters.client import MultiServerMCPClient


async def main():
    client = MultiServerMCPClient(
        {
            "weaviate-query-agent": {
                "transport": "streamable_http",
                "url": "https://api.agents.weaviate.io/mcp",
                "headers": {
                    "Authorization": f"Bearer {os.environ['WEAVIATE_API_KEY']}",
                    "X-Weaviate-Cluster-Url": os.environ["WEAVIATE_URL"],
                },
            }
        }
    )
    tools = await client.get_tools()

    agent = create_agent("openai:gpt-5", tools)
    response = await agent.ainvoke(
        {"messages": [{"role": "user", "content": "What are the most expensive blue t-shirts?"}]}
    )
    print(response["messages"][-1].content)


asyncio.run(main())
```

Then run it with uv. The example uses an OpenAI model, so also set `OPENAI_API_KEY`:

```shell
uv run query_agent_langchain.py
```

</TabItem>
</Tabs>

## Choosing collections

Both tools take a required `collections` argument. You don't need to tell the model which collections exist: when a client lists the server's tools, each tool's description ends with the collections available in your cluster. For up to 100 collections, the `collections` parameter is also restricted to these names. The model therefore picks from your actual collections instead of guessing.

Collection names are case-insensitive for the first letter (`eCommerce` resolves to `ECommerce`), matching the Query Agent client libraries.

The MCP server does not support the following collections:

- [Multi-tenant](/weaviate/manage-collections/multi-tenancy) collections
- Collections with more than one [named vector](/weaviate/config-refs/collections#named-vectors). Collections with a single named vector are supported, and that vector is used automatically.

To query these collections, use the [Python](./python.md) or [TypeScript](./typescript.md) client, which support [advanced collection configuration](../reference/advanced_collections.md).

## Tools

### `query_agent_ask`

The model sees this tool description. The server adds the last line when a client lists the tools, naming the collections in your cluster (here, an example cluster with four collections):

```text
Ask Mode transforms your query into actionable searches or
aggregations, and then provides a final answer to the question.

For example, you could ask:

"How many orders related to books were placed last week?"

And the agent will filter for orders, perform semantic search for books
and sort or filter for timestamps from the last week. Then, the agent
will provide a response, answering this question exactly based on the
data retrieved.

The result always carries final_answer. When result_evaluation is
'llm', it additionally carries is_partial_answer (whether information
the query asked for is missing from the answer), missing_information
(what exactly could not be found in the data), and sources (the
retrieved objects the answer actually drew on).

Collections available in this cluster: Brands, ECommerce, FinancialContracts, Weather.
```

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

The model sees this tool description. The server adds the last line when a client lists the tools, naming the collections in your cluster (here, an example cluster with four collections):

```text
Search Mode combines AI-powered semantic search with structured
filtering and returns the matching Weaviate objects directly.

For example, you could ask:

"Find me some vintage shoes under $70"

And the agent will perform semantic search for vintage shoes, apply a
filter for price < 70, and return the matching objects from your
collections, ready for you to render or post-process.

You could also ask:

"Something comfortable to wear on a long flight"

And the agent will use AI-powered search to find relevant objects, even
when terms like comfortable or long flight never appear in your data.

Under the hood, Search Mode does more than embed your query as-is. The
agent writes one or more optimized semantic and structured queries,
executes them against your collections, and reranks the retrieved
objects by how well each one matches your original request.

The result's `results` field lists the matching objects in rank order
(best match first), each as a dict of property names to values.

Collections available in this cluster: Brands, ECommerce, FinancialContracts, Weather.
```

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
