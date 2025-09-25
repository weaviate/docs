---
title: 画像検索
sidebar_position: 25
image: og/docs/howto.jpg
# tags: ['how to', 'image']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.image.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/search.image-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.image.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/search.image-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/mainpkg/search-image_test.go';
import JavaCode from '!!raw-loader!/_includes/code/howto/java/src/test/java/io/weaviate/docs/search/ImageSearchTest.java';

`Image` 検索は **検索入力として画像を使用** し、 ベクトル 類似検索を実行します。

<details>
  <summary>
    追加情報
  </summary>

**画像検索の設定**

画像を検索入力として使用するには、コレクションに画像 ベクトライザー 統合を設定します。利用可能な統合の一覧については、モデルプロバイダー統合のページを参照してください [利用可能な統合一覧](../model-providers/index.md)。

</details>

<!-- ## Named vectors

:::info Added in `v1.24`
::: -->

<!-- Any vector-based search on collections with [named vectors](../config-refs/collections.mdx#named-vectors) configured must include a `target` vector name in the query. This allows Weaviate to find the correct vector to compare with the query vector. -->

## ローカル画像パスによる検索

`Near Image` オペレーターを使用して画像検索を実行します。<br/>
クエリ画像がファイルとして保存されている場合、クライアントライブラリを利用してファイル名で検索できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ImageFileSearch"
      endMarker="# END ImageFileSearch"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START ImageFileSearch"
      endMarker="# END ImageFileSearch"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">

  <FilteredTextBlock
    text={TSCode}
    startMarker="// START ImageFileSearch"
    endMarker="// END ImageFileSearch"
    language="ts"
  />

  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">

  > まだ利用できません。 [この機能要望](https://github.com/weaviate/typescript-client/issues/65) への投票をお願いします。以下に DIY コードを示します。

  <FilteredTextBlock
    text={TSCodeLegacy}
    startMarker="// START ImageFileSearch"
    endMarker="// END ImageFileSearch"
    language="ts"
  />
  </TabItem>


  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START ImageFileSearch"
      endMarker="// END ImageFileSearch"
      language="gonew"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START ImageFileSearch"
      endMarker="// END ImageFileSearch"
      language="java"
    />
  </TabItem>

</Tabs>

<details>
  <summary>レスポンス例</summary>

  <FilteredTextBlock
    text={TSCode}
    startMarker="# START Expected base64 results"
    endMarker="# END Expected base64 results"
    language="json"
  />

</details>


## base64 表現による検索

画像の base64 表現を使用して検索できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START search with base64"
      endMarker="# END search with base64"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START search with base64"
      endMarker="# END search with base64"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START search with base64"
      endMarker="// END search with base64"
      language="ts"
    />
  </TabItem>

   <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START search with base64"
      endMarker="// END search with base64"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START search with base64"
      endMarker="// END search with base64"
      language="gonew"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START search with base64"
      endMarker="// END search with base64"
      language="java"
    />
  </TabItem>
</Tabs>


<details>
  <summary>レスポンス例</summary>

  <FilteredTextBlock
    text={PyCode}
    startMarker="# START Expected base64 results"
    endMarker="# END Expected base64 results"
    language="json"
  />

</details>
## オンライン画像の base64 表現の作成

オンライン画像の base64 表現を生成し、[上記](#by-the-base64-representation) のとおり類似検索の入力として使用できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START helper base64 functions"
      endMarker="# END helper base64 functions"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START helper base64 functions"
      endMarker="// END helper base64 functions"
      language="js"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START helper base64 functions"
      endMarker="// END helper base64 functions"
      language="gonew"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START helper base64 functions"
      endMarker="// END helper base64 functions"
      language="java"
    />
  </TabItem>

</Tabs>

## 他のオペレーターとの組み合わせ

`Near Image` 検索は、 filter や limit などの他のオペレーターと同様に、他のすべてのオペレーターと組み合わせて使用できます。

詳細については、[`similarity search`](./similarity.md) ページをご覧ください。

## 関連ページ

- [Weaviate に接続](/weaviate/connections/index.mdx)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>