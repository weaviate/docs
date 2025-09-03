---
title: オブジェクトレベルクエリ（Get）
sidebar_position: 10
description: " GraphQL の get クエリで Weaviate からデータを効率的に取得します。"
image: og/docs/api.jpg
# tags: ['graphql', 'get{}']
---

import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';

import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

このページでは、オブジェクトレベルのクエリ機能について説明します。これらは本文中で `Get` クエリと総称されます。


### パラメーター

`Get` クエリでは、対象のコレクションを指定する必要があります。

-  GraphQL 呼び出しでは、取得するプロパティを明示的に指定する必要があります。  
-  gRPC 呼び出しでは、すべてのプロパティがデフォルトで取得されます。  

-  GraphQL と gRPC のいずれの呼び出しでも、メタデータ取得は任意です。

#### 使用可能な引数

| 引数 | 説明 | 必須 |
| -------- | ----------- | -------- |
| Collection | 「クラス」とも呼ばれます。取得対象のオブジェクトコレクション。 | Yes |
| Properties | 取得するプロパティ | Yes (GraphQL) <br/> (No if using gRPC API) |
| Cross-references | 取得するクロスリファレンス | No |
| [メタデータ](./additional-properties.md) | 取得するメタデータ（追加プロパティ） | No |
| [条件フィルター](./filters.md) | 取得するオブジェクトをフィルタリング | No |
| [検索オペレーター](./search-operators.md) | 検索戦略を指定（例: near text、hybrid、bm25） | No |
| [追加オペレーター](./additional-operators.md) | 追加オペレーターを指定（例: limit、offset、sort） | No |
| [Tenant name](#multi-tenancy) | テナント名を指定 | Yes, if multi-tenancy enabled. ([詳細: マルチテナンシーとは?](../../concepts/data.md#multi-tenancy)) |
| [Consistency level](#consistency-levels) | コンシステンシーレベルを指定 | No |


#### 使用例

import GraphQLGetSimple from '/_includes/code/graphql.get.simple.mdx';

<GraphQLGetSimple/>

<details>
  <summary>レスポンス例</summary>

上記のクエリを実行すると、次のような結果が得られます:

```
{'points': 400.0, 'answer': 'Refrigerator Car', 'air_date': '1997-02-14', 'hasCategory': 'TRANSPORTATION', 'question': 'In the 19th century Gustavus Swift developed this type of railway car to preserve his packed meat', 'round': 'Jeopardy!'}
{'points': 800.0, 'hasCategory': 'FICTIONAL CHARACTERS', 'answer': 'Forsyte', 'air_date': '1998-05-27', 'question': 'Last name of Soames & Irene, the 2 principal characters in John Galsworthy\'s 3 novel "saga"', 'round': 'Double Jeopardy!'}
{'points': 500.0, 'answer': 'Duluth', 'air_date': '1996-12-17', 'hasCategory': 'MUSEUMS', 'question': 'This eastern Minnesota city is home to the Lake Superior Museum of Transportation', 'round': 'Jeopardy!'}
{'points': 1000.0, 'answer': 'Ear', 'air_date': '1988-11-16', 'hasCategory': 'HISTORY', 'round': 'Double Jeopardy!', 'question': "An eighteenth-century war was named for this part of Robert Jenkins' body, reputedly cut off by Spaniards"}
{'points': 400.0, 'answer': 'Bonnie Blair', 'air_date': '1997-02-28', 'hasCategory': 'SPORTS', 'round': 'Jeopardy!', 'question': "At the 1994 Olympics, this U.S. woman speed skater surpassed Eric Heiden's medal total"}
{'points': 1600.0, 'answer': 'Turkish', 'air_date': '2008-03-24', 'hasCategory': 'LANGUAGES', 'question': 'In the 1920s this language of Anatolia switched from the Arabic to the Latin alphabet', 'round': 'Double Jeopardy!'}
{'points': 100.0, 'answer': 'Ireland', 'air_date': '1998-10-01', 'hasCategory': 'POTPOURRI', 'round': 'Jeopardy!', 'question': "Country in which you'd find the Book of Kells"}
{'points': 800.0, 'answer': 'Ichabod Crane', 'air_date': '2008-01-03', 'hasCategory': 'LITERATURE', 'round': 'Double Jeopardy!', 'question': 'Washington Irving based this character on his friend Jesse Merwin, a schoolteacher'}
{'points': 300.0, 'air_date': '1997-12-05', 'hasCategory': 'LITERATURE', 'answer': '"The Prince and the Pauper"', 'question': 'Tom Canty, born in a slum called Offal Court, & Edward Tudor are the title characters in this Twain novel', 'round': 'Jeopardy!'}
{'points': 500.0, 'answer': 'Seattle', 'air_date': '1999-05-10', 'hasCategory': 'U.S. CITIES', 'round': 'Jeopardy!', 'question': "The site of the World's Fair in 1962, it's flanked on the west by Puget Sound & on the east by Lake Washington"}
```

</details>

<details>
  <summary>取得オブジェクトの順序</summary>

引数を指定しない場合、オブジェクトは ID 順で取得されます。  

したがって、このような `Get` クエリは実質的なオブジェクト検索戦略には適していません。その用途には [Cursor API](./additional-operators.md#cursor-with-after) の使用をご検討ください。

</details>

:::tip さらに詳しく
- [検索方法: 基本](../../search/basics.md)
:::

### `Get` groupBy

クエリに一致するオブジェクトをグループ単位で取得できます。

グループはプロパティによって定義され、グループ数やグループごとのオブジェクト数を制限できます。

import GroupbyLimitations from '/_includes/groupby-limitations.mdx';

<GroupbyLimitations />


#### 構文

```graphql
{
  Get{
    <Class>(
      <vectorSearchOperator>  # e.g. nearVector, nearObject, nearText
      groupBy:{
        path: [<propertyName>]  # Property to group by (only one property or cross-reference)
        groups: <number>  # Max. number of groups
        objectsPerGroup: <number>  # Max. number of objects per group
      }
    ) {
      _additional {
        group {
          id  # An identifier for the group in this search
          groupedBy{ value path }  # Value and path of the property grouped by
          count  # Count of objects in this group
          maxDistance  # Maximum distance from the group to the query vector
          minDistance  # Minimum distance from the group to the query vector
          hits {  # Where the actual properties for each grouped objects will be
            <properties>  # Properties of the individual object
            _additional {
              id  # UUID of the individual object
              vector  # The vector of the individual object
              distance  # The distance from the individual object to the query vector
            }
          }
        }
      }
    }
  }
}
```

#### 使用例:


import GraphQLGroupBy from '/_includes/code/graphql.get.groupby.mdx';

<GraphQLGroupBy/>


### コンシステンシーレベル

:::info Added in `v1.19`
:::

レプリケーションが有効な場合、`Get` クエリに `consistency` 引数を指定できます。利用可能なオプションは次のとおりです:
- `ONE`
- `QUORUM` (Default)
- `ALL`

コンシステンシーレベルの詳細は [こちら](../../concepts/replication-architecture/consistency.md) を参照してください。

import GraphQLGetConsistency from '/_includes/code/graphql.get.consistency.mdx';

<GraphQLGetConsistency/>

### マルチテナンシー

:::info Added in `v1.20`
:::

マルチテナンシーコレクションでは、各 `Get` クエリでテナントを指定する必要があります。

import GraphQLGetMT from '/_includes/code/graphql.get.multitenancy.mdx';

<GraphQLGetMT/>


:::tip さらに詳しく
- [データ管理方法: マルチテナンシー操作](../../manage-collections/multi-tenancy.mdx)
:::



## クロスリファレンス

import CrossReferencePerformanceNote from '/_includes/cross-reference-performance-note.mdx';

<CrossReferencePerformanceNote />

Weaviate では、オブジェクト間のクロスリファレンスをサポートしています。各クロスリファレンスはプロパティのように振る舞います。

クロスリファレンスされたプロパティは `Get` クエリで取得できます。

import GraphQLGetBeacon from '/_includes/code/graphql.get.beacon.mdx';

<GraphQLGetBeacon/>

import GraphQLGetBeaconUnfiltered from '!!raw-loader!/_includes/code/graphql.get.beacon.v3.py';

<details>
  <summary>期待されるレスポンス</summary>

<FilteredTextBlock
  text={GraphQLGetBeaconUnfiltered}
  startMarker="// ===== EXPECTED RESULT ====="
  endMarker="// ===== END EXPECTED RESULT ====="
  language="json"
/>

</details>

:::tip Read more
- [クロスリファレンスされたプロパティの取得方法](../../search/basics.md#retrieve-cross-referenced-properties)
:::

## 追加プロパティ / メタデータ

さまざまなメタデータプロパティは `Get{}` リクエストで取得できます。以下が例です:

Property | Description |
-------- | ----------- |
`id` | オブジェクト ID |
`vector` | オブジェクト ベクトル |
`generate` | 生成モジュールの出力 |
`rerank` | リランカー モジュールの出力 |
`creationTimeUnix` | オブジェクトの作成時刻 |
`lastUpdateTimeUnix` | オブジェクトの最終更新時刻 |
`distance` | クエリとの ベクトル 距離（ベクトル検索のみ） |
`certainty` | クエリとの ベクトル 距離を確信度に正規化（ベクトル検索のみ） |
`score` | 検索スコア（BM25 およびハイブリッドのみ） |
`explainScore` | スコアの説明（BM25 およびハイブリッドのみ） |
`classification` | 分類モジュールの出力 |
`featureProjection` | 特徴量プロジェクションの出力 |

これらはレスポンスの `_additional` プロパティを通じて返されます。

詳細は以下を参照してください:

:::tip Read more
- [リファレンス: GraphQL: Additional properties](./additional-properties.md)
- [ハウツー検索: 取得プロパティの指定](../../search/basics.md#specify-object-properties)
:::


## 検索オペレーター

利用可能な検索オペレーターは以下のとおりです。

| Argument | 説明 | 必要な統合タイプ | 詳細 |
| --- | --- | --- | --- |
| `nearObject` | Weaviate オブジェクトを使用した ベクトル検索 | *none* | [Learn more](./search-operators.md#nearobject) |
| `nearVector` | 生の ベクトル を使用した ベクトル検索 | *none* | [Learn more](./search-operators.md#nearvector) |
| `nearText` | テキストクエリを使用した ベクトル検索 | Text embedding model |  |
| `nearImage` | 画像を使用した ベクトル検索 | Multi-modal embedding model |
| `hybrid` | ベクトル検索結果と BM25 検索結果を組み合わせます | *none* | [Learn more](../graphql/search-operators.md#hybrid) |
| `bm25`   | BM25F ランキングによるキーワード検索  | *none* | [Learn more](../graphql/search-operators.md#bm25) |

詳細は以下を参照してください:

:::tip Read more
- [リファレンス: GraphQL: Search operators](./search-operators.md)
- [ハウツー検索: 類似度検索](../../search/similarity.md)
- [ハウツー検索: 画像検索](../../search/image.md)
- [ハウツー検索: BM25 検索](../../search/bm25.md)
- [ハウツー検索: ハイブリッド検索](../../search/hybrid.md)
:::

## 条件付きフィルター

`Get{}` クエリは条件付きフィルターと組み合わせることができます。

詳細は以下を参照してください:

:::tip Read more
- [リファレンス: GraphQL: Conditional Filters](./filters.md)
- [ハウツー検索: フィルター](../../search/filters.md)
:::


## 追加オペレーター

`Get{}` クエリは `limit`, `offset`, `autocut`, `after`, `sort` などの追加オペレーターと組み合わせることができます。

詳細は以下を参照してください:

:::tip Read more
- [リファレンス: GraphQL: Additional Operators](./additional-operators.md)
:::


## 関連ページ
- [ハウツー: 検索: 基本](../../search/basics.md)


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

