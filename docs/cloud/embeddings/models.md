---
title: Choose a model
sidebar_label: Choose a model
sidebar_position: 2
description: "List of pre-trained embedding models optimized for enterprise retrieval tasks in multiple languages."
image: og/wcd/user_guides.jpg
---

On this page, you can find a list of pre-trained models designed specifically for enterprise retrieval tasks in English and other languages. Additional models and features will be added in the future, so please check back regularly for updates.

## How to choose the right model?

Here are some simple recommendations on when you should use a specific model:

### Text embedding models

- **[`Snowflake/snowflake-arctic-embed-m-v1.5`](#snowflake-arctic-embed-m-v1.5)**
  Best for datasets that are **primarily in English** with text lengths typically **under 512 tokens**.
- **[`Snowflake/snowflake-arctic-embed-l-v2.0`](#snowflake-arctic-embed-l-v2.0)**
  Ideal for datasets that include **multiple languages** or require **longer context (up to 8192 tokens)**. This model is optimized for robust performance on both English and multilingual retrieval tasks.

### Multimodal model

- **[`ModernVBERT/colmodernvbert`](#colmodernvbert)**
  Best for **visual document retrieval** where you want to search document images (PDFs, slides, invoices) using text queries. This model embeds documents directly as images, **eliminating the need for OCR or text extraction pipelines**.

Below, you can find a complete list of all available models.

---

## Available models

<!-- TODO[g-despot]: Uncomment section when more models are added
The following models are available for use with Weaviate Embeddings:

- **[`Snowflake/snowflake-arctic-embed-m-v1.5`](#snowflake-arctic-embed-m-v1.5)**
- **[`Snowflake/snowflake-arctic-embed-l-v2.0`](#snowflake-arctic-embed-l-v2.0)** (default)

---
-->

import WeaviateEmbeddingsModels from '/_includes/weaviate-embeddings-models.mdx';

<WeaviateEmbeddingsModels />

---

## Multimodal models

Weaviate Embeddings also offers multimodal models for visual document retrieval tasks. These models generate embeddings from document images (PDFs, slides, invoices converted to images) that can be searched with text queries.

### `ModernVBERT/colmodernvbert` {#colmodernvbert}

- A 250M parameter late-interaction vision-language encoder, fine-tuned for visual document retrieval tasks.
- **Ideal for**: Getting documents directly into Weaviate without heavy preprocessing. No OCR or text extraction required - simply convert documents to images and embed them. Images and text queries are represented together in the same vector space for seamless retrieval.
- **Type**: Multi-vector embeddings (ColBERT-style late-interaction)
- **Input**: Document images + text queries
- **Performance**: State-of-the-art in its size class, matching models up to 10x larger.
- **Pricing**: $0.065 per 1M tokens
- **Query token limit**: 8,092 tokens
- **Recommended**: Enable [MUVERA encoding](/weaviate/configuration/compression/multi-vectors) to reduce memory usage while preserving retrieval quality.
- Read more at the [Hugging Face model card](https://huggingface.co/ModernVBERT/colmodernvbert)
- For integration details, see [Weaviate Embeddings: Multimodal](/weaviate/model-providers/weaviate/embeddings-multimodal)

---

## Vectorizer parameters

import WeaviateEmbeddingsVectorizerParameters from '/_includes/weaviate-embeddings-vectorizer-parameters.mdx';

<WeaviateEmbeddingsVectorizerParameters />

## Additional resources

- [Weaviate Embeddings: Overview](/cloud/embeddings)
- [Weaviate Embeddings: Quickstart](/cloud/embeddings/quickstart)
- [Weaviate Embeddings: Administration](/cloud/embeddings/administration)
- [Model provider integrations: Weaviate Embeddings](/weaviate/model-providers/weaviate/embeddings.md)

## Support & feedback

import SupportAndTrouble from '/\_includes/wcs/support-and-troubleshoot.mdx';

<SupportAndTrouble />
