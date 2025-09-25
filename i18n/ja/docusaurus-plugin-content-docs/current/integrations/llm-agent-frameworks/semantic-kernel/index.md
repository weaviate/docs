---
title: セマンティック カーネル
sidebar_position: 7
---
[Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/) は Microsoft によって開発された LLM フレームワークです。Semantic Kernel は `plugins`、`memory`、`planners` などの抽象化を通じて LLM アプリケーションの構築を容易にします。 

## Semantic Kernel と Weaviate
Weaviate は Semantic Kernel でサポートされている ベクトル ストアです。 


## リソース 
リソースは 2 つのカテゴリーに分かれています。 
1. [**ハンズオン学習**](#hands-on-learning): エンドツーエンドのチュートリアルで技術的理解を深めます。

2. [**読む・聞く**](#read-and-listen): これらの技術に関する概念的理解を高めます。

### ハンズオン学習

| Topic | Description | Resource | 
| --- | --- | --- |
| Semantic Kernel を使用した RAG チャットボット | 取得してから生成するというシンプルなワークフローを実装します。プロンプト エンジニアリング、OpenAI API 呼び出しのオーケストレーション、Weaviate の統合に Semantic Kernel を使用します。Weaviate をナレッジベースとして使用し、意味的に関連するコンテキストを取得します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/semantic-kernel/dotnet/Chatbot_RAG_Weaviate.ipynb) |
| Weaviate と SK を用いた検索拡張生成 | 取得してから生成するというシンプルなワークフローを実装します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/semantic-kernel/RetrievalAugmentedGeneration_Weaviate.ipynb) |
| Weaviate 永続メモリ | このノートブックでは、`VolatileMemoryStore` のメモリ ストレージを `WeaviateMemoryStore` の永続メモリに置き換える方法を示します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/semantic-kernel/weaviate-persistent-memory.ipynb) | 


### 読む・聞く 
| Topic | Description | Resource | 
| --- | --- | --- |
| Weaviate ポッドキャスト | John Maeda と Bob van Luijt による Humans and AI | [Podcast](https://youtu.be/c9t0VViIP9c?feature=shared) |
| NeurIPS 2023 での Weaviate | Semantic Kernel の Alex Chao との対談 | [Podcast](https://www.youtube.com/watch?v=xrZxk0H2cmY) |
| Semantic Kernel と Weaviate: 長期メモリを備えた LLM との対話をオーケストレーションする | オーケストレーション フレームワークとして Semantic Kernel を、外部知識ソースとして Weaviate を使用する方法を学びます。 | [Blog](https://devblogs.microsoft.com/semantic-kernel/guest-post-semantic-kernel-and-weaviate-orchestrating-interactions-around-llms-with-long-term-memory/) |


