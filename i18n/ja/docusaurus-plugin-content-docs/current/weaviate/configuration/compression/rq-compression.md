---
title: 回転量子化 (RQ)
sidebar_position: 25
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'rq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure-rq/rq-compression-v4.py';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.rq_test.go';
import TSCode from '!!raw-loader!/\_includes/code/howto/configure-rq/rq-compression-v3.ts';
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/rq-compression.java';

:::caution 技術プレビュー

回転量子化 ( RQ ) は **`v1.32`** で **技術プレビュー** として追加されました。<br/><br/>
これは、この機能がまだ開発中であり、将来のリリースで変更される可能性があることを意味します。互換性が破壊される変更が含まれる場合もあります。  
**現時点では本番環境での使用は推奨しません。**

:::

[**回転量子化 ( RQ )**](../../concepts/vector-quantization.md#rotational-quantization) は、4 倍の圧縮率でほぼ完璧なリコール ( ほとんどのデータセットで 98-99% ) を維持する、高速で学習不要なベクトル圧縮手法です。

:::note HNSW のみ
RQ は現在、フラットインデックス型をサポートしていません。
:::

## 新しいコレクションでの圧縮の有効化

RQ はコレクション作成時に、コレクション定義を通じて有効化できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableRQ"
        endMarker="# END EnableRQ"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JS/TS Client v3">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START EnableRQ"
        endMarker="// END EnableRQ"
        language="ts"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START EnableRQ"
        endMarker="// END EnableRQ"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START EnableRQ"
      endMarker="// END EnableRQ"
      language="java"
    />
  </TabItem>
</Tabs>

## 既存コレクションでの圧縮の有効化

RQ は、既存のコレクションに対してもコレクション定義を更新することで有効化できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START UpdateSchema"
        endMarker="# END UpdateSchema"
        language="py"
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
    <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START UpdateSchema"
        endMarker="// END UpdateSchema"
        language="go"
      />
  </TabItem>
</Tabs>

## RQ パラメーター

RQ を調整するには、以下の量子化およびベクトルインデックスパラメーターを使用します。

import RQParameters from '/\_includes/configuration/rq-compression-parameters.mdx' ;

<RQParameters />

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START RQWithOptions"
        endMarker="# END RQWithOptions"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JS/TS Client v3">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START RQWithOptions"
        endMarker="// END RQWithOptions"
        language="ts"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START RQWithOptions"
        endMarker="// END RQWithOptions"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START RQWithOptions"
      endMarker="// END RQWithOptions"
      language="java"
    />
  </TabItem>
</Tabs>

<!--
:::note Maximum query performance

For maximum query performance with minimal recall impact, consider setting `rescoreLimit` to 0. This disables rescoring and can significantly boost QPS (queries per second) while only causing a very minor drop in recall.

:::
-->



## 追加の考慮事項

### 複数 ベクトル エンベディング（名前付き ベクトル）

import NamedVectorCompress from '/\_includes/named-vector-compress.mdx';

<NamedVectorCompress />

### マルチベクトル エンベディング (ColBERT、ColPali など)

import MultiVectorCompress from '/\_includes/multi-vector-compress.mdx';

<MultiVectorCompress />

:::note マルチベクトルのパフォーマンス
RQ はマルチベクトル エンベディングをサポートしています。各トークン ベクトルは 64 次元の倍数に切り上げられるため、非常に短いベクトルでは 4x 未満の圧縮になる場合があります。これは技術的な制限であり、将来のバージョンで改善される可能性があります。
:::

## 追加リソース

- [スターター ガイド: 圧縮](/docs/weaviate/starter-guides/managing-resources/compression.mdx)
- [リファレンス: ベクトル インデックス](/weaviate/config-refs/indexing/vector-index.mdx)
- [コンセプト: ベクトル 量子化](/docs/weaviate/concepts/vector-quantization.md)
- [コンセプト: ベクトル インデックス](/weaviate/concepts/indexing/vector-index.md)

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

