---
title: GPT4All と Weaviate
sidebar_position: 10
image: og/docs/integrations/provider_integrations_gpt4all.jpg
# tags: ['model providers', 'gpt4all']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

 GPT4All ライブラリを使用すると、幅広いモデルを自身のデバイス上で簡単に実行できます。 Weaviate は  GPT4All ライブラリとシームレスに統合されており、ユーザーは  Weaviate データベースから互換性のあるモデルを直接活用できます。

これらの統合により、開発者は高度な  AI 駆動アプリケーションを簡単に構築できます。

## GPT4All との統合

### ベクトル検索のための Embedding モデル

![Embedding 統合の図](../_includes/integration_gpt4all_embedding.png)

 GPT4All の  Embedding モデルは、テキストデータを  ベクトル 埋め込みに変換し、意味とコンテキストを捉えます。

[ Weaviate は GPT4All の Embedding モデルと統合](./embeddings.md) し、データのシームレスなベクトル化を実現します。この統合により、追加の前処理やデータ変換を行うことなく、セマンティック検索およびハイブリッド検索を実行できます。

[ GPT4All embedding 統合ページ](./embeddings.md)

## 概要

これらの統合により、開発者は  Weaviate 内から強力な  GPT4All モデルを活用できます。

その結果、 AI 駆動アプリケーションの開発プロセスが簡素化され、イノベーティブなソリューションの創出に集中できます。

## はじめに

これらの統合を利用するには、ローカルにホストされた  Weaviate インスタンスが必要です。これにより、自身の  GPT4All モデルをホストできます。

該当する統合ページにアクセスし、 Weaviate を  GPT4All モデルとどのように設定し、アプリケーションで使用するかをご確認ください。

- [ テキスト Embeddings ](./embeddings.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

