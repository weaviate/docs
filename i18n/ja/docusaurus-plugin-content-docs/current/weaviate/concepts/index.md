---
title: Concepts
description: Explore foundational concepts behind Weaviate's vector search capabilities.
sidebar_position: 0
image: og/docs/concepts.jpg
# tags: ['getting started']
---


<!-- :::caution Migrated From:
- `Core knowledge`
  - `Data objects` from `Core knowledge/Basics`
  - `Modules`: Combines theoretical explanations from `Configuration/Modules` + `Modules/Index`
- `Architecture`
- `Vector indexing` from `Vector Index (ANN) Plugins:Index` + `HNSW`
  - Note: Configuration options from `HNSW` are now in `References: Configuration/Vector index#How to configure HNSW`
::: -->

**Concepts** セクションでは、Weaviate とそのアーキテクチャに関するさまざまな側面を解説し、最大限に活用していただくための情報を提供します。これらのセクションはどの順番でもお読みいただけます。

:::info
実践的なガイドをお求めの場合は、[クイックスタート チュートリアル](/weaviate/quickstart/index.md) をお試しください。
:::

## コアコンセプト

**[Data structure](./data.md)**

- Weaviate がデータオブジェクトをどのように保存・表現し、相互にリンクしているかを説明します。

**[Modules](./modules.md)**

- Weaviate のモジュールシステムの概要、モジュールでできること、既存のモジュールタイプ、およびカスタムモジュールについて説明します。

**[Indexing](./indexing/index.md)**

- 転置インデックスおよび  ANN インデックスを使用して Weaviate 内でデータがどのようにインデックス化されるかと、設定可能なオプションについて説明します。

**[Vector indexing](./indexing/vector-index.md)**

- HNSW アルゴリズム、距離メトリクス、設定可能なオプションなど、Weaviate のベクトルインデックス アーキテクチャを詳しく説明します。

**[Vector quantization](./vector-quantization.md)**

- Weaviate のベクトル量子化オプションについて詳しく説明します。

## Weaviate のアーキテクチャ

次の図は、Weaviate のアーキテクチャを 30,000 フィートの視点で示しています。

[![Weaviate モジュール API の概要](../../../../../../docs/weaviate/concepts/img/weaviate-architecture-overview.svg "Weaviate のシステムとアーキテクチャの概要")](../../../../../../docs/weaviate/concepts/img/weaviate-architecture-overview.svg)

この図の各コンポーネントについては、以下のガイドで詳しく学べます。

**[Learn about storage inside a shard](./storage.md)**
  * Weaviate がデータを保存する方法  
  * Weaviate が書き込みを永続化する方法  
  * 転置インデックス、ベクトルインデックス、オブジェクトストアがどのように連携するか  

**[Ways to scale Weaviate horizontally](./cluster.md)**
  * スケールするさまざまな動機  
  * シャーディングとレプリケーション  
  * クラスターの設定方法  
  * 一貫性  

**[How to plan resources](./resources.md)**
  * CPU・Memory・GPU の役割  
  * クラスターを適切にサイズ設定する方法  
  * 特定プロセスの高速化  
  * ボトルネックの防止  

**[Filtered vector search](./filtering.md)**
  * ベクトル検索をフィルターと組み合わせる  
  * HNSW と転置インデックスを組み合わせて高リコールかつ高速なフィルター付きクエリを実現する方法  

**[User-facing interfaces](./interface.md)**
  * ユーザー向け API の設計思想  
  * REST と GraphQL API の役割  

**[Replication architecture](./replication-architecture/index.md)**
  * レプリケーションについて  
  * Weaviate の実装  
  * ユースケース  

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>