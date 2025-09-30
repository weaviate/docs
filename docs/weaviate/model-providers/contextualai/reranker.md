---
title: Reranker
description: Contextual AI Reranker Model Provider
sidebar_position: 70
image: og/docs/integrations/provider_integrations_generic.jpg
---

# Contextual AI Reranker with Weaviate

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.reranker.py';
import TSCode from '!!raw-loader!../_includes/provider.reranker.ts';

Weaviate's integration with Contextual AI rerankers allows you to rerank search results using their models.

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

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


