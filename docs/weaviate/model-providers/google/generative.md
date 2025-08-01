---
title: Generative AI
description: Google Generative Model Provider
sidebar_position: 50
image: og/docs/integrations/provider_integrations_google.jpg
# tags: ['model providers', 'google', 'generative', 'rag']
---

# Google Generative AI with Weaviate


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.generative.py';
import TSCode from '!!raw-loader!../_includes/provider.generative.ts';

Weaviate's integration with [Google AI Studio](https://ai.google.dev/?utm_source=weaviate&utm_medium=referral&utm_campaign=partnerships&utm_content=) and [Google Vertex AI](https://cloud.google.com/vertex-ai) APIs allows you to access their models' capabilities directly from Weaviate.

[Configure a Weaviate collection](#configure-collection) to use a generative AI model with Google. Weaviate will perform retrieval augmented generation (RAG) using the specified model and your Google API key.

More specifically, Weaviate will perform a search, retrieve the most relevant objects, and then pass them to the Google generative model to generate outputs.

![RAG integration illustration](../_includes/integration_google_rag.png)

:::info AI Studio availability
At the time of writing (November 2023), AI Studio is not available in all regions. See [this page](https://ai.google.dev/gemini-api/docs/available-regions) for the latest information.
:::

## Requirements

### Weaviate configuration

Your Weaviate instance must be configured with the Google generative AI integration (`generative-google`) module.

:::info Module name change
`generative-google` was called `generative-palm` in Weaviate versions prior to `v1.27`.
:::

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

You must provide valid API credentials to Weaviate for the appropriate integration.

#### AI Studio

Go to [Google AI Studio](https://aistudio.google.com/app/apikey/?utm_source=weaviate&utm_medium=referral&utm_campaign=partnerships&utm_content=) to sign up and obtain an API key.

#### Vertex AI

This is called an `access token` in Google Cloud.

##### Automatic token generation

import UseGoogleAuthInstructions from './_includes/use_google_auth_instructions.mdx';

<UseGoogleAuthInstructions/>

##### Manual token retrieval

This is called an `access token` in Google Cloud.

If you have the [Google Cloud CLI tool](https://cloud.google.com/cli) installed and set up, you can view your token by running the following command:

```shell
gcloud auth print-access-token
```

import GCPTokenExpiryNotes from '/_includes/gcp.token.expiry.notes.mdx';

<GCPTokenExpiryNotes/>

#### Provide the API key

Provide the API key to Weaviate at runtime, as shown in the examples below.

Note the separate headers that are available for [AI Studio](#ai-studio) and [Vertex AI](#vertex-ai) users.

import ApiKeyNote from '../_includes/google-api-key-note.md';

<ApiKeyNote />

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START GoogleInstantiation"
      endMarker="# END GoogleInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START GoogleInstantiation"
      endMarker="// END GoogleInstantiation"
      language="ts"
    />
  </TabItem>

</Tabs>

## Configure collection

import MutableGenerativeConfig from '/_includes/mutable-generative-config.md';

<MutableGenerativeConfig />

[Configure a Weaviate index](../../manage-collections/generative-reranker-models.mdx#specify-a-generative-model-integration) as follows to use a Google generative AI model as follows:

Note that the required parameters differ between Vertex AI and AI Studio.

You can [specify](#generative-parameters) one of the [available models](#available-models) for Weaviate to use. The [default model](#available-models) is used if no model is specified.

### Vertex AI

Vertex AI users must provide the Google Cloud project ID in the collection configuration.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicGenerativeGoogleVertex"
      endMarker="# END BasicGenerativeGoogleVertex"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicGenerativeGoogleVertex"
      endMarker="// END BasicGenerativeGoogleVertex"
      language="ts"
    />
  </TabItem>

</Tabs>

### AI Studio

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicGenerativeGoogleStudio"
      endMarker="# END BasicGenerativeGoogleStudio"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicGenerativeGoogleStudio"
      endMarker="// END BasicGenerativeGoogleStudio"
      language="ts"
    />
  </TabItem>

</Tabs>

### Generative parameters

Configure the following generative parameters to customize the model behavior.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullGenerativeGoogle"
      endMarker="# END FullGenerativeGoogle"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullGenerativeGoogle"
      endMarker="// END FullGenerativeGoogle"
      language="ts"
    />
  </TabItem>

</Tabs>

## Select a model at runtime

Aside from setting the default model provider when creating the collection, you can also override it at query time.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RuntimeModelSelectionGoogle"
      endMarker="# END RuntimeModelSelectionGoogle"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RuntimeModelSelectionGoogle"
      endMarker="// END RuntimeModelSelectionGoogle"
      language="ts"
    />
  </TabItem>
</Tabs>

## Retrieval augmented generation

After configuring the generative AI integration, perform RAG operations, either with the [single prompt](#single-prompt) or [grouped task](#grouped-task) method.

### Single prompt

![Single prompt RAG integration generates individual outputs per search result](../_includes/integration_google_rag_single.png)

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

![Grouped task RAG integration generates one output for the set of search results](../_includes/integration_google_rag_grouped.png)

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
      startMarker="# START WorkingWithImagesGoogle"
      endMarker="# END WorkingWithImagesGoogle"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
        text={TSCode}
        startMarker="// START WorkingWithImagesGoogle"
        endMarker="// END WorkingWithImagesGoogle"
        language="ts"
      />
  </TabItem>
</Tabs>

## References

### Available models

Vertex AI:
- `chat-bison` (default)
- `chat-bison-32k` (from Weaviate `v1.24.9`)
- `chat-bison@002` (from Weaviate `v1.24.9`)
- `chat-bison-32k@002` (from Weaviate `v1.24.9`)
- `chat-bison@001` (from Weaviate `v1.24.9`)
- `gemini-1.5-pro-preview-0514` (from Weaviate `v1.25.1`)
- `gemini-1.5-pro-preview-0409` (from Weaviate `v1.25.1`)
- `gemini-1.5-flash-preview-0514` (from Weaviate `v1.25.1`)
- `gemini-1.0-pro-002` (from Weaviate `v1.25.1`)
- `gemini-1.0-pro-001` (from Weaviate `v1.25.1`)
- `gemini-1.0-pro` (from Weaviate `v1.25.1`)

AI Studio:
- `chat-bison-001` (default)
- `gemini-pro`
<!-- - `gemini-pro-vision` (from Weaviate `v1.24.2`) -->

## Further resources

### Other integrations

- [Google text embedding models + Weaviate](./embeddings.md).
- [Google multimodal embedding models + Weaviate](./embeddings-multimodal.md).

### Code examples

Once the integrations are configured at the collection, the data management and search operations in Weaviate work identically to any other collection. See the following model-agnostic examples:

- The [How-to: Manage collections](../../manage-collections/index.mdx) and [How-to: Manage objects](../../manage-objects/index.mdx) guides show how to perform data operations (i.e. create, read, update, delete collections and objects within them).
- The [How-to: Query & Search](../../search/index.mdx) guides show how to perform search operations (i.e. vector, keyword, hybrid) as well as retrieval augmented generation.

### References

- [Google Vertex AI](https://cloud.google.com/vertex-ai)
- [Google AI Studio](https://ai.google.dev/?utm_source=weaviate&utm_medium=referral&utm_campaign=partnerships&utm_content=)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
