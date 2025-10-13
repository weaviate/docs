---
title: Generative AI
description: Contextual AI Generative Model Provider
sidebar_position: 50
image: og/docs/integrations/provider_integrations_contextualai.jpg
tags: ['model providers', 'contextual ai', 'generative', 'rag']
---

# Contextual AI's Generative AI with Weaviate

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.generative.py';
import TSCode from '!!raw-loader!../_includes/provider.generative.ts';

Contextual AI allows you to access their [Grounded Language Model (GLM)](https://contextual.ai/blog/introducing-grounded-language-model?utm_campaign=GLM-integration&utm_source=weaviate&utm_medium=github&utm_content=repo) directly from Weaviate.

[Configure a Weaviate collection](#configure-collection) to use a generative AI model with Contextual AI. Weaviate will perform retrieval augmented generation (RAG) using the specified model and your Contextual AI API key.

[Configure collection](#configure-collection) • [Select a model](#select-a-model) • [Parameters](#generative-parameters) • [Runtime selection](#select-a-model-at-runtime) • [Headers](#header-parameters) • [RAG](#retrieval-augmented-generation)

More specifically, Weaviate will perform a search, retrieve the most relevant objects, and then pass them to the Contextual AI generative model to generate outputs.

![RAG integration illustration](../_includes/integration_contextualai_rag.png)

## Requirements

### Weaviate configuration

Your Weaviate instance must be configured with the Contextual AI generative integration (`generative-contextualai`) module.

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

## Configure collection

import MutableGenerativeConfig from '/_includes/mutable-generative-config.md';

<MutableGenerativeConfig />

Configure a Weaviate collection to use Contextual AI as follows:

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicGenerativeContextualAI"
      endMarker="# END BasicGenerativeContextualAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicGenerativeContextualAI"
      endMarker="// END BasicGenerativeContextualAI"
      language="ts"
    />
  </TabItem>

</Tabs>

### Select a model

You can specify a model version (defaults to `v2`): `v1` or `v2`.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GenerativeContextualAICustomModel"
      endMarker="# END GenerativeContextualAICustomModel"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START GenerativeContextualAICustomModel"
      endMarker="// END GenerativeContextualAICustomModel"
      language="ts"
    />
  </TabItem>

</Tabs>

### Generative parameters

Supported parameters include:

- `model`: The version of Contextual's GLM to use. Currently, we have `v1` and `v2` (defaults to `v2`)
- `temperature`: The sampling temperature, which affects the randomness in the response. Note that higher temperature values can reduce groundedness. Range: 0 ≤ x ≤ 1 (defaults to 0)
- `topP`: A parameter for nucleus sampling, an alternative to temperature which also affects the randomness of the response. Note that higher top_p values can reduce groundedness. Range: 0 < x ≤ 1 (defaults to 0.9)
- `maxTokens`: The maximum number of tokens that the model can generate in the response. Range: 1 ≤ x ≤ 2048 (defaults to 1024)
- `systemPrompt`: Instructions that the model follows when generating responses. Note that we do not guarantee that the model follows these instructions exactly (optional)
- `avoidCommentary`: Flag to indicate whether the model should avoid providing additional commentary in responses. Commentary is conversational in nature and does not contain verifiable claims; therefore, commentary is not strictly grounded in available context. However, commentary may provide useful context which improves the helpfulness of responses (defaults to `false`)
- `baseURL`: Custom API endpoint URL (optional)

Additional `knowledge` array can be provided at runtime for RAG scenarios. The knowledge sources the model can use when generating a response are required for proper grounded generation.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullGenerativeContextualAI"
      endMarker="# END FullGenerativeContextualAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullGenerativeContextualAI"
      endMarker="// END FullGenerativeContextualAI"
      language="ts"
    />
  </TabItem>

</Tabs>

## Select a model at runtime

You can override the default provider at query time.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RuntimeModelSelectionContextualAI"
      endMarker="# END RuntimeModelSelectionContextualAI"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RuntimeModelSelectionContextualAI"
      endMarker="// END RuntimeModelSelectionContextualAI"
      language="ts"
    />
  </TabItem>
</Tabs>

## Header parameters

Runtime headers:

- `X-Contextual-Api-Key`: Contextual AI API key.
- `X-Contextual-Baseurl`: Optional base URL (e.g., a proxy).

Any additional headers provided at runtime override existing configuration.

## Retrieval augmented generation

Use either the single prompt or grouped task method.

### Single prompt

![Single prompt RAG integration generates individual outputs per search result](../_includes/integration_contextualai_rag_single.png)

To generate text for each object in the search results, use the single prompt method.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START SinglePromptExample"
      endMarker="# END SinglePromptExample"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START SinglePromptExample"
      endMarker="// END SinglePromptExample"
      language="ts"
    />
  </TabItem>
</Tabs>

### Grouped task

Generates a single output for the entire result set.

![Grouped task RAG integration generates one output for the set of search results](../_includes/integration_contextualai_rag_grouped.png)

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GroupedTaskExample"
      endMarker="# END GroupedTaskExample"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START GroupedTaskExample"
      endMarker="// END GroupedTaskExample"
      language="ts"
    />
  </TabItem>
</Tabs>

## Further resources

- Contextual AI API docs: `https://docs.contextual.ai/user-guides/beginner-guide`
- [Contextual AI Reranker Models + Weaviate](./reranker.md)
- [Introducing the most grounded language model (GLM)](https://contextual.ai/blog/introducing-grounded-language-model?utm_campaign=GLM-integration&utm_source=weaviate&utm_medium=github&utm_content=repo)
- [How-to: Manage collections](../../manage-collections/index.mdx)
- [How-to: Query & Search](../../search/index.mdx)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


