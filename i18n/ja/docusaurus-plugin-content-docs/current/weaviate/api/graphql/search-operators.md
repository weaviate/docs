---
title: 検索オペレーター
sidebar_position: 20
description: "高度なクエリ構築と精密なデータターゲティング手法のための GraphQL 検索オペレーターガイド。"
image: og/docs/api.jpg
# tags: ['graphql', 'search operators']
---


import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

このページでは、クエリで使用できる検索オペレーターについて説明します。ベクトル検索オペレーター（ `nearText` 、 `nearVector` 、 `nearObject` など）、キーワード検索オペレーター（ `bm25` ）、ハイブリッド検索オペレーター（ `hybrid` ）などがあります。

コレクションレベルのクエリには、検索オペレーターを 1 つだけ追加できます。

## オペレーターの利用可否

### 組み込みオペレーター

これらのオペレーターは、設定に関係なくすべての Weaviate インスタンスで利用できます。

* [nearVector](#nearvector)
* [nearObject](#nearobject)
* [hybrid](#hybrid)
* [bm25](#bm25)

### モジュール固有のオペレーター

モジュール固有の検索オペレーターは、特定の Weaviate モジュールを追加することで利用可能になります。

関連するモジュールを追加すると、次のオペレーターを使用できます。  
* [nearText](#neartext)  
* [Multimodal search](#multimodal-search)  
* [ask](#ask)  


## ベクトル検索オペレーター

`nearXXX` オペレーターを使用すると、クエリとのベクトル類似度に基づいてデータオブジェクトを検索できます。クエリには生のベクトル（ `nearVector` ）またはオブジェクトの UUID（ `nearObject` ）を指定できます。

適切な ベクトライザー モデルを有効化している場合、テキストクエリ（ `nearText` ）、画像（ `nearImage` ）、その他のメディア入力をクエリとして使用することもできます。

すべてのベクトル検索オペレーターは、 `certainty` または `distance` の閾値、さらに [`limit` オペレーター](./additional-operators.md#limit-argument) や [`autocut` オペレーター](./additional-operators.md#autocut) と組み合わせて使用し、クエリと結果の類似度または距離を指定できます。


### nearVector

`nearVector` は、入力ベクトルに最も近いデータオブジェクトを検索します。

#### 変数

| 変数 | 必須 | 型 | 説明 |
| --- | --- | --- | --- |
| `vector` | yes | `[float]` | ベクトル埋め込みを `float` の配列として渡します。配列の長さは、このコレクション内のベクトルと同じである必要があります。 |
| `distance` | no | `float` | 指定した検索入力に対して許容される最大距離。 `certainty` 変数と同時には使用できません。距離値の解釈は [使用している距離メトリック](/weaviate/config-refs/distances.md) に依存します。 |
| `certainty` | no | `float` | 結果アイテムと検索ベクトル間の正規化された距離。0（完全に反対）〜 1（同一ベクトル）の範囲に正規化されます。 `distance` 変数と同時には使用できません。 |

#### 例

import GraphQLFiltersNearVector from '/_includes/code/graphql.filters.nearVector.mdx';

<GraphQLFiltersNearVector/>


### nearObject

`nearObject` は、同じコレクション内の既存オブジェクトに最も近いデータオブジェクトを検索します。通常、検索対象のオブジェクトはその UUID で指定します。

* 注: 引数にはオブジェクトの `id` または `beacon` と、必要に応じて `certainty` を指定できます。  
* 注: 検索に使用したオブジェクトは、常に結果の 1 件目として返されます。

#### 変数

| 変数 | 必須 | 型 | 説明 |
| --------- | -------- | ---- | ----------- |
| `id` | yes | `UUID` | UUID 形式のデータオブジェクト識別子。 |
| `beacon` | no | `url` | Beacon URL 形式のデータオブジェクト識別子。例: `weaviate://<hostname>/<kind>/id` |
| `distance` | no | `float` | 指定した検索入力に対して許容される最大距離。 `certainty` 変数と同時には使用できません。距離値の解釈は [使用している距離メトリック](/weaviate/config-refs/distances.md) に依存します。 |
| `certainty` | no | `float` | 結果アイテムと検索ベクトル間の正規化された距離。0（完全に反対）〜 1（同一ベクトル）の範囲に正規化されます。 `distance` 変数と同時には使用できません。 |

#### 例

import GraphQLFiltersNearObject from '/_includes/code/graphql.filters.nearObject.mdx';

<GraphQLFiltersNearObject/>

<details>
  <summary>想定されるレスポンス</summary>

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "_additional": {
            "distance": -1.1920929e-07
          },
          "name": "The New York Times Company"
        },
        {
          "_additional": {
            "distance": 0.059879005
          },
          "name": "New York Times"
        },
        {
          "_additional": {
            "distance": 0.09176409
          },
          "name": "International New York Times"
        },
        {
          "_additional": {
            "distance": 0.13954824
          },
          "name": "New Yorker"
        },
        ...
      ]
    }
  }
}
```

</details>



### nearText

`nearText` オペレーターは、自然言語クエリとのベクトル類似度に基づいてデータオブジェクトを検索します。

このオペレーターは、コレクションに互換性のある ベクトライザー モジュールが設定されている場合に有効になります。互換性のある ベクトライザー モジュールは以下のとおりです。

* 任意の `text2vec` モジュール
* 任意の `multi2vec` モジュール


#### 変数

| 変数 | 必須 | 型 | 説明 |
| --- | --- | --- | --- |
| `concepts` | yes | `[string]` | 自然言語クエリや単語を含む文字列配列。複数の文字列を指定した場合、セントロイドを計算して使用します。コンセプトの解析方法の詳細は [こちら](#concept-parsing) を参照してください。 |
| `distance` | no | `float` | 指定した検索入力に対して許容される最大距離。 `certainty` 変数と同時には使用できません。距離値の解釈は [使用している距離メトリック](/weaviate/config-refs/distances.md) に依存します。 |
| `certainty` | no | `float` | 結果アイテムと検索ベクトル間の正規化された距離。0（完全に反対）〜 1（同一ベクトル）の範囲に正規化されます。 `distance` 変数と同時には使用できません。 |
| `autocorrect` | no | `boolean` | 入力テキストを自動修正します。 [`text-spellcheck` モジュール](../../modules/spellcheck.md) が存在し、かつ有効になっている必要があります。 |
| `moveTo` | no | `object{}` | キーワードで表される別のベクトルに検索語を近づけます。 |
| `moveTo{concepts}` | no | `[string]` | 自然言語クエリや単語を含む文字列配列。複数の文字列を指定した場合、セントロイドを計算して使用します。 |
| `moveTo{objects}` | no | `[UUID]` | 結果を近づけたいオブジェクト ID。NLP 検索結果をベクトル空間上の特定方向にバイアスするために使用します。 |
| `moveTo{force}` | no | `float` | 移動に適用する強さ。0 は移動なし、1 は最大移動量を表します。 |
| `moveAwayFrom` | no | `object{}` | キーワードで表される別のベクトルから検索語を遠ざけます。 |
| `moveAwayFrom{concepts}` | no | `[string]` | 自然言語クエリや単語を含む文字列配列。複数の文字列を指定した場合、セントロイドを計算して使用します。 |
| `moveAwayFrom{objects}` | no | `[UUID]` | 結果を遠ざけたいオブジェクト ID。NLP 検索結果をベクトル空間上の特定方向にバイアスするために使用します。 |
| `moveAwayFrom{force}` | no | `float` | 移動に適用する強さ。0 は移動なし、1 は最大移動量を表します。 |

#### 例 I

この例は `nearText` オペレーターの使用例を示しており、別の検索クエリへ結果をバイアスする方法も含みます。

import GraphQLFiltersNearText from '/_includes/code/graphql.filters.nearText.mdx';

<GraphQLFiltersNearText/>

#### 例 II

結果を他のデータオブジェクトへバイアスすることもできます。たとえばこのクエリでは、「 travelling in asia 」に関するクエリを、フードに関する記事へ寄せています。

import GraphQLFiltersNearText2Obj from '/_includes/code/graphql.filters.nearText.2obj.mdx';

<GraphQLFiltersNearText2Obj/>

<details>
  <summary>期待されるレスポンス</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "certainty": 0.9619976580142975
          },
          "summary": "We've scoured the planet for what we think are 50 of the most delicious foods ever created. A Hong Kong best food, best enjoyed before cholesterol checks. When you have a best food as naturally delicious as these little fellas, keep it simple. Courtesy Matt@PEK/Creative Commons/FlickrThis best food Thai masterpiece teems with shrimp, mushrooms, tomatoes, lemongrass, galangal and kaffir lime leaves. It's a result of being born in a land where the world's most delicious food is sold on nearly every street corner.",
          "title": "World food: 50 best dishes"
        },
        {
          "_additional": {
            "certainty": 0.9297388792037964
          },
          "summary": "The look reflects the elegant ambiance created by interior designer Joyce Wang in Hong Kong, while their mixology program also reflects the original venue. MONO Hong Kong , 5/F, 18 On Lan Street, Central, Hong KongKoral, The Apurva Kempinski Bali, IndonesiaKoral's signature dish: Tomatoes Bedugul. Esterre at Palace Hotel TokyoLegendary French chef Alain Ducasse has a global portfolio of restaurants, many holding Michelin stars. John Anthony/JW Marriott HanoiCantonese cuisine from Hong Kong is again on the menu, this time at the JW Marriott in Hanoi. Stanley takes its name from the elegant Hong Kong waterside district and the design touches reflect this legacy with Chinese antiques.",
          "title": "20 best new Asia-Pacific restaurants to try in 2020"
        }
        ...
      ]
    }
  }
}
```

</details>

#### 追加情報

##### コンセプト解析

`nearText` クエリは、配列入力の各要素を別々の文字列として ベクトル 化します。複数の文字列が渡された場合、クエリ ベクトル は各文字列 ベクトル の平均となります。

- `["New York Times"]` = 単一の ベクトル 位置が語の出現に基づいて決定される  
- `["New", "York", "Times"]` = すべてのコンセプトが同じ重みを持つ  
- `["New York", "Times"]` = 上記 2 つの組み合わせ  

実用例: `concepts: ["beatles", "John Lennon"]`

##### セマンティックパス

* `txt2vec-contextionary` モジュールのみで利用可能

セマンティックパスは、クエリからデータオブジェクトまでのコンセプトの配列を返します。これにより、Weaviate がどのようなステップを踏んだか、およびクエリとデータオブジェクトがどのように解釈されたかを確認できます。

| Property | 説明 |
| --- | --- |
| `concept` | このステップで見つかったコンセプト |
| `distanceToNext` | 次のステップまでの距離（最後のステップの場合は null） |
| `distanceToPrevious` | 前のステップまでの距離（最初のステップの場合は null） |
| `distanceToQuery` | このステップからクエリまでの距離 |
| `distanceToResult` | このステップから結果までの距離 |

_注: セマンティックパスを構築できるのは、探索語がパスの開始、各検索結果がパスの終端を表すため [`nearText: {}` オペレーター](#neartext) が設定されている場合のみです。現在 `nearText: {}` クエリは GraphQL でのみ利用可能なため、`semanticPath` は REST API では利用できません。_

例: エッジなしでセマンティックパスを表示

import GraphQLUnderscoreSemanticpath from '/_includes/code/graphql.underscoreproperties.semanticpath.mdx';

<GraphQLUnderscoreSemanticpath/>


### マルチモーダル検索

使用している ベクトライザー モジュールによっては、画像・音声・動画など追加のモダリティをクエリとして使用し、対応する互換オブジェクトを取得できます。

`multi2vec-clip` や `multi2vec-bind` など一部のモジュールでは、モダリティを跨いだ検索が可能です。たとえばテキストクエリで画像を検索したり、画像クエリでテキストを検索したりできます。

詳細は以下の各モジュールページをご覧ください。

* [Transformers マルチモーダル埋め込み](../../model-providers/transformers/embeddings-multimodal.md)
* [ImageBind マルチモーダル埋め込み](../../model-providers/imagebind/embeddings-multimodal.md)


## hybrid

このオペレーターを使用すると、[ BM25 ](#bm25) と ベクトル 検索を組み合わせて「良いとこ取り」の検索結果セットを取得できます。

### 変数

| Variables    | Required | Type       | Description                                                                 |
|--------------|----------|------------|-----------------------------------------------------------------------------|
| `query`      | yes      | `string`   | 検索クエリ                                                                  |
| `alpha`      | no       | `float`    | 各検索アルゴリズムの重み付け。デフォルトは 0.75                             |
| `vector`     | no       | `[float]`  | 独自の ベクトル を指定する場合に使用                                         |
| `properties` | no       | `[string]` | BM25 検索対象を特定のプロパティに限定。デフォルトはすべてのテキストプロパティ |
| `fusionType` | no       | `string` | ハイブリッド融合アルゴリズムの種類（ `v1.20.0` から利用可能）               |
| `bm25SearchOperator` | no | `object` | ターゲットオブジェクトがマッチと見なされるために含むべき (bm25) クエリトークン数を設定（ `v1.31.0` から利用可能） |

* 注:
    * `alpha` は 0〜1 の数値で、デフォルトは 0.75  
        * `alpha` = 0 で純粋な **キーワード** 検索（ BM25 ）のみ  
        * `alpha` = 1 で純粋な **ベクトル** 検索のみ  
        * `alpha` = 0.5 で BM25 と ベクトル を同等に重み付け  
    * `fusionType` は `rankedFusion` または `relativeScoreFusion`  
        * `rankedFusion` （デフォルト）は BM25 と ベクトル 検索の順位を反転して加算  
        * `relativeScoreFusion` は正規化された BM25 と ベクトル のスコアを加算  

### 融合アルゴリズム

#### Ranked fusion

`rankedFusion` アルゴリズムは Weaviate のオリジナルのハイブリッド融合アルゴリズムです。

このアルゴリズムでは、各オブジェクトが検索結果（ ベクトル またはキーワード）の順位に基づいてスコアリングされます。それぞれの検索で最上位のオブジェクトが最高スコアを得て、下位になるほどスコアは低下します。最終スコアは ベクトル 検索とキーワード検索の順位ベーススコアを合算して算出されます。

#### Relative score fusion

:::info `v1.20` で追加
:::
:::info `v1.24` 以降のデフォルトは Relative Score Fusion
:::

`relativeScoreFusion` では、 ベクトル 検索とキーワード検索のスコアが 0〜1 にスケーリングされます。スケーリング後、最高値は 1、最低値は 0 となり、その間の値が 0〜1 の範囲で割り当てられます。最終スコアは、正規化された ベクトル 類似度と正規化された BM25 スコアの合計（スケーリング済み）です。

<details>
  <summary>融合スコアリング比較</summary>

この例では、小さな検索結果セットを用いて ranked fusion と relative fusion のアルゴリズムを比較します。表には以下の情報が示されています。

- `document id`（ 0 〜 4 ）  
- `keyword score`（ソート済み）  
- `vector search score`（ソート済み）  

<table>
  <tr>
    <th>Search Type</th>
    <th>(id): score</th><th>(id): score</th><th>(id): score</th><th>(id): score</th><th>(id): score</th>
  </tr>
  <tr>
    <td>Keyword</td>
    <td>(1): 5</td><td>(0): 2.6</td><td>(2): 2.3</td><td>(4): 0.2</td><td>(3): 0.09</td>
  </tr>
  <tr>
    <td>Vector</td>
    <td>(2): 0.6</td><td>(4): 0.598</td><td>(0): 0.596</td><td>(1): 0.594</td><td>(3): 0.009</td>
  </tr>
</table>

ランキングアルゴリズムはこれらのスコアを用いてハイブリッドランキングを導出します。

#### ランク融合

結果の rank によって score が決まります。score は `1/(RANK + 60)` で計算されます。

<table>
  <tr>
    <th>検索タイプ</th>
    <th>(id): score</th><th>(id): score</th><th>(id): score</th><th>(id): score</th><th>(id): score</th>
  </tr>
  <tr>
    <td>Keyword</td>
    <td>(1): 0.0154</td><td>(0): 0.0160</td><td>(2): 0.0161</td><td>(4): 0.0167</td><td>(3): 0.0166</td>
  </tr>
  <tr>
    <td>Vector</td>
    <td>(2): 0.016502</td><td>(4): 0.016502</td><td>(0): 0.016503</td><td>(1): 0.016503</td><td>(3): 0.016666</td>
  </tr>
</table>

表が示すように、入力 score に関係なく、各ランクの結果は同一です。

#### 相対スコア融合

ここでは score を正規化します。最大 score を 1、最小を 0 とし、その間は **最大値** と **最小値** からの **相対距離** に基づいてスケーリングされます。

<table>
  <tr>
    <th>検索タイプ</th>
    <th>(id): score</th><th>(id): score</th><th>(id): score</th><th>(id): score</th><th>(id): score</th>
  </tr>
  <tr>
    <td>Keyword</td>
    <td>(1): 1.0</td><td>(0): 0.511</td><td>(2): 0.450</td><td>(4): 0.022</td><td>(3): 0.0</td>
  </tr>
  <tr>
    <td>Vector</td>
    <td>(2): 1.0</td><td>(4): 0.996</td><td>(0): 0.993</td><td>(1): 0.986</td><td>(3): 0.0</td>
  </tr>
</table>

ここでの score は元の score の相対的な分布を反映しています。例えば、vector 検索の先頭 4 件の score はほぼ同一であり、正規化後も同様です。

#### 重み付けと最終スコア

これらの score を合算する前に、alpha パラメーターに従って重み付けされます。ここでは alpha=0.5 とし、両検索タイプが最終結果に等しく寄与するため、各 score に 0.5 を掛けます。

これで各ドキュメントの score を合算し、両方の融合アルゴリズムの結果を比較できます。

<table>
  <tr>
    <th>アルゴリズムタイプ</th>
    <th>(id): score</th><th>(id): score</th><th>(id): score</th><th>(id): score</th><th>(id): score</th>
  </tr>
  <tr>
    <td>Ranked</td>
    <td>(2): 0.016301</td><td>(1): 0.015952</td><td>(0): 0.015952</td><td>(4): 0.016600</td><td>(3): 0.016630</td>
  </tr>
  <tr>
    <td>Relative</td>
    <td>(1): 0.993</td><td>(0): 0.752</td><td>(2): 0.725</td><td>(4): 0.509</td><td>(3): 0.0</td>
  </tr>
</table>

#### 考察

vector 検索では、上位 4 オブジェクト（**ID 2, 4, 0, 1**）の score がほぼ同一で、いずれも良好な結果でした。一方、keyword 検索では 1 つのオブジェクト（**ID 1**）が他を大きく上回っていました。

これは `relativeScoreFusion` の最終結果に反映され、オブジェクト **ID 1** がトップに選ばれました。これは、このドキュメントが keyword 検索で次点と大きな差を付けて最良であり、かつ vector 検索でも上位グループに入っていたためです。

これに対し、`rankedFusion` ではオブジェクト **ID 2** がトップとなり、**ID 1** と **ID 0** が僅差で続きました。

</details>

融合メソッドの詳細については、[こちらのブログ記事](https://weaviate.io/blog/hybrid-search-fusion-algorithms) を参照してください。

### 追加メタデータのレスポンス

Hybrid 検索の結果は、BM25F score と `nearText` 類似度を融合した score によって並べ替えられます（値が大きいほど関連性が高い）。この `score` と、さらに `explainScore` メタデータはレスポンスで任意に取得できます。


### 例

import GraphQLFiltersHybrid from '/_includes/code/graphql.filters.hybrid.mdx';

<GraphQLFiltersHybrid/>

### ベクトルを指定した例

`vector` 変数にベクトルクエリを指定することもできます。これにより、ハイブリッド検索の vector 検索コンポーネントでは `query` 変数を上書きします。

import GraphQLFiltersHybridVector from '/_includes/code/graphql.filters.hybrid.vector.mdx';

<GraphQLFiltersHybridVector/>

### 条件フィルター付きハイブリッド

:::info v1.18.0 で追加
:::

`hybrid` では [条件 (`where`) フィルター](../graphql/filters.md) を使用できます。

import GraphQLFiltersHybridFilterExample from '/_includes/code/graphql.filters.hybrid.filter.example.mdx';

<GraphQLFiltersHybridFilterExample/>


### BM25 検索対象プロパティの指定

:::info v1.19 で追加
:::

`hybrid` オペレーターでは、BM25 コンポーネントの検索対象プロパティを制限するために文字列の配列を受け取れます。指定しない場合、すべてのテキストプロパティが検索されます。

import GraphQLFiltersHybridProperties from '/_includes/code/graphql.filters.hybrid.properties.mdx';

<GraphQLFiltersHybridProperties/>

### `relativeScoreFusion` のオーバーサーチ

:::info v1.21 で追加
:::

`relativeScoreFusion` を `fusionType` として使用し、検索の `limit` が小さい場合、score の正規化により結果セットが limit パラメーターに対して非常に敏感になることがあります。

この影響を緩和するため、Weaviate は自動的により大きい limit（100）で検索を行い、その後要求された limit まで結果を切り詰めます。

### BM25 検索オペレーター

:::info Added in `v1.31`
:::

`bm25SearchOperator` を使用すると、キーワード検索 ( bm25 ) 部分のハイブリッド検索で、クエリトークンのうち何個が対象オブジェクトに含まれていれば一致とみなすかを設定できます。これにより、関連するキーワードを一定数以上含むオブジェクトのみを返したい場合に便利です。

利用可能なオプションは `And` と `Or` です。`Or` を設定した場合は、追加パラメーター `minimumOrTokensMatch` を指定する必要があります。これは、一致と判断するためにクエリトークンが何個一致する必要があるかを定義します。

未指定の場合、キーワード検索は `Or` が設定され、`minimumOrTokensMatch` が 1 と同等に動作します。

## BM25

`bm25` オペレーターはキーワード (スパース ベクトル) 検索を実行し、BM25F ランキング関数で結果にスコアを付けます。BM25F ( **B**est **M**atch **25** with Extension to Multiple Weighted **F**ields) は、複数フィールド ( `properties` ) にスコアリングアルゴリズムを適用することで精度を高めた BM25 の拡張版です。

検索は大文字小文字を区別せず、大文字小文字の一致によるスコア上昇はありません。ストップワードは除去されます。[ステミングはまだサポートされていません](https://github.com/weaviate/weaviate/issues/2439)。

### スキーマ設定

[自由パラメーター `k1` と `b`](https://en.wikipedia.org/wiki/Okapi_BM25#The_ranking_function) は任意で設定できます。詳細は [スキーマリファレンス](../../config-refs/indexing/inverted-index.mdx#bm25) を参照してください。

### 変数
`bm25` オペレーターでは以下の変数をサポートしています。

| 変数 | 必須 | 説明 |
| --------- | -------- | ----------- |
| `query`   | yes      | キーワード検索クエリ。 |
| `properties` | no    | 検索対象とするプロパティ (フィールド) の配列。指定しない場合はコレクション内のすべてのプロパティが対象になります。 |
| `searchOperator` | no | 対象オブジェクトを一致とみなすために、クエリトークンがいくつ含まれている必要があるかを設定します ( v1.31.0 以降で利用可能)。 |

:::info Boosting properties
特定のプロパティはキャレット記号の後に数値を付けて重み付けできます。例: `properties: ["title^3", "summary"]`
:::

### 追加メタデータの取得

BM25F の `score` メタデータをレスポンスで取得できます。スコアが高いほど関連性が高いことを示します。

### クエリ例

import GraphQLFiltersBM25 from '/_includes/code/graphql.filters.bm25.mdx';

<GraphQLFiltersBM25/>

<details>
  <summary>想定されるレスポンス</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "certainty": null,
            "distance": null,
            "score": "3.4985464"
          },
          "title": "Tim Dowling: is the dog’s friendship with the fox sweet – or a bad omen?"
        }
      ]
    }
  },
  "errors": null
}
```

</details>

### 条件フィルター付き BM25

:::info Added in `v1.18`
:::

`bm25` は [条件 (`where`) フィルター](../graphql/filters.md) と併用できます。

import GraphQLFiltersBM25FilterExample from '/_includes/code/graphql.filters.bm25.filter.example.mdx';

<GraphQLFiltersBM25FilterExample/>

<details>
  <summary>想定されるレスポンス</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "summary": "Sometimes, the hardest part of setting a fishing record is just getting the fish weighed. A Kentucky fisherman has officially set a new record in the state after reeling in a 9.05-pound saugeye. While getting the fish in the boat was difficult, the angler had just as much trouble finding an officially certified scale to weigh it on. In order to qualify for a state record, fish must be weighed on an officially certified scale. The previous record for a saugeye in Kentucky ws an 8 pound, 8-ounce fish caught in 2019.",
          "title": "Kentucky fisherman catches record-breaking fish, searches for certified scale"
        },
        {
          "summary": "Unpaid last month because there wasn\u2019t enough money. Ms. Hunt picks up shifts at JJ Fish & Chicken, bartends and babysits. three daughters is subsidized,and cereal fromErica Hunt\u2019s monthly budget on $12 an hourErica Hunt\u2019s monthly budget on $12 an hourExpensesIncome and benefitsRent, $775Take-home pay, $1,400Varies based on hours worked. Daycare, $600Daycare for Ms. Hunt\u2019s three daughters is subsidized, as are her electricity and internet costs. Household goods, $300Child support, $350Ms. Hunt picks up shifts at JJ Fish & Chicken, bartends and babysits to make more money.",
          "title": "Opinion | What to Tell the Critics of a $15 Minimum Wage"
        },
        ...
      ]
    }
  }
}

```

</details>

### 検索オペレーター

:::info Added in `v1.31`
:::

`searchOperator` を使用すると、クエリトークンのうち何個が対象オブジェクトに含まれていれば一致とみなすかを設定できます。これにより、関連キーワードを一定数以上含むオブジェクトのみを返したい場合に便利です。

利用可能なオプションは `And` と `Or` です。`Or` を設定した場合は、追加パラメーター `minimumOrTokensMatch` を指定する必要があります。これは、一致と判断するためにクエリトークンが何個一致する必要があるかを定義します。

未指定の場合、キーワード検索は `Or` が設定され、`minimumOrTokensMatch` が 1 と同等に動作します。

## ask オペレーター

モジュール [Question Answering](/weaviate/modules/qna-transformers.md) によって有効化されます。

このオペレーターは、取得した結果を Q&A モデルに通すことで質問への回答を返します。

### 変数

| 変数 | 必須 | 型 | 説明 |
| --------- | -------- | ---- | ----------- |
| `question` 	| yes	| `string` | 質問文。 |
| `certainty` | no 	| `float` | 求める最小確信度。値が高いほど検索は厳密に、低いほど曖昧になります。設定しない場合、抽出できたすべての回答が返されます。 |
| `properties`	| no 	| `[string]` | テキストを含むクエリコレクションのプロパティ。指定しない場合はすべてが対象になります。 |
| `rerank` 	| no 	| `boolean`	| 有効にすると、qna モジュールが回答スコアを基に結果を再ランク付けします。例として、以前の (セマンティック) 検索で 3 番目だった結果に最も可能性の高い回答が含まれていた場合、その結果が 1 位に繰り上がります。*v1.10.0 以降でサポート* |

### 例

import QNATransformersAsk from '/_includes/code/qna-transformers.ask.mdx';

<QNATransformersAsk/>

### 追加メタデータの取得

`answer` と `certainty` を取得できます。


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


