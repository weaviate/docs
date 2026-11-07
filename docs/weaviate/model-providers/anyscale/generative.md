---
title: Generative AI
sidebar_position: 50
image: og/docs/integrations/provider_integrations_anyscale.jpg
# tags: ['model providers', 'anyscale', 'generative', 'rag']
---

# Anyscale Generative AI with Weaviate


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.generative.py';
import TSCode from '!!raw-loader!../_includes/provider.generative.ts';

Weaviate's integration with Anyscale's Endpoints APIs allows you to access their models' capabilities directly from Weaviate.

[Configure a Weaviate collection](#configure-collection) to use a generative AI model with Anyscale. Weaviate will perform retrieval augmented generation (RAG) using the specified model and your Anyscale API key.

More specifically, Weaviate will perform a search, retrieve the most relevant objects, and then pass them to the Anyscale generative model to generate outputs.

![RAG integration illustration](../_includes/integration_anyscale_rag.png)

## Requirements

### Weaviate configuration

Your Weaviate instance must be configured with the Anyscale generative AI integration (`generative-anyscale`) module.

<details>
  <summary>For Weaviate Cloud (WCD) users</summary>

This integration is enabled by default on Weaviate Cloud (WCD) instances.

</details>

<details>
  <summary>For self-hosted users</summary>

- Check the [cluster metadata](/deploy/configuration/status.md#cluster-metadata) to verify if the module is enabled.
- Follow the [how-to configure modules](../../configuration/modules.md) guide to enable the module in Weaviate.

</details>

### API credentials

You must provide a valid Anyscale API key to Weaviate for this integration. Go to [Anyscale](https://www.anyscale.com/) to sign up and obtain an API key.

Provide the API key to Weaviate using one of the following methods:

- Set the `ANYSCALE_APIKEY` environment variable that is available to Weaviate.
- Provide the API key at runtime, as shown in the examples below.

<Tabs className="code" groupId="languages">

 <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START AnyscaleInstantiation"
      endMarker="# END AnyscaleInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START AnyscaleInstantiation"
      endMarker="// END AnyscaleInstantiation"
      language="ts"
    />
  </TabItem>

</Tabs>

## Configure collection

import MutableGenerativeConfig from '/_includes/mutable-generative-config.md';

<MutableGenerativeConfig />

[Configure a Weaviate index](../../manage-collections/generative-reranker-models.mdx#specify-a-generative-model-integration) as follows to use an Anyscale generative model:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicGenerativeAnyscale"
      endMarker="# END BasicGenerativeAnyscale"
      language="py"
    />
  </TabItem>

  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicGenerativeAnyscale"
      endMarker="// END BasicGenerativeAnyscale"
      language="ts"
    />
  </TabItem>

</Tabs>

You can [specify](#generative-parameters) a model for Weaviate to use. If you do not set a model, Weaviate uses the [server default](#available-models).

### Select a model

You can specify [a model](#available-models) for Weaviate to use, as shown in the following configuration example:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GenerativeAnyscaleCustomModel"
      endMarker="# END GenerativeAnyscaleCustomModel"
      language="py"
    />
  </TabItem>

  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START GenerativeAnyscaleCustomModel"
      endMarker="// END GenerativeAnyscaleCustomModel"
      language="ts"
    />
  </TabItem>

</Tabs>

### Generative parameters

Configure the following generative parameters to customize the model behavior.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullGenerativeAnyscale"
      endMarker="# END FullGenerativeAnyscale"
      language="py"
    />
  </TabItem>

  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullGenerativeAnyscale"
      endMarker="// END FullGenerativeAnyscale"
      language="ts"
    />
  </TabItem>

</Tabs>

For further details on model parameters, see the [Anyscale LLM serving documentation](https://docs.anyscale.com/llm/serving).

## Select a model at runtime

Aside from setting the default model provider when creating the collection, you can also override it at query time.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RuntimeModelSelectionAnyscale"
      endMarker="# END RuntimeModelSelectionAnyscale"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RuntimeModelSelectionAnyscale"
      endMarker="// END RuntimeModelSelectionAnyscale"
      language="ts"
    />
  </TabItem>
</Tabs>

## Header parameters

You can provide the API key as well as some optional parameters at runtime through additional headers in the request. The following headers are available:

- `X-Anyscale-Api-Key`: The Anyscale API key.
- `X-Anyscale-Baseurl`: The base URL to use (e.g. a proxy) instead of the default Anyscale URL.

Any additional headers provided at runtime will override the existing Weaviate configuration.

Provide the headers as shown in the [API credentials examples](#api-credentials) above.

## Retrieval augmented generation

After configuring the generative AI integration, perform RAG operations, either with the [single prompt](#single-prompt) or [grouped task](#grouped-task) method.

### Single prompt

![Single prompt RAG integration generates individual outputs per search result](../_includes/integration_anyscale_rag_single.png)

To generate text for each object in the search results, use the single prompt method.

The example below generates outputs for each of the `n` search results, where `n` is specified by the `limit` parameter.

When creating a single prompt query, use braces `{}` to interpolate the object properties you want Weaviate to pass on to the language model. For example, to pass on the object's `title` property, include `{title}` in the query.

<Tabs className="code" groupId="languages">

 <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START SinglePromptExample"
      endMarker="# END SinglePromptExample"
      language="py"
    />
  </TabItem>

 <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START SinglePromptExample"
      endMarker="// END SinglePromptExample"
      language="ts"
    />
  </TabItem>

</Tabs>

### Grouped task

![Grouped task RAG integration generates one output for the set of search results](../_includes/integration_anyscale_rag_grouped.png)

To generate one text for the entire set of search results, use the grouped task method.

In other words, when you have `n` search results, the generative model generates one output for the entire group.

<Tabs className="code" groupId="languages">

 <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GroupedTaskExample"
      endMarker="# END GroupedTaskExample"
      language="py"
    />
  </TabItem>

 <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START GroupedTaskExample"
      endMarker="// END GroupedTaskExample"
      language="ts"
    />
  </TabItem>

</Tabs>

## References

### Available models

Weaviate does not validate the model name, so you can set any model that your Anyscale deployment serves.

The server default is `meta-llama/Llama-2-70b-chat-hf`.

:::caution Anyscale discontinued its public Endpoints API
Anyscale shut down the public Endpoints API at `https://api.endpoints.anyscale.com` on 2024-08-01. The default base URL no longer serves any model. To use this integration, deploy a model on the Anyscale platform and point Weaviate at your deployment with the `baseURL` collection parameter or the [`X-Anyscale-Baseurl` header](#header-parameters). The available models are the ones your deployment serves. See the [Anyscale LLM serving documentation](https://docs.anyscale.com/llm/serving).
:::

## Further resources

### Code examples

Once the integrations are configured at the collection, the data management and search operations in Weaviate work identically to any other collection. See the following model-agnostic examples:

- The [How-to: Manage collections](../../manage-collections/index.mdx) and [How-to: Manage objects](../../manage-objects/index.mdx) guides show how to perform data operations (i.e. create, read, update, delete collections and objects within them).
- The [How-to: Query & Search](../../search/index.mdx) guides show how to perform search operations (i.e. vector, keyword, hybrid) as well as retrieval augmented generation.

### References

- Anyscale [LLM serving documentation](https://docs.anyscale.com/llm/serving)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
