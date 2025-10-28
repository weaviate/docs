---
title: Reranker
description: Contextual AI Reranker Model Provider
sidebar_position: 70
image: og/docs/integrations/provider_integrations_contextualai.jpg
tags: ['model providers', 'contextual ai', 'reranker']
---

# Contextual AI Reranker Models with Weaviate

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.reranker.py';
import TSCode from '!!raw-loader!../_includes/provider.reranker.ts';

Weaviate's integration with [Contextual AI rerankers](https://contextual.ai/blog/rerank-v2/?utm_campaign=contextual-ai-integration&utm_source=weaviate&utm_medium=github&utm_content=repo) allows you to rerank search results using their models with custom instructions for recency, document type, source, and metadata.

![Reranker integration illustration](../_includes/integration_contextualai_reranker.png)

## Requirements

### Weaviate configuration

Your Weaviate instance must be configured with the Contextual AI reranker integration (`reranker-contextualai`) module.

<details>
  <summary>For Weaviate Cloud (WCD) users</summary>

This integration is enabled by default on Weaviate Cloud (WCD) serverless instances.

</details>

<details>
  <summary>For self-hosted users</summary>

- Check the [cluster metadata](/deploy/configuration/meta.md) to verify if the module is enabled.
- Follow the [how-to configure modules](../../configuration/modules.md) guide to enable the module in Weaviate.

</details>

### API credentials

Provide a Contextual AI API key to Weaviate. Sign up at `https://contextual.ai/`.

Provide the API key using one of the following methods:

- Set the `CONTEXTUAL_API_KEY` environment variable available to Weaviate.
- Provide the API key at runtime via headers (see below) or client instantiation examples.

<Tabs groupId="languages">

  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START ContextualAIInstantiation"
      endMarker="# END ContextualAIInstantiation"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START ContextualAIInstantiation"
      endMarker="// END ContextualAIInstantiation"
      language="ts"
    />
  </TabItem>

</Tabs>

## Configure the reranker

import MutableRerankerConfig from '/_includes/mutable-reranker-config.md';

<MutableRerankerConfig />

Configure a collection to use Contextual AI reranker:

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RerankerContextualAIBasic"
      endMarker="# END RerankerContextualAIBasic"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RerankerContextualAIBasic"
      endMarker="// END RerankerContextualAIBasic"
      language="ts"
    />
  </TabItem>

</Tabs>

### Select a model

Available models include:

- `ctxl-rerank-v2-instruct-multilingual` (default)
- `ctxl-rerank-v2-instruct-multilingual-mini`
- `ctxl-rerank-v1-instruct`


### Advanced parameter configuration

You can configure additional parameters for fine-tuned reranking behavior:

- `model`: The version of the reranker to use. Currently, we have: `ctxl-rerank-v2-instruct-multilingual`, `ctxl-rerank-v2-instruct-multilingual-mini`, `ctxl-rerank-v1-instruct` (defaults to `ctxl-rerank-v2-instruct-multilingual`)
- `instruction`: Instructions that the reranker references when ranking documents, after considering relevance. We evaluated the model on instructions for recency, document type, source, and metadata, and it can generalize to other instructions as well. For instructions related to recency and timeframe, specify the timeframe (e.g., instead of saying "this year") because the reranker doesn't know the current date. Example: "Prioritize internal sales documents over market analysis reports. More recent documents should be weighted higher. Enterprise portal content supersedes distributor communications." (optional)
- `topN`: The number of top-ranked results to return (optional)

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RerankerContextualAICustomModel"
      endMarker="# END RerankerContextualAICustomModel"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RerankerContextualAICustomModel"
      endMarker="// END RerankerContextualAICustomModel"
      language="ts"
    />
  </TabItem>

</Tabs>

## Header parameters

Runtime headers:

- `X-Contextual-Api-Key`: Contextual AI API key.

## Reranking query

Any search can be combined with a reranker.

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RerankerQueryExample"
      endMarker="# END RerankerQueryExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RerankerQueryExample"
      endMarker="// END RerankerQueryExample"
      language="ts"
    />
  </TabItem>

</Tabs>

## Further resources

- [Contextual AI Reranker API docs](https://docs.contextual.ai/api-reference/rerank/rerank)
- [Introducing the instruction-following reranker](https://contextual.ai/blog/introducing-instruction-following-reranker)
- [Contextual AI Reranker v2 Blog Post](https://contextual.ai/blog/rerank-v2/?utm_campaign=contextual-ai-integration&utm_source=weaviate&utm_medium=github&utm_content=repo)
- [Contextual AI Generative AI + Weaviate](./generative.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


