---
title: フィルター
sidebar_position: 90
image: og/docs/howto.jpg
# tags: ['how to', 'apply conditional filters']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.filters.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/search.filters-v3.py';
import JavaScriptCode from '!!raw-loader!/_includes/code/howto/search.filters.ts';
import JavaScriptCodeLegacy from '!!raw-loader!/_includes/code/howto/search.filters-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/mainpkg/search-filters_test.go';


フィルターを使用すると、指定した条件に基づいて特定のオブジェクトを結果セットに含めたり除外したりできます。<br/>
フィルター演算子の一覧については、[API リファレンス](../api/graphql/filters.md#filter-structure)をご覧ください。

## 単一条件でのフィルター

結果セットを制限するには、クエリに `filter` を追加します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# SingleFilterPython"
      endMarker="# END SingleFilterPython"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# SingleFilterPython"
      endMarker="# END SingleFilterPython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchSingleFilter"
      endMarker="// END searchSingleFilter"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// searchSingleFilter"
      endMarker="// END searchSingleFilter"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START SingleFilter"
      endMarker="// END SingleFilter"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# SingleFilterGraphQL"
      endMarker="# END SingleFilterGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

出力例は以下のとおりです。

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected SingleFilter results"
  endMarker="# END Expected SingleFilter results"
  language="json"
/>

</details>

## 複数条件でのフィルター

2 つ以上の条件でフィルターを行う場合、`And` または `Or` を使用して条件間の関係を定義します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">

  `v4` Python クライアント API では、`any_of` や `all_of`、さらには `&` や `|` 演算子によるフィルターが利用できます。  
  <br/>

  <ul>
    <li><code>any_of</code> または <code>all_of</code> を使用すると、指定したフィルター リストのうち「いずれか」または「すべて」に一致するオブジェクトでフィルタリングできます。</li>
    <li><code>&</code> または <code>|</code> を使用すると、2 つのフィルターを組み合わせてフィルタリングできます。</li>
  </ul>

  <br/>

  #### `&` または `|` を使用したフィルター

  <FilteredTextBlock
    text={PyCode}
    startMarker="# MultipleFiltersAndPython"
    endMarker="# END MultipleFiltersAndPython"
    language="python"
  />

  #### `any of` を使用したフィルター

  <FilteredTextBlock
    text={PyCode}
    startMarker="# MultipleFiltersAnyOfPython"
    endMarker="# END MultipleFiltersAnyOfPython"
    language="python"
  />

  #### `all of` を使用したフィルター

  <FilteredTextBlock
    text={PyCode}
    startMarker="# MultipleFiltersAllOfPython"
    endMarker="# END MultipleFiltersAllOfPython"
    language="python"
  />

  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# MultipleFiltersAndPython"
      endMarker="# END MultipleFiltersAndPython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">

  JS/TS `v3` API では、`Filters.and` と `Filters.or` メソッドを使用してフィルターを組み合わせます。  
  <br/>

  これらのメソッドは可変長引数を取ります（例: `Filters.and(f1, f2, f3, ...)`）。配列（例: `fs`）を引数として渡す場合は、`Filters.and(...fs)` のようにスプレッド構文を使って配列を要素に展開してください。  
  <br/>

  <FilteredTextBlock
    text={JavaScriptCode}
    startMarker="// searchMultipleFiltersAnd"
    endMarker="// END searchMultipleFiltersAnd"
    language="js"
  />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// searchMultipleFiltersAnd"
      endMarker="// END searchMultipleFiltersAnd"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START MultipleFiltersAnd"
      endMarker="// END MultipleFiltersAnd"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# MultipleFiltersAndGraphQL"
      endMarker="# END MultipleFiltersAndGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

出力例は以下のとおりです。

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected MultipleFiltersAnd results"
  endMarker="# END Expected MultipleFiltersAnd results"
  language="json"
/>

</details>
## ネストされたフィルター

フィルターはグループ化してネストできます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# MultipleFiltersNestedPython"
      endMarker="# END MultipleFiltersNestedPython"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# MultipleFiltersNestedPython"
      endMarker="# END MultipleFiltersNestedPython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchMultipleFiltersNested"
      endMarker="// END searchMultipleFiltersNested"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// searchMultipleFiltersNested"
      endMarker="// END searchMultipleFiltersNested"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START MultipleFiltersNested"
      endMarker="// END MultipleFiltersNested"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# MultipleFiltersNestedGraphQL"
      endMarker="# END MultipleFiltersNestedGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例：

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected MultipleFiltersNested results"
  endMarker="# END Expected MultipleFiltersNested results"
  language="json"
/>

</details>

<details>
  <summary>
    追加情報
  </summary>

ネストされたフィルターを作成する手順は次のとおりです。

- 外側の `operator` を `And` または `Or` に設定します。  
- `operands` を追加します。  
- `operand` 式の中で、ネストされたグループを追加するために `operator` を `And` または `Or` に設定します。  
- 必要に応じてネストされたグループに `operands` を追加します。  

</details>

## フィルターと検索オペレーターの組み合わせ

フィルターは `nearXXX`、`hybrid`、および `bm25` などの検索オペレーターと一緒に使用できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# SingleFilterNearTextPython"
      endMarker="# END SingleFilterNearTextPython"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# SingleFilterNearTextPython"
      endMarker="# END SingleFilterNearTextPython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchFilterNearText"
      endMarker="// END searchFilterNearText"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// searchFilterNearText"
      endMarker="// END searchFilterNearText"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START searchFilterNearText"
      endMarker="// END searchFilterNearText"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# SingleFilterNearTextGraphQL"
      endMarker="# END SingleFilterNearTextGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例：

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected SingleFilterNearText results"
  endMarker="# END Expected SingleFilterNearText results"
  language="json"
/>

</details>
## `ContainsAny` フィルター

`ContainsAny` 演算子はテキスト プロパティに対して動作し、入力として値の配列を受け取ります。この演算子は、そのプロパティが配列内の値の **いずれか（1 つ以上）** を含むオブジェクトとマッチします。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# ContainsAnyFilter"
      endMarker="# END ContainsAnyFilter"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# ContainsAnyFilter"
      endMarker="# END ContainsAnyFilter"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// ContainsAnyFilter"
      endMarker="// END ContainsAnyFilter"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// ContainsAnyFilter"
      endMarker="// END ContainsAnyFilter"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START ContainsAnyFilter"
      endMarker="// END ContainsAnyFilter"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GraphQLContainsAnyFilter"
      endMarker="# END GraphQLContainsAnyFilter"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected ContainsAnyFilter results"
  endMarker="# END Expected ContainsAnyFilter results"
  language="json"
/>

</details>

## `ContainsAll` フィルター

`ContainsAll` 演算子はテキスト プロパティに対して動作し、入力として値の配列を受け取ります。この演算子は、そのプロパティが配列内の **すべて** の値を含むオブジェクトとマッチします。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# ContainsAllFilter"
      endMarker="# END ContainsAllFilter"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# ContainsAllFilter"
      endMarker="# END ContainsAllFilter"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// ContainsAllFilter"
      endMarker="// END ContainsAllFilter"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// ContainsAllFilter"
      endMarker="// END ContainsAllFilter"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START ContainsAllFilter"
      endMarker="// END ContainsAllFilter"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GraphQLContainsAllFilter"
      endMarker="# END GraphQLContainsAllFilter"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected ContainsAllFilter results"
  endMarker="# END Expected ContainsAllFilter results"
  language="json"
/>

</details>
## `ContainsAny` と `ContainsAll` を用いたバッチ削除

バッチ削除を行いたい場合は、[オブジェクトの削除](../manage-objects/delete.mdx#containsany--containsall) を参照してください。

## 部分一致でのテキストフィルター

オブジェクト プロパティが `text`、またはオブジェクト ID など `text` に類似したデータ型の場合、部分一致でフィルタリングするには `Like` を使用します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# LikeFilterPython"
      endMarker="# END LikeFilterPython"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# LikeFilterPython"
      endMarker="# END LikeFilterPython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchLikeFilter"
      endMarker="// END searchLikeFilter"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// searchLikeFilter"
      endMarker="// END searchLikeFilter"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START LikeFilter"
      endMarker="// END LikeFilter"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# LikeFilterGraphQL"
      endMarker="# END LikeFilterGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力は次のようになります。

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected LikeFilter results"
  endMarker="# END Expected LikeFilter results"
  language="json"
/>

</details>

<details>
  <summary>
    追加情報
  </summary>

  `*` ワイルドカード演算子は 0 文字以上に一致します。`?` 演算子はちょうど 1 文字に一致します。
  <br/>

  現在、`Like` フィルターはワイルドカード文字（`?` と `*`）をリテラル文字として一致させることはできません（[詳細はこちら](../api/graphql/filters.md#wildcard-literal-matches-with-like)）。
</details>

## クロスリファレンスを用いたフィルター

import CrossReferencePerformanceNote from '/_includes/cross-reference-performance-note.mdx';

<CrossReferencePerformanceNote />

クロスリファレンス先オブジェクトのプロパティでフィルターするには、コレクション名をフィルターに追加します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# CrossReferencePython"
      endMarker="# END CrossReferencePython"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# CrossReferencePython"
      endMarker="# END CrossReferencePython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchCrossReference"
      endMarker="// END searchCrossReference"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// searchSingleFilter"
      endMarker="// END searchSingleFilter"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START CrossReference"
      endMarker="// END CrossReference"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# CrossReferenceGraphQL"
      endMarker="# END CrossReferenceGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力は次のようになります。

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected CrossReferencePython results"
  endMarker="# END Expected CrossReferencePython results"
  language="json"
/>

</details>
## ジオ座標によるフィルター

import GeoLimitations from '/_includes/geo-limitations.mdx';

<GeoLimitations/>

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterbyGeolocation"
      endMarker="# END FilterbyGeolocation"
      language="python"
    />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START FilterbyGeolocation"
      endMarker="# END FilterbyGeolocation"
      language="pyv3"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterbyGeolocation"
      endMarker="// END FilterbyGeolocation"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterbyGeolocation"
      endMarker="// END FilterbyGeolocation"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterbyGeolocation"
      endMarker="// END FilterbyGeolocation"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START GQLFilterbyGeolocation"
      endMarker="# END GQLFilterbyGeolocation"
      language="graphql"
    />
  </TabItem>
</Tabs>

## `DATE` データ型によるフィルター

`DATE` データ型のプロパティでフィルターするには、日付／時刻を RFC 3339 タイムスタンプとして指定するか、 Python `datetime` オブジェクトなどクライアントライブラリで使用できる型を指定します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterByDateDatatype"
      endMarker="# END FilterByDateDatatype"
      language="python"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterByDateDatatype"
      endMarker="// END FilterByDateDatatype"
      language="js"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterByDateDatatype"
      endMarker="// END FilterByDateDatatype"
      language="gonew"
    />
  </TabItem>
</Tabs>

## メタデータによるフィルター

フィルターは、オブジェクト ID、プロパティの長さ、タイムスタンプなどのメタデータプロパティにも適用できます。

完全な一覧は、[API リファレンス：Filters](../api/graphql/filters.md#special-cases) を参照してください。

### オブジェクト `id` によるフィルター

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterById"
      endMarker="# END FilterById"
      language="python"
    />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START FilterById"
      endMarker="# END FilterById"
      language="pyv3"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// filterById"
      endMarker="// END filterById"
      language="js"
    />
  </TabItem>
 <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// filterById"
      endMarker="// END filterById"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterById"
      endMarker="// END FilterById"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GQLFilterById"
      endMarker="# END GQLFilterById"
      language="graphql"
    />
  </TabItem>
</Tabs>
### オブジェクトの timestamp によるフィルター

このフィルターを使用するには、[プロパティ timestamp](../config-refs/indexing/inverted-index.mdx#indextimestamps) を [インデックスに登録](../manage-collections/collection-operations.mdx#set-inverted-index-parameters) しておく必要があります。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterByTimestamp"
      endMarker="# END FilterByTimestamp"
      language="python"
    />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START FilterByTimestamp"
      endMarker="# END FilterByTimestamp"
      language="pyv3"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterByTimestamp"
      endMarker="// END FilterByTimestamp"
      language="js"
    />
  </TabItem>

   <TabItem value="js2" label="JS/TS Client ">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// FilterByTimestamp"
      endMarker="// END FilterByTimestamp"
      language="js"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterByTimestamp"
      endMarker="// END FilterByTimestamp"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GQLFilterByTimestamp"
      endMarker="# END GQLFilterByTimestamp"
      language="graphql"
    />
  </TabItem>
</Tabs>

### オブジェクト length プロパティによるフィルター

このフィルターを使用するには、[プロパティ length](../config-refs/indexing/inverted-index.mdx#indexpropertylength) を [インデックスに登録](../manage-collections/collection-operations.mdx#set-inverted-index-parameters) しておく必要があります。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterByPropertyLength"
      endMarker="# END FilterByPropertyLength"
      language="python"
    />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START FilterByPropertyLength"
      endMarker="# END FilterByPropertyLength"
      language="pyv3"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterByPropertyLength"
      endMarker="// END FilterByPropertyLength"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={JavaScriptCodeLegacy}
      startMarker="// FilterByPropertyLength"
      endMarker="// END FilterByPropertyLength"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterByPropertyLength"
      endMarker="// END FilterByPropertyLength"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GQLFilterByPropertyLength"
      endMarker="# END GQLFilterByPropertyLength"
      language="graphql"
    />
  </TabItem>
</Tabs>

### オブジェクト null 状態によるフィルター

このフィルターを使用するには、[プロパティ null state](../config-refs/indexing/inverted-index.mdx#indexnullstate) を [インデックスに登録](../manage-collections/collection-operations.mdx#set-inverted-index-parameters) しておく必要があります。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterByPropertyNullState"
      endMarker="# END FilterByPropertyNullState"
      language="python"
    />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START FilterByPropertyNullState"
      endMarker="# END FilterByPropertyNullState"
      language="pyv3"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterByPropertyNullState"
      endMarker="// END FilterByPropertyNullState"
      language="js"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterByPropertyNullState"
      endMarker="// END FilterByPropertyNullState"
      language="gonew"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GQLFilterByPropertyNullState"
      endMarker="# END GQLFilterByPropertyNullState"
      language="graphql"
    />
  </TabItem>
</Tabs>

## フィルターの考慮事項

### トークン化

import TokenizationNote from '/_includes/tokenization.mdx'

<TokenizationNote />

### フィルターのパフォーマンス向上

フィルターの実行速度が遅い場合は、データセットのサイズを制限するために `limit` パラメーターや追加の `where` 演算子の利用をご検討ください。

## フィルター演算子の一覧

フィルター演算子の一覧については、[参照ページ](../api/graphql/filters.md#filter-structure)をご覧ください。

## 関連ページ

- [Weaviate への接続](/weaviate/connections/index.mdx)
- [API リファレンス: フィルター](../api/graphql/filters.md)

## ご質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>