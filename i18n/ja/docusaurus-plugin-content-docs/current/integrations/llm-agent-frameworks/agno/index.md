---
title: Agno
sidebar_position: 1
---

[Agno](https://docs.agno.com/introduction) は、マルチモーダル エージェント を構築するための軽量ライブラリです。LLM を統一された API として公開し、メモリ、ナレッジ、tools、推論といったスーパーパワーを付与します。


## Agno と Weaviate
Weaviate は Agno で [サポートされている ベクトル データベース](https://docs.agno.com/vectordb/weaviate) です。まずは次のようにして ベクトル ストア を作成します。

```python
from agno.agent import Agent
from agno.knowledge.pdf_url import PDFUrlKnowledgeBase
from agno.vectordb.search import SearchType
from agno.vectordb.weaviate import Distance, VectorIndex, Weaviate

vector_db = Weaviate(
    collection="recipes",
    search_type=SearchType.hybrid,
    vector_index=VectorIndex.HNSW,
    distance=Distance.COSINE,
    local=True,  # Set to False if using Weaviate Cloud and True if using local instance
)
```

次に、エージェント のためのナレッジベースを作成します。

```python
knowledge_base = PDFUrlKnowledgeBase(
    urls=["https://agno-public.s3.amazonaws.com/recipes/ThaiRecipes.pdf"],
    vector_db=vector_db,
)
```

## 当社リソース 
[**Hands on Learning**](#hands-on-learning): エンドツーエンドのチュートリアルで技術的理解を深めましょう。

### Hands on Learning

| トピック | 説明 | リソース | 
| --- | --- | --- |
| Weaviate Query Agent with Agno | このノートブックでは、Agno を通じて Weaviate Query Agent を tool として定義する方法を紹介します。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/agno/agno-weaviate-query-agent.ipynb) |


