---
title: CrewAI
sidebar_position: 1
---

[CrewAI](https://www.crewai.com/) はマルチ エージェント アプリケーションを構築するためのフレームワークです。

## CrewAI と Weaviate
Weaviate は CrewAI で [サポートされている ベクトル 検索ツール](https://docs.crewai.com/tools/weaviatevectorsearchtool) です。これにより、Weaviate クラスターに保存されているドキュメントに対してセマンティック検索クエリを実行できます。 

次のようにツールを初期化できます:

```python
from crewai_tools import WeaviateVectorSearchTool

# Initialize the tool
tool = WeaviateVectorSearchTool(
    collection_name='example_collections',
    limit=3,
    weaviate_cluster_url="https://your-weaviate-cluster-url.com",
    weaviate_api_key="your-weaviate-api-key",
)
```

## リソース
リソースは 2 つのカテゴリーに分かれています:  
1. [**ハンズオン学習**](#hands-on-learning) : エンドツーエンドのチュートリアルで技術的な理解を深めます。  
2. [**読み物と動画**](#read-and-listen) : これらの技術について概念的な理解を深めます。  

### ハンズオン学習 <!-- {#hands-on-learning} -->

| トピック | 説明 | リソース |
| --- | --- | --- |
| Weaviate Query Agent with Crew AI | Crew AI を通じて Weaviate Query Agent をツールとして定義する方法を示します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/crewai/crewai-query-agent-as-tool.ipynb) |

### 読み物と動画 <!-- {#read-and-listen} -->

| トピック | 説明 | リソース |
| --- | --- | --- |
| Practical Multi Agent RAG using CrewAI, Weaviate, Groq and ExaTool | code_interpretation、rag、memory、カスタムツールを可能にする RAG 搭載 CrewAI エージェントの構築方法を学びます。 | [Blog](https://lorenzejay.dev/articles/practical-agentic-rag) |
| Rag Techniques Tutorial for Agentic Rag | RAG 初心者向けのテクニックを解説する動画です。 | [Video](https://youtu.be/zXBlvpaFNxE?si=KkE14m1KngPZvu_W) |
| How to Build an Agentic RAG Recommendation Engine | Knowledge を活用して、エージェントのクルーに関連するコンテキストと情報へアクセスさせる方法を学びます。 | [Video](https://youtu.be/2Fu_GgS-Q4s?si=ZnDeucXrGnG7UaQY) |

