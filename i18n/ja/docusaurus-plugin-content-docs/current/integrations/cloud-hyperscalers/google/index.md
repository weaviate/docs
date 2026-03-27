---
title: Google Cloud Platform
sidebar_position: 2
---

Google Cloud Platform ( GCP ) の Marketplace から Weaviate クラスターを起動できます。Weaviate は Google Gemini API と Google Vertex AI と統合できます。

## GCP と Weaviate
Weaviate は GCP のインフラストラクチャおよび Google の [Gemini API](https://ai.google.dev/aistudio) や [Vertex AI](https://cloud.google.com/vertex-ai?hl=en) などのサービスと連携します。

* [Vertex AI と Gemini API で埋め込みモデルおよび生成モデルを実行する](/weaviate/model-providers/google)


## リソース
これらのリソースは次の 2 つのカテゴリに分類されます:
1. [**ハンズオン学習**](#ハンズオン学習): エンドツーエンドのチュートリアルで技術的理解を深めます。

2. [**読むと聞く**](#読むと聞く): これらのテクノロジーに関する概念的理解を深めます。

### ハンズオン学習

| Topic | Description | Resource |
| --- | --- | --- |
| Gemini Flash を使用したマルチモーダル アプリケーションの構築 | このノートブックでは、Weaviate と Gemini Flash を使ってマルチモーダル アプリケーションを構築する方法を示します。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/cloud-hyperscalers/google/gemini/multimodal-and-gemini-flash/NY-Roadshow-Gemini.ipynb) |
| BigQuery と Weaviate | DSPy を使用して BigQuery と Weaviate 間でデータを同期します。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/cloud-hyperscalers/google/bigquery/BigQuery-Weaviate-DSPy-RAG.ipynb) |
| Gemini Ultra でのセマンティック検索 | このノートブックでは、Weaviate と Gemini Ultra の使い方を紹介します。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/cloud-hyperscalers/google/gemini/gemini-ultra/gemini-ultra-weaviate.ipynb) |
| Gemini API を用いた Weaviate Query Agent | Query Agent を Gemini API のツールとして使用します。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/cloud-hyperscalers/google/agents/gemini-api-query-agent.ipynb) |
| Vertex AI を用いた Weaviate Query Agent | Query Agent を Vertex AI のツールとして使用します。 | [ノートブック](https://github.com/weaviate/recipes/blob/main/integrations/cloud-hyperscalers/google/agents/vertex-ai-query-agent.ipynb) |
| GKE への Weaviate ベクトル データベースのデプロイ | このチュートリアルでは、Google Kubernetes Engine ( GKE ) 上に Weaviate ベクトル データベース クラスターをデプロイする方法を説明します。 | [ガイド](https://cloud.google.com/kubernetes-engine/docs/tutorials/deploy-weaviate) |
| Weaviate と Gemini API によるパーソナライズされた商品説明 | データを埋め込み、セマンティック検索を実行し、Gemini API へ生成呼び出しを行い、その出力をデータベースに保存する方法を学びます。 | [ノートブック](https://github.com/google-gemini/cookbook/blob/main/examples/weaviate/personalized_description_with_weaviate_and_gemini_api.ipynb) |

### 読むと聞く
| Topic | Description | Resource |
| --- | --- | --- |
| Weaviate on Vertex AI RAG Engine: Building RAG Applications on Google Cloud | Vertex AI の新しい RAG Engine を使用し、Google Cloud 上で RAG アプリケーションを構築する方法を学びます。 | [ブログ](https://weaviate.io/blog/google-rag-api) |


