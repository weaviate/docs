---
title: Weaviate Embeddings
sidebar_position: 10
image: og/docs/integrations/provider_integrations_wes.jpg
# tags: ['model providers', 'weaviate', 'weaviate embeddings']
---

:::info Weaviate Embeddings へのアクセス
Weaviate Embeddings は Weaviate Cloud で提供される有料サービスです。Sandbox クラスターを使用して無料でお試しいただけます。
:::

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

[Weaviate Embeddings](/cloud/embeddings) は Weaviate Cloud ユーザーに ベクトライザー モデルを提供し、Weaviate Cloud のデータベース インスタンスから直接 Weaviate Embeddings のモデルを活用できます。

これらの統合により、開発者は高度な AI ドリブン アプリケーションを簡単に構築できます。

## Weaviate Embeddings との統合

### ベクトル検索向け エンベディングモデル

![エンベディング統合の図](../_includes/integration_wes_embedding.png)

Weaviate Embeddings のモデルは、テキストデータを意味とコンテキストを捉えた ベクトル エンベディングへ変換します。

[Weaviate Cloud は Weaviate Embeddings のエンベディングモデル](./embeddings.md) と統合して、データのシームレスなベクトル化を実現します。この統合により、追加の前処理やデータ変換を行わずに、セマンティック検索やハイブリッド検索を実行できます。

[Weaviate Embeddings の統合ページ](./embeddings.md)

## 概要

これらの統合により、開発者は Weaviate 内部で Weaviate Embeddings の強力なモデルを直接利用できます。

その結果、AI ドリブン アプリケーションの構築プロセスが簡素化され、開発を加速し、革新的なソリューションの創出に集中できます。

## はじめに

これらの統合を利用するには、有効な Weaviate Cloud API キーを Weaviate に提供する必要があります。[Weaviate Cloud](https://console.weaviate.cloud/) にアクセスして登録し、API キーを取得してください。

次に、該当する統合ページで Weaviate を Weaviate Embeddings モデルと連携する設定方法を確認し、アプリケーションで利用を開始してください。

- [テキスト エンベディング](./embeddings.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

