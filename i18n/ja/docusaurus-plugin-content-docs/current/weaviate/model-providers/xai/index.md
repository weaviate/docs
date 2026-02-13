---
title: xAI と Weaviate
sidebar_position: 10
# image: og/docs/integrations/provider_integrations_xai.jpg
# tags: ['model providers', 'xAI']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

xAI は自然言語の処理と生成のために幅広いモデルを提供しています。 Weaviate は xAI の API とシームレスに統合され、ユーザーは Weaviate Database から直接 xAI のモデルを活用できます。

これらの統合により、開発者は高度な AI ドリブン アプリケーションを簡単に構築できます。

## xAI との統合

### RAG 用生成 AI モデル

![単一プロンプト RAG 統合は検索結果ごとに個別の出力を生成します](../_includes/integration_xai_rag.png)

xAI の生成 AI モデルは、与えられたプロンプトとコンテキストに基づいて人間のようなテキストを生成できます。

[Weaviate の生成 AI 統合](./generative.md) を使用すると、ユーザーは Weaviate Database から直接 検索拡張生成 (RAG) を実行できます。これは、Weaviate の効率的なストレージと高速な検索機能を xAI の生成 AI モデルと組み合わせることで、パーソナライズされた文脈に即した応答を生成します。

[xAI 生成 AI 統合ページ](./generative.md)

## まとめ

これらの統合により、開発者は xAI の強力なモデルを Weaviate 内で直接活用できます。

その結果、AI ドリブン アプリケーションの構築プロセスが簡素化され、開発を加速し、イノベーティブなソリューションの創出に集中できます。

## はじめに

この統合を利用するには、有効な xAI API キーを Weaviate に提供する必要があります。 [xAI](https://console.x.ai/) にアクセスしてサインアップし、API キーを取得してください。

次に、該当する統合ページに移動し、xAI モデルで Weaviate を構成する方法を学び、ご自身のアプリケーションで利用を開始してください。

- [生成 AI](./generative.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

