---
title: マルチ ベクトル エンコーディング
sidebar_position: 30
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/manage-data.collections.py';
import TSCode from '!!raw-loader!/\_includes/code/howto/manage-data.collections.ts';


マルチ ベクトル 埋め込みは、ドキュメントや画像などの単一データ オブジェクトを 1 本の ベクトル ではなく、複数の ベクトル の集合で表現します。これにより、各 ベクトル がオブジェクトの異なる部分を表すことで、より細かな意味情報を捉えられます。しかし、その分各アイテムに複数の ベクトル を保持するため、メモリ使用量が大幅に増加します。

そのため、ストレージ コストを抑えクエリ レイテンシを改善するには、マルチ ベクトル システムにおける圧縮技術が特に重要になります。**エンコーディング** は、マルチ ベクトル 全体を新しいコンパクトな単一 ベクトル 表現へと変換し、意味的な関係性を維持しようとします。

## MUVERA エンコーディング

** MUVERA **（ _Multi-Vector Retrieval via Fixed Dimensional Encodings_ ）は、マルチ ベクトル 埋め込みを固定次元の単一 ベクトル にエンコードすることで、メモリ使用量の増加と処理速度の低下という課題に取り組みます。これにより、従来のマルチ ベクトル 手法と比べてメモリ消費を抑えられます。

<!-- TODO[g-despot]: Add link to blog post: Read more about it in this blog post. -->

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START MultiValueVectorMuvera"
      endMarker="# END MultiValueVectorMuvera"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START MultiValueVectorMuvera"
      endMarker="// END MultiValueVectorMuvera"
      language="ts"
    />
  </TabItem>
  <TabItem value="java" label="Java">

```java
// Java support coming soon
```

 </TabItem>
  <TabItem value="go" label="Go">

```go
// Go support coming soon
```

</TabItem>
</Tabs>

MUVERA でエンコードされた ベクトル の最終次元数は  
`repetition * 2^ksim * dprojections` になります。これらのパラメータを慎重にチューニングし、メモリ使用量と検索精度のバランスを取ることが重要です。

以下のパラメータで MUVERA を微調整できます。

- **`ksim`** (`int`):  
  SimHash パーティショニング関数のためにサンプリングされるガウシアン ベクトル の本数です。この値がハッシュのビット数、ひいては空間分割ステップで作成されるバケット数を決定します。総バケット数は $2^{ksim}$ となります。`ksim` を大きくすると埋め込み空間がより細かく分割され、近似精度が向上する可能性がありますが、中間エンコード ベクトル の次元数も増加します。

- **`dprojections`** (`int`):  
  次元削減ステップでランダム線形射影後のサブ ベクトル の次元数です。バケットごとに集約された ベクトル はランダム行列を用いて `dprojections` 次元に射影されます。`dprojections` を小さくすると、最終的な固定次元エンコーディングの総次元数を抑えられるためメモリ消費を削減できますが、情報損失と検索精度低下を招く可能性があります。

- **`repetition`** (`int`):  
  空間分割と次元削減ステップを繰り返す回数です。繰り返しによってマルチ ベクトル 埋め込みの異なる側面を捉え、最終的な固定次元エンコーディングの堅牢性と精度を高められます。各繰り返しで得られた単一 ベクトル は連結されます。`repetition` を増やすと最終エンコーディングの次元数は増加しますが、元のマルチ ベクトル 類似度をより良く近似できる場合があります。

:::note Quantization
量子化（Quantization）は、マルチ ベクトル 埋め込みに対する圧縮技術としても利用できます。値を低精度で近似することで各 ベクトル のメモリ フットプリントを削減します。単一 ベクトル と同様に、マルチ ベクトル でも [PQ](./pq-compression.md)、[BQ](./bq-compression.md)、[RQ](./rq-compression.md)、[SQ](./sq-compression.md) の量子化をサポートしています。
:::

## 参考リソース

- [操作ガイド: コレクションの管理](../../manage-collections/vector-config.mdx#define-multi-vector-embeddings-eg-colbert-colpali)
- [概念: ベクトル 量子化](../../concepts/vector-quantization.md)

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

