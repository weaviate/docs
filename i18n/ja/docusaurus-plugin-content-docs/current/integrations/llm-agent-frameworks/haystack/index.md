---
title: Haystack
sidebar_position: 3
---

[Haystack](https://haystack.deepset.ai/) は、大規模言語モデルアプリケーションを構築するためのフレームワークです。

## Haystack と Weaviate
Weaviate は Haystack で利用できる [サポート対象のドキュメントストア](https://haystack.deepset.ai/integrations/weaviate-document-store) です。ドキュメントストアを構築するには、稼働中の Weaviate クラスターが必要です。

```python
auth_client_secret = AuthApiKey(Secret.from_token("MY_WEAVIATE_API_KEY"))
document_store = WeaviateDocumentStore(auth_client_secret=auth_client_secret)
```

## 当社のリソース
[**実践学習**](#hands-on-learning): エンドツーエンドのチュートリアルで技術的理解を深めましょう。

### Hands on Learning

| Topic | Description | Resource |
| --- | --- | --- |
| Advanced RAG: Query Expansion | RAG におけるクエリ拡張の実装方法を学びます。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/haystack/query_expansion_haystack_weaviate.ipynb) |
| Haystack and Weaviate Query Agent | Haystack で Query Agent をツールとして使用します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/haystack/haystack-query-agent-tool.ipynb) |


