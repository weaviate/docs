---
title: JavaScript/TypeScript client
description: "Use the TypeScript client to interact with the Query Agent."
image: og/docs/agents.jpg
# tags: ['agents', 'query-agent', 'clients']
---

import QuickLinks from "/src/components/QuickLinks";

export const pythonCardsData = [
  {
    title: "weaviate/agents-typescript-client",
    link: "https://github.com/weaviate/agents-typescript-client",
    icon: "fa-brands fa-github",
  },
  {
    title: "Reference manual (docstrings)",
    link: "https://weaviate.github.io/agents-typescript-client/index.html",
    icon: "fa-solid fa-book",
  },
];

The TypeScript client supports code that is written in TypeScript or JavaScript. It allows you to easily interact with the Query Agent API from your JavaScript or TypeScript applications.

It relies on the [Weaviate Client package](../../weaviate/client-libraries/typescript/index.mdx), and handles authentication and connection to your Weaviate instance from there.

:::note JavaScript/TypeScript client (SDK)

The latest Query Agent TypeScript client is version `v||site.agents_typescript_version||`.

<QuickLinks items={pythonCardsData} />

:::

## Installation

The Query Agent TypeScript client is distributed as the [`weaviate-agents`](https://www.npmjs.com/package/weaviate-agents) package on npm, and depends on the [`weaviate-client`](https://www.npmjs.com/package/weaviate-client) package, which it declares as a peer dependency. You should install both packages together:

```shell
npm install weaviate-client weaviate-agents
```

Or with `yarn` / `pnpm`:

```shell
yarn add weaviate-client weaviate-agents
```

```shell
pnpm add weaviate-client weaviate-agents
```

### Imports

Import the agent class directly from the `weaviate-agents` package, alongside your usual `weaviate-client` imports:

```typescript
import weaviate from "weaviate-client";
import { QueryAgent } from "weaviate-agents";
```

#### Troubleshooting: Force `npm` to install the latest version

For existing installations, `npm install` may not upgrade `weaviate-agents` to the [latest version](https://www.npmjs.com/package/weaviate-agents). If this occurs, explicitly upgrade the package:

```shell
npm install weaviate-agents@latest
```

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
