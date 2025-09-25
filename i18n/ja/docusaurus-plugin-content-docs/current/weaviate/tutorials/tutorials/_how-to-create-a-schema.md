---
title: スキーマを定義する方法
sidebar_position: 2
image: og/docs/tutorials.jpg
---

import SkipLink from '/src/components/SkipValidationLink'

本チュートリアルでは、 Weaviate でスキーマを作成する方法の一例を示します。

チュートリアル終了時には、スキーマをどのように作成するかを理解し、その重要性やスキーマ定義に必要な情報をどこで確認できるかがわかるようになります。

### Key points

- スキーマはコンセプトを定義するクラスとプロパティで構成されます。  
- スキーマ内の単語（クラス名およびプロパティ名）は `text2vec-contextionary` に含まれている必要があります。  
- スキーマは <SkipLink href="/weaviate/api/rest#tag/schema">RESTful API</SkipLink> を通じて変更できます。 Python、JavaScript、Go のクライアントも利用可能です。  
- Weaviate のクラスまたはプロパティは不変ですが、常に拡張することは可能です。  
- コンセプト、クラス、プロパティ、 dataType については [API リファレンスガイド](/weaviate/api/index.mdx) を参照してください。  

## Prerequisites

本チュートリアルに進む前に、まずは [クイックスタートチュートリアル](docs/weaviate/quickstart/index.md) をお読みいただくことをおすすめします。

このチュートリアルを実行するには、 `text2vec-contextionary` モジュールが有効な Weaviate インスタンスが必要です。ここでは、 `http://localhost:8080` で実行されていると仮定します。

## スキーマとは？

import SchemaDef from '/_includes/definition-schema.md';

<SchemaDef/>

スキーマを定義せずにデータのインポートを開始すると、[自動スキーマ機能](/weaviate/config-refs/collections.mdx#auto-schema) が作動し、 Weaviate がスキーマを自動生成します。

これは状況によっては便利ですが、多くの場合はスキーマを明示的に定義したいこともあります。手動でスキーマを定義することで、ご自身のデータやニーズに適したスキーマを確実に設計できます。

## 初めてのスキーマ作成（ Python クライアント）

[ニュース出版物](../more-resources/example-datasets.md)のデータセット用にスキーマを作成したいとします。このデータセットは Financial Times、New York Times、CNN、Wired などの **出版物** に掲載されたランダムなニュース **記事** で構成されています。さらに **著者** も取り込み、発行日などのメタデータも保存したいと考えます。

以下の手順でスキーマを作成し、アップロードします。

**1. JSON 形式の空のスキーマから始める**

スキーマは JSON 形式で定義します。まずは空のスキーマを用意します。

```json
{
  "classes": []
}
```

**2. クラスとプロパティを定義する**

このデータセットから Weaviate に取り込みたいクラスは `Publication`、`Article`、`Author` の 3 つとしましょう。これらの単語は *単数形* である点に注目してください（ベストプラクティスとして、各データオブジェクトはこれらクラスの *1 つ* だからです）。

クラス名は必ず大文字で始めます。プロパティ名は小文字で始めます。複数の単語を連結してクラス名やプロパティ名にする場合は、camelCase を用います。スキーマのクラス、プロパティ、dataType については [こちら](/weaviate/config-refs/collections.mdx) を参照してください。

クラス `Publication` を、プロパティ `name`、`hasArticles`、`headquartersGeoLocation` と共に JSON で定義します。`name` は `Publication` の名称を表す文字列です。`hasArticles` は Article オブジェクトへの参照です。この参照を有効にするため、同じスキーマ内にクラス `Article` も定義する必要があります。`headquartersGeoLocation` は特殊な dataType である `geoCoordinates` を使用します。

クラス `"Article"` のプロパティ `"title"` は dataType が `"string"`、一方 `"content"` は `"text"` です。`string` 型と `text` 型ではトークン化方法が異なります。

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

同じスキーマにクラス `Article` と `Author` も追加し、最終的に次のようなクラス構成になります。

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

次に、このクラス一覧をスキーマに追加すると、スキーマ全体は次のようになります。

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

**3. Python クライアントでスキーマを Weaviate にアップロードする**

import HowtoSchemaCreatePython from '/_includes/code/howto.schema.create.python/index.mdx';

<HowtoSchemaCreatePython/>

## 初めてのスキーマ作成（ RESTful API、Python、JavaScript）

現在、スキーマ全体を一括でアップロードできるのは Python クライアントのみです。Python を使用しない場合は、クラスを 1 つずつ Weaviate にアップロードする必要があります。前述のスキーマは、次の手順でアップロードできます。

**1. 参照を含まないクラスを作成する**

   他のクラスへの参照プロパティは、参照先のクラスがスキーマ内に存在している必要があります。そのため、まずは参照を除いたすべてのプロパティを持つクラスを作成し、ステップ 2 で参照を追加します。

   参照プロパティ `hasArticles` を除いた `Publication` クラスを作成し、実行中の Weaviate インスタンスに次のように追加します。

import HowtoSchemaCreate from '/_includes/code/howto.schema.create.mdx';

<HowtoSchemaCreate/>

   `Article` および `Author` クラスでも同様のリクエストを行ってください。

**2. 既存クラスに参照プロパティを追加する**

   これで Weaviate スキーマには 3 つのクラスが存在しますが、相互参照はまだ設定されていません。`Publication` と `Article` の間を `hasArticles` プロパティでリンクします。

import HowtoSchemaPropertyAdd from '/_includes/code/howto.schema.property.add.mdx';

<HowtoSchemaPropertyAdd/>

   `Author` クラスの `wroteArticles` と `writesFor` も同様に、`Article` と `Publication` へ参照するよう追加してください。

## Next steps

<!-- - Go to the [next "How-to" guide]  (./how-to-import-data.md) to learn how to import data. -->
- <SkipLink href="/weaviate/api/rest#tag/schema">RESTful API リファレンス</SkipLink> でスキーマ API の操作一覧を確認してください。  
- [Weaviate とスキーマ作成](https://hackernoon.com/what-is-weaviate-and-how-to-create-data-schemas-in-it-7hy3460) に関する記事もぜひご覧ください。  

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>