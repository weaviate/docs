---
title: Text Embeddings
description: OpenAI Embedding Model Provider
sidebar_position: 20
image: og/docs/integrations/provider_integrations_openai.jpg
# tags: ['model providers', 'openai', 'embeddings']
---

# OpenAI Embeddings with Weaviate

:::info Looking for Azure OpenAI integration docs?
For Azure OpenAI integration docs, see [this page instead](../openai-azure/embeddings.md).
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import GoConnect from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/1-connect/main.go';
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/2-usage-text/main.go';

Weaviate's integration with OpenAI's APIs allows you to access their models' capabilities directly from Weaviate.

[Configure a Weaviate vector index](#configure-the-vectorizer) to use an OpenAI embedding model, and Weaviate will generate embeddings for various operations using the specified model and your OpenAI API key. This feature is called the *vectorizer*.

At [import time](#data-import), Weaviate generates text object embeddings and saves them into the index. For [vector](#vector-near-text-search) and [hybrid](#hybrid-search) search operations, Weaviate converts text queries into embeddings.

![Embedding integration illustration](../_includes/integration_openai_embedding.png)

## Requirements

### Weaviate configuration

Your Weaviate instance must be configured with the OpenAI vectorizer integration (`text2vec-openai`) module.

<details>
  <summary>For Weaviate Cloud (WCD) users</summary>

This integration is enabled by default on Weaviate Cloud (WCD) serverless instances.

</details>

<details>
  <summary>For self-hosted users</summary>

- Check the [cluster metadata](/deploy/configuration/meta.md) to verify if the module is enabled.
- Follow the [how-to configure modules](../../configuration/modules.md) guide to enable the module in Weaviate.

</details>

<!-- Docs note: the `OPENAI_ORGANIZATION` environment variable is not documented, as it is not the recommended way to provide the OpenAI organization parameter. -->

### API credentials

You must provide a valid OpenAI API key to Weaviate for this integration. Go to [OpenAI](https://openai.com/) to sign up and obtain an API key.

Provide the API key to Weaviate using one of the following methods:

- Set the `OPENAI_APIKEY` environment variable that is available to Weaviate.
- Provide the API key at runtime, as shown in the examples below.

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START OpenAIInstantiation"
      endMarker="# END OpenAIInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START OpenAIInstantiation"
      endMarker="// END OpenAIInstantiation"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoConnect}
      startMarker="// START OpenAIInstantiation"
      endMarker="// END OpenAIInstantiation"
      language="goraw"
    />
  </TabItem>

</Tabs>

## Configure the vectorizer

[Configure a Weaviate index](../../manage-collections/vector-config.mdx#specify-a-vectorizer) as follows to use an OpenAI embedding model:

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerOpenAI"
      endMarker="# END BasicVectorizerOpenAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerOpenAI"
      endMarker="// END BasicVectorizerOpenAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerOpenAI"
      endMarker="// END BasicVectorizerOpenAI"
      language="goraw"
    />
  </TabItem>

</Tabs>

### Select a model

You can specify one of the [available models](#available-models) for the vectorizer to use, as shown in the following configuration examples.

#### For `text-embedding-3` model family

For `v3` models such as `text-embedding-3-large`, provide the model name and optionally the dimensions (e.g. `1024`).

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VectorizerOpenAICustomModelV3"
      endMarker="# END VectorizerOpenAICustomModelV3"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START VectorizerOpenAICustomModelV3"
      endMarker="// END VectorizerOpenAICustomModelV3"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START VectorizerOpenAICustomModelV3"
      endMarker="// END VectorizerOpenAICustomModelV3"
      language="goraw"
    />
  </TabItem>

</Tabs>

#### For older model families (e.g. `ada`)

For older models such as `text-embedding-ada-002`, provide the model name (`ada`), the type (`text`) and the model version (`002`).

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VectorizerOpenAICustomModelLegacy"
      endMarker="# END VectorizerOpenAICustomModelLegacy"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START VectorizerOpenAICustomModelLegacy"
      endMarker="// END VectorizerOpenAICustomModelLegacy"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START VectorizerOpenAICustomModelLegacy"
      endMarker="// END VectorizerOpenAICustomModelLegacy"
      language="goraw"
    />
  </TabItem>

</Tabs>

You can [specify](#vectorizer-parameters) one of the [available models](#available-models) for Weaviate to use. The [default model](#available-models) is used if no model is specified.

import VectorizationBehavior from '/_includes/vectorization.behavior.mdx';

<details>
  <summary>Vectorization behavior</summary>

<VectorizationBehavior/>

</details>

### Vectorizer parameters

- `model`: The OpenAI model name or family.
- `dimensions`: The number of dimensions for the model.
- `modelVersion`: The version string for the model.
- `type`: The model type, either `text` or `code`.
- `baseURL`: The URL to use (e.g. a proxy) instead of the default OpenAI URL.

#### (`model` & `dimensions`) or (`model` & `modelVersion`)

For `v3` models such as `text-embedding-3-large`, provide the model name and optionally the dimensions (e.g. `1024`).

For older models such as `text-embedding-ada-002`, provide the model name (`ada`), the type (`text`) and the model version (`002`).

#### Example configuration

The following examples show how to configure OpenAI-specific options.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullVectorizerOpenAI"
      endMarker="# END FullVectorizerOpenAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullVectorizerOpenAI"
      endMarker="// END FullVectorizerOpenAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FullVectorizerOpenAI"
      endMarker="// END FullVectorizerOpenAI"
      language="goraw"
    />
  </TabItem>

</Tabs>

For further details on model parameters, see the [OpenAI API documentation](https://platform.openai.com/docs/api-reference/embeddings).

## Header parameters

You can provide the API key as well as some optional parameters at runtime through additional headers in the request. The following headers are available:

- `X-OpenAI-Api-Key`: The OpenAI API key.
- `X-OpenAI-Baseurl`: The base URL to use (e.g. a proxy) instead of the default OpenAI URL.
- `X-OpenAI-Organization`: The OpenAI organization ID.

Any additional headers provided at runtime will override the existing Weaviate configuration.

Provide the headers as shown in the [API credentials examples](#api-credentials) above.

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

Once the vectorizer is configured, Weaviate will perform vector and hybrid search operations using the specified OpenAI model.

![Embedding integration at search illustration](../_includes/integration_openai_embedding_search.png)

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

You can use any OpenAI embedding model with `text2vec-openai`. For document embeddings, choose from the following [embedding model families](https://platform.openai.com/docs/models/embeddings):

* `text-embedding-3`
    * Available dimensions:
        * `text-embedding-3-large`: `256`, `1024`, `3072` (default)
        * `text-embedding-3-small`: `512`, `1536` (default)
* `ada`
* `babbage`
* `davinci`

<details>
  <summary>Deprecated models</summary>

The following models are available, but deprecated:
* Codex
* babbage-001
* davinci-001
* curie

[Source](https://platform.openai.com/docs/deprecations)

</details>

## Further resources

### Other integrations

- [OpenAI generative models + Weaviate](./generative.md).

### Code examples

Once the integrations are configured at the collection, the data management and search operations in Weaviate work identically to any other collection. See the following model-agnostic examples:

- The [How-to: Manage collections](../../manage-collections/index.mdx) and [How-to: Manage objects](../../manage-objects/index.mdx) guides show how to perform data operations (i.e. create, read, update, delete collections and objects within them).
- The [How-to: Query & Search](../../search/index.mdx) guides show how to perform search operations (i.e. vector, keyword, hybrid) as well as retrieval augmented generation.

### External resources

- OpenAI [Embed API documentation](https://platform.openai.com/docs/api-reference/embeddings)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
