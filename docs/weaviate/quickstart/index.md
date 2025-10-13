---
title: Quickstart
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Prerequisites

- [Weaviate Cloud](https://console.weaviate.cloud) sandbox instance
- [OpenAI API key](https://platform.openai.com/api-keys)

<details>
  <summary>How to set up a sandbox instance</summary>

Go to the [Weaviate Cloud console](https://console.weaviate.cloud) and follow these steps:

<div style={{position: "relative", paddingBottom: "calc(54.10879629629629% + 50px)", height: 0}}>
  <iframe
    id="qp7xdo7cjr"
    src="https://app.guideflow.com/embed/qp7xdo7cjr"
    width="100%"
    height="100%"
    style={{overflow: "hidden", position: "absolute", border: "none"}}
    scrolling="no"
    allow="clipboard-read; clipboard-write"
    webKitAllowFullScreen
    mozAllowFullScreen
    allowFullScreen
    allowTransparency="true"
  />
  <script src="https://app.guideflow.com/assets/opt.js" data-iframe-id="qp7xdo7cjr"></script>
</div>

<br/>

:::note

- Cluster provisioning typically takes 1-3 minutes.
- When the cluster is ready, Weaviate Cloud displays a checkmark (`✔️`) next to the cluster name.
- Note that Weaviate Cloud adds a random suffix to sandbox cluster names to ensure uniqueness.

:::

</details>

## Installation

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">

```bash
pip install -U weaviate-client
```

</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">

```bash
npm install weaviate-client
```

</TabItem>
</Tabs>

## Environment Variables

Set these before running:

```bash
export WEAVIATE_URL="your-weaviate-url"
export WEAVIATE_API_KEY="your-weaviate-key"
export OPENAI_APIKEY="your-openai-key"
```

## Complete Example

This example connects to Weaviate, creates a collection, imports data, performs a semantic search, and runs RAG.

import MinimalQuickstart from '/_includes/code/quickstart/minimal.quickstart.mdx'

<MinimalQuickstart />

## What this does

1. **Connect** - Connects to your Weaviate Cloud instance ([read more](../connections/index.mdx))
2. **Create** - Creates a `Question` collection with Weaviate embeddings ([read more](../manage-collections/collection-operations.mdx))
3. **Import** - Loads and imports Jeopardy questions from a JSON file ([read more](../manage-objects/import.mdx))
4. **Search** - Finds biology-related questions using semantic search ([read more](../search/similarity.md))
5. **RAG** - Generates a tweet about the results using OpenAI ([read more](../search/generative.md))
