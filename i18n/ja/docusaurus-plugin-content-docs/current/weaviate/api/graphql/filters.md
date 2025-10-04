---
title: 条件付きフィルター
sidebar_position: 35
description: "検索結果を絞り込むための条件ロジックを適用する GraphQL フィルタリングのドキュメント。"
image: og/docs/api.jpg
# tags: ['graphql', 'filters']
---


import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

条件付きフィルターは [`Object-level`](./get.md) や [`Aggregate`](./aggregate.md) の各クエリ、さらに [バッチ削除](../../manage-objects/delete.mdx#delete-multiple-objects) に追加できます。フィルタリングに使用される演算子は `where` フィルターとも呼ばれます。

フィルターは 1 つ以上の条件で構成でき、`And` または `Or` 演算子で結合されます。各条件はプロパティパス・演算子・値で構成されます。


## 単一オペランド（条件）

代数的条件の各セットは「オペランド」と呼ばれます。各オペランドに必要なプロパティは次のとおりです。  
- 演算子タイプ  
- プロパティパス  
- 値および値の型  

たとえば、次のフィルターはクラス `Article` のうち、`wordCount` が `GreaterThan` 1000 のオブジェクトのみを許可します。

import GraphQLFiltersWhereSimple from '/_includes/code/graphql.filters.where.simple.mdx';

<GraphQLFiltersWhereSimple/>

<details>
  <summary>Expected response</summary>

```
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Anywhere but Washington: an eye-opening journey in a deeply divided nation"
        },
        {
          "title": "The world is still struggling to implement meaningful climate policy"
        },
        ...
      ]
    }
  }
}
```

</details>

## フィルター構造

`where` フィルターは [代数的オブジェクト](https://en.wikipedia.org/wiki/Algebraic_structure) で、次の引数を取ります。

- `Operator`（以下のいずれか）
  - `And`
  - `Or`
  - `Equal`
  - `NotEqual`
  - `GreaterThan`
  - `GreaterThanEqual`
  - `LessThan`
  - `LessThanEqual`
  - `Like`
  - `WithinGeoRange`
  - `IsNull`
  - `ContainsAny`  (*配列および text プロパティのみ*)
  - `ContainsAll`  (*配列および text プロパティのみ*)
- `Path`：コレクションのプロパティ名を示す [XPath](https://en.wikipedia.org/wiki/XPath#Abbreviated_syntax) 形式の文字列リスト。  
  - プロパティがクロスリファレンスの場合、パスは文字列のリストとしてたどります。たとえば `inPublication` というリファレンスプロパティが `Publication` コレクションを参照している場合、`name` を指定するパスセレクターは `["inPublication", "Publication", "name"]` になります。
- `valueType`
  - `valueInt`：`int` データ型
  - `valueBoolean`：`boolean` データ型
  - `valueString`：`string` データ型（`string` は非推奨）
  - `valueText`：`text`、`uuid`、`geoCoordinates`、`phoneNumber` データ型
  - `valueNumber`：`number` データ型
  - `valueDate`：`date` データ型（ISO 8601 タイムスタンプ、[RFC3339](https://datatracker.ietf.org/doc/rfc3339/) 形式）

演算子が `And` または `Or` の場合、オペランドは `where` フィルターのリストになります。

<details>
  <summary>Example filter structure (GraphQL)</summary>

```graphql
{
  Get {
    <Class>(where: {
        operator: <operator>,
        operands: [{
          path: [path],
          operator: <operator>
          <valueType>: <value>
        }, {
          path: [<matchPath>],
          operator: <operator>,
          <valueType>: <value>
        }]
      }) {
      <propertyWithBeacon> {
        <property>
        ... on <ClassOfWhereBeaconGoesTo> {
          <propertyOfClass>
        }
      }
    }
  }
}
```

</details>

<details>
  <summary>Example response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Opinion | John Lennon Told Them ‘Girls Don't Play Guitar.' He Was So Wrong."
        }
      ]
    }
  },
  "errors": null
}
```

</details>

:::note `Not` operator  
Weaviate にはフィルターを反転する演算子（例：`Not Like ...`）はありません。追加をご希望の場合は [問題をアップボートしてください](https://github.com/weaviate/weaviate/issues/3683)。  
:::

### フィルターの挙動

#### `Equal` フィルターでの複数語クエリ

`where` フィルターにおける `Equal` 演算子の複数語テキストプロパティに対する挙動は、そのプロパティの `tokenization` 設定によって異なります。

利用可能なトークナイゼーションタイプの違いについては、[スキーマプロパティのトークナイゼーション](../../config-refs/collections.mdx#tokenization) を参照してください。

#### `text` フィルターにおけるストップワード

`v1.12.0` 以降、[転置インデックスのストップワードリスト](/weaviate/config-refs/indexing/inverted-index.mdx#stopwords) を独自に設定できます。

## 複数オペランド

複数のオペランドを設定したり、[条件をネスト](../../search/filters.md#nested-filters) することができます。

:::tip  
`valueDate` を [RFC3339](https://datatracker.ietf.org/doc/rfc3339/) 形式の `string` として指定すれば、日時も数値と同様にフィルタリングできます。  
:::

import GraphQLFiltersWhereOperands from '/_includes/code/graphql.filters.where.operands.mdx';

<GraphQLFiltersWhereOperands />

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "China\u2019s long-distance lorry drivers are unsung heroes of its economy"
        },
        {
          "title": "\u2018It\u2019s as if there\u2019s no Covid\u2019: Nepal defies pandemic amid a broken economy"
        },
        {
          "title": "A tax hike threatens the health of Japan\u2019s economy"
        }
      ]
    }
  }
}
```

</details>

## フィルター演算子

### `Like`

`Like` 演算子は、部分一致に基づいて `text` データをフィルタリングします。次のワイルドカードを使用できます。

- `?` → ちょうど 1 文字の不明文字  
  - `car?` は `cart`、`care` にマッチしますが `car` にはマッチしません
- `*` → 0 文字以上の不明文字  
  - `car*` は `car`、`care`、`carpet` などにマッチします  
  - `*car*` は `car`、`healthcare` などにマッチします。

import GraphQLFiltersWhereLike from '/_includes/code/graphql.filters.where.like.mdx';

<GraphQLFiltersWhereLike/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "name": "The New York Times Company"
        },
        {
          "name": "International New York Times"
        },
        {
          "name": "New York Times"
        },
        {
          "name": "New Yorker"
        }
      ]
    }
  }
}
```

</details>



#### `Like` のパフォーマンス

各 `Like` フィルターは、そのプロパティの全ての 転置インデックス を走査します。検索時間はデータセット サイズに比例して増加し、大規模なデータセットでは遅くなる可能性があります。

#### `Like` でのワイルドカード文字のリテラル一致

現在、`Like` フィルターはワイルドカード文字（`?` と `*`）をリテラル文字として一致させることができません。たとえば、`car`、`care`、`carpet` ではなく文字列 `car*` のみを一致させることは現状では不可能です。これは既知の制限であり、将来の Weaviate のバージョンで対応される可能性があります。


### `ContainsAny` / `ContainsAll`

`ContainsAny` と `ContainsAll` の各オペレーターは、配列の値を基準にオブジェクトをフィルターします。

両オペレーターとも値の配列を受け取り、入力値に基づいて一致するオブジェクトを返します。

:::note `ContainsAny` and `ContainsAll` notes:
- `ContainsAny` と `ContainsAll` の各オペレーターはテキストを配列として扱います。テキストは選択されたトークナイゼーション方式に基づいてトークン配列に分割され、その配列に対して検索が行われます。  
- REST API を使った [バッチ削除](../../manage-objects/delete.mdx#delete-multiple-objects) で `ContainsAny` または `ContainsAll` を使用する場合、テキスト配列は `valueTextArray` 引数で指定する必要があります。検索時の使用方法とは異なり、`valueText` 引数は使用できません。
:::


#### `ContainsAny`

`ContainsAny` は、入力配列の値のうち少なくとも 1 つが存在するオブジェクトを返します。

`Person` データセットを想定し、各オブジェクトが `text` 型の `languages_spoken` プロパティを持つとします。

`path` が `["languages_spoken"]`、`value` が `["Chinese", "French", "English"]` の `ContainsAny` クエリは、`languages_spoken` 配列にこれらの言語のいずれかが含まれるオブジェクトを返します。

#### `ContainsAll`

`ContainsAll` は、入力配列の全ての値が存在するオブジェクトを返します。

上記と同じ `Person` データセットで、`path` が `["languages_spoken"]`、`value` が `["Chinese", "French", "English"]` の `ContainsAll` クエリは、`languages_spoken` 配列に 3 つ全ての言語が含まれるオブジェクトを返します。

## Filter performance

import RangeFilterPerformanceNote from '/_includes/range-filter-performance-note.mdx';

<RangeFilterPerformanceNote />

## 特殊ケース

### ID でのフィルター

オブジェクトは一意の ID または UUID でフィルターできます。この場合、`id` を `valueText` として渡します。

import GraphQLFiltersWhereId from '/_includes/code/graphql.filters.where.id.mdx';

<GraphQLFiltersWhereId/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Backs on the rack - Vast sums are wasted on treatments for back pain that make it worse"
        }
      ]
    }
  }
}
```

</details>

### タイムスタンプでのフィルター

`creationTimeUnix` や `lastUpdateTimeUnix` などの内部タイムスタンプでもフィルターできます。これらの値は Unix エポックミリ秒、または [RFC3339](https://datatracker.ietf.org/doc/rfc3339/) 形式の日時として表現可能です。エポックミリ秒は `valueText`、RFC3339 形式の日時は `valueDate` として渡す必要があります。

:::info
タイムスタンプでのフィルターには、対象クラスがタイムスタンプの インデックス を有効化している必要があります。詳細は [こちら](/weaviate/config-refs/indexing/inverted-index.mdx#indextimestamps) を参照してください。
:::

import GraphQLFiltersWhereTimestamps from '/_includes/code/graphql.filters.where.timestamps.mdx';

<GraphQLFiltersWhereTimestamps />

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Army builds new body armor 14-times stronger in the face of enemy fire"
        },
        ...
      ]
    }
  }
}
```

</details>

### プロパティ長でのフィルター

プロパティの長さを基準にフィルターできます。

長さの計算方法は型によって異なります。  
- 配列型: 配列の要素数を使用します。null（プロパティが存在しない）と空配列はいずれも長さ 0 と見なされます。  
- 文字列およびテキスト: 文字数（たとえば Unicode 文字の「世」は 1 文字としてカウントされます）。  
- 数値、ブーリアン、地理座標、電話番号、データ ブロブはサポートされていません。

```graphql
{
  Get {
    <Class>(
      where: {
        operator: <Operator>,
        valueInt: <value>,
        path: ["len(<property>)"]
      }
    )
  }
}
```

サポートされるオペレーターは `(not) equal` と `greater/less than (equal)` で、値は 0 以上である必要があります。

`path` の値は文字列であり、プロパティ名を `len()` でラップします。たとえば `title` プロパティの長さでフィルターする場合は `path: ["len(title)"]` を使用します。

`Article` クラスのオブジェクトで `title` の長さが 10 文字を超えるものを取得するには、次のようにします。

```graphql
{
  Get {
    Article(
      where: {
        operator: GreaterThan,
        valueInt: 10,
        path: ["len(title)"]
      }
    )
  }
}
```

:::note
プロパティ長でのフィルターには、対象クラスで [プロパティ長のインデックス](/weaviate/config-refs/indexing/inverted-index.mdx#indexpropertylength) を有効化している必要があります。
:::

### クロスリファレンスでのフィルター

クロスリファレンス（ビーコン）先のプロパティ値でも検索できます。

例えば、`inPublication` が New Yorker に設定されている `Article` クラスを対象にフィルターする場合は次のようになります。

import GraphQLFiltersWhereBeacon from '/_includes/code/graphql.filters.where.beacon.mdx';

<GraphQLFiltersWhereBeacon/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "inPublication": [
            {
              "name": "New Yorker"
            }
          ],
          "title": "The Hidden Costs of Automated Thinking"
        },
        {
          "inPublication": [
            {
              "name": "New Yorker"
            }
          ],
          "title": "The Real Deal Behind the U.S.\u2013Iran Prisoner Swap"
        },
        ...
      ]
    }
  }
}
```

</details>

### 参照数でのフィルター

前述の例では「New Yorker が出版した全ての記事を探す」のような単純な質問を解決できますが、「少なくとも 2 本の記事を書いた著者が執筆した記事を探す」のような質問は対応できません。ただし、参照数でフィルターすることは可能です。既存の比較オペレーター（`Equal`、`LessThan`、`LessThanEqual`、`GreaterThan`、`GreaterThanEqual`）を参照要素に直接指定します。例:

import GraphQLFiltersWhereBeaconCount from '/_includes/code/graphql.filters.where.beacon.count.mdx';

<GraphQLFiltersWhereBeaconCount/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Author": [
        {
          "name": "Agam Shah",
          "writesFor": [
            {
              "name": "Wall Street Journal"
            },
            {
              "name": "Wall Street Journal"
            }
          ]
        },
        {
          "name": "Costas Paris",
          "writesFor": [
            {
              "name": "Wall Street Journal"
            },
            {
              "name": "Wall Street Journal"
            }
          ]
        },
        ...
      ]
    }
  }
}
```

</details>

### Geo 座標

`Where` フィルターの特別なケースとして geoCoordinates が存在します。このフィルターは `Get{}` 関数でのみサポートされます。geoCoordinates プロパティタイプを設定している場合、キロメートル単位でエリア内を検索できます。

例えば、次のクエリは特定の地理位置を中心とした半径 2 KM 内のすべてを返します:

import GraphQLFiltersWhereGeocoords from '/_includes/code/graphql.filters.where.geocoordinates.mdx';

<GraphQLFiltersWhereGeocoords/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "headquartersGeoLocation": {
            "latitude": 51.512737,
            "longitude": -0.0962234
          },
          "name": "Financial Times"
        },
        {
          "headquartersGeoLocation": {
            "latitude": 51.512737,
            "longitude": -0.0962234
          },
          "name": "International New York Times"
        }
      ]
    }
  }
}
```

</details>

geoCoordinates は内部で ベクトル インデックスを使用していることに注意してください。

import GeoLimitations from '/_includes/geo-limitations.mdx';

<GeoLimitations/>

### Null 状態

`IsNull` オペレーターを使用すると、指定したプロパティが `null` か `not null` かでオブジェクトをフィルタリングできます。長さ 0 の配列や空文字列は null 値と同等であることに注意してください。

```graphql
{
  Get {
    <Class>(where: {
        operator: IsNull,
        valueBoolean: <true/false>
        path: [<property>]
  }
}
```

:::note
null 状態でのフィルタリングを行うには、対象クラスがこれをインデックス化するように設定されている必要があります。詳細は [こちら](../../config-refs/indexing/inverted-index.mdx#indexnullstate) を参照してください。
:::


## 関連ページ

- [検索方法: フィルター](../../search/filters.md)



## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

