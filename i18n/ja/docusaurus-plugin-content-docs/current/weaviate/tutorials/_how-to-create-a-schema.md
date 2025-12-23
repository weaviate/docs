---
title: スキーマの定義方法
sidebar_position: 2
image: og/docs/tutorials.jpg
---

import SkipLink from '/src/components/SkipValidationLink'

このチュートリアルでは、Weaviate でスキーマを作成する例をご紹介します。

最後まで読み終えると、スキーマの作成方法がよく理解でき、その重要性や定義に必要な情報をどこで確認できるかが分かるようになります。

### 要点

- スキーマはコンセプトを定義するクラスとプロパティで構成されます。  
- スキーマ内の語（クラス名とプロパティ名）は `text2vec-contextionary` に含まれている必要があります。  
- スキーマは <SkipLink href="/weaviate/api/rest#tag/schema">RESTful API</SkipLink> を介して変更できます。 Python 、 JavaScript 、 Go の各クライアントも利用可能です。  
- Weaviate ではクラスやプロパティはイミュータブルですが、いつでも拡張できます。  
- [API リファレンスガイド](/weaviate/api/index.mdx) で Concepts、Classes、Properties、dataTypes について学べます。  

## 前提条件

このチュートリアルに進む前に、まず [クイックスタートチュートリアル](docs/weaviate/quickstart/index.md) をお読みいただくことをおすすめします。

このチュートリアルでは `text2vec-contextionary` モジュールを有効にした Weaviate インスタンスが必要です。ここでは `http://localhost:8080` で稼働していると仮定します。

## スキーマとは

import SchemaDef from '/_includes/definition-schema.md';

<SchemaDef/>

スキーマを定義せずにデータのインポートを開始すると、[auto-schema 機能](/weaviate/config-refs/collections.mdx#auto-schema) が起動し、Weaviate が自動的にスキーマを作成します。

状況によってはこれで十分な場合もありますが、多くの場合はスキーマを明示的に定義したいでしょう。手動でスキーマを定義することで、ご自身のデータや要件に最適化されたスキーマを確実に作成できます。

## はじめてのスキーマ作成（ Python クライアントの場合）

たとえば、[ニュース出版物](../more-resources/example-datasets.md) データセット用にスキーマを作成したいとします。このデータセットには Financial Times、New York Times、CNN、Wired などの **出版物** からランダムに抽出したニュース **記事** が含まれています。さらに **著者** と、発行日などのメタデータも保持したいとします。

以下の手順でスキーマを作成し、アップロードします。

**1. JSON 形式の空のスキーマから始める。**

スキーマは JSON 形式で定義します。まずは次のような空のスキーマを用意します:

```json
{
  "classes": []
}
```

**2. クラスとプロパティを定義する。**

このデータセットから Weaviate で取り込みたいクラスは `Publication`、`Article`、`Author` の 3 つだとします。これらの語は *単数形* であることに注意してください（ベストプラクティスとして、各データオブジェクトはこれらのクラスの *1 つ* だからです）。

クラス名は必ず大文字で始めます。プロパティ名は必ず小文字で始めます。複数の単語を連結してクラス名やプロパティ名にする場合は camelCase を用います。スキーマのクラス、プロパティ、データ型についての詳細は[こちら](/weaviate/config-refs/collections.mdx)をご覧ください。

では、`Publication` クラスをプロパティ `name`、`hasArticles`、`headquartersGeoLocation` で定義しましょう。`name` は `Publication` の名称で、型は string です。`hasArticles` は Article オブジェクトへの参照になります。この参照を可能にするため、同じスキーマ内で `Article` クラスも定義する必要があります。`headquartersGeoLocation` は特別なデータ型 `geoCoordinates` です。

なお、`Article` クラスのプロパティ `"title"` はデータ型 `"string"` ですが、`"content"` のデータ型は `"text"` です。`string` と `text` の値は異なる方法でトークン化されます。

```json
{
  "class": "Publication",
  "description": "A publication with an online source",
  "properties": [
    {
      "dataType": [
        "text"
      ],
      "description": "Name of the publication",
      "name": "name"
    },
    {
      "dataType": [
        "Article"
      ],
      "description": "The articles this publication has",
      "name": "hasArticles"
    },
    {
      "dataType": [
          "geoCoordinates"
      ],
      "description": "Geo location of the HQ",
      "name": "headquartersGeoLocation"
    }
  ]
}
```

クラス `Article` と `Author` も同じスキーマに追加すると、次のようなクラス一覧になります:

```json
[{
  "class": "Publication",
  "description": "A publication with an online source",
  "properties": [
    {
      "dataType": [
        "text"
      ],
      "description": "Name of the publication",
      "name": "name"
    },
    {
      "dataType": [
        "Article"
      ],
      "description": "The articles this publication has",
      "name": "hasArticles"
    },
    {
      "dataType": [
          "geoCoordinates"
      ],
      "description": "Geo location of the HQ",
      "name": "headquartersGeoLocation"
    }
  ]
}, {
  "class": "Article",
  "description": "A written text, for example a news article or blog post",
  "properties": [
    {
      "dataType": [
        "text"
      ],
      "description": "Title of the article",
      "name": "title"
    },
    {
      "dataType": [
        "text"
      ],
      "description": "The content of the article",
      "name": "content"
    }
  ]
}, {
  "class": "Author",
  "description": "The writer of an article",
  "properties": [
      {
        "dataType": [
            "text"
        ],
        "description": "Name of the author",
        "name": "name"
      },
      {
        "dataType": [
            "Article"
        ],
        "description": "Articles this author wrote",
        "name": "wroteArticles"
      },
      {
        "dataType": [
            "Publication"
        ],
        "description": "The publication this author writes for",
        "name": "writesFor"
      }
  ]
}]
```

次に、このクラス一覧をスキーマに追加すると、スキーマは次のようになります:

```json
{
  "classes": [{
    "class": "Publication",
    "description": "A publication with an online source",
    "properties": [
      {
        "dataType": [
          "text"
        ],
        "description": "Name of the publication",
        "name": "name"
      },
      {
        "dataType": [
          "Article"
        ],
        "description": "The articles this publication has",
        "name": "hasArticles"
      },
      {
        "dataType": [
            "geoCoordinates"
        ],
        "description": "Geo location of the HQ",
        "name": "headquartersGeoLocation"
      }
    ]
  }, {
    "class": "Article",
    "description": "A written text, for example a news article or blog post",
    "properties": [
      {
        "dataType": [
          "text"
        ],
        "description": "Title of the article",
        "name": "title"
      },
      {
        "dataType": [
          "text"
        ],
        "description": "The content of the article",
        "name": "content"
      }
    ]
  }, {
    "class": "Author",
    "description": "The writer of an article",
    "properties": [
      {
        "dataType": [
            "text"
        ],
        "description": "Name of the author",
        "name": "name"
      },
      {
        "dataType": [
            "Article"
        ],
        "description": "Articles this author wrote",
        "name": "wroteArticles"
      },
      {
        "dataType": [
            "Publication"
        ],
        "description": "The publication this author writes for",
        "name": "writesFor"
      }
    ]
  }]
}
```

**3. Python クライアントでスキーマを Weaviate にアップロードする。**

import HowtoSchemaCreatePython from '/_includes/code/howto.schema.create.python/index.mdx';

<HowtoSchemaCreatePython/>

## はじめてのスキーマ作成（ RESTful API 、 Python または JavaScript ）

現在、スキーマ全体を一度にアップロードできるのは Python クライアントのみです。Python を使用しない場合は、クラスを 1 つずつ Weaviate にアップロードする必要があります。前述のスキーマは次の手順でアップロードできます:

**1. 参照なしでクラスを作成する。**

他のクラスへの参照は、そのクラスがすでに Weaviate スキーマに存在している場合にのみ追加できます。そのため、まずは参照を含まないすべてのプロパティを持つクラスを作成し、ステップ 2 で参照を追加します。

`hasArticles` プロパティを含まない `Publication` クラスを作成し、次のように稼働中の Weaviate インスタンスに追加します:

import HowtoSchemaCreate from '/_includes/code/howto.schema.create.mdx';

<HowtoSchemaCreate/>

`Article` クラスと `Author` クラスについても同様のリクエストを実行してください。

**2. 既存クラスに参照プロパティを追加する。**

現在 Weaviate スキーマには 3 つのクラスがありますが、まだクロスリファレンスで相互にリンクされていません。`Publication` と `Articles` を結ぶ参照 `hasArticles` を次のように追加します:

import HowtoSchemaPropertyAdd from '/_includes/code/howto.schema.property.add.mdx';

<HowtoSchemaPropertyAdd/>

同様に、`Author` クラスの `wroteArticles` プロパティで `Articles` を、`writesFor` プロパティで `Publication` を参照するように設定してください。

## 次のステップ

<!-- - Go to the [next "How-to" guide]  (./how-to-import-data.md) to learn how to import data. -->
- すべてのスキーマ API 操作の概要については <SkipLink href="/weaviate/api/rest#tag/schema">RESTful API リファレンス</SkipLink> をご覧ください。  
- [Weaviate とスキーマ作成](https://hackernoon.com/what-is-weaviate-and-how-to-create-data-schemas-in-it-7hy3460) に関するこの記事もぜひお読みください。  

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>