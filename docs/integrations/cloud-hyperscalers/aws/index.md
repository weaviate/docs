---
title: Amazon Web Services
sidebar_position: 1
---

Launch a Weaviate cluster from the Amazon Web Services (AWS) marketplace. AWS supports model provider integrations through SageMaker and Bedrock.

## AWS and Weaviate
Weaviate integrates with [AWS](https://aws.amazon.com/) infrastructure and services like [SageMaker](https://aws.amazon.com/sagemaker/) and [Bedrock](https://aws.amazon.com/bedrock/).

* [Deploy Weaviate from AWS Marketplace](/deploy/installation-guides/aws-marketplace.md)
* [Run embedding and generative models on SageMaker and Bedrock](/weaviate/model-providers/aws)

## Our Resources 
The resources are broken into two categories:
1. [**Hands on Learning**](#hands-on-learning): Build your technical understanding with end-to-end tutorials.

2. [**Read and Listen**](#read-and-listen): Develop your conceptual understanding of these technologies.

### Hands on Learning

| Topic | Description | Resource | 
| --- | --- | --- |
| RAG with Cohere models on Amazon Bedrock and Weaviate | The example use case generates targeted advertisements for vacation stay listings based on a target audience. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/cloud-hyperscalers/aws/RAG_Cohere_Weaviate_v4_client.ipynb) |
| RAG with AWS Nova Lite on Bedrock and Weaviate | This notebook will show you how to use the dynamic RAG API to define the model provider at query time. | [Notebook](https://github.com/weaviate/recipes/blob/main/weaviate-features/model-providers/aws/rag_nova_lite_bedrock.ipynb) | 

### Read and Listen
| Topic | Description | Resource |
| --- | --- | --- |
| Legacy data to RAG : Modernise Your Apps with Amazon Sagemaker Unified Studio | A guide to seamlessly transform data sitting in lakes and warehouses for GenAI capable applications | [Blog](https://weaviate.io/blog/sagemaker-studio-rag) |
| Multimodal Search with Nova Embeddings | This notebook demonstrates how to build a multimodal search system using AWS Nova embeddings in Weaviate, enabling image search, hybrid search, and the Weaviate Query Agent. | [Notebook](https://github.com/weaviate/recipes/blob/main/weaviate-features/model-providers/aws/multi-modal-search-nova-embeddings.ipynb) | 
| Nova Customization | This notebook will illustrate how to use the open-source Nova Prompt Optimizer to optimize a RAG system. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/cloud-hyperscalers/aws/nova-prompt-optimizer.ipynb) | 