---
title: Generative AI
description: Ollama Generative Model Provider
sidebar_position: 50
image: og/docs/integrations/provider_integrations_ollama.jpg
# tags: ['model providers', 'ollama', 'generative', 'rag']
---

# Ollama Generative AI with Weaviate


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.local.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.local.ts';
import PyCode from '!!raw-loader!../_includes/provider.generative.py';
import TSCode from '!!raw-loader!../_includes/provider.generative.ts';

Weaviate's integration with Ollama's models allows you to access their models' capabilities directly from Weaviate.

[Configure a Weaviate collection](#configure-collection) to use a generative AI model with Ollama. Weaviate will perform retrieval augmented generation (RAG) using the specified model via your local Ollama instance.

More specifically, Weaviate will perform a search, retrieve the most relevant objects, and then pass them to the Ollama generative model to generate outputs.

![RAG integration illustration](../_includes/integration_ollama_rag.png)

## Requirements

### Ollama

This integration requires a locally running Ollama instance with your selected model available. Refer to the [Ollama documentation](https://ollama.com/) for installation and model download instructions.

### Weaviate configuration

Your Weaviate instance must be configured with the Ollama generative AI integration (`generative-ollama`) module.

<details>
  <summary>For Weaviate Cloud (WCD) users</summary>

This integration is enabled by default on Weaviate Cloud (WCD) serverless instances.
<br/>

To use Ollama with Weaviate Cloud, make sure your Ollama server is running and accessible from the Weaviate Cloud instance. If you are running Ollama on your own machine, you may need to expose it to the internet. Carefully consider the security implications of exposing your Ollama server to the internet.
<br/>

For use cases such as this, consider using a self-hosted Weaviate instance, or another API-based integration method.

</details>

<details>
  <summary>For self-hosted users</summary>

- Check the [cluster metadata](/deploy/configuration/meta.md) to verify if the module is enabled.
- Follow the [how-to configure modules](../../configuration/modules.md) guide to enable the module in Weaviate.

</details>

Your Weaviate instance must be able to access the Ollama endpoint. If you area a Docker user, specify the [Ollama endpoint using `host.docker.internal`](#configure-collection) alias to access the host machine from within the container.

### Credentials

As this integration connects to a local Ollama container, no additional credentials (e.g. API key) are required. Connect to Weaviate as usual, such as in the examples below.

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START BasicInstantiation"
      endMarker="# END BasicInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START BasicInstantiation"
      endMarker="// END BasicInstantiation"
      language="ts"
    />
  </TabItem>

</Tabs>

## Configure collection

import MutableGenerativeConfig from '/_includes/mutable-generative-config.md';

<MutableGenerativeConfig />

[Configure a Weaviate index](../../manage-collections/generative-reranker-models.mdx#specify-a-generative-model-integration) as follows to use an Ollama generative model:

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicGenerativeOllama"
      endMarker="# END BasicGenerativeOllama"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicGenerativeOllama"
      endMarker="// END BasicGenerativeOllama"
      language="ts"
    />
  </TabItem>

</Tabs>

import APIEndpoint from '/docs/weaviate/model-providers/_includes/ollama/api-endpoint.mdx';

<APIEndpoint/>

The [default model](#available-models) is used if no model is specified.

## Select a model at runtime

Aside from setting the default model provider when creating the collection, you can also override it at query time.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RuntimeModelSelectionOllama"
      endMarker="# END RuntimeModelSelectionOllama"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RuntimeModelSelectionOllama"
      endMarker="// END RuntimeModelSelectionOllama"
      language="ts"
    />
  </TabItem>
</Tabs>

## Retrieval augmented generation

After configuring the generative AI integration, perform RAG operations, either with the [single prompt](#single-prompt) or [grouped task](#grouped-task) method.

### Single prompt

![Single prompt RAG integration generates individual outputs per search result](../_includes/integration_ollama_rag_single.png)

To generate text for each object in the search results, use the single prompt method.

The example below generates outputs for each of the `n` search results, where `n` is specified by the `limit` parameter.

When creating a single prompt query, use braces `{}` to interpolate the object properties you want Weaviate to pass on to the language model. For example, to pass on the object's `title` property, include `{title}` in the query.

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

![Grouped task RAG integration generates one output for the set of search results](../_includes/integration_ollama_rag_grouped.png)

To generate one text for the entire set of search results, use the grouped task method.

In other words, when you have `n` search results, the generative model generates one output for the entire group.

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

### RAG with images

You can also supply images as a part of the input when performing retrieval augmented generation in both single prompts and grouped tasks. 

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START WorkingWithImagesOllama"
      endMarker="# END WorkingWithImagesOllama"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
        text={TSCode}
        startMarker="// START WorkingWithImagesOllama"
        endMarker="// END WorkingWithImagesOllama"
        language="ts"
      />
  </TabItem>
</Tabs>

## References

<!-- Hiding "full" examples as no other parameters exist than shown above -->
<!-- <Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullGenerativeOllama"
      endMarker="# END FullGenerativeOllama"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullGenerativeOllama"
      endMarker="// END FullGenerativeOllama"
      language="ts"
    />
  </TabItem>

</Tabs> -->

### Available models

See the [Ollama documentation](https://ollama.com/library) for a list of available models. Note that this list includes both generative models and embedding models; specify a generative model for the `generative-ollama` module.

Download the desired model with `ollama pull <model-name>`.

If no model is specified, the default model (`llama3`) is used.

## Further resources

### Other integrations

- [Ollama embedding models + Weaviate](./embeddings.md).

### Code examples

Once the integrations are configured at the collection, the data management and search operations in Weaviate work identically to any other collection. See the following model-agnostic examples:

- The [How-to: Manage collections](../../manage-collections/index.mdx) and [How-to: Manage objects](../../manage-objects/index.mdx) guides show how to perform data operations (i.e. create, read, update, delete collections and objects within them).
- The [How-to: Query & Search](../../search/index.mdx) guides show how to perform search operations (i.e. vector, keyword, hybrid) as well as retrieval augmented generation.

### References

- [Ollama models](https://ollama.com/library)
- [Ollama repository](https://github.com/ollama/ollama)
- [How to change the host and port of the Ollama server](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-expose-ollama-on-my-network)

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
