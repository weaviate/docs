---
title: モジュール
sidebar_position: 15
description: "特化したアドオンコンポーネントで Weaviate の機能を拡張するためのモジュラーアーキテクチャの概要。"
image: og/docs/concepts.jpg
# tags: ['modules']
---
<!-- :::caution Migrated From:
- Combines theoretical explanations from `Configuration/Modules` + `Modules/Index`. e.g.:
  - `Introduction` is from `Configuration/Modules`
  - `Vectorization modules (Dense Retriever modules)` is from `Modules/Index`
::: -->

 Weaviate にはモジュール化された構造があります。ベクトル化やバックアップなどの機能は、*オプション* のモジュールによって処理されます。

モジュールを一切付与しない  Weaviate  のコアは、純粋なベクトルネイティブデータベースです。
[![Weaviate モジュールの紹介](./img/weaviate-module-diagram.svg "Weaviate モジュール図")](./img/weaviate-module-diagram.svg)

データはオブジェクトとそのベクトルの組み合わせとして  Weaviate  に保存され、これらのベクトルは提供された [ベクトルインデックスアルゴリズム](../concepts/indexing/vector-index.md) によって検索可能です。ベクトライザーモジュールが付与されていない場合、 Weaviate  はオブジェクトを *vectorize* する、すなわちオブジェクトからベクトルを計算する方法を知りません。

保存・検索したいデータの種類（テキスト、画像など）やユースケース（検索、質問応答など）、言語、分類、ML モデル、学習データセットなどに応じて、最適なベクトライザーモジュールを選択して付与できます。または、自前のベクトルを  Weaviate  に持ち込むことも可能です。

このページでは、モジュールとは何か、そして Weaviate でどのような役割を果たすのかを説明します。


## 利用可能なモジュールタイプ

次の図は、最新の  Weaviate  バージョン (||site.weaviate_version||) で利用できるモジュールを示しています。モジュールは以下のカテゴリに分かれます。

- ベクトル化モジュール
- ベクトル化と追加機能を備えたモジュール
- その他のモジュール

![Weaviate module ecosystem](./img/weaviate-modules.png "Weaviate module ecosystem")

### ベクトライザー & ランカーモジュール

`text2vec-*`、`multi2vec-*`、`img2vec-*` などのベクトライザーモジュールはデータをベクトルへ変換します。`rerank-*` などのランカーモジュールは、検索結果をランク付けします。

### リーダー & ジェネレーターモジュール

リーダーまたはジェネレーターモジュールは、ベクトライザーモジュールの上に重ねて使用できます。これらのモジュールは取得した関連ドキュメント集合に対してさらなる処理を行い、質問応答や生成タスクなどを実行します。例としては、ドキュメントから直接回答を抽出する [`qna-transformers`](../modules/qna-transformers.md) モジュールがあります。ジェネレーターモジュールは、言語生成を用いて与えられたドキュメントから回答を生成します。

### その他のモジュール

`gcs-backup` や `text-spellcheck` などが該当します。

## 依存関係

モジュールは他のモジュールへの依存関係を持つ場合があります。たとえば、[`qna-transformers`](../modules/qna-transformers.md) モジュールを使用するには、*正確に 1 つ* のテキストベクトル化モジュールが必要です。

## モジュールを使用しない Weaviate

 Weaviate  は、モジュールなしでも純粋なベクトルネイティブデータベース兼検索エンジンとして利用できます。モジュールを含めない場合は、各データエントリーに対してベクトルを入力する必要があります。その後、ベクトル検索によってオブジェクトを検索できます。

## カスタムモジュール

誰でも  Weaviate  で使用できるカスタムモジュールを作成可能です。作成方法と利用方法は [こちら](../modules/custom-modules.md) をご覧ください。

## さらなるリソース

:::info Related pages
- [設定: モジュール](../configuration/modules.md)
- [リファレンス: モジュール](../modules/index.md)
:::

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>