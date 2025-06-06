---
title: Jina AI + Weaviate
sidebar_position: 10
image: og/docs/integrations/provider_integrations_jinaai.jpg
# tags: ['model providers', 'jinaai']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

Jina AI offers a wide range of models for natural language processing. Weaviate seamlessly integrates with Jina AI's APIs, allowing users to leverage Jina AI's models directly from the Weaviate Database.

These integrations empower developers to build sophisticated AI-driven applications with ease.

## Integrations with Jina AI

### Embedding models for vector search

![Embedding integration illustration](../_includes/integration_jinaai_embedding.png)

Jina AI's embedding models transform text data into vector embeddings, capturing meaning and context.

[Weaviate integrates with Jina AI's embedding models](./embeddings.md) to enable seamless vectorization of data. This integration allows users to perform semantic and hybrid search operations without the need for additional preprocessing or data transformation steps.

[Jina AI embedding integration page](./embeddings.md)
[Jina AI ColBERT embedding integration page](./embeddings-colbert.md)
[Jina AI multimodal embedding integration page](./embeddings-multimodal.md)

## Summary

These integrations enable developers to leverage Jina AI's powerful models directly within Weaviate.

In turn, they simplify the process of building AI-driven applications to speed up your development process, so that you can focus on creating innovative solutions.

## Get started

You must provide a valid Jina AI API key to Weaviate for these integrations. Go to [Jina AI](https://jina.ai/embeddings/) to sign up and obtain an API key.

Then, go to the relevant integration page to learn how to configure Weaviate with the Jina AI models and start using them in your applications.

- [Text Embeddings](./embeddings.md)
- [ColBERT embeddings](./embeddings-colbert.md)
- [Multimodal embeddings](./embeddings-multimodal.md)
- [Rerankers](./reranker.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
