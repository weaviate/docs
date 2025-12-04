---
title: Contextual AI
sidebar_position: 9
image: og/integrations/home.jpg
---

[Contextual AI](https://contextual.ai/) offers a [document Parser](https://docs.contextual.ai/api-reference/parse/parse-file) built for retrieval-augmented generation (RAG) systems. It enables agents to understand and navigate complex document structures. 

## Contextual AI and Weaviate
Parsed outputs can be stored in Weaviate for vector and hybrid search, metadata filtering, and RAG. 

## Our Resources 
[**Hands on Learning**](#hands-on-learning): Build your technical understanding with end-to-end tutorials.

### Hands on Learning

| Topic | Description | Resource | 
| --- | --- | --- |
| Contextual AI Parser + Weaviate | Learn how to use Contextual AI's Parser with Weaviate to build powerful RAG applications over PDF documents. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/data-platforms/contextual-ai/rag_over_pdfs_contextual_weaviate.ipynb) | 
| Generative Search with Contextual AI | This notebook demos how to use ContextualAI's generative model (v2) with Weaviate for RAG, combining hybrid search (sparse + dense) with generative search to answer questions based on retrieved Jeopardy data. | [Notebook](https://github.com/weaviate/recipes/blob/main/weaviate-features/model-providers/contextual/rag_contextual_v2.ipynb) | 
| Reranking with Contextual AI | This notebook demonstrates how to use Contextual AI's reranking model (ctxl-rerank-v2-instruct-multilingual) with Weaviate to improve search result quality. | [Notebook](https://github.com/weaviate/recipes/blob/main/weaviate-features/reranking/contextual-reranking/rerank_contextual.ipynb) | 