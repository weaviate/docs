---
title: ハイブリッド検索
sidebar_position: 40
image: og/docs/howto.jpg
# tags: ['how to', 'hybrid search']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.hybrid.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/search.hybrid-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.hybrid.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/search.hybrid-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/mainpkg/search-hybrid_test.go';
import GQLCode from '!!raw-loader!/_includes/code/howto/search.hybrid.gql.py';

`Hybrid` 検索は、ベクトル検索とキーワード（ BM25F ）検索の結果セットを融合し、両方の結果を組み合わせます。

[融合手法](#change-the-fusion-method) と [相対ウェイト](#balance-keyword-and-vector-search) は設定で調整できます。

## 基本的なハイブリッド検索

ベクトル検索とキーワード検索の結果を結合します。検索には 1 つのクエリ文字列を使用します。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridBasicPython"
  endMarker="# END HybridBasicPython"
  language="python"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridBasicPython"
  endMarker="# END HybridBasicPython"
  language="pyv3"
/>
</TabItem>

<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridBasic"
  endMarker="// END searchHybridBasic"
  language="js"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// searchHybridBasic"
  endMarker="// END searchHybridBasic"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START Basic"
    endMarker="// END Basic"
    language="go"
  />
</TabItem>

<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridBasicGraphQL"
  endMarker="# END HybridBasicGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridBasic results"
  endMarker="# END Expected HybridBasic results"
  language="json"
/>

</details>

## 名前付きベクトル

:::info `v1.24` で追加
:::

[名前付きベクトル](../config-refs/collections.mdx#named-vectors) を持つコレクションでハイブリッド検索を行う場合は、`target` ベクトルを指定する必要があります。Weaviate はクエリベクトルを使用して、指定されたターゲットベクトル空間を検索します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# NamedVectorHybridPython"
      endMarker="# END NamedVectorHybridPython"
      language="python"
    />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# NamedVectorHybridPython"
      endMarker="# END NamedVectorHybridPython"
      language="pyv3"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// NamedVectorHybrid"
      endMarker="// END NamedVectorHybrid"
      language="ts"
    />
  </TabItem>
  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// NamedVectorHybrid"
      endMarker="// END NamedVectorHybrid"
      language="tsv2"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# NamedVectorHybridGraphQL"
      endMarker="# END NamedVectorHybridGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# START Expected NamedVectorNearText results"
  endMarker="# END Expected NamedVectorNearText results"
  language="json"
/>

</details>
## 検索結果の説明

オブジェクトのランキングを確認するには、クエリで `explain score` フィールドを設定します。検索ランキングはオブジェクトのメタデータの一部です。 Weaviate はこのスコアを利用して検索結果を並べ替えます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithScorePython"
  endMarker="# END HybridWithScorePython"
  language="python"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithScorePython"
  endMarker="# END HybridWithScorePython"
  language="pyv3"
/>
</TabItem>

<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithScore"
  endMarker="// END searchHybridWithScore"
  language="js"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// searchHybridWithScore"
  endMarker="// END searchHybridWithScore"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithScore"
      endMarker="// END WithScore"
      language="go"
    />
  </TabItem>

<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithScoreGraphQL"
  endMarker="# END HybridWithScoreGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>例のレスポンス</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithScore results"
  endMarker="# END Expected HybridWithScore results"
  language="json"
/>

</details>

## キーワード検索とベクトル検索のバランス

ハイブリッド検索の結果は、キーワード成分またはベクトル成分のいずれかを優先できます。キーワード成分とベクトル成分の相対的な重みを変更するには、クエリで `alpha` 値を設定します。

- `alpha` が `1` の場合、純粋なベクトル検索になります。
- `alpha` が `0` の場合、純粋なキーワード検索になります。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithAlphaPython"
  endMarker="# END HybridWithAlphaPython"
  language="python"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithAlphaPython"
  endMarker="# END HybridWithAlphaPython"
  language="pyv3"
/>
</TabItem>

<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithAlpha"
  endMarker="// END searchHybridWithAlpha"
  language="js"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// searchHybridWithAlpha"
  endMarker="// END searchHybridWithAlpha"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithAlpha"
      endMarker="// END WithAlpha"
      language="go"
    />
</TabItem>

<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithAlphaGraphQL"
  endMarker="# END HybridWithAlphaGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>例のレスポンス</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithAlpha results"
  endMarker="# END Expected HybridWithAlpha results"
  language="json"
/>

</details>
## 融合手法の変更

`Relative Score Fusion` は `v1.24` からデフォルトの融合手法です。

- 検索ランキングではなく、キーワード検索と ベクトル 検索の相対スコアを使用する場合は `Relative Score Fusion` を使用してください。  
- `hybrid` 演算子と [`autocut`](../api/graphql/additional-operators.md#autocut) を併用する場合も `Relative Score Fusion` を使用してください。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithFusionTypePython"
  endMarker="# END HybridWithFusionTypePython"
  language="python"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithFusionTypePython"
  endMarker="# END HybridWithFusionTypePython"
  language="pyv3"
/>
</TabItem>

<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithFusionType"
  endMarker="// END searchHybridWithFusionType"
  language="ts"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// searchHybridWithFusionType"
  endMarker="// END searchHybridWithFusionType"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithFusionType"
      endMarker="// END WithFusionType"
      language="go"
    />
</TabItem>

<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithFusionTypeGraphQL"
  endMarker="# END HybridWithFusionTypeGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithFusionType results"
  endMarker="# END Expected HybridWithFusionType results"
  language="json"
/>

</details>

<details>
  <summary>
    追加情報
  </summary>

融合手法の詳細な解説については、[このブログ記事](https://weaviate.io/blog/hybrid-search-fusion-algorithms) と [このリファレンスページ](../api/graphql/search-operators.md#variables-2) を参照してください。

</details>

## キーワード検索演算子

:::info `v1.31` で追加
:::

Keyword (BM25) 検索演算子では、オブジェクトが返されるために含まれている必要があるクエリ [トークン](#tokenization) の最小数を指定します。選択肢は `and` または `or`（デフォルト）です。

### `or`

`or` 演算子では、検索語のトークンのうち `minimumOrTokensMatch` 以上を含むオブジェクトが返されます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START HybridWithBM25OperatorOrWithMin"
      endMarker="# END HybridWithBM25OperatorOrWithMin"
      language="python"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={GQLCode}
      startMarker="# START HybridWithBM25OperatorOrWithMin"
      endMarker="# END HybridWithBM25OperatorOrWithMin"
      language="python"
    />
  </TabItem>
</Tabs>

### `and`

`and` 演算子では、検索語のすべてのトークンを含むオブジェクトが返されます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START HybridWithBM25OperatorAnd"
      endMarker="# END HybridWithBM25OperatorAnd"
      language="python"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={GQLCode}
      startMarker="# START HybridWithBM25OperatorAnd"
      endMarker="# END HybridWithBM25OperatorAnd"
      language="python"
    />
  </TabItem>
</Tabs>
## キーワード検索プロパティの指定

:::info `v1.19.0` で追加
:::

ハイブリッド検索におけるキーワード検索部分では、オブジェクトのプロパティの一部だけを検索対象にできます。これは ベクトル 検索部分には影響しません。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithPropertiesPython"
  endMarker="# END HybridWithPropertiesPython"
  language="python"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithPropertiesPython"
  endMarker="# END HybridWithPropertiesPython"
  language="pyv3"
/>
</TabItem>

<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithProperties"
  endMarker="// END searchHybridWithProperties"
  language="js"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// searchHybridWithProperties"
  endMarker="// END searchHybridWithProperties"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithProperties"
      endMarker="// END WithProperties"
      language="go"
    />
</TabItem>

<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithPropertiesGraphQL"
  endMarker="# END HybridWithPropertiesGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

以下のような出力になります:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithProperties results"
  endMarker="# END Expected HybridWithProperties results"
  language="json"
/>

</details>

## プロパティ値の重み付け設定

オブジェクトの `properties` に対して、キーワード検索時の相対的な重要度を指定できます。値が大きいほど、そのプロパティの検索スコアへの寄与が高まります。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithPropertyWeightingPython"
  endMarker="# END HybridWithPropertyWeightingPython"
  language="python"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithPropertyWeightingPython"
  endMarker="# END HybridWithPropertyWeightingPython"
  language="pyv3"
/>
</TabItem>

<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithPropertyWeighting"
  endMarker="// END searchHybridWithPropertyWeighting"
  language="js"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// searchHybridWithPropertyWeighting"
  endMarker="// END searchHybridWithPropertyWeighting"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithPropertyWeighting"
      endMarker="// END WithPropertyWeighting"
      language="go"
    />
</TabItem>

<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithPropertyWeightingGraphQL"
  endMarker="# END HybridWithPropertyWeightingGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

以下のような出力になります:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithPropertyWeighting results"
  endMarker="# END Expected HybridWithPropertyWeighting results"
  language="json"
/>

</details>
## 検索ベクトルの指定

ハイブリッド検索のベクトル要素は、クエリ 文字列またはクエリ ベクトルを使用できます。クエリ 文字列の代わりにクエリ ベクトルを指定する場合は、クエリ内でベクトル検索用のクエリ ベクトルと、キーワード検索用のクエリ 文字列の両方を渡してください。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithVectorPython"
  endMarker="# END HybridWithVectorPython"
  language="python"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithVectorPython"
  endMarker="# END HybridWithVectorPython"
  language="pyv3"
/>
</TabItem>

<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithVector"
  endMarker="// END searchHybridWithVector"
  language="js"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// searchHybridWithVector"
  endMarker="// END searchHybridWithVector"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithVector"
      endMarker="// END WithVector"
      language="go"
    />
</TabItem>

<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithVectorGraphQL"
  endMarker="# END HybridWithVectorGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithVector results"
  endMarker="# END Expected HybridWithVector results"
  language="json"
/>

</details>

## ベクトル検索パラメーター

:::info `v1.25` で追加
ハイブリッド閾値（`max_vector_distance`）は後の `v1.26.3` で導入されました。
:::

[ベクトル類似検索](/weaviate/search/similarity) では、`group by` や `move to` / `move away` など、[near text](/weaviate/search/similarity.md#search-with-text) や [near vector](/weaviate/search/similarity.md#search-with-a-vector) と同様のパラメーターを指定できます。ベクトル検索における同等の距離しきい値は、`max vector distance` パラメーターで設定できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VectorParametersPython"
      endMarker="# END VectorParametersPython"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# VectorSimilarityGraphQL"
      endMarker="# END VectorSimilarityGraphQL"
      language="pyv3"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// VectorSimilarity"
      endMarker="// END VectorSimilarity"
      language="js"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected VectorSimilarityGraphQL results"
  endMarker="# END VectorSimilarityGraphQL results"
  language="json"
/>

</details>

## ハイブリッド検索のしきい値

:::info Added in `v1.25`
:::

利用可能なしきい値は `max vector distance` のみで、これはベクトル検索コンポーネントに許容される最大距離を設定します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VectorSimilarityPython"
      endMarker="# END VectorSimilarityPython"
      language="python"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">

<TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START VectorSimilarityThreshold"
      endMarker="// END VectorSimilarityThreshold"
      language="ts"
    />
  </TabItem>
  </TabItem>
</Tabs>

## 結果のグループ化

:::info Added in `v1.25`
:::

検索結果をグループ化するための条件を定義します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START HybridGroupByPy4"
      endMarker="# END HybridGroupByPy4"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START HybridGroupBy"
      endMarker="// END HybridGroupBy"
      language="ts"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例のレスポンス</summary>

レスポンスは次のようになります。

```
'Jeopardy!'
'Double Jeopardy!'
```

</details>

## `limit` と `offset`

`limit` を使用して、返されるオブジェクト数の上限を固定します。

必要に応じて `offset` を使用して結果をページネーションできます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START limit Python"
      endMarker="# END limit Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START limit Python"
      endMarker="# END limit Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START limit"
      endMarker="// END limit"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START limit"
      endMarker="// END limit"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START limit"
      endMarker="// END limit"
      language="go"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START limit GraphQL"
      endMarker="# END limit GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>
## 結果グループの制限

クエリからの距離が類似しているグループに結果を制限するには、[`autocut`](../api/graphql/additional-operators.md#autocut) フィルターを使用します。`autocut` をハイブリッド検索と併用する場合は、ランキング手法として `Relative Score Fusion` を指定してください。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START autocut Python"
      endMarker="# END autocut Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START autocut Python"
      endMarker="# END autocut Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START autocut"
      endMarker="// END autocut"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START autocut"
      endMarker="// END autocut"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START autocut"
      endMarker="// END autocut"
      language="go"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START autocut GraphQL"
      endMarker="# END autocut GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# START Expected autocut results"
  endMarker="# END Expected autocut results"
  language="json"
/>

</details>

## 結果のフィルタリング

検索結果をさらに絞り込むには、[`filter`](../api/graphql/filters.md) を使用します。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithFilterPython"
  endMarker="# END HybridWithFilterPython"
  language="python"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithFilterPython"
  endMarker="# END HybridWithFilterPython"
  language="pyv3"
/>
</TabItem>

<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithFilter"
  endMarker="// END searchHybridWithFilter"
  language="js"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// searchHybridWithFilter"
  endMarker="// END searchHybridWithFilter"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithFilter"
      endMarker="// END WithFilter"
      language="go"
    />
  </TabItem>

<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# HybridWithFilterGraphQL"
  endMarker="# END HybridWithFilterGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithFilter results"
  endMarker="# END Expected HybridWithFilter results"
  language="json"
/>

</details>
### トークナイゼーション

import TokenizationNote from '/_includes/tokenization.mdx'

<TokenizationNote />

## 関連ページ

- [Weaviate への接続](/weaviate/connections/index.mdx)
- [API リファレンス: 検索オペレーター # Hybrid](../api/graphql/search-operators.md#hybrid)
- [Weaviate Academy: トークナイゼーション](../../academy/py/tokenization/index.md)
- [ハイブリッド フュージョン アルゴリズム](https://weaviate.io/blog/hybrid-search-fusion-algorithms) について
- チュートリアルについては [クエリ](/weaviate/tutorials/query.md) を参照してください
- GraphQL API を使用した検索については [GraphQL API](../api/graphql/get.md) を参照してください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>