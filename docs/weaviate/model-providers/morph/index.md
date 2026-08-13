---
title: Morph + Weaviate
sidebar_position: 10
image: og/docs/model-provider-integrations.jpg
# tags: ['model providers', 'morph']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

[Morph](https://morphllm.com/) serves code and text embedding models behind an OpenAI-compatible API. Weaviate integrates with Morph's embedding endpoint so you can vectorize and search data using Morph-hosted models directly from your Weaviate instance.

:::caution Morph lists the Embedding API as legacy
Morph's own documentation labels the Embedding API as legacy and planned for deprecation. Check the current status in [Morph's documentation](https://docs.morphllm.com/) before you build on this integration.
:::

## Integrations with Morph

### Embedding models for vector search

![Embedding integration illustration](../_includes/integration_morph_embedding.png)

Morph exposes embedding models over an OpenAI-compatible `/v1/embeddings` API at `https://api.morphllm.com`.

[Weaviate integrates with Morph's embedding models](./embeddings.md) through the `text2vec-morph` vectorizer module. Configure a vector index to use a Morph model and Weaviate generates embeddings for imports, vector searches, and hybrid searches automatically.

[Morph embedding integration page](./embeddings.md)

## Summary

This integration lets you use Morph's hosted embedding models from Weaviate without managing inference infrastructure yourself.

## Get started

Generate an API key in the [Morph dashboard](https://morphllm.com/), then supply it to Weaviate through the `MORPH_APIKEY` environment variable or the `X-Openai-Api-Key` request header. The header name is shared with the OpenAI integration, because Morph requests are built by the same OpenAI-compatible client inside Weaviate. Then see the embedding integration page:

- [Text Embeddings](./embeddings.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
