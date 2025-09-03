---
title: データの集計
sidebar_position: 85
image: og/docs/howto.jpg
# tags: ['how to', 'aggregate data']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.aggregate.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/search.aggregate-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.aggregate.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/search.aggregate-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/mainpkg/search-aggregation_test.go';


`Aggregate` クエリは結果セットを処理して計算結果を返します。`aggregate` クエリは、オブジェクトのグループや結果セット全体に対して使用します。

<details>
  <summary>
    追加情報
  </summary>

`Aggregate` クエリを実行するには、次の項目を指定します。

- 検索対象となるコレクション
- 1 つ以上の集計対象プロパティ。例:
  
   - メタプロパティ
   - オブジェクトプロパティ
   - `groupedBy` プロパティ

- 選択した各プロパティについて、少なくとも 1 つのサブプロパティを選択

詳細については、[Aggregate](/weaviate/api/graphql/aggregate) を参照してください。

</details>

## `count` メタプロパティの取得

クエリに一致したオブジェクトの数を返します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# MetaCount Python"
      endMarker="# END MetaCount Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# MetaCount Python"
      endMarker="# END MetaCount Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// MetaCount TS"
      endMarker="// END MetaCount TS"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// MetaCount TS"
      endMarker="// END MetaCount TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START MetaCount"
      endMarker="// END MetaCount"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# MetaCount GraphQL"
      endMarker="# END MetaCount GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

  出力例は次のとおりです:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# MetaCount Expected Results"
    endMarker="# END MetaCount Expected Results"
    language="json"
  />
</details>

## `text` プロパティの集計

この例では、`question` プロパティの出現頻度をカウントします。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# TextProp Python"
      endMarker="# END TextProp Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# TextProp Python"
      endMarker="# END TextProp Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// TextProp TS"
      endMarker="// END TextProp TS"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// TextProp TS"
      endMarker="// END TextProp TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START TextProp"
      endMarker="// END TextProp"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# TextProp GraphQL"
      endMarker="# END TextProp GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

  出力例は次のとおりです:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# TextProp Expected Results"
    endMarker="# END TextProp Expected Results"
    language="json"
  />
</details>
## `int` プロパティの集計

この例では、`points` プロパティを合計します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# IntProp Python"
      endMarker="# END IntProp Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# IntProp Python"
      endMarker="# END IntProp Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// IntProp TS"
      endMarker="// END IntProp TS"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// IntProp TS"
      endMarker="// END IntProp TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START IntProp"
      endMarker="// END IntProp"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# IntProp GraphQL"
      endMarker="# END IntProp GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

  出力は次のようになります:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# IntProp Expected Results"
    endMarker="# END IntProp Expected Results"
    language="json"
  />
</details>

## `groupedBy` プロパティの集計

結果をグループ化するには、クエリで `groupBy` を使用します。

各グループの集計データを取得するには、`groupedBy` プロパティを使用します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# groupBy Python"
      endMarker="# END groupBy Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# groupBy Python"
      endMarker="# END groupBy Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// groupBy TS"
      endMarker="// END groupBy TS"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// groupBy TS"
      endMarker="// END groupBy TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START groupBy"
      endMarker="// END groupBy"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# groupBy GraphQL"
      endMarker="# END groupBy GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>


<details>
  <summary>レスポンス例</summary>

  出力は次のようになります:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# groupBy Expected Results"
    endMarker="# END groupBy Expected Results"
    language="json"
  />
</details>

import GroupbyLimitations from '/_includes/groupby-limitations.mdx';

<GroupbyLimitations />
## `similarity search` を用いた Aggregate

`Aggregate` は [similarity search](./similarity.md) オペレーター（ `Near` オペレーターの一種）と組み合わせて使用できます。

<!-- Make sure to [limit your search results](../api/graphql/aggregate.md#limiting-the-search-space).<br/> -->
集約するオブジェクトの最大数を指定するには、 `objectLimit` を使用します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# nearTextWithLimit Python"
      endMarker="# END nearTextWithLimit Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# nearTextWithLimit Python"
      endMarker="# END nearTextWithLimit Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// nearTextWithLimit TS"
      endMarker="// END nearTextWithLimit TS"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// nearTextWithLimit TS"
      endMarker="// END nearTextWithLimit TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START nearTextWithLimit"
      endMarker="// END nearTextWithLimit"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# nearTextWithLimit GraphQL"
      endMarker="# END nearTextWithLimit GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

  The output is like this:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# nearTextWithLimit Expected Results"
    endMarker="# END nearTextWithLimit Expected Results"
    language="json"
  />
</details>

### 類似度 `distance` の設定

`Aggregate` は [similarity search](./similarity.md) オペレーター（ `Near` オペレーターの一種）と組み合わせて使用できます。

<!-- Make sure to [limit your search results](../api/graphql/aggregate.md#limiting-the-search-space).<br/> -->
オブジェクトの類似度を指定するには、 `distance` を使用します。

<!-- If you use `Aggregate` with a [similarity search](./similarity.md) operator (one of the `nearXXX` operators), [limit your search results](../api/graphql/aggregate.md#limiting-the-search-space). To specify how similar the objects should be, use the `distance` operator. -->

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# nearTextWithDistance Python"
      endMarker="# END nearTextWithDistance Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# nearTextWithDistance Python"
      endMarker="# END nearTextWithDistance Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// nearTextWithDistance TS"
      endMarker="// END nearTextWithDistance TS"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// nearTextWithDistance TS"
      endMarker="// END nearTextWithDistance TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START nearTextWithDistance"
      endMarker="// END nearTextWithDistance"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# nearTextWithDistance GraphQL"
      endMarker="# END nearTextWithDistance GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

  The output is like this:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# nearTextWithDistance Expected Results"
    endMarker="# END nearTextWithDistance Expected Results"
    language="json"
  />
</details>
## `hybrid search` を用いた集計

`Aggregate` を [ハイブリッド検索](./hybrid.md) 演算子と組み合わせて使用できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# HybridExample"
      endMarker="# END HybridExample"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# HybridExample"
      endMarker="# END HybridExample"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// HybridExample"
      endMarker="// END HybridExample"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// nearTextWithLimit TS"
      endMarker="// END nearTextWithLimit TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START nearTextWithLimit"
      endMarker="// END nearTextWithLimit"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GraphQLHybridExample"
      endMarker="# END GraphQLHybridExample"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

  出力例:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# ResultsHybridExample"
    endMarker="# END ResultsHybridExample"
    language="json"
  />
</details>

## 結果のフィルタリング

より具体的な結果を得るには、 `filter` を使用して検索範囲を絞り込みます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# whereFilter Python"
      endMarker="# END whereFilter Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# whereFilter Python"
      endMarker="# END whereFilter Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// whereFilter TS"
      endMarker="// END whereFilter TS"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// whereFilter TS"
      endMarker="// END whereFilter TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START whereFilter"
      endMarker="// END whereFilter"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# whereFilter GraphQL"
      endMarker="# END whereFilter GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

  出力例:

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# whereFilter Expected Results"
    endMarker="# END whereFilter Expected Results"
    language="json"
  />

</details>
## 関連ページ

- [Weaviate への接続](/weaviate/connections/index.mdx)
- [API リファレンス: GraphQL: Aggregate](../api/graphql/aggregate.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>