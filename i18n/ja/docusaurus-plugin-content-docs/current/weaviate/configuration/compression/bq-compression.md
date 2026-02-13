---
title: バイナリ量子化 (BQ)
sidebar_position: 6
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'bq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure.bq-compression.py';
import PyCodeV3 from '!!raw-loader!/\_includes/code/howto/configure.bq-compression-v3.py';
import TSCode from '!!raw-loader!/\_includes/code/howto/configure.bq-compression.ts';
import TSCodeBQOptions from '!!raw-loader!/\_includes/code/howto/configure.bq-compression.options.ts';
import TSCodeLegacy from '!!raw-loader!/\_includes/code/howto/configure.bq-compression-v2.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.bq_test.go';
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/bq-compression.java';

:::info Added in `v1.23`
BQ は `v1.23` 以降で [`flat` index](/weaviate/concepts/indexing/vector-index.md#flat-index) タイプに対応し、`v1.24` からは [`hnsw` index](/weaviate/config-refs/indexing/vector-index.mdx#hnsw-index) タイプにも対応しています。
:::

バイナリ量子化 (BQ) は、ベクトルのサイズを削減できるベクトル圧縮手法です。

BQ を使用するには、以下のように有効化し、コレクションにデータを追加します。

<details>
  <summary>追加情報</summary>

- [インデックス タイプを設定する方法](../../manage-collections/vector-config.mdx#set-vector-index-type)

</details>

## 新規コレクションでの圧縮の有効化

コレクション作成時に、コレクション定義で BQ を有効化できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableBQ"
        endMarker="# END EnableBQ"
        language="py"
      />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
      <FilteredTextBlock
        text={PyCodeV3}
        startMarker="# START EnableBQ"
        endMarker="# END EnableBQ"
        language="pyv3"
      />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START EnableBQ"
        endMarker="// END EnableBQ"
        language="ts"
      />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
      <FilteredTextBlock
        text={TSCodeLegacy}
        startMarker="// START EnableBQ"
        endMarker="// END EnableBQ"
        language="tsv2"
      />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START EnableBQ"
      endMarker="// END EnableBQ"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START EnableBQ"
      endMarker="// END EnableBQ"
      language="java"
    />
  </TabItem>
</Tabs>

## 既存コレクションでの圧縮の有効化

:::info Added in `v1.31`
コレクション作成後に BQ 圧縮を有効化する機能は Weaviate `v1.31` で追加されました。
:::

既存のコレクションでも、コレクション定義を更新することで BQ を有効化できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START UpdateSchema"
        endMarker="# END UpdateSchema"
        language="py"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START UpdateSchema"
        endMarker="// END UpdateSchema"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START UpdateSchema"
      endMarker="// END UpdateSchema"
      language="java"
    />
  </TabItem>
</Tabs>



## BQ パラメーター

BQ 圧縮には、`vectorIndexConfig` 内で次のパラメーターを使用できます:

import BQParameters from '/\_includes/configuration/bq-compression-parameters.mdx' ;

<BQParameters />

例:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START BQWithOptions"
        endMarker="# END BQWithOptions"
        language="py"
      />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
      <FilteredTextBlock
        text={PyCodeV3}
        startMarker="# START BQWithOptions"
        endMarker="# END BQWithOptions"
        language="pyv3"
      />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
      <FilteredTextBlock
        text={TSCodeBQOptions}
        startMarker="// START BQWithOptions"
        endMarker="// END BQWithOptions"
        language="ts"
      />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
      <FilteredTextBlock
        text={TSCodeLegacy}
        startMarker="// START BQWithOptions"
        endMarker="// END BQWithOptions"
        language="tsv2"
      />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BQWithOptions"
      endMarker="// END BQWithOptions"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START BQWithOptions"
      endMarker="// END BQWithOptions"
      language="java"
    />
  </TabItem>
</Tabs>

## 追加の考慮事項

### 複数 ベクトル 埋め込み（名前付き ベクトル）

import NamedVectorCompress from '/\_includes/named-vector-compress.mdx';

<NamedVectorCompress />

### マルチ ベクトル 埋め込み（ColBERT、ColPali など）

import MultiVectorCompress from '/\_includes/multi-vector-compress.mdx';

<MultiVectorCompress />

## 追加リソース

- [スターターガイド: 圧縮](/docs/weaviate/starter-guides/managing-resources/compression.mdx)
- [リファレンス: ベクトル インデックス](/weaviate/config-refs/indexing/vector-index.mdx)
- [コンセプト: ベクトル 量子化](/docs/weaviate/concepts/vector-quantization.md)
- [コンセプト: ベクトル インデックス](/weaviate/concepts/indexing/vector-index.md)

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

