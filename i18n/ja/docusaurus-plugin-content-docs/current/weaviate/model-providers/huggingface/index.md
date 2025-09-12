---
title: Hugging Face と Weaviate
sidebar_position: 10
image: og/docs/integrations/provider_integrations_huggingface.jpg
# tags: ['model providers', 'huggingface']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

Hugging Face は自然言語処理向けに幅広いモデルを提供しています。 Weaviate は Hugging Face の Inference API とシームレスに統合されており、ユーザーは Hugging Face Hub のモデルを Weaviate データベースから直接利用できます。

これらの統合により、開発者は高度な AI 駆動アプリケーションを簡単に構築できます。

## Hugging Face との統合

### ベクトル検索用の埋め込みモデル

![埋め込み統合のイメージ](../_includes/integration_huggingface_embedding.png)

Hugging Face Hub の埋め込みモデルはテキストデータをベクトル埋め込みに変換し、意味とコンテキストを捉えます。

[Weaviate は Hugging Face Hub の埋め込みモデルと統合](./embeddings.md) しており、データをシームレスにベクトル化できます。この統合により、追加の前処理やデータ変換を行わずにセマンティック検索やハイブリッド検索が可能になります。

[Hugging Face 埋め込み統合ページ](./embeddings.md)

## まとめ

これらの統合を利用することで、開発者は Hugging Face の強力なモデルを Weaviate 内で直接活用できます。

その結果、 AI 駆動アプリケーションの開発プロセスが簡素化され、イノベーティブなソリューションの創出に集中できます。

## はじめに

これらの統合を使用するには、有効な Hugging Face API キーを Weaviate に提供する必要があります。 [Hugging Face](https://huggingface.co/docs/api-inference/en/quicktour) にアクセスしてサインアップし、 API キーを取得してください。

次に、該当する統合ページに移動し、 Hugging Face Hub のモデルで Weaviate を設定してアプリケーションで使用を開始しましょう。

- [テキスト埋め込み](./embeddings.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


