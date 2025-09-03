---
title: データをインポートする方法
sidebar_position: 3
image: og/docs/tutorials.jpg
# tags: ['how to', 'import']
---

このチュートリアルでは、バッチインポート方式を使用して Weaviate にデータをインポートする方法を学習します。

チュートリアル終了時には、データをインポートする手順と、バッチインポート方式を使用すべきタイミングを把握できるようになります。

<!-- :::caution Under construction.
Migrated from "How to import data" tutorial from Weaviate Docs Classic
::: -->

# 導入

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

まずは [クイックスタートチュートリアル](docs/weaviate/quickstart/index.md) をご覧いただくことをおすすめします。

1. **Weaviate インスタンスに接続する。**  
   このチュートリアルでは、`text2vec-contextionary` モジュールが動作する Weaviate インスタンスが必要です。ここでは `http://localhost:8080` で動作していると想定します。  
2. **スキーマをアップロードする。**  
   スキーマの作成とアップロード方法は [こちら](./how-to-create-a-schema.md) をご覧ください。本ガイドでは `Publication`、`Article`、`Author` クラスを含む類似のスキーマがアップロード済みであると仮定します。

# データオブジェクトの追加

`New York Times` という名前の `Publication` を Weaviate インスタンスに追加してみましょう。データオブジェクトを追加する際、すべてのプロパティを入力する必要はありません。`Article` オブジェクトがまだないので、`hasArticles` プロパティは今回は省略します。なお、`UUID` は `id` パラメーターに指定していますが、省略可能です。

import CodeAddData from '/_includes/code/howto.add.data.things.mdx';

<CodeAddData />

# 参照付きデータオブジェクトの追加

プロパティに参照を含むデータオブジェクトを追加する場合、参照先データオブジェクトの `UUID` を使用する必要があります。`New York Times` に記事を書く `Author`、`Jodi Kantor` を追加してみましょう。

import CodeAddRef from '/_includes/code/howto.add.data.things.reference.mdx';

<CodeAddRef />

データオブジェクト作成後に参照を追加することもできます。次の例では、まず `Author` を `name` のみで作成し、後から `Publication` への参照を追加しています。先にデータオブジェクトを作成してから参照を追加したい場合に便利です。

import CodeAddRefLater from '/_includes/code/howto.add.data.things.add.reference.mdx';

<CodeAddRefLater />

# 次のステップ

<!-- TODO: point it towards search or the relevant content -->
<!-- - Take a look at [How to query data](./how-to-query-data) to learn how to interact with the data you just added. -->

- データの追加・変更・削除に関するすべての API 操作は、RESTful [API リファレンス](/weaviate/api/rest) をご覧ください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>