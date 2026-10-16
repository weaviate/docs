---
title: Client libraries
description: "Use the Python client, the TypeScript client, or the MCP server to interact with the Query Agent."
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'clients']
---

You can interact with the Query Agent through the official Python and JavaScript/TypeScript client libraries, or connect any MCP-compatible tool or agent through the hosted MCP server:


import CardsSection from "/src/components/CardsSection";

export const agentsClientLibrariesData = [
  {
    title: "Python Client",
    description:
      "Install and use the official Query Agent Python client.",
    link: "/query-agent/clients/python/",
    icon: "fab fa-python",
  },
  {
    title: "JavaScript / TypeScript Client",
    description: "Use the official Query Agent TypeScript/JavaScript client.",
    link: "/query-agent/clients/typescript/",
    icon: "fab fa-js",
  },
  {
    title: "MCP Server",
    description:
      "Connect Claude Code, Cursor, or your own agents to the Query Agent over MCP.",
    link: "/query-agent/clients/mcp/",
    icon: "fas fa-plug",
  }
];

<br />
<CardsSection items={agentsClientLibrariesData} />
<br />

:::info Don't see your preferred language?

If you want to contribute a client, or to request a particular client, let us know in [the community forum](https://forum.weaviate.io/)

:::

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
