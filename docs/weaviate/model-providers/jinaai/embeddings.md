---
title: Text Embeddings
sidebar_position: 20
image: og/docs/integrations/provider_integrations_jinaai.jpg
# tags: ['model providers', 'jinaai', 'embeddings']
---

# Jina AI Embeddings with Weaviate


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import GoConnect from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/1-connect/main.go';
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/2-usage-text/main.go';

Weaviate's integration with Jina AI's APIs allows you to access their models' capabilities directly from Weaviate.

[Configure a Weaviate vector index](#configure-the-vectorizer) to use a Jina AI embedding model, and Weaviate will generate embeddings for various operations using the specified model and your Jina AI API key. This feature is called the *vectorizer*.

At [import time](#data-import), Weaviate generates text object embeddings and saves them into the index. For [vector](#vector-near-text-search) and [hybrid](#hybrid-search) search operations, Weaviate converts text queries into embeddings.

![Embedding integration illustration](../_includes/integration_jinaai_embedding.png)

## Requirements

### Weaviate configuration

Your Weaviate instance must be configured with the Jina AI vectorizer integration (`text2vec-jinaai`) module.

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

You must provide a valid Jina AI API key to Weaviate for this integration. Go to [Jina AI](https://jina.ai/embeddings/) to sign up and obtain an API key.

Provide the API key to Weaviate using one of the following methods:

- Set the `JINAAI_APIKEY` environment variable that is available to Weaviate.
- Provide the API key at runtime, as shown in the examples below.

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START JinaAIInstantiation"
      endMarker="# END JinaAIInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START JinaAIInstantiation"
      endMarker="// END JinaAIInstantiation"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoConnect}
      startMarker="// START JinaAIInstantiation"
      endMarker="// END JinaAIInstantiation"
      language="goraw"
    />
  </TabItem>

</Tabs>

## Configure the vectorizer

[Configure a Weaviate index](../../manage-collections/vector-config.mdx#specify-a-vectorizer) as follows to use a Jina AI embedding model:

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerJinaAI"
      endMarker="# END BasicVectorizerJinaAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerJinaAI"
      endMarker="// END BasicVectorizerJinaAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerJinaAI"
      endMarker="// END BasicVectorizerJinaAI"
      language="goraw"
    />
  </TabItem>

</Tabs>

### Select a model

You can specify one of the [available models](#available-models) for the vectorizer to use, as shown in the following configuration example.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VectorizerJinaCustomModel"
      endMarker="# END VectorizerJinaCustomModel"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START VectorizerJinaCustomModel"
      endMarker="// END VectorizerJinaCustomModel"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START VectorizerJinaCustomModel"
      endMarker="// END VectorizerJinaCustomModel"
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

The following examples show how to configure Jina AI-specific options.

Note that `dimensions` is not applicable for the `jina-embeddings-v2` models.

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullVectorizerJinaAI"
      endMarker="# END FullVectorizerJinaAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullVectorizerJinaAI"
      endMarker="// END FullVectorizerJinaAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FullVectorizerJinaAI"
      endMarker="// END FullVectorizerJinaAI"
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

Once the vectorizer is configured, Weaviate will perform vector and hybrid search operations using the specified Jina AI model.

![Embedding integration at search illustration](../_includes/integration_jinaai_embedding_search.png)

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

- `jina-embeddings-v3` (Added in Weaviate `v1.26.5` and `v1.27`)
    - When using this model, Weaviate will automatically use the appropriate `task` type, applying `retrieval.passage` for embedding entries and `retrieval.query` for queries.
    - By default, Weaviate uses `1024` dimensions
- `jina-embeddings-v2-base-en` (Default)
- `jina-embeddings-v2-small-en`

Note that `dimensions` is not applicable for the `jina-embeddings-v2` models.

## Further resources

### Other integrations

- [Jina AI ColBERT embedding models + Weaviate](./embeddings-colbert.md).
- [Jina AI multimodal embedding models + Weaviate](./embeddings-multimodal.md)
- [Jina AI reranker models + Weaviate](./reranker.md)

### Code examples

Once the integrations are configured at the collection, the data management and search operations in Weaviate work identically to any other collection. See the following model-agnostic examples:

- The [How-to: Manage collections](../../manage-collections/index.mdx) and [How-to: Manage objects](../../manage-objects/index.mdx) guides show how to perform data operations (i.e. create, read, update, delete collections and objects within them).
- The [How-to: Query & Search](../../search/index.mdx) guides show how to perform search operations (i.e. vector, keyword, hybrid) as well as retrieval augmented generation.

### External resources

- Jina AI [Embeddings API documentation](https://jina.ai/embeddings/)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
