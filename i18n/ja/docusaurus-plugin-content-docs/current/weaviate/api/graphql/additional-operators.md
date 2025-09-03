---
title: 追加オペレーター
sidebar_position: 40
description: "クエリ機能を拡張する追加オペレーター（ limit 、 sort 、 group など）の構文リファレンスです。"
image: og/docs/api.jpg
# tags: ['graphql', 'additional operators']
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TryEduDemo from '/_includes/try-on-edu-demo.mdx';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import AutocutPyCode from '!!raw-loader!/_includes/code/howto/search.similarity.py';
import AutocutPyCodeV3 from '!!raw-loader!/_includes/code/howto/search.similarity-v3.py';
import AutocutTSCode from '!!raw-loader!/_includes/code/howto/search.similarity.ts';
import PyCode from '!!raw-loader!/_includes/code/graphql.additional.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/graphql.additional-v3.py';
import TSCode from '!!raw-loader!/_includes/code/graphql.additional.ts';
import GoCode from '!!raw-loader!/_includes/code/graphql.additional.go';
import JavaCode from '!!raw-loader!/_includes/code/graphql.additional.java';
import CurlCode from '!!raw-loader!/_includes/code/graphql.additional.sh';

<TryEduDemo />


## 構文

 `limit` 、 `autocut` 、 `sort` などの関数は、クラス レベルでクエリを修正します。
<!--
For example:

import GraphQLFiltersExample from '/_includes/code/graphql.filters.example.mdx';

<GraphQLFiltersExample/> -->


## limit 引数

 `limit` 引数は結果数を制限します。次の関数が `limit` をサポートしています:

- `Get`
- `Explore`
- `Aggregate`

import GraphQLFiltersLimit from '/_includes/code/graphql.filters.limit.mdx';

<GraphQLFiltersLimit/>

<details>
  <summary>想定されるレスポンス</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Backs on the rack - Vast sums are wasted on treatments for back pain that make it worse"
        },
        {
          "title": "Graham calls for swift end to impeachment trial, warns Dems against calling witnesses"
        },
        {
          "title": "Through a cloud, brightly - Obituary: Paul Volcker died on December 8th"
        },
        {
          "title": "Google Stadia Reviewed \u2013 Against The Stream"
        },
        {
          "title": "Managing Supply Chain Risk"
        }
      ]
    }
  }
}
```

</details>

## `offset` を用いたページネーション

結果をページ単位で取得するには、 `offset` と `limit` を併用してレスポンスのサブセットを指定します。

たとえば最初の 10 件を表示するには、 `limit: 10` と `offset: 0` を設定します。次の 10 件を表示する場合は `offset: 10` にします。さらに続けて取得する場合は offset を増やしてください。詳細は [パフォーマンス上の考慮事項](./additional-operators.md#performance-considerations) を参照してください。

 `Get` と `Explore` の各関数は `offset` をサポートしています。

import GraphQLFiltersOffset from '/_includes/code/graphql.filters.offset.mdx';

<GraphQLFiltersOffset/>

<details>
  <summary>想定されるレスポンス</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Through a cloud, brightly - Obituary: Paul Volcker died on December 8th"
        },
        {
          "title": "Google Stadia Reviewed \u2013 Against The Stream"
        },
        {
          "title": "Managing Supply Chain Risk"
        },
        {
          "title": "Playing College Football In Madden"
        },
        {
          "title": "The 50 best albums of 2019, No 3: Billie Eilish \u2013 When We All Fall Asleep, Where Do We Go?"
        }
      ]
    }
  }
}
```

</details>

### パフォーマンス上の考慮事項

ページネーションはカーソル ベース実装ではありません。これには次の影響があります:

- **ページ数が増えるとレスポンス時間とシステム負荷が増大します**。 offset が増えるたびに、各ページ リクエストではコレクション全体に対してより大きな呼び出しが行われます。たとえば `offset` と `limit` が 21–30 の結果を指定する場合、Weaviate は 30 個のオブジェクトを取得し、最初の 20 個を破棄します。次の呼び出しでは 40 個を取得し、最初の 30 個を破棄します。
- **マルチ シャード構成ではリソース要件が増幅されます。** 各シャードがオブジェクト一覧全体を取得し、 offset 以前のオブジェクトを破棄します。たとえば 10 シャード構成で 91–100 の結果を要求すると、Weaviate は 1,000 個（各シャード 100 個）のオブジェクトを取得し、そのうち 990 個を破棄します。
- **取得できるオブジェクト数に制限があります。** 1 回のクエリで返されるのは最大 `QUERY_MAXIMUM_RESULTS` 件です。 `offset` と `limit` の合計が `QUERY_MAXIMUM_RESULTS` を超えると、Weaviate はエラーを返します。上限を変更するには `QUERY_MAXIMUM_RESULTS` 環境変数を編集してください。値を上げる場合は、パフォーマンス問題を避けるため最小限にしてください。
 - **ページネーションはステートフルではありません。** 呼び出し間にデータベース状態が変化すると、ページが結果を取り逃す可能性があります。挿入や削除はオブジェクト数を変化させ、更新はオブジェクトの順序を変える可能性があります。ただし書き込みがなければ、大きな 1 ページで取得しても複数の小さなページで取得しても、全体の結果セットは同一です。


## autocut

autocut 関数は、結果セット内の不連続（ジャンプ）に基づいて結果を制限します。具体的には、ベクトル 距離や検索スコアなどの結果メトリクスにおけるジャンプを検出します。

autocut を使用するには、クエリ内で許容するジャンプ数を指定します。指定したジャンプ数を超えた時点で、それ以降の結果は返されません。

例として、 `nearText` 検索が次の距離値を返すとします。

 `[0.1899, 0.1901, 0.191, 0.21, 0.215, 0.23]`

autocut の返却結果は以下のようになります。

- `autocut: 1`: `[0.1899, 0.1901, 0.191]`
- `autocut: 2`: `[0.1899, 0.1901, 0.191, 0.21, 0.215]`
- `autocut: 3`: `[0.1899, 0.1901, 0.191, 0.21, 0.215, 0.23]`

autocut が利用できる関数:

- `nearXXX`
- `bm25`
- `hybrid`

 `hybrid` 検索で autocut を使用する場合は、 `relativeScoreFusion` ランキング メソッドを指定してください。

autocut はデフォルトで無効です。明示的に無効化するには、ジャンプ数を `0` または負の値に設定します。

autocut と limit フィルターを組み合わせると、autocut は `limit` で制限された最初のオブジェクトのみを対象に評価します。

<!-- TODO: Update with link to blog:
For more `autocut` examples and to learn about the motivation behind this filter, see the [v1.20 release blog post](https://weaviate.io/blog). -->

サンプル クライアント コード:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={AutocutPyCode}
      startMarker="# START Autocut Python"
      endMarker="# END Autocut Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={AutocutPyCodeV3}
      startMarker="# START Autocut Python"
      endMarker="# END Autocut Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v2">
    <FilteredTextBlock
      text={AutocutTSCode}
      startMarker="// START Autocut"
      endMarker="// END Autocut"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={AutocutPyCodeV3}
      startMarker="# START Autocut GraphQL"
      endMarker="# END Autocut GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: 応答</summary>

The output is like this:

<FilteredTextBlock
  text={AutocutPyCodeV3}
  startMarker="# START AutoCutResults"
  endMarker="# END AutoCutResults"
  language="json"
/>

</details>

各機能カテゴリごとのクライアント コード例については、次のページを参照してください。

- [類似度検索での autocut](../../search/similarity.md#limit-result-groups)
- [ `bm25` 検索での autocut](../../search/bm25.md#limit-result-groups)
- [ `hybrid` 検索での autocut](../../search/hybrid.md#limit-result-groups)

## `after` を用いたカーソル

バージョン `v1.18` からは、`after` を使用してオブジェクトを順次取得できます。たとえば、`after` を使ってコレクション内のオブジェクトを一式取得できます。

`after` は、単一シャード構成およびマルチシャード構成のどちらにも対応したカーソルを生成します。

`after` はオブジェクト ID に基づいて機能するため、リストクエリでのみ使用できます。`after` は `where`、`near<Media>`、`bm25`、`hybrid` などの検索や、フィルターとの併用には対応していません。これらの用途では、`offset` と `limit` を用いたページネーションを使用してください。

import GraphQLFiltersAfter from '/_includes/code/graphql.filters.after.mdx';

<GraphQLFiltersAfter/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "id": "00313a4c-4308-30b0-af4a-01773ad1752b"
          },
          "title": "Managing Supply Chain Risk"
        },
        {
          "_additional": {
            "id": "0042b9d0-20e4-334e-8f42-f297c150e8df"
          },
          "title": "Playing College Football In Madden"
        },
        {
          "_additional": {
            "id": "0047c049-cdd6-3f6e-bb89-84ae20b74f49"
          },
          "title": "The 50 best albums of 2019, No 3: Billie Eilish \u2013 When We All Fall Asleep, Where Do We Go?"
        },
        {
          "_additional": {
            "id": "00582185-cbf4-3cd6-8c59-c2d6ec979282"
          },
          "title": "How artificial intelligence is transforming the global battle against human trafficking"
        },
        {
          "_additional": {
            "id": "0061592e-b776-33f9-8109-88a5bd41df78"
          },
          "title": "Masculine, feminist or neutral? The language battle that has split Spain"
        }
      ]
    }
  }
}
```

</details>

## ソート

結果は `text`、`number`、`int` などのプリミティブプロパティでソートできます。 

### ソートの考慮事項

オブジェクト取得時にはソートを適用できますが、**検索オペレーター使用時には利用できません**。検索オペレーターは自動的に [`certainty` または `distance`](./search-operators.md#vector-search-operators) などの要素で結果をランク付けするため、ソートはサポートされていません。

Weaviate のソート実装では大きなメモリスパイクは発生しません。Weaviate はすべてのオブジェクトプロパティをメモリにロードせず、ソート対象のプロパティ値のみを保持します。

ディスク上にソート専用のデータ構造も使用していません。オブジェクトをソートする際、Weaviate はオブジェクトを特定し、該当プロパティを抽出します。これは小規模（数十万〜数百万オブジェクト）では十分に機能しますが、非常に大きなリスト（数億〜数十億オブジェクト）をソートする場合は高コストです。将来的には、この性能制限を克服するためにカラム指向ストレージメカニズムが追加される可能性があります。

### ソート順

#### boolean 値
`false` は `true` より小さい値と見なされます。昇順では `false` が `true` の前に、降順では `true` の後に配置されます。

#### null 値
`null` はすべての非 `null` 値より小さいと見なされます。昇順では `null` が最初に、降順では最後に配置されます。

#### 配列
配列は要素ごとに比較されます。配列の先頭から同じ位置の要素を比較し、ある位置で一方の配列の要素がもう一方より小さい場合、その配列全体が小さいと判断されます。

配列の長さが同じで全要素が等しい場合は等しいと見なされます。一方の配列がもう一方のサブセットである場合、サブセットの方が小さいと見なされます。

例:
- `[1, 2, 3] = [1, 2, 3]`
- `[1, 2, 4] < [1, 3, 4]`
- `[2, 2] > [1, 2, 3, 4]`
- `[1, 2, 3] < [1, 2, 3, 4]`

### ソート API

ソートは 1 つ以上のプロパティで実行できます。最初のプロパティ値が同一の場合、Weaviate は次のプロパティで順序を決定します。

sort 関数には、プロパティとソート順を記述したオブジェクト、またはその配列を渡します。

| パラメーター | 必須 | 型            | 説明 |
|-------------|------|---------------|------|
| `path`      | yes  | `text`        | ソート対象フィールドへのパス。単一要素の配列でフィールド名を含みます。GraphQL ではフィールド名を直接指定できます。 |
| `order`     | クライアントにより異なる | `asc` または `desc` | ソート順。昇順 (デフォルト) または降順。|

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START Sorting Python"
      endMarker="# END Sorting Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START Sorting Python"
      endMarker="# END Sorting Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START Sorting"
      endMarker="// END Sorting"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START Sorting"
      endMarker="// END Sorting"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START Sorting"
      endMarker="// END Sorting"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="Curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START Sorting"
      endMarker="# END Sorting"
      language="shell"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START Sorting GraphQL"
      endMarker="# END Sorting GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>


<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "JeopardyQuestion": [
        {
          "answer": "$5 (Lincoln Memorial in the background)",
          "points": 600,
          "question": "A sculpture by Daniel Chester French can be seen if you look carefully on the back of this current U.S. bill"
        },
        {
          "answer": "(1 of 2) Juneau, Alaska or Augusta, Maine",
          "points": 0,
          "question": "1 of the 2 U.S. state capitals that begin with the names of months"
        },
        {
          "answer": "(1 of 2) Juneau, Alaska or Honolulu, Hawaii",
          "points": 0,
          "question": "One of the 2 state capitals whose names end with the letter \"U\""
        }
      ]
    }
  }
}
```

</details>


#### 複数プロパティによるソート

複数のプロパティでソートするには、`{ path, order }` オブジェクトの配列を sort 関数に渡します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START MultiplePropSorting Python"
      endMarker="# END MultiplePropSorting Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START MultiplePropSorting Python"
      endMarker="# END MultiplePropSorting Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START MultiplePropSorting"
      endMarker="// END MultiplePropSorting"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START MultiplePropSorting"
      endMarker="// END MultiplePropSorting"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START MultiplePropSorting"
      endMarker="// END MultiplePropSorting"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="Curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START MultiplePropSorting"
      endMarker="# END MultiplePropSorting"
      language="shell"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START MultiplePropSorting GraphQL"
      endMarker="# END MultiplePropSorting GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>


#### メタデータプロパティ

メタデータでソートするには、プロパティ名の前にアンダースコアを追加します。

| プロパティ名 | ソート用プロパティ名 |
| :- | :- |
| `id` | `_id` |
| `creationTimeUnix` | `_creationTimeUnix` |
| `lastUpdateTimeUnix` | `_lastUpdateTimeUnix` |

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START AdditionalPropSorting Python"
      endMarker="# END AdditionalPropSorting Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START AdditionalPropSorting Python"
      endMarker="# END AdditionalPropSorting Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START AdditionalPropSorting"
      endMarker="// END AdditionalPropSorting"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START AdditionalPropSorting"
      endMarker="// END AdditionalPropSorting"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START AdditionalPropSorting"
      endMarker="// END AdditionalPropSorting"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="Curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START AdditionalPropSorting"
      endMarker="# END AdditionalPropSorting"
      language="shell"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START AdditionalPropSorting GraphQL"
      endMarker="# END AdditionalPropSorting GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Python クライアント v4 のプロパティ名</summary>

| プロパティ名 | ソート用プロパティ名 |
| :- | :- |
| `uuid` | `_id` |
| `creation_time` | `_creationTimeUnix` |
| `last_update_time` | `_lastUpdateTimeUnix` |

</details>



## グルーピング

類似したコンセプトをまとめるために group を使用できます（ _entity merging_ とも呼ばれます）。意味的に類似したオブジェクトをグループ化する方法は 2 つあり、`closest` と `merge` です。最も近いコンセプトを返すには `type: closest` を設定します。類似したエンティティを 1 つの文字列に結合するには `type: merge` を設定します。

### 変数

| 変数 | 必須 | 型 | 説明 |
| --------- | -------- | ---- | ----------- |
| `type` | yes | `string` | `closest` または `merge` |
| `force` | yes | `float` | 特定の移動に適用する force です。<br/>`0` から `1` の間で指定します。`0` は移動なし、`1` は最大移動です。 |

### 例

import GraphQLFiltersGroup from '/_includes/code/graphql.filters.group.mdx';

<GraphQLFiltersGroup/>

このクエリは `International New York Times`、`The New York Times Company`、`New York Times` の結果をマージします。

グループの中心となるコンセプトである `The New York Times Company` が先頭に表示され、関連する値が括弧内に続きます。

<details>
  <summary>期待されるレスポンス</summary>

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "name": "Fox News"
        },
        {
          "name": "Wired"
        },
        {
          "name": "The New York Times Company (New York Times, International New York Times)"
        },
        {
          "name": "Game Informer"
        },
        {
          "name": "New Yorker"
        },
        {
          "name": "Wall Street Journal"
        },
        {
          "name": "Vogue"
        },
        {
          "name": "The Economist"
        },
        {
          "name": "Financial Times"
        },
        {
          "name": "The Guardian"
        },
        {
          "name": "CNN"
        }
      ]
    }
  }
}
```

</details>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

