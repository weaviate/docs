---
title: Meta + Weaviate
description: "Meta offers generative models through its API. Weaviate integrates with the Meta API, so you can use Meta's generative models directly from the Weaviate Database."
sidebar_position: 10
image: og/docs/model-provider-integrations.jpg
# tags: ['model providers', 'meta']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

Meta offers generative models through its API. Weaviate integrates with the Meta API, so you can use Meta's generative models directly from the Weaviate Database.

## Integrations with Meta

### Generative AI models for RAG

![Single prompt RAG integration generates individual outputs per search result](../_includes/integration_meta_rag_single.png)

Meta's generative models produce text from a prompt and the supplied context.

[Weaviate's generative AI integration](./generative.md) enables users to perform retrieval augmented generation (RAG) directly from the Weaviate Database. This combines Weaviate's efficient storage and fast retrieval capabilities with Meta's generative models to generate personalized and context-aware responses.

[Meta generative AI integration page](./generative.md)

## Summary

This integration enables developers to use Meta's generative models directly within Weaviate.

## Get started

You must provide a valid Meta API key to Weaviate for this integration. See the [Meta API documentation](https://dev.meta.ai/docs/api-reference) to obtain an API key.

Then, go to the relevant integration page to learn how to configure Weaviate with the Meta models and start using them in your applications.

- [Generative AI](./generative.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
