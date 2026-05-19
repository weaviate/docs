---
title: Agents Clients
description: "Use the Python or TypeScript client to interact with Weaviate Agents."
image: og/docs/agents.jpg
tags: ['agents', 'query-agent', 'clients']
---

You can interact with the Query Agent through official client libraries, currently supporting either Python or JavaScript/TypeScript:


import CardsSection from "/src/components/CardsSection";

export const agentsClientLibrariesData = [
  {
    title: "Python Client",
    description:
      "Install and use the official Weaviate Agents Python client.",
    link: "/agents/clients/python/",
    icon: "fab fa-python",
  },
  {
    title: "JavaScript / TypeScript Client",
    description: "Use the official Weaviate Agents TypesScript/JavaScript client.",
    link: "/agents/clients/typescript/",
    icon: "fab fa-js",
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
