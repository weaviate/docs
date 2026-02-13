---
title: リランキング
sidebar_position: 75
image: og/docs/howto.jpg
# tags: ['how to', 'rank']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.rerank.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/search.rerank-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.rerank.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/search.rerank-v2.ts';
import SimilarityPyCode from '!!raw-loader!/_includes/code/howto/search.similarity.py';
import SimilarityPyCodeV3 from '!!raw-loader!/_includes/code/howto/search.similarity-v3.py';
import SimilarityTSCode from '!!raw-loader!/_includes/code/howto/search.similarity.ts';
import SimilarityTSCodeLegacy from '!!raw-loader!/_includes/code/howto/search.similarity-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/mainpkg/search-rerank_test.go';



リランキングモジュールは、異なる基準や別の（たとえば、よりコストの高い）アルゴリズムに基づいて検索結果セットを並べ替えます。

<details>
  <summary>
    追加情報
  </summary>

 **リランキングの設定**

検索結果をリランキングするには、コレクションに対してリランカーの [モデル統合](../model-providers/index.md) を有効にします。

1 つのコレクションに複数のリランカーを設定できます。複数の `reranker` モジュールが有効になっている場合は、スキーマの `moduleConfig` セクションで使用したいモジュールを指定してください。

</details>

## 名前付きベクトル

:::info Added in `v1.24`
:::

[名前付きベクトル](../config-refs/collections.mdx#named-vectors) を設定したコレクションでベクトルベースの検索を行う場合、クエリに `target` ベクトル名を含める必要があります。これにより Weaviate は、クエリベクトルと比較する正しいベクトルを見つけることができます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={SimilarityPyCode}
      startMarker="# NamedVectorNearTextPython"
      endMarker="# END NamedVectorNearTextPython"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={SimilarityPyCodeV3}
      startMarker="# NamedVectorNearTextPython"
      endMarker="# END NamedVectorNearTextPython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={SimilarityTSCode}
      startMarker="// NamedVectorNearText"
      endMarker="// END NamedVectorNearText"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={SimilarityTSCodeLegacy}
      startMarker="// NamedVectorNearText"
      endMarker="// END NamedVectorNearText"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START NamedVectorNearText"
      endMarker="// END NamedVectorNearText"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={SimilarityPyCodeV3}
      startMarker="# NamedVectorNearTextGraphql"
      endMarker="# END NamedVectorNearTextGraphql"
      language="graphql"
    />
  </TabItem>
</Tabs>

## ベクトル検索結果のリランキング

ベクトル検索の結果をリランキングするには、ソート対象となるオブジェクトプロパティを設定します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START nearTextRerank Python"
      endMarker="# END nearTextRerank Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START nearTextRerank Python"
      endMarker="# END nearTextRerank Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RerankNearText"
      endMarker="// END RerankNearText"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START RerankNearText"
      endMarker="// END RerankNearText"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START RerankNearText"
      endMarker="// END RerankNearText"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START nearTextRerank GraphQL"
      endMarker="# END nearTextRerank GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例のレスポンス</summary>

レスポンスの例は次のようになります。

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# START Expected nearTextRerank results"
    endMarker="# END Expected nearTextRerank results"
    language="json"
  />

</details>

## キーワード検索結果のリランク

キーワード検索の結果をリランクするには、ソート対象となるオブジェクト プロパティを設定します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START bm25Rerank Python"
      endMarker="# END bm25Rerank Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START bm25Rerank Python"
      endMarker="# END bm25Rerank Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START bm25Rerank"
      endMarker="// END bm25Rerank"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START bm25Rerank"
      endMarker="// END bm25Rerank"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START bm25Rerank"
      endMarker="// END bm25Rerank"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START bm25Rerank GraphQL"
      endMarker="# END bm25Rerank GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

レスポンスは次のようになります。

  <FilteredTextBlock
    text={PyCodeV3}
    startMarker="# START Expected bm25Rerank results"
    endMarker="# END Expected bm25Rerank results"
    language="json"
  />

</details>

## 関連ページ

- [Weaviate への接続](/weaviate/connections/index.mdx)
- [API リファレンス: GraphQL - 追加プロパティ](../api/graphql/additional-properties.md#rerank)
- [API リファレンス: GraphQL - ソート](/weaviate/api/graphql/additional-operators#sorting-api)
- [コンセプト: リランク](../concepts/reranking.md)
- [モデルプロバイダー連携](../model-providers/index.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>