---
title: Generative AI
sidebar_position: 50
image: og/docs/integrations/provider_integrations_generic.jpg
---

# Contextual AI Generative with Weaviate

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.generative.py';
import TSCode from '!!raw-loader!../_includes/provider.generative.ts';

Weaviate's integration with Contextual AI lets you use GLM models directly from Weaviate.

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

Supported parameters include: `model`, `temperature`, `topP`, `maxTokens`, `systemPrompt`, `avoidCommentary`, and optional `knowledge` array at runtime.

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

You can provide runtime headers:

- `X-Contextual-Api-Key`: Contextual AI API key.
- `X-Contextual-Baseurl`: Optional base URL (e.g., a proxy).

Any additional headers provided at runtime override existing configuration.

## Retrieval augmented generation

Use either the single prompt or grouped task method.

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

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


