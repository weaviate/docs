---
title: Text Embeddings
description: "Weaviate's integration with Google AI Studio and Google Vertex AI APIs allows you to access their models' capabilities directly from Weaviate."
sidebar_position: 20
image: og/docs/integrations/provider_integrations_google.jpg
# tags: ['model providers', 'google', 'embeddings']
---

# Google Text Embeddings with Weaviate


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import GoConnect from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/1-connect/main.go';
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/2-usage-text/main.go';

Weaviate's integration with [Google AI Studio](https://ai.google.dev/?utm_source=weaviate&utm_medium=referral&utm_campaign=partnerships&utm_content=) and [Google Vertex AI](https://cloud.google.com/vertex-ai) APIs allows you to access their models' capabilities directly from Weaviate.

[Configure a Weaviate vector index](#configure-the-vectorizer) to use a Google embedding model, and Weaviate will generate embeddings for various operations using the specified model and your Google API key. This feature is called the *vectorizer*.

At [import time](#data-import), Weaviate generates text object embeddings and saves them into the index. For [vector](#vector-near-text-search) and [hybrid](#hybrid-search) search operations, Weaviate converts text queries into embeddings.

![Embedding integration illustration](../_includes/integration_google_embedding.png)

:::info AI Studio availability
At the time of writing (November 2023), AI Studio is not available in all regions. See [this page](https://ai.google.dev/gemini-api/docs/available-regions) for the latest information.
:::

## Requirements

### Weaviate configuration

Your Weaviate instance must be configured with the Google vectorizer integration (`text2vec-google`) module.

:::info Module name change
`text2vec-google` was called `text2vec-palm` in Weaviate versions prior to `v1.27`.
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

If you have the [Google Cloud CLI tool](https://cloud.google.com/cli) installed and set up, you can view your token by running the following command:

```shell
gcloud auth print-access-token
```

#### Token expiry for Vertex AI users

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

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoConnect}
      startMarker="// START GoogleInstantiation"
      endMarker="// END GoogleInstantiation"
      language="goraw"
    />
  </TabItem>

</Tabs>

## Configure the vectorizer

[Configure a Weaviate index](../../manage-collections/vector-config.mdx#specify-a-vectorizer) as follows to use a Google embedding model:

Note that the required parameters differ between Vertex AI and AI Studio.

You can [specify](#vectorizer-parameters) one of the [available models](#available-models) for Weaviate to use. The [default model](#available-models) is used if no model is specified.

### Vertex AI

Vertex AI users must provide the Google Cloud project ID in the vectorizer configuration.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerGoogleVertex"
      endMarker="# END BasicVectorizerGoogleVertex"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerGoogleVertex"
      endMarker="// END BasicVectorizerGoogleVertex"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerGoogleVertex"
      endMarker="// END BasicVectorizerGoogleVertex"
      language="goraw"
    />
  </TabItem>

</Tabs>

### AI Studio

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerGoogleStudio"
      endMarker="# END BasicVectorizerGoogleStudio"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerGoogleStudio"
      endMarker="// END BasicVectorizerGoogleStudio"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerGoogleStudio"
      endMarker="// END BasicVectorizerGoogleStudio"
      language="goraw"
    />
  </TabItem>

</Tabs>

import VectorizationBehavior from '/_includes/vectorization.behavior.mdx';

<details>
  <summary>Vectorization behavior</summary>

<VectorizationBehavior/>

</details>

### Vectorizer parameters

The following examples show how to configure Google-specific options.

- `projectId` (Only required if using Vertex AI): e.g. `cloud-large-language-models`
- `apiEndpoint` (Optional): e.g. `us-central1-aiplatform.googleapis.com`
- `modelId` (Optional): e.g. `textembedding-gecko@001` (Vertex AI) or `embedding-001` (AI Studio)
<!-- - `titleProperty` (Optional): The Weaviate property name for the `gecko-002` or `gecko-003` model to use as the title. -->

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullVectorizerGoogle"
      endMarker="# END FullVectorizerGoogle"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullVectorizerGoogle"
      endMarker="// END FullVectorizerGoogle"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FullVectorizerGoogle"
      endMarker="// END FullVectorizerGoogle"
      language="goraw"
    />
  </TabItem>

</Tabs>

## Data import

After configuring the vectorizer, [import data](../../manage-objects/import.mdx) into Weaviate. Weaviate generates embeddings for text objects using the specified model.

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BatchImportExample"
      endMarker="# END BatchImportExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BatchImportExample"
      endMarker="// END BatchImportExample"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BatchImportExample"
      endMarker="// END BatchImportExample"
      language="goraw"
    />
  </TabItem>

</Tabs>

:::tip Re-use existing vectors
If you already have a compatible model vector available, you can provide it directly to Weaviate. This can be useful if you have already generated embeddings using the same model and want to use them in Weaviate, such as when migrating data from another system.
:::

## Searches

Once the vectorizer is configured, Weaviate will perform vector and hybrid search operations using the specified Google model.

![Embedding integration at search illustration](../_includes/integration_google_embedding_search.png)

### Vector (near text) search

When you perform a [vector search](../../search/similarity.md#search-with-text), Weaviate converts the text query into an embedding using the specified model and returns the most similar objects from the database.

The query below returns the `n` most similar objects from the database, set by `limit`.

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START NearTextExample"
      endMarker="# END NearTextExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START NearTextExample"
      endMarker="// END NearTextExample"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START NearTextExample"
      endMarker="// END NearTextExample"
      language="goraw"
    />
  </TabItem>

</Tabs>

### Hybrid search

:::info What is a hybrid search?
A hybrid search performs a vector search and a keyword (BM25) search, before [combining the results](../../search/hybrid.md) to return the best matching objects from the database.
:::

When you perform a [hybrid search](../../search/hybrid.md), Weaviate converts the text query into an embedding using the specified model and returns the best scoring objects from the database.

The query below returns the `n` best scoring objects from the database, set by `limit`.

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START HybridExample"
      endMarker="# END HybridExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START HybridExample"
      endMarker="// END HybridExample"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START HybridExample"
      endMarker="// END HybridExample"
      language="goraw"
    />
  </TabItem>

</Tabs>

## References

### Available models

Vertex AI:
- `textembedding-gecko@001` (default)
- `textembedding-gecko@002`
- `textembedding-gecko@003`
- `textembedding-gecko@latest`
- `textembedding-gecko-multilingual@001`
- `textembedding-gecko-multilingual@latest`
- `text-embedding-preview-0409`
- `text-multilingual-embedding-preview-0409`
- `gemini-embedding-001` (added in 1.29.9, 1.30.11, 1.31.5 and onwards)
- `text-embedding-005` (added in v1.29.9, 1.30.11, 1.31.5 and onwards)
- `text-multilingual-embedding-002` (added in v1.29.9, 1.30.11, 1.31.5 and onwards)

AI Studio:
- `embedding-001` (default)
- `text-embedding-004`

## Further resources

### Other integrations

- [Google generative models + Weaviate](./generative.md).

### Code examples

Once the integrations are configured at the collection, the data management and search operations in Weaviate work identically to any other collection. See the following model-agnostic examples:

- The [How-to: Manage collections](../../manage-collections/index.mdx) and [How-to: Manage objects](../../manage-objects/index.mdx) guides show how to perform data operations (i.e. create, read, update, delete collections and objects within them).
- The [How-to: Query & Search](../../search/index.mdx) guides show how to perform search operations (i.e. vector, keyword, hybrid) as well as retrieval augmented generation.

### External resources

- [Google Vertex AI](https://cloud.google.com/vertex-ai)
- [Google AI Studio](https://ai.google.dev/?utm_source=weaviate&utm_medium=referral&utm_campaign=partnerships&utm_content=)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
