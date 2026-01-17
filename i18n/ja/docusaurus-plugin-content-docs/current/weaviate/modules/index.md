---
title: リファレンス - モジュール
description:  Weaviate のモジュールについて学び、機能を拡張しましょう。
sidebar_position: 0
image: og/docs/modules/_title.jpg
# tags: ['modules']
---

このセクションでは、 Weaviate の個別モジュールの機能と使用方法について説明します。

:::tip ベクトライザー、生成 AI、またはリランカーの連携ドキュメントをお探しですか？
それらは、よりユーザー中心の内容となる [モデルプロバイダー連携](../model-providers/index.md) セクションへ移動しました。
:::

## 一般

 Weaviate のモジュールはコードベースに組み込まれており、[環境変数で有効化](../configuration/modules.md) して追加機能を提供します。

### モジュールの種類

 Weaviate のモジュールは、次のカテゴリに分類できます。

- [ベクトライザー](#vectorizer-reranker-and-generative-ai-integrations): データをベクトル埋め込みへ変換し、インポートやベクトル検索に利用します。  
- [リランカー](#vectorizer-reranker-and-generative-ai-integrations): 初期検索結果を並べ替えて検索精度を向上させます。  
- [生成 AI](#vectorizer-reranker-and-generative-ai-integrations): 検索拡張生成 (RAG) 用に生成 AI モデルを統合します。  
- [バックアップ](#backup-modules): Weaviate でのバックアップおよびリストア操作を支援します。  
- [オフロード](#offloading-modules): テナントデータを外部ストレージへオフロードします。  
- [その他]: 追加機能を提供するモジュールです。  

#### ベクトライザー、リランカー、および生成 AI 連携

これらのモジュールについては、[モデルプロバイダー連携](../model-providers/index.md) ドキュメントをご覧ください。ページはモデルプロバイダー (例: Hugging Face、OpenAI) 別に、その後モデルタイプ (例: ベクトライザー、リランカー、生成 AI) 別に整理されています。

例：

- [OpenAI 埋め込み連携ページ](../model-providers/openai/embeddings.md) では、 OpenAI の埋め込みモデルを Weaviate で利用する方法を解説しています。

<img
    src={require('../model-providers/_includes/integration_openai_embedding.png').default}
    alt="埋め込み連携のイラスト"
    style={{ maxWidth: "50%", display: "block", marginLeft: "auto", marginRight: "auto"}}
/>
<br/>

- [Cohere リランカー連携ページ](../model-providers/cohere/reranker.md) では、 Cohere のリランカーモデルを Weaviate で利用する方法を解説しています。

<img
    src={require('../model-providers/_includes/integration_cohere_reranker.png').default}
    alt="リランカー連携のイラスト"
    style={{ maxWidth: "50%", display: "block", marginLeft: "auto", marginRight: "auto"}}
/>
<br/>

- [Anthropic 生成 AI 連携ページ](../model-providers/anthropic/generative.md) では、 Anthropic の生成 AI モデルを Weaviate で利用する方法を解説しています。

<img
    src={require('../model-providers/_includes/integration_anthropic_rag.png').default}
    alt="生成 AI 連携のイラスト"
    style={{ maxWidth: "50%", display: "block", marginLeft: "auto", marginRight: "auto"}}
/>
<br/>

### モジュールの特性

- 命名規則  
  - ベクトライザー (Retriever モジュール): `<media>2vec-<name>-<optional>` 例: `text2vec-contextionary`, `img2vec-neural`, `text2vec-transformers`  
  - その他のモジュール: `<functionality>-<name>-<optional>` 例: `qna-transformers`  
  - モジュール名は URL セーフでなければなりません。つまり、 URL エンコードが必要な文字を含めてはいけません。  
  - モジュール名は大文字小文字を区別しません。`text2vec-bert` と `text2vec-BERT` は同一モジュールです。  
- モジュール情報へは `v1/modules/<module-name>/<module-specific-endpoint>` RESTful エンドポイントでアクセスできます。  
- 一般的なモジュール情報 (添付済みモジュール、バージョンなど) には、 Weaviate の [`v1/meta` エンドポイント](/deploy/configuration/meta.md) からアクセスできます。  
- モジュールは RESTful API の `additional` プロパティおよび [GraphQL API の `_additional` プロパティ](../api/graphql/additional-properties.md) を追加できます。  
- モジュールは GraphQL クエリに [フィルター](../api/graphql/filters.md) を追加できます。  
- どのベクトライザーやその他モジュールをどのデータコレクションに適用するかは、[スキーマ](../manage-collections/vector-config.mdx#specify-a-vectorizer) で設定します。  

## バックアップ モジュール

 Weaviate におけるバックアップおよびリストア操作は、バックアッププロバイダーモジュールによって実現されます。

これらは内部または外部のいずれかに存在する交換可能なストレージバックエンドです。

### 外部プロバイダー

外部バックアッププロバイダーは、外部ストレージサービスと連携して Weaviate データのバックアップの保存および取得を行います。

バックアップデータを Weaviate インスタンスの外部に保存することで、バックアップの可用性がインスタンス自身から切り離されるため、本番環境に最適です。ノードが到達不能になった場合でもバックアップは利用可能です。

さらに、マルチノードの Weaviate クラスターでは外部プロバイダーの使用が _必須_ です。マルチノードバックアップを単一ノードの内部に保存すると、耐久性と可用性が大幅に低下するなどの問題があるためサポートされていません。

サポートされている外部バックアッププロバイダーは次のとおりです。  
- [S3](/deploy/configuration/backups.md#s3-aws-or-s3-compatible)  
- [GCS](/deploy/configuration/backups.md#gcs-google-cloud-storage)  
- [Azure](/deploy/configuration/backups.md#azure-storage)  

モジュールシステムの拡張性により、新しいプロバイダーも容易に追加できます。上記以外の外部プロバイダーにご興味がある場合は、ぜひ [フォーラム](https://forum.weaviate.io/) でご相談いただくか、[GitHub](https://github.com/weaviate/weaviate) に issue をお寄せください。

### 内部プロバイダー

内部プロバイダーは、 Weaviate インスタンス内でバックアップデータの保存および取得を行います。このタイプは開発や実験用途向けであり、本番環境での使用は推奨されません。内部プロバイダーはマルチノードバックアップには対応しておらず、マルチノード環境では外部プロバイダーが必要です。

 Weaviate `v1.16` 現在、サポートされている内部バックアッププロバイダーは [filesystem](/deploy/configuration/backups.md#filesystem) のみです。

## オフロード モジュール

:::info `v1.26` で追加
:::

オフロードモジュールは、テナントデータを外部ストレージへオフロードする機能を提供します。これにより、リソースとコストの管理が容易になります。

設定方法の詳細は [設定方法: オフロード](/deploy/configuration/tenant-offloading.md) をご覧ください。

## その他のモジュール

上記に加えて、次のようなモジュールがあります。

- [qna-transformers](./qna-transformers.md): transformers モデルを使用した質問応答 (回答抽出) 機能  
- [qna-openai](./qna-openai.md): OpenAI モデルを使用した質問応答 (回答抽出) 機能  
- [ner-transformers](./ner-transformers.md): transformers モデルを使用した固有表現抽出機能  
- [text-spellcheck](./ner-transformers.md): GraphQL クエリのスペルチェック機能  
- [sum-transformers](./sum-transformers.md): transformer モデルを使用してテキストを要約  
- [usage-modules](./usage-modules.md): 請求用途の使用状況分析を収集し、 GCS または S3 にアップロード

## 関連ページ

- [設定：モジュール](../configuration/modules.md)
- [概念：モジュール](../concepts/modules.md)

## その他のサードパーティ統合

import IntegrationLinkBack from '/_includes/integrations/link-back.mdx';

<IntegrationLinkBack/>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

