---
title: Multimodal Embeddings
description: "Weaviate Embeddings' models can be accessed directly from a Weaviate Cloud instance."
sidebar_position: 20
image: og/docs/integrations/provider_integrations_wes.jpg
# tags: ['model providers', 'weaviate', 'wes', 'weaviate embeddings']
---

:::info Added in `1.35.0`
:::

# Weaviate Embeddings - Multimodal Embeddings

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import FilteredTextBlock from "@site/src/components/Documentation/FilteredTextBlock";
import PyConnect from "!!raw-loader!../\_includes/provider.connect.weaviate.py";
import TSConnect from "!!raw-loader!../\_includes/provider.connect.weaviate.ts";
import GoConnect from "!!raw-loader!/\_includes/code/howto/go/docs/model-providers/1-connect-weaviate-embeddings/main.go";

import PyCode from "!!raw-loader!../\_includes/provider.vectorizer.py";
import TSCode from "!!raw-loader!../\_includes/provider.vectorizer.ts";
import GoCode from "!!raw-loader!/\_includes/code/howto/go/docs/model-providers/2-usage-text/main.go";
import JavaV6Code from "!!raw-loader!/\_includes/code/java-v6/src/test/java/ModelProvidersTest.java";
import CSharpCode from "!!raw-loader!/\_includes/code/csharp/ModelProvidersTest.cs";

<CloudOnlyBadge />

[Configure a Weaviate vector index](#configure-the-vectorizer) to use a Weaviate Embeddings model, and Weaviate will generate embeddings for various operations using the specified model and your Weaviate API key. This feature is called the _vectorizer_.

At [import time](#data-import), Weaviate generates image embeddings and saves them into the index. Then at search time, Weaviate converts text queries into embeddings.

:::tip Primary use case: Image-based document retrieval
This integration is optimized for image-based document retrieval. Embed images of document pages with Weaviate Embeddings' multimodal model, then retrieve relevant pages with text queries.
:::

![Embedding integration illustration](../_includes/integration_wes_embedding.png)

## Requirements

import Requirements from "/\_includes/weaviate-embeddings-requirements.mdx";

<Requirements />

:::info Cloud only
Weaviate Embeddings vectorizers are not available for self-hosted users.
:::

### API credentials

Your Weaviate Cloud credentials are automatically used to authorize your access to Weaviate Embeddings.

<Tabs className="code" groupId="languages">

 <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START WeaviateInstantiation"
      endMarker="# END WeaviateInstantiation"
      language="py"
    />
  </TabItem>
 <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START WeaviateInstantiation"
      endMarker="// END WeaviateInstantiation"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoConnect}
      startMarker="// START WeaviateInstantiation"
      endMarker="// END WeaviateInstantiation"
      language="goraw"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START WeaviateInstantiation"
      endMarker="// END WeaviateInstantiation"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C# (Beta)">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START WeaviateInstantiation"
      endMarker="// END WeaviateInstantiation"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Configure the vectorizer

[Configure a Weaviate index](../../manage-collections/vector-config.mdx#specify-a-vectorizer) as follows to use a Weaviate Embeddings multimodal model.

Configure one `BLOB` type property to hold the image data, and pass its name to the vectorizer configuration.

Note currently only one model is available.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerMMWeaviate"
      endMarker="# END BasicVectorizerMMWeaviate"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerMMWeaviate"
      endMarker="// END BasicVectorizerMMWeaviate"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerMMWeaviate"
      endMarker="// END BasicVectorizerMMWeaviate"
      language="goraw"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START BasicVectorizerMMWeaviate"
      endMarker="// END BasicVectorizerMMWeaviate"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C# (Beta)">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START BasicVectorizerWeaviate"
      endMarker="// END BasicVectorizerWeaviate"
      language="csharp"
    />
  </TabItem>
</Tabs>

### Vectorizer parameters

The following parameters are available for the Weaviate Embeddings multimodal vectorizer:

- `base_url` (optional): The base URL for the Weaviate Embeddings service. (Not required in most cases.)
- `model` (optional): The name of the model to use for embedding generation. Currently only one model is available.

## Data import

After configuring the vectorizer, [import data](../../manage-objects/import.mdx) into Weaviate. Weaviate generates embeddings for image objects using the specified model.

<Tabs className="code" groupId="languages">

 <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START MMBatchImportDocsExample"
      endMarker="# END MMBatchImportDocsExample"
      language="py"
    />
  </TabItem>

 <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START MMBatchImportDocsExample"
      endMarker="// END MMBatchImportDocsExample"
      language="ts"
    />
  </TabItem>

</Tabs>

:::tip Re-use existing vectors
If you already have a compatible model vector available, you can provide it directly to Weaviate. This can be useful if you have already generated embeddings using the same model and want to use them in Weaviate, such as when migrating data from another system.
:::

## Searches

Once the vectorizer is configured, Weaviate will perform vector and hybrid search operations using the specified model.

![Embedding integration at search illustration](../_includes/integration_wes_embedding_search.png)

### Vector (near text) search

When you perform a [vector search](../../search/similarity.md#search-with-text), Weaviate converts the text query into an embedding using the specified model and returns the most similar objects from the database.

The query below returns the `n` most similar objects from the database, set by `limit`.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START NearTextExample"
      endMarker="# END NearTextExample"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
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
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START NearTextExample"
      endMarker="// END NearTextExample"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C# (Beta)">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START NearTextExample"
      endMarker="// END NearTextExample"
      language="csharp"
    />
  </TabItem>
</Tabs>

### Hybrid search

:::info What is a hybrid search?
A hybrid search performs a vector search and a keyword (BM25) search, before [combining the results](../../search/hybrid.md) to return the best matching objects from the database.
:::

When you perform a [hybrid search](../../search/hybrid.md), Weaviate converts the text query into an embedding using the specified model and returns the best scoring objects from the database.

The query below returns the `n` best scoring objects from the database, set by `limit`.

<Tabs className="code" groupId="languages">

 <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START HybridExample"
      endMarker="# END HybridExample"
      language="py"
    />
  </TabItem>
 <TabItem value="ts" label="JavaScript/TypeScript">
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
<TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridExample"
      endMarker="// END HybridExample"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C# (Beta)">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridExample"
      endMarker="// END HybridExample"
      language="csharp"
    />
  </TabItem>
</Tabs>

## References

### Available models

Currently, the only available multimodal model is:

- `ModernVBERT/colmodernvbert`: A late-interaction model fine-tuned for visual document retrieval tasks. ([Hugging Face model card](https://huggingface.co/ModernVBERT/colmodernvbert))

## Further resources

### Code examples

Once the integrations are configured at the collection, the data management and search operations in Weaviate work identically to any other collection. See the following model-agnostic examples:

- The [How-to: Manage collections](../../manage-collections/index.mdx) and [How-to: Manage objects](../../manage-objects/index.mdx) guides show how to perform data operations (i.e. create, read, update, delete collections and objects within them).
- The [How-to: Query & Search](../../search/index.mdx) guides show how to perform search operations (i.e. vector, keyword, hybrid) as well as retrieval augmented generation.

### References

- Weaviate Embeddings [Documentation](/cloud/embeddings)

## Questions and feedback

import DocsFeedback from "/\_includes/docs-feedback.mdx";

<DocsFeedback />
