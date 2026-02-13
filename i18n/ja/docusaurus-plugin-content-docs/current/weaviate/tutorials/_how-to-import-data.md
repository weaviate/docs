---
title: データをインポートする方法
sidebar_position: 3
image: og/docs/tutorials.jpg
# tags: ['how to', 'import']
---

このチュートリアルでは、バッチ インポート方法を使用して Weaviate にデータをインポートする方法を学びます。

チュートリアルの最後には、データをインポートする手順と、バッチ インポート方法を使用するタイミングについて理解できるようになります。

<!-- :::caution Under construction.
Migrated from "How to import data" tutorial from Weaviate Docs Classic
::: -->


# 概要

データは RESTful API を通じて追加します。データオブジェクトの構文は次のとおりです。

```json
{
  "class": "<class name>",  // as defined during schema creation
  "id": "<UUID>",     // optional, must be in UUID format.
  "properties": {
    "<property name>": "<property value>", // specified in dataType defined during schema creation
  }
}
```

# 前提条件

まずは [Quickstart チュートリアル](docs/weaviate/quickstart/index.md) をお読みいただくことをおすすめします。

1. **Weaviate インスタンスへの接続**  
   このチュートリアルを実行するには、`text2vec-contextionary` モジュールが動作している Weaviate インスタンスが必要です。ここでは、`http://localhost:8080` でインスタンスが稼働していると想定します。  
2. **スキーマのアップロード**  
   スキーマの作成とアップロード方法は [こちら](./how-to-create-a-schema.md) をご覧ください。本ガイドでは、`Publication`、`Article`、`Author` のクラスを含む類似のスキーマがすでにアップロードされていることを前提とします。

# データオブジェクトの追加

`Publication` クラスに `New York Times` という名前のデータオブジェクトを追加してみましょう。データオブジェクトを追加する際、すべてのプロパティを設定する必要はありません。`Article` オブジェクトがまだないため、ここでは `hasArticles` プロパティは省略します。`UUID` を `id` パラメーターで指定していますが、これは任意です。

import CodeAddData from '/_includes/code/howto.add.data.things.mdx';

<CodeAddData />

# 参照付きデータオブジェクトの追加

プロパティに参照を含むデータオブジェクトを追加する場合は、参照先データオブジェクトの `UUID` を使用する必要があります。`New York Times` に記事を書く `Author` クラスの `Jodi Kantor` を追加してみましょう。

import CodeAddRef from '/_includes/code/howto.add.data.things.reference.mdx';

<CodeAddRef />

すでにデータオブジェクトを作成した後で参照を追加することもできます。次の例では、まず `name` だけで `Author` を作成し、その後で `Publication` への参照を追加しています。先にデータオブジェクトを作成し、後から参照を設定したい場合に便利です。

import CodeAddRefLater from '/_includes/code/howto.add.data.things.add.reference.mdx';

<CodeAddRefLater />

# 次のステップ

<!-- TODO: point it towards search or the relevant content -->
<!-- - Take a look at [How to query data](./how-to-query-data) to learn how to interact with the data you just added. -->

- データの追加・変更・削除に関するすべての API 操作については、RESTful [API リファレンス](/weaviate/api/rest) をご覧ください。


## ご質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>