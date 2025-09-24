---
title: Azure OpenAI と Weaviate
sidebar_position: 10
image: og/docs/integrations/provider_integrations_openai_azure.jpg
# tags: ['model providers', 'azure', 'openai']
---

<!-- Note: for images, use https://docs.google.com/presentation/d/15opIcJuaIjEEcs_1Zm8B6pccox2p7_MHSjCnRv4dPfU/edit?usp=sharing -->

Microsoft Azure は自然言語処理と生成のために幅広い OpenAI モデルを提供しています。Weaviate は Microsoft Azure の API とシームレスに統合し、ユーザーは OpenAI のモデルを Weaviate データベースから直接活用できます。

これらの統合により、開発者は高度な AI 駆動アプリケーションを容易に構築できます。

## Azure OpenAI との統合

### ベクトル検索用の埋め込みモデル

![埋め込み統合の図](../_includes/integration_openai_azure_embedding.png)

Azure OpenAI の埋め込みモデルは、テキストデータを意味と文脈を捉えたベクトル埋め込みへと変換します。

[Weaviate は Azure OpenAI の埋め込みモデルと統合](./embeddings.md)し、データのシームレスなベクトル化を実現します。この統合により、追加の前処理やデータ変換を行わずに、セマンティック検索やハイブリッド検索を実施できます。

[Azure OpenAI 埋め込み統合ページ](./embeddings.md)

### RAG 用の生成 AI モデル

![シングルプロンプト RAG 統合は検索結果ごとに個別の出力を生成](../_includes/integration_openai_azure_rag_single.png)

Azure OpenAI の生成 AI モデルは、与えられたプロンプトとコンテキストに基づき、人間らしいテキストを生成できます。

[Weaviate の生成 AI 統合](./generative.md)を使用すると、Weaviate データベースから直接 Retrieval augmented generation を実行できます。これは、Weaviate の効率的なストレージと高速検索機能を Azure OpenAI の生成 AI モデルと組み合わせ、個別で文脈に合った応答を生成します。

[Azure OpenAI 生成 AI 統合ページ](./generative.md)

## まとめ

これらの統合により、開発者は Azure OpenAI の強力なモデルを Weaviate 内で直接利用できます。

その結果、AI 駆動アプリケーションの構築プロセスが簡素化され、開発を加速し、革新的なソリューションの創造に集中できます。

## はじめる

これらの統合を利用するには、有効な Azure OpenAI API キーを Weaviate に提供する必要があります。[Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-foundry/models/openai/) にアクセスして登録し、API キーを取得してください。

その後、該当する統合ページで、Azure OpenAI モデルを Weaviate に設定する方法を確認し、アプリケーションで利用を開始しましょう。

- [テキスト埋め込み](./embeddings.md)
- [生成 AI](./generative.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

