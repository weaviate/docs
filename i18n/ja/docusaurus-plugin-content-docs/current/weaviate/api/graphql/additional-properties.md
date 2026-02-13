---
title: 追加プロパティ（メタデータ）
sidebar_position: 45
description: "クエリ結果に追加のコンテキストを付与するためのメタデータおよび追加プロパティへアクセスする GraphQL API ガイド。"
image: og/docs/api.jpg
---

import SkipLink from '/src/components/SkipValidationLink'
import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

クエリでは、いわゆる「追加プロパティ」（メタデータ）を取得できます。

### 利用可能な追加プロパティ

`id`、`vector`、`certainty`、`distance`、`featureProjection`、`classification` フィールドはデフォルトで利用できます。

クエリの種類や有効化されている Weaviate モジュールに応じて、さらに追加プロパティが利用できる場合があります。

クロスリファレンスされたオブジェクトから取得できるのは `id` のみである点にご注意ください。

### 追加プロパティを要求する

GraphQL クエリでは、取得したいすべての追加プロパティを予約済みプロパティ `_additional{}` で指定できます。

クライアントライブラリごとに指定方法が異なる場合があります。以下の例をご参照ください。

### 使用例

ここでは [UUID](#id) と [distance](#distance) を取得するクエリ例を示します。

import GraphQLUnderscoreDistance from '/_includes/code/graphql.underscoreproperties.distance.mdx';

<GraphQLUnderscoreDistance/>

<details>
  <summary>期待されるレスポンス</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "distance": 0.15422738,
            "id": "e76ec9ae-1b84-3995-939a-1365b2215312"
          },
          "title": "How to Dress Up For an Untraditional Holiday Season"
        },
        {
          "_additional": {
            "distance": 0.15683109,
            "id": "a2d51619-dd22-337a-8950-e1a407dab3d2"
          },
          "title": "2020's biggest fashion trends reflect a world in crisis"
        },
        ...
      ]
    }
  }
}
```

</details>

## 追加プロパティ

### id

オブジェクトの [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) を取得するには `id` フィールドを使用します。

### vector

データオブジェクトの ベクトル 埋め込みを取得するには `vector` フィールドを使用します。

### generate

:::info [生成モデル統合](../../model-providers/index.md) が必要です
:::

`generate` フィールドを使用すると、[検索拡張生成](../../search/generative.md) を実行できます。

`generate` クエリを実行すると、`singleResult`、`groupedResult`、`error` などの追加結果フィールドが利用可能になります。

例については、[関連の How-to ページ](../../search/generative.md) をご覧ください。

### rerank

:::info [リランカー統合](../../model-providers/index.md) が必要です
:::

`rerank` フィールドは [検索結果を再順位付け](../../search/rerank.md) するために使用できます。受け取れるパラメータは 2 つです:

| パラメータ | 必須 | 型 | 説明 |
|------------|------|----|------|
| `property` | yes  | `string` | リランカーに渡すプロパティを指定します。たとえば Products コレクションで類似検索を行い、その後 Name フィールドだけでリランクしたい場合などに利用します。 |
| `query`    | no   | `string` | 別のクエリを任意で指定できます。 |

`rerank` クエリを実行すると、追加の `score` フィールドが利用可能になります。

例については、[関連の How-to ページ](../../search/rerank.md) をご覧ください。

### creationTimeUnix

データオブジェクトの作成タイムスタンプを取得するには `creationTimeUnix` フィールドを使用します。

### lastUpdateTimeUnix

データオブジェクトの最終更新タイムスタンプを取得するには `lastUpdateTimeUnix` フィールドを使用します。

### ベクトル検索メタデータ

検索クエリ ベクトル と各検索結果との類似度メトリックを取得するには、`distance` または `certainty` フィールドを使用します。

#### Distance

:::info Added in `v1.14.0`
:::

`Distance` は ベクトル 検索で計算された生の距離であり、使用している距離メトリックと同じ単位で表示されます。

[距離メトリックと想定される距離範囲](../../config-refs/distances.md#available-distance-metrics) の詳細な概要をご覧ください。

距離の値が小さいほど、2 つのベクトルが互いに近いことを示します。

#### Certainty（コサイン距離のみ）

`Certainty` は 0 から 1 の間の値を返す経験的な指標です。そのため `cosine` のような固定範囲の距離メトリックでのみ利用できます。

### キーワード検索メタデータ

キーワード（BM25）検索の各結果に対するスコアおよびその説明を取得するには、`score` と `explainScore` フィールドを使用します。

#### Score

`score` は結果の BM25F スコアです。このスコアはデータセットおよびクエリに依存する相対値である点にご注意ください。

#### ExplainScore

`explainScore` は結果の BM25F スコアを構成要素ごとに分解して説明します。これにより、結果がそのスコアになった理由を理解できます。

### ハイブリッド検索メタデータ

ハイブリッド検索の各結果について、そのスコアとスコアリング理由を取得するには、 `score` フィールドと `explainScore` フィールドを使用します。

#### スコア

`score` は、指定された [融合アルゴリズム](./search-operators.md#fusion-algorithms) に基づくハイブリッドスコアです。この値はデータセットとクエリに対して相対的なものです。

#### ExplainScore

`explainScore` は、結果のハイブリッドスコアをベクトル検索成分とキーワード検索成分に分解したものです。これにより、特定のスコアが付いた理由を理解できます。


### 分類

データオブジェクトが <SkipLink href="/weaviate/api/rest#tag/classifications">分類の対象になった</SkipLink> 場合、次のコマンドを実行するとオブジェクトがどのように分類されたかの追加情報を取得できます。

import GraphQLUnderscoreClassification from '/_includes/code/graphql.underscoreproperties.classification.mdx';

<GraphQLUnderscoreClassification/>

### 特徴射影

特徴射影 (feature projection) を使用すると、結果のベクトルを 2d または 3d に次元削減し、可視化しやすくできます。現在は [t-SNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding) が使用されています。

特徴射影の詳細設定を行うために、オプションパラメーター（現在は GraphQL のみ対応）を指定できます。各パラメーターとそのデフォルト値は次のとおりです。

| Parameter | Type | Default | Implication |
|--|--|--|--|
| `dimensions` | `int` | `2` | 目標次元数。通常は `2` または `3` |
| `algorithm` | `string` | `tsne` | 使用するアルゴリズム。現在サポートされているのは `tsne` |
| `perplexity` | `int` | `min(5, len(results)-1)` | `t-SNE` のパープレキシティ値。可視化対象の件数 `n` に対して `n-1` 未満である必要があります |
| `learningRate` | `int` | `25` | `t-SNE` の学習率 |
| `iterations` | `int` | `100` | `t-SNE` アルゴリズムを実行する反復回数。値を大きくすると結果が安定しますが、応答時間が長くなります |

デフォルト設定を使用した例:

import GraphQLUnderscoreFeature from '/_includes/code/graphql.underscoreproperties.featureprojection.mdx';

<GraphQLUnderscoreFeature/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "featureProjection": {
              "vector": [
                -115.17981,
                -16.873344
              ]
            }
          },
          "title": "Opinion | John Lennon Told Them \u2018Girls Don\u2019t Play Guitar.\u2019 He Was So Wrong."
        },
        {
          "_additional": {
            "featureProjection": {
              "vector": [
                -117.78348,
                -21.845968
              ]
            }
          },
          "title": "Opinion | John Lennon Told Them \u2018Girls Don\u2019t Play Guitar.\u2019 He Was So Wrong."
        },
        ...
      ]
    }
  }
}
```

</details>

上記の結果は次のようにプロットできます（赤色が最初の結果）。

![Weaviate T-SNE example](./img/plot-noSettings.png?i=1 "Weaviate T-SNE example")

#### ベストプラクティスおよび注意事項
* `t-SNE` アルゴリズムは O(n^2) の計算量を持つため、リクエストサイズは 100 項目以下に抑えることを推奨します。
* `t-SNE` は非決定的かつ損失を伴い、クエリごとにリアルタイムで実行されます。そのため、返される次元はクエリ間で意味を持ちません。
* コストの高いアルゴリズムであるため、応答時間が重要な高負荷状況では `featureProjection` を含むリクエストの数を制限してください。 `featureProjection` を含む並列リクエストは避け、他の時間的制約があるリクエストを処理するスレッドを確保しましょう。


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

