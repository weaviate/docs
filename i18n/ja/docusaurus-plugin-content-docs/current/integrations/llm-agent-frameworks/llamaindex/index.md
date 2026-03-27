---
title: LlamaIndex
sidebar_position: 5
---

[LlamaIndex](https://www.llamaindex.ai/) は、大規模言語モデル ( LLM ) アプリケーションを構築するためのフレームワークです。 

## LlamaIndex と Weaviate
Weaviate は、LlamaIndex における [サポートされているベクトルストア](https://docs.llamaindex.ai/en/stable/api_reference/storage/vector_store/weaviate/) です。 

ベクトルストアを作成します:

```python
vector_store = WeaviateVectorStore(weaviate_client=client, index_name="LlamaIndex")
```

## リソース 
リソースは次の 2 つのカテゴリに分かれています:  
1. [ **ハンズオンラーニング** ](#hands-on-learning): エンドツーエンドのチュートリアルで技術的な理解を深めましょう。

2. [ **読む・聞く** ](#read-and-listen): これらの技術に関する概念的な理解を深めましょう。

### ハンズオンラーニング

| トピック | 説明 | リソース | 
| --- | --- | --- |
| LlamaIndex におけるデータローダー | LlamaIndex を使用して Weaviate にデータをロードする方法、および既存の Weaviate クラスターに LlamaIndex を接続する方法を学びます。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/data-loaders-episode1/episode1.ipynb) |
| LlamaIndex におけるインデックス | LlamaIndex で構築できるさまざまなインデックスについて学びます。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/indexes-episode2/indexes-in-llamaindex.ipynb) |
| リカーシブクエリエンジン | リカーシブクエリエンジンの構築方法を学びます。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/recursive-query-engine/recursive-retrieval.ipynb) |
| 自己修正クエリエンジン | ベクトルストアをセットアップし、自己修正クエリエンジンを構築します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/self-correcting-query-engine/self-correcting.ipynb) | 
| シンプルクエリエンジン | シンプルなクエリエンジンを構築します。 | [Notebook](https://github.com/weaviate/recipes/tree/main/integrations/llm-agent-frameworks/llamaindex/simple-query-engine) |
| SQL ルータークエリエンジン | ベクトルデータベースと SQL データベースを検索する SQL クエリエンジンを構築します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/sql-router-query-engine/sql-query-router.ipynb) |
| サブクエスチョンクエリエンジン | 複雑な質問を複数のパートに分割するクエリエンジンを構築します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/sub-question-query-engine/sub_question_query_engine.ipynb) |
| 高度な RAG | この Notebook では、LlamaIndex と Weaviate を用いた高度な Retrieval-Augmented Generation ( RAG ) パイプラインをガイドします。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/retrieval-augmented-generation/advanced_rag.ipynb) | 
| ナイーブ RAG | この Notebook では、LlamaIndex と Weaviate を用いたナイーブな RAG パイプラインをガイドします。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/retrieval-augmented-generation/naive_rag.ipynb) |
| エージェントと非エージェントの比較 | ナイーブ RAG と、RAG ツールを持つエージェントの違いを学びます。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/agents/llama-index-weaviate-assistant-agent.ipynb) |
| LlamaIndex と Weaviate Query エージェント | LlamaIndex の `AgentWorkflow` で Query エージェントをツールとして使用します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/llamaindex/agents/agent-workflow-with-weaviate-query-agent-.ipynb) | 


### 読む・聞く 
| トピック | 説明 | リソース | 
| --- | --- | --- |
| エピソード 1: データロード | このエピソードでは、データを LlamaIndex と Weaviate に接続する方法を示します。 | [Video](https://youtu.be/Bu9skgCrJY8?feature=shared) | 
| エピソード 2: LlamaIndex のインデックス | この動画では、3 種類の LlamaIndex インデックス (Vector Store Index、List Index、Tree Index) を取り上げ、アーキテクチャ設計を解説します。最後に Vector Store Index と List Index のデモを行います。  | [Video](https://youtu.be/6pLgOJrFL38?feature=shared) |
| エピソード 3: LlamaIndex における RAG 手法 | LlamaIndex で実装されている 4 つのクエリエンジンについて学びます。 | [Video](https://youtu.be/Su-ROQMaiaw?feature=shared) | 
| LlamaIndex と Weaviate のブログ | LlamaIndex の概要と統合の概要を紹介しています。 | [Blog](https://weaviate.io/blog/llamaindex-and-weaviate) |

