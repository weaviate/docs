---
title: モデルの選択
sidebar_label: モデルの選択
sidebar_position: 2
description: "複数言語に対応し、エンタープライズ向け検索タスクに最適化された事前学習済み埋め込みモデルの一覧。"
image: og/wcd/user_guides.jpg
---

このページでは、英語およびその他の言語でのエンタープライズ検索タスク向けに特化した事前学習済みモデルの一覧を確認できます。今後さらにモデルや機能が追加される予定ですので、定期的にご確認ください。

## 適切なモデルの選び方

以下は、特定のモデルを使用すべきシンプルな推奨事項です。

- **[`Snowflake/snowflake-arctic-embed-m-v1.5`](#snowflake-arctic-embed-m-v1.5)**  
  主に **English** で、テキストの長さが通常 **512 tokens** 未満のデータセットに最適です。
- **[`Snowflake/snowflake-arctic-embed-l-v2.0`](#snowflake-arctic-embed-l-v2.0)**  
  **複数言語**を含むデータセットや、**8192 tokens** までの長いコンテキストが必要な場合に理想的です。このモデルは、English と多言語の両方の検索タスクで高いパフォーマンスを発揮するよう最適化されています。

以下に、利用可能なすべてのモデルを一覧で示します。

---

## 利用可能なモデル

<!-- TODO[g-despot]: Uncomment section when more models are added
The following models are available for use with Weaviate Embeddings:

- **[`Snowflake/snowflake-arctic-embed-m-v1.5`](#snowflake-arctic-embed-m-v1.5)**
- **[`Snowflake/snowflake-arctic-embed-l-v2.0`](#snowflake-arctic-embed-l-v2.0)** (default)

---
-->

import WeaviateEmbeddingsModels from '/_includes/weaviate-embeddings-models.mdx';

<WeaviateEmbeddingsModels />

## ベクトライザー パラメーター

import WeaviateEmbeddingsVectorizerParameters from '/_includes/weaviate-embeddings-vectorizer-parameters.mdx';

<WeaviateEmbeddingsVectorizerParameters />

## 追加リソース

- [Weaviate Embeddings: 概要](/cloud/embeddings)
- [Weaviate Embeddings: クイックスタート](/cloud/embeddings/quickstart)
- [Weaviate Embeddings: 管理](/cloud/embeddings/administration)
- [モデル プロバイダー統合: Weaviate Embeddings](/weaviate/model-providers/weaviate/embeddings.md)

## サポート & フィードバック

import SupportAndTrouble from '/\_includes/wcs/support-and-troubleshoot.mdx';

<SupportAndTrouble />


