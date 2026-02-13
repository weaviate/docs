---
title: 集計
sidebar_position: 15
description: "Weaviate データセットに対して計算および統計操作を行う集計クエリのドキュメント。"
image: og/docs/api.jpg
# tags: ['graphql', 'aggregate', 'aggregate{}', 'meta']
---

import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';

import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

# 概要

このページでは集計クエリについて説明します。ここではまとめて `Aggregate` クエリと呼びます。

`Aggregate` クエリは、コレクション全体、または [検索結果](#aggregating-a-vector-search--faceted-vector-search) に対して集計を実行できます。


### パラメーター

`Aggregate` クエリでは、対象となるコレクションの指定が必須です。各クエリには以下の種類の引数を含められます。

| 引数 | 説明 | 必須 |
| -------- | ----------- | -------- |
| Collection | 「class」とも呼ばれます。取得対象のオブジェクトコレクション。 | はい |
| Properties | 取得するプロパティ | はい |
| [Conditional filters](./filters.md) | 取得対象オブジェクトをフィルタリング | いいえ |
| [Search operators](./search-operators.md) | 検索戦略を指定（例: near text, hybrid, bm25） | いいえ |
| [Additional operators](./additional-operators.md) | 追加オペレーターを指定（例: limit, offset, sort） | いいえ |
| [Tenant name](#multi-tenancy) | テナント名を指定 | マルチテナンシー有効時は必須（[詳細: マルチテナンシーとは?](../../concepts/data.md#multi-tenancy)） |
| [Consistency level](#consistency-levels) | 整合性レベルを指定 | いいえ |


### 利用可能なプロパティ

データ型ごとに利用可能な集計プロパティが決まっています。以下の表は各データ型で利用できるプロパティを示します。

| データ型 | 利用可能なプロパティ |
| --------- | -------------------- |
| Text | `count`, `type`, `topOccurrences (value, occurs)` |
| Number | `count`, `type`, `minimum`, `maximum`, `mean`, `median`, `mode`, `sum` |
| Integer | `count`, `type`, `minimum`, `maximum`, `mean`, `median`, `mode`, `sum` |
| Boolean | `count`, `type`, `totalTrue`, `totalFalse`, `percentageTrue`, `percentageFalse` |
| Date | `count`, `type`, `minimum`, `maximum`, `mean`, `median`, `mode` |


<details>
  <summary>GraphQL Aggregate フォーマットを見る</summary>

```graphql
{
  Aggregate {
    <Class> (groupBy:[<property>]) {
      groupedBy { # requires `groupBy` filter
          path
          value
      }
      meta {
        count
      }
      <propertyOfDatatypeText> {
          count
          type
          topOccurrences (limit: <n_minimum_count>) {
              value
              occurs
          }
      }
      <propertyOfDatatypeNumberOrInteger> {
          count
          type
          minimum
          maximum
          mean
          median
          mode
          sum
      }
      <propertyOfDatatypeBoolean> {
          count
          type
          totalTrue
          totalFalse
          percentageTrue
          percentageFalse
      }
      <propertyWithReference>
        pointingTo
        type
    }
  }
}
```

</details>

以下は `Article` コレクションのメタ情報を取得する例です。ここではデータのグループ化は行っておらず、結果は `Article` コレクション内のすべてのデータオブジェクトに関係します。

import GraphQLAggregateSimple from '/_includes/code/graphql.aggregate.simple.mdx';

<GraphQLAggregateSimple/>

上記クエリは次のような結果を返します。

```json
{
  "data": {
    "Aggregate": {
      "Article": [
        {
          "inPublication": {
            "pointingTo": [
              "Publication"
            ],
            "type": "cref"
          },
          "meta": {
            "count": 4403
          },
          "wordCount": {
            "count": 4403,
            "maximum": 16852,
            "mean": 966.0113558937088,
            "median": 680,
            "minimum": 109,
            "mode": 575,
            "sum": 4253348,
            "type": "int"
          }
        }
      ]
    }
  }
}
```

import HowToGetObjectCount from '/_includes/how.to.get.object.count.mdx';

:::tip `meta { count }` はクエリオブジェクトの件数を返します
そのため、この `Aggregate` クエリはクラス内のオブジェクト総数を取得します。

<HowToGetObjectCount/>
:::

### `groupBy` 引数

`groupBy` 引数を使用すると、クエリに一致するデータオブジェクトをプロパティに基づいてグループ化し、そのメタ情報を取得できます。

import GroupbyLimitations from '/_includes/groupby-limitations.mdx';

<GroupbyLimitations />

`Aggregate` 関数における `groupBy` 引数の構成は次のとおりです。

```graphql
{
  Aggregate {
    <Class> ( groupBy: ["<propertyName>"] ) {
      groupedBy {
          path
          value
      }
      meta {
        count
      }
      <propertyName> {
        count
      }
    }
  }
}
```

次の例では、記事を発行元を表す `inPublication` プロパティでグループ化しています。

import GraphQLAggGroupby from '/_includes/code/graphql.aggregate.groupby.mdx';

<GraphQLAggGroupby/>

<details>
  <summary>想定されるレスポンス</summary>

```json
{
  "data": {
    "Aggregate": {
      "Article": [
        {
          "groupedBy": {
            "path": [
              "inPublication"
            ],
            "value": "weaviate://localhost/Publication/16476dca-59ce-395e-b896-050080120cd4"
          },
          "meta": {
            "count": 829
          },
          "wordCount": {
            "mean": 604.6537997587454
          }
        },
        {
          "groupedBy": {
            "path": [
              "inPublication"
            ],
            "value": "weaviate://localhost/Publication/c9a0e53b-93fe-38df-a6ea-4c8ff4501783"
          },
          "meta": {
            "count": 618
          },
          "wordCount": {
            "mean": 917.1860841423949
          }
        },
        ...
      ]
    }
  }
}
```

</details>

### 追加フィルター

`Aggregate` 関数は条件フィルターで拡張できます。[詳細はこちら](filters.md)。

### `topOccurrences` プロパティ

集計時には `topOccurrences` プロパティが利用可能です。カウントはトークナイゼーションには依存せず、プロパティ全体、または配列の場合はその値ごとの出現回数を基に計算されます。

`limit` パラメーターを指定して返却件数を制限できます。例: `limit: 5` で最も頻度の高い上位 5 件を返します。

### 整合性レベル

:::info `Aggregate` では利用できません
`Aggregate` クエリでは現在、異なる整合性レベルは利用できません。
:::

### マルチテナンシー

:::info `v1.20` で追加
:::

マルチテナンシーが設定されている場合、`Aggregate` 関数は特定テナントの結果を集計できます。

クエリ内、またはクライアントで `tenant` パラメーターを指定してください。

```graphql
{
  Aggregate {
    Article (
      tenant: "tenantA"
    ) {
      meta {
        count
      }
    }
  }
}
```

:::tip HOW-TO ガイドを見る
マルチテナンシーの使用方法については、[マルチテナンシー操作ガイド](../../manage-collections/multi-tenancy.mdx) を参照してください。
:::



## ベクトル検索の集約 / ファセット ベクトル検索

:::note
この機能は `v1.13.0` で追加されました
:::

ベクトル検索（例: `nearObject`、`nearVector`、`nearText`、`nearImage` など）と集約を組み合わせることができます。内部的には 2 段階のプロセスで、まずベクトル検索で目的のオブジェクトを取得し、その結果を集約します。

### 検索空間の制限

ベクトル検索はオブジェクトを類似度でランク付けしますが、どのオブジェクトも除外しません。したがって、検索演算子が集約に影響を与えるようにするには、クエリに `objectLimit` か `certainty` のいずれかを設定して検索空間を制限する必要があります:

* `objectLimit`、例: `objectLimit: 100` は、ベクトル検索クエリで取得された最初の 100 件のオブジェクトを集約するように  Weaviate  に指示します。あらかじめ提供したい結果数が分かっている場合、たとえば 100 件のレコメンデーションを生成したいレコメンド シナリオで便利です。

* `certainty`、例: `certainty: 0.7` は、確信度スコアが 0.7 以上のすべてのベクトル検索結果を集約するように  Weaviate  に指示します。このリストには固定長がなく、十分にマッチするオブジェクト数によって変わります。これは EC などのユーザー向け検索シナリオで便利です。ユーザーは「apple iphone」と意味的に類似するすべての検索結果に興味を持ち、その後ファセットを生成したい場合があります。

`objectLimit` と `certainty` のいずれも設定されていない場合、集約クエリは失敗します。

### 例

以下に `nearObject`、`nearVector`、`nearText` の例を示します。任意の `near<Media>` が利用できます。

#### nearObject

import GraphQLAggNearObject from '/_includes/code/graphql.aggregate.nearObject.mdx';

<GraphQLAggNearObject/>

#### nearVector

:::tip プレースホルダー ベクトルの置き換え
このクエリを実行するには、プレースホルダー ベクトルを、オブジェクト ベクトルを生成したのと同じ ベクトライザー から取得した実際のベクトルに置き換えてください。
:::

import GraphQLAggNearVector from '/_includes/code/graphql.aggregate.nearVector.mdx';

<GraphQLAggNearVector/>

#### nearText

:::note
`nearText` を利用するには、`text2vec-*` モジュールが  Weaviate  にインストールされている必要があります。
:::

import GraphQLAggNearText from '/_includes/code/graphql.aggregate.nearText.mdx';

<GraphQLAggNearText/>


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

