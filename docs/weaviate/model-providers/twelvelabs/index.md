---
title: TwelveLabs + Weaviate
sidebar_position: 10
image: og/docs/model-provider-integrations.jpg
# tags: ['model providers', 'twelvelabs']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

TwelveLabs builds multimodal understanding models. Weaviate integrates with the TwelveLabs embedding API, so you can vectorize your data and your queries with a TwelveLabs model without leaving the Weaviate Database.

:::caution Text and images only
TwelveLabs is best known for video understanding, but this Weaviate integration works with **text and images only**. Video and audio are not supported.
:::

## Integrations with TwelveLabs

### Embedding models for vector search

![Embedding integration illustration](../_includes/integration_twelvelabs_embedding.png)

TwelveLabs' embedding models place text and images in a shared vector space, so that a text query can retrieve images and vice versa.

[Weaviate integrates with TwelveLabs' embedding models](./embeddings-multimodal.md) to enable seamless vectorization of data. This integration allows users to perform semantic and hybrid search operations without the need for additional preprocessing or data transformation steps.

[TwelveLabs multimodal embedding integration page](./embeddings-multimodal.md)

## Summary

This integration enables developers to use TwelveLabs' multimodal embedding models within Weaviate.

In turn, it simplifies the process of building AI-driven applications to speed up your development process, so that you can focus on creating innovative solutions.

## Get started

You must provide a valid TwelveLabs API key to Weaviate for this integration. Go to [TwelveLabs](https://www.twelvelabs.io/) to sign up and obtain an API key.

Then, go to the relevant integration page to learn how to configure Weaviate with the TwelveLabs models and start using them in your applications.

- [Multimodal Embeddings](./embeddings-multimodal.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
