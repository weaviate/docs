---
title: OpenAI + Weaviate
description: "OpenAI offers a wide range of models for natural language processing and generation. Weaviate seamlessly integrates with OpenAI's APIs, allowing users to leverage OpenAI's models directly from the Weaviate Database."
sidebar_position: 10
image: og/docs/integrations/provider_integrations_openai.jpg
# tags: ['model providers', 'openai']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

:::info Looking for Azure OpenAI integration docs?
For Azure OpenAI integration docs, see [this page instead](../openai-azure/index.md).
:::

OpenAI offers a wide range of models for natural language processing and generation. Weaviate seamlessly integrates with OpenAI's APIs, allowing users to leverage OpenAI's models directly from the Weaviate Database.

These integrations empower developers to build sophisticated AI-driven applications with ease.

## Integrations with OpenAI

### Embedding models for vector search

![Embedding integration illustration](../_includes/integration_openai_embedding.png)

OpenAI's embedding models transform text data into vector embeddings, capturing meaning and context.

[Weaviate integrates with OpenAI's embedding models](./embeddings.md) to enable seamless vectorization of data. This integration allows users to perform semantic and hybrid search operations without the need for additional preprocessing or data transformation steps.

[OpenAI embedding integration page](./embeddings.md)

### Generative AI models for RAG

![Single prompt RAG integration generates individual outputs per search result](../_includes/integration_openai_rag_single.png)

OpenAI's generative AI models can generate human-like text based on given prompts and contexts.

[Weaviate's generative AI integration](./generative.md) enables users to perform retrieval augmented generation (RAG) directly from the Weaviate Database. This combines Weaviate's efficient storage and fast retrieval capabilities with OpenAI's generative AI models to generate personalized and context-aware responses.

[OpenAI generative AI integration page](./generative.md)

## Summary

These integrations enable developers to leverage OpenAI's powerful models directly within Weaviate.

In turn, they simplify the process of building AI-driven applications to speed up your development process, so that you can focus on creating innovative solutions.

## Get started

You must provide a valid OpenAI API key to Weaviate for these integrations. Go to [OpenAI](https://openai.com/) to sign up and obtain an API key.

Then, go to the relevant integration page to learn how to configure Weaviate with the OpenAI models and start using them in your applications.

- [Text Embeddings](./embeddings.md)
- [Generative AI](./generative.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
