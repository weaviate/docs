---
title: KubeAI と Weaviate
sidebar_position: 10
image: og/docs/integrations/provider_integrations_kubeai.jpg
# tags: ['model providers', 'openai']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

[KubeAI](https://github.com/substratusai/kubeai) は、OpenAI 形式の API エンドポイントを通じて自然言語処理および生成のための幅広いモデルを提供します。Weaviate は KubeAI の API とシームレスに統合され、ユーザーは KubeAI の任意のモデルを Weaviate Database から直接利用できます。

これらの統合により、開発者は高度な AI ドリブンアプリケーションを容易に構築できます。

## KubeAI との統合

### ベクトル検索のための埋め込みモデル

![埋め込み統合の図解](../_includes/integration_kubeai_embedding.png)

KubeAI の埋め込みモデルはテキストデータをベクトル埋め込みへと変換し、意味と文脈を捉えます。

[Weaviate は KubeAI の埋め込みエンドポイントと統合](./embeddings.md)しており、データのシームレスなベクトル化を実現します。この統合により、追加の前処理やデータ変換ステップを必要とせずにセマンティック検索やハイブリッド検索を実行できます。

[KubeAI 埋め込み統合ページ](./embeddings.md)

### RAG 用の生成 AI モデル

![単一プロンプト RAG の統合は検索結果ごとに個別の出力を生成します](../_includes/integration_kubeai_rag_single.png)

KubeAI の生成 AI モデルは、与えられたプロンプトとコンテキストに基づいて人間らしいテキストを生成できます。

[Weaviate の生成 AI 統合](./generative.md)を使用すると、Weaviate Database から直接 検索拡張生成 (RAG) を実行できます。これにより、Weaviate の効率的なストレージと高速検索能力に KubeAI の生成 AI モデルを組み合わせ、パーソナライズされた文脈に応じた応答を生成します。

[KubeAI 生成 AI 統合ページ](./generative.md)

## まとめ

これらの統合により、開発者は KubeAI の強力なモデルを Weaviate 内で直接活用できます。

その結果、AI ドリブンアプリケーションの構築プロセスが簡素化され、開発スピードが向上し、革新的なソリューションの創出に集中できます。

## 開始方法

Kubernetes クラスターに KubeAI をデプロイし、埋め込みモデルおよび生成モデルを用意します。詳細は、[KubeAI デプロイガイド](https://www.kubeai.org/tutorials/weaviate/#kubeai-configuration)をご覧ください。

その後、該当する統合ページに移動し、KubeAI モデルで Weaviate を設定してアプリケーションで利用を開始してください。

- [テキスト埋め込み](./embeddings.md)
- [生成 AI](./generative.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


