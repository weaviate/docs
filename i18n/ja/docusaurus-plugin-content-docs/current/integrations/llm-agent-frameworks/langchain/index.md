---
title: LangChain
sidebar_position: 4
---

[ LangChain ](https://python.langchain.com/v0.2/docs/introduction/) は、大規模言語モデル（ LLM ）を利用するアプリケーションを構築するためのフレームワークです。

## LangChain と Weaviate
Weaviate は、 LangChain でサポートされている ベクトル ストアです。統合を利用するには、稼働中の Weaviate クラスターが必要です。

お使いの Weaviate クラスターに LangChain を接続します:  
```python
weaviate_client = weaviate.connect_to_local()
db = WeaviateVectorStore.from_documents(docs, embeddings, client=weaviate_client)
```

## リソース
これらのリソースは 2 つのカテゴリに分かれています:
1. [**ハンズオン学習**](#hands-on-learning)：エンドツーエンドのチュートリアルで技術的な理解を深めます。

2. [**読む・聴く**](#read-and-listen)：これらの技術に関する概念的理解を深めます。

### ハンズオン学習

| トピック | 説明 | リソース |
| --- | --- | --- |
| LangChain LCEL | LangChain LCEL で言語プログラムを定義し、それを DSPy でコンパイルし、再び LangChain LCEL に変換するノートブックです。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/langchain/LCEL/RAG-with-LangChain-LCEL-and-DSPy.ipynb) |
| LangChain とマルチテナンシー | LangChain、 OpenAI、 Weaviate を使用し、テナントごとに複数の PDF を取り込んで多言語 RAG を構築します。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/langchain/loading-data/langchain-simple-pdf-multitenant.ipynb) |
| 多言語 RAG | LangChain と Weaviate を使って RAG アプリケーションを構築する方法を示すシンプルなノートブックです。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/langchain/loading-data/langchain-simple-pdf.ipynb) |
| LangChain と Weaviate Query エージェント | Weaviate Query エージェントを LangChain のツールとして使用します。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/langchain/agents/langchain-weaviate-query-agent.ipynb) |


### 読む・聴く
| トピック | 説明 | リソース |
| --- | --- | --- |
| LangChain と Weaviate の組み合わせ | LangChain における Weaviate との統合方法と、さまざまな `CombineDocuments` 手法について学びます。 | [ブログ](https://weaviate.io/blog/combining-langchain-and-weaviate) |
| Weaviate Podcast #36 | Harrison Chase と Bob van Luijt による LangChain と Weaviate の対談 | [ポッドキャスト](https://www.youtube.com/watch?v=lhby7Ql7hbk) |
| LLM アプリのための Weaviate + LangChain | LangChain と Weaviate がどのように連携するかの概要です。 | [動画](https://youtu.be/7AGj4Td5Lgw?feature=shared) |


