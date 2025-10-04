---
title: スカラー量子化 (SQ)
sidebar_position: 27
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'sq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression-v4.py';
import PyCodeV3 from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression-v3.py';
import TSCode from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression-v3.ts';
import TSCodeSQOptions from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression.options-v3.ts';
import TSCodeLegacy from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression-v2.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.sq_test.go';
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/sq-compression.java';

:::info Added in v1.26.0

:::

[スカラー量子化 (SQ)](/weaviate/concepts/vector-quantization#scalar-quantization) は、ベクトルのサイズを削減できるベクトル圧縮手法です。

SQ を使用するには、コレクション定義で有効化してからデータをコレクションに追加します。

## 新規コレクションでの圧縮の有効化

SQ はコレクション作成時に、コレクション定義を通じて有効化できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableSQ"
        endMarker="# END EnableSQ"
        language="py"
      />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
      <FilteredTextBlock
        text={PyCodeV3}
        startMarker="# START EnableSQ"
        endMarker="# END EnableSQ"
        language="pyv3"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START EnableSQ"
        endMarker="// END EnableSQ"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START EnableSQ"
      endMarker="// END EnableSQ"
      language="java"
    />
  </TabItem>
</Tabs>

## 既存コレクションでの圧縮の有効化

:::info Added in `v1.31`
コレクション作成後に SQ 圧縮を有効化できる機能は Weaviate `v1.31` で追加されました。
:::

既存のコレクションでも、コレクション定義を更新することで SQ を有効化できます。

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

## SQ パラメーター

SQ を調整するには、これらの `vectorIndexConfig` パラメーターを設定します。

import SQParameters from '/\_includes/configuration/sq-compression-parameters.mdx' ;

<SQParameters />

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START SQWithOptions"
        endMarker="# END SQWithOptions"
        language="py"
      />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
      <FilteredTextBlock
        text={PyCodeV3}
        startMarker="# START SQWithOptions"
        endMarker="# END SQWithOptions"
        language="pyv3"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START SQWithOptions"
        endMarker="// END SQWithOptions"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START SQWithOptions"
      endMarker="// END SQWithOptions"
      language="java"
    />
  </TabItem>
</Tabs>



## 追加の考慮事項

### 複数ベクトル埋め込み（名前付きベクトル）

import NamedVectorCompress from '/\_includes/named-vector-compress.mdx';

<NamedVectorCompress />

### マルチベクトル埋め込み（ ColBERT、 ColPali など）

import MultiVectorCompress from '/\_includes/multi-vector-compress.mdx';

<MultiVectorCompress />

## さらに学ぶ

- [スターターガイド: 圧縮](/docs/weaviate/starter-guides/managing-resources/compression.mdx)
- [リファレンス: ベクトル インデックス](/weaviate/config-refs/indexing/vector-index.mdx)
- [概念: ベクトル 量子化](/docs/weaviate/concepts/vector-quantization.md)
- [概念: ベクトル インデックス](/weaviate/concepts/indexing/vector-index.md)

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

