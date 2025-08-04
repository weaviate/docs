---
title: Model2Vec + Weaviate
sidebar_position: 10
image: og/docs/integrations/provider_integrations_model2vec.jpg
# tags: ['model providers', 'model2vec']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

The Model2Vec library allows you to easily run a range of embeddings models on your own device as lightweight, static models. Weaviate seamlessly integrates with the Model2Vec library, allowing users to leverage compatible models directly from the Weaviate Database.

These integrations empower developers to build sophisticated AI-driven applications with ease.

## Integrations with Model2Vec

Weaviate integrates with compatible Model2Vec models by accessing the locally hosted Model2Vec API.

### Embedding models for vector search

![Embedding integration illustration](../_includes/integration_model2vec_embedding.png)

Model2Vec's embedding models transform text data into vector embeddings, using faster, static versions of sentence transformer models.

[Weaviate integrates with Model2Vec's embedding models](./embeddings.md) to enable seamless vectorization of data. This integration allows users to perform semantic and hybrid search operations without the need for additional preprocessing or data transformation steps.

[Model2Vec embedding integration page](./embeddings.md)

## Summary

These integrations enable developers to leverage powerful Model2Vec models from directly within Weaviate.

In turn, they simplify the process of building AI-driven applications to speed up your development process, so that you can focus on creating innovative solutions.

## Get started

A locally hosted Weaviate instance is required for these integrations so that you can host your own Model2Vec models.

Go to the relevant integration page to learn how to configure Weaviate with the Model2Vec models and start using them in your applications.

- [Text Embeddings](./embeddings.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
