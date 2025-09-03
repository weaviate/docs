---
title: 検索パターンと基本
sidebar_position: 10
image: og/docs/howto.jpg
# tags: ['how to', 'semantic search']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.basics.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/search.basics-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.basics.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/search.basics-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/mainpkg/search-basic_test.go';
import JavaCode from '!!raw-loader!/_includes/code/howto/java/src/test/java/io/weaviate/docs/search/BasicSearchTest.java';

Weaviate では、[ ベクトル 類似度検索](./similarity.md)、[ キーワード検索](./bm25.md)、または両者を組み合わせた [ ハイブリッド検索](./hybrid.md) を使用してデータをクエリできます。返却するオブジェクトの [ プロパティ ](#specify-object-properties) や [ メタデータ ](#retrieve-metadata-values) を制御できます。

このページでは、検索を始めるための基本的な構文を紹介します。

## オブジェクト一覧

パラメーターを指定せずにオブジェクトを取得できます。この場合、オブジェクトは UUID の昇順で返されます。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# BasicGetPython"
      endMarker="# END BasicGetPython"
      language="py"
    />
  </TabItem>

<TabItem value="py3" label="Python Client v3">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# BasicGetPython"
  endMarker="# END BasicGetPython"
  language="pyv3"
/>

</TabItem>
<TabItem value="js" label="JS/TS Client v3">

<FilteredTextBlock
  text={TSCode}
  startMarker="// BasicGetJS"
  endMarker="// END BasicGetJS"
  language="js"
/>

</TabItem>

<TabItem value="js2" label="JS/TS Client v2">

<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// BasicGetJS"
  endMarker="// END BasicGetJS"
  language="tsv2"
/>

</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START BasicGet"
    endMarker="// END BasicGet"
    language="go"
  />
</TabItem>

<TabItem value="java" label="Java">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START BasicGet"
    endMarker="// END BasicGet"
    language="java"
  />
</TabItem>

<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# BasicGetGraphQL"
  endMarker="# END BasicGetGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// BasicGet Expected Results"
  endMarker="// END BasicGet Expected Results"
  language="json"
/>

</details>

<details>
  <summary>追加情報</summary>

  クエリで返したい情報を指定します。オブジェクトのプロパティ、オブジェクト ID、メタデータを返すことができます。

</details>

## 返却オブジェクトの `limit` 指定

`limit` を使用して返却するオブジェクトの最大数を固定で設定します。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetWithLimitPython"
  endMarker="# END GetWithLimitPython"
  language="py"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithLimitPython"
  endMarker="# END GetWithLimitPython"
  language="pyv3"
/>

</TabItem>
<TabItem value="js" label="JS/TS Client v3">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithLimitJS"
  endMarker="// END GetWithLimitJS"
  language="js"
/>

</TabItem>

<TabItem value="js2" label="JS/TS Client v2">

<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// GetWithLimitJS"
  endMarker="// END GetWithLimitJS"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START GetWithLimit"
    endMarker="// END GetWithLimit"
    language="go"
  />
</TabItem>

<TabItem value="java" label="Java">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetWithLimit"
    endMarker="// END GetWithLimit"
    language="java"
  />
</TabItem>

<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithLimitGraphQL"
  endMarker="# END GetWithLimitGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetWithLimit Expected Results"
  endMarker="// END GetWithLimit Expected Results"
  language="json"
/>

</details>
## `limit` と `offset` を使用したページネーション

結果セットの途中から開始するには `offset` を指定します。`offset` から始めて返すオブジェクトの数を `limit` で設定します。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetWithLimitOffsetPython"
  endMarker="# END GetWithLimitOffsetPython"
  language="py"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithLimitOffsetPython"
  endMarker="# END GetWithLimitOffsetPython"
  language="pyv3"
/>

</TabItem>
<TabItem value="js" label="JS/TS Client v3">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithLimitOffsetJS"
  endMarker="// END GetWithLimitOffsetJS"
  language="js"
/>

</TabItem>

<TabItem value="js2" label="JS/TS Client v2">

<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// GetWithLimitOffsetJS"
  endMarker="// END GetWithLimitOffsetJS"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START GetWithOffset"
    endMarker="// END GetWithOffset"
    language="go"
  />
</TabItem>

<TabItem value="java" label="Java">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetWithOffset"
    endMarker="// END GetWithOffset"
    language="java"
  />
</TabItem>

<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithLimitOffsetGraphQL"
  endMarker="# END GetWithLimitOffsetGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetWithLimitOffset Expected Results"
  endMarker="// END GetWithLimitOffset Expected Results"
  language="json"
/>

</details>

データベース全体をページネートする場合は、 `offset` と `limit` の代わりに [カーソル](../manage-objects/read-all-objects.mdx) を使用してください。


## オブジェクト `properties` の指定

返却するオブジェクトのプロパティを指定できます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetPropertiesPython"
  endMarker="# END GetPropertiesPython"
  language="py"
/>
</TabItem>


<TabItem value="py3" label="Python Client v3">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetPropertiesPython"
  endMarker="# END GetPropertiesPython"
  language="pyv3"
/>

</TabItem>
<TabItem value="js" label="JS/TS Client v3">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetPropertiesJS"
  endMarker="// END GetPropertiesJS"
  language="js"
/>

</TabItem>

<TabItem value="js2" label="JS/TS Client v2">

<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// GetPropertiesJS"
  endMarker="// END GetPropertiesJS"
  language="tsv2"
/>

</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START GetProperties"
    endMarker="// END GetProperties"
    language="go"
  />
</TabItem>

<TabItem value="java" label="Java">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetProperties"
    endMarker="// END GetProperties"
    language="java"
  />
</TabItem>

<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetPropertiesGraphQL"
  endMarker="# END GetPropertiesGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetProperties Expected Results"
  endMarker="// END GetProperties Expected Results"
  language="json"
/>

</details>
## オブジェクトの `vector` を取得

オブジェクトの `vector` を取得できます。（[名前付きベクトル](../config-refs/collections.mdx#named-vectors) を使用している場合にも適用されます。）

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetObjectVectorPython"
  endMarker="# END GetObjectVectorPython"
  language="py"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetObjectVectorPython"
  endMarker="# END GetObjectVectorPython"
  language="pyv3"
/>

</TabItem>
<TabItem value="js" label="JS/TS Client v3">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetObjectVectorJS"
  endMarker="// END GetObjectVectorJS"
  language="js"
/>

</TabItem>

<TabItem value="js2" label="JS/TS Client v2">

<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// GetObjectVectorJS"
  endMarker="// END GetObjectVectorJS"
  language="tsv2"
/>

</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START GetObjectVector"
    endMarker="// END GetObjectVector"
    language="go"
  />
</TabItem>

<TabItem value="java" label="Java">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetObjectVector"
    endMarker="// END GetObjectVector"
    language="java"
  />
</TabItem>

<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetObjectVectorGraphQL"
  endMarker="# END GetObjectVectorGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例は次のとおりです。

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetObjectVector Expected Results"
  endMarker="// END GetObjectVector Expected Results"
  language="json"
/>

</details>

## オブジェクトの `id` を取得

オブジェクトの `id` （ uuid ）を取得できます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">

<FilteredTextBlock
  text={PyCode}
  startMarker="# GetObjectIdPython"
  endMarker="# END GetObjectIdPython"
  language="py"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetObjectIdPython"
  endMarker="# END GetObjectIdPython"
  language="pyv3"
/>

</TabItem>
<TabItem value="js" label="JS/TS Client v3">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetObjectIdJS"
  endMarker="// END GetObjectIdJS"
  language="js"
/>

</TabItem>

<TabItem value="js2" label="JS/TS Client v2">

<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// GetObjectIdJS"
  endMarker="// END GetObjectIdJS"
  language="tsv2"
/>

</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START GetObjectId"
    endMarker="// END GetObjectId"
    language="go"
  />
</TabItem>

<TabItem value="java" label="Java">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetObjectId"
    endMarker="// END GetObjectId"
    language="java"
  />
</TabItem>

<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetObjectIdGraphQL"
  endMarker="# END GetObjectIdGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例は次のとおりです。

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetObjectId Expected Results"
  endMarker="// END GetObjectId Expected Results"
  language="json"
/>

</details>
## クロス参照プロパティの取得

import CrossReferencePerformanceNote from '/_includes/cross-reference-performance-note.mdx';

<CrossReferencePerformanceNote />

クロス参照オブジェクトからプロパティを取得するには、次を指定します:

- クロス参照プロパティ
- 対象のクロス参照コレクション
- 取得するプロパティ

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetWithCrossRefsPython"
  endMarker="# END GetWithCrossRefsPython"
  language="py"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithCrossRefsPython"
  endMarker="# END GetWithCrossRefsPython"
  language="pyv3"
/>

</TabItem>
<TabItem value="js" label="JS/TS Client v3">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithCrossRefs"
  endMarker="// END GetWithCrossRefs"
  language="js"
/>

</TabItem>

<TabItem value="js2" label="JS/TS Client v2">

<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// GetWithCrossRefs"
  endMarker="// END GetWithCrossRefs"
  language="tsv2"
/>

</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START GetWithCrossRefs"
    endMarker="// END GetWithCrossRefs"
    language="go"
  />
</TabItem>

<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithCrossRefsGraphQL"
  endMarker="# END GetWithCrossRefsGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

出力例は次のとおりです:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithCrossRefs Expected Results"
  endMarker="# END GetWithCrossRefs Expected Results"
  language="json"
/>

</details>

## メタデータ値の取得

返却するメタデータフィールドを指定できます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetWithMetadataPython"
  endMarker="# END GetWithMetadataPython"
  language="py"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithMetadataPython"
  endMarker="# END GetWithMetadataPython"
  language="pyv3"
/>

</TabItem>
<TabItem value="js" label="JS/TS Client v3">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithMetadataJS"
  endMarker="// END GetWithMetadataJS"
  language="js"
/>

</TabItem>

<TabItem value="js2" label="JS/TS Client v2">

<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// GetWithMetadataJS"
  endMarker="// END GetWithMetadataJS"
  language="tsv2"
/>

</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START GetWithMetadata"
    endMarker="// END GetWithMetadata"
    language="go"
  />
</TabItem>

<TabItem value="java" label="Java">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetWithMetadata"
    endMarker="// END GetWithMetadata"
    language="java"
  />
</TabItem>

<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithMetadataGraphQL"
  endMarker="# END GetWithMetadataGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

メタデータフィールドの一覧については、[ GraphQL: 追加プロパティ](../api/graphql/additional-properties.md) を参照してください。
## マルチテナンシー

[マルチテナンシー](../concepts/data.md#multi-tenancy) を有効にしている場合、すべてのクエリで tenant パラメーターを指定してください。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# MultiTenancy"
  endMarker="# END MultiTenancy"
  language="py"
/>
</TabItem>

<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# MultiTenancy"
  endMarker="# END MultiTenancy"
  language="pyv3"
 />
</TabItem>

<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCode}
  startMarker="// MultiTenancy"
  endMarker="// END MultiTenancy"
  language="js"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLegacy}
  startMarker="// MultiTenancy"
  endMarker="// END MultiTenancy"
  language="tsv2"
/>
</TabItem>

<TabItem value="go" label="Go">
  <FilteredTextBlock
    text={GoCode}
    startMarker="// START MultiTenancy"
    endMarker="// END MultiTenancy"
    language="go"
  />
</TabItem>

<TabItem value="java" label="Java">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START MultiTenancy"
    endMarker="// END MultiTenancy"
    language="java"
  />
</TabItem>


</Tabs>

## レプリケーション

レプリケーションを有効にしたコレクションでは、クエリで整合性レベルを指定できます。これは CRUD クエリと検索の両方に適用されます。

import QueryReplication from '/_includes/code/replication.get.object.by.id.mdx';

<QueryReplication/>

## 関連ページ

- [Weaviate に接続する](/weaviate/connections)
- [API リファレンス: GraphQL: Get](../api/graphql/get.md)
- チュートリアルについては、[クエリ](/weaviate/tutorials/query.md) をご覧ください
- GraphQL API を使用した検索については、[GraphQL API](../api/graphql/get.md) をご覧ください

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>