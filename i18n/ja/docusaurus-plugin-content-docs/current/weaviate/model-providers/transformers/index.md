---
title: ローカルホストされた Transformers ＋ Weaviate
sidebar_position: 10
image: og/docs/integrations/provider_integrations_transformers.jpg
# tags: ['model providers', 'huggingface', 'transformers']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

Hugging Face の Transformers ライブラリは、自然言語処理向けの幅広いモデルで利用できます。 Weaviate は Transformers ライブラリとシームレスに統合し、ユーザーは Weaviate Database から直接互換性のあるモデルを活用できます。

これらの統合により、開発者は高度な AI 駆動アプリケーションを簡単に構築できます。

## Hugging Face Transformers との統合

Weaviate は、互換性のある Hugging Face Transformers モデルをコンテナで起動することで統合します。 これにより、ユーザーは独自のモデルをホストし、 Weaviate と共に利用できます。

### ベクトル検索用エンベディングモデル

![Embedding integration illustration](../_includes/integration_transformers_embedding.png)

Transformers 互換のエンベディングモデルは、テキストデータを意味とコンテキストを捉えたベクトル埋め込みに変換します。

[Weaviate は Hugging Face Transformers のエンベディングモデルと統合しています](./embeddings.md) 。この統合により、追加の前処理やデータ変換を行うことなく、意味検索およびハイブリッド検索を実行できます。

[Hugging Face Transformers エンベディング統合ページ](./embeddings.md)

## 概要

これらの統合により、開発者は Weaviate 内部から直接強力な Hugging Face Transformers モデルを活用できます。

その結果、 AI 駆動アプリケーションの構築プロセスが簡素化され、開発スピードが向上し、革新的なソリューションの創出に集中できます。

## 始める

これらの統合を利用するには、ローカルでホストされた Weaviate インスタンスが必要です。 これにより、ご自身の Hugging Face Transformers モデルをホストできます。

関連する統合ページにアクセスして、 Hugging Face Transformers モデルを Weaviate で構成し、アプリケーションでの使用を開始してください。

- [テキストエンベディング](./embeddings.md)
- [テキストエンベディング（カスタムイメージ）](./embeddings-custom-image.md)
- [マルチモーダルエンベディング](./embeddings-multimodal.md)
- [マルチモーダルエンベディング（カスタムイメージ）](./embeddings-multimodal-custom-image.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

