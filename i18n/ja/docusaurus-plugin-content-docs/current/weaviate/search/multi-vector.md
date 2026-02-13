---
title: 複数ターゲット ベクトル
sidebar_position: 50
image: og/docs/howto.jpg
# tags: ['how to', 'hybrid search']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCodeV4 from '!!raw-loader!/_includes/code/howto/search.multi-target-v4.py';
import TSCodeV3 from '!!raw-loader!/_includes/code/howto/search.multi-target-v3.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/search.multi-target.go';

:::info `v1.26` で追加
:::

マルチターゲット ベクトル検索では、Weaviate は複数のターゲット ベクトル空間を同時に検索します。これらの結果は、単一の検索結果セットを生成するために["結合戦略"](#available-join-strategies)で統合されます。

ターゲット ベクトルおよびクエリ ベクトルを指定する方法には、次のようなものがあります。

- [ターゲット ベクトル名のみを指定](#specify-target-vector-names-only)
- [クエリ ベクトルを指定](#specify-query-vectors)
- [ターゲット ベクトル名と結合戦略を指定](#specify-target-vector-names-and-join-strategy)
- [生のベクトル距離に重み付け](#weight-raw-vector-distances)
- [正規化ベクトル距離に重み付け](#weight-normalized-vector-distances)

<!-- TODO: Move most of the description/prose to a new "vector.md" page under concepts/search. -->

### 利用可能な結合戦略

- **minimum** (*デフォルト*) すべてのベクトル距離の最小値を使用します。
- **sum** ベクトル距離の合計を使用します。
- **average** ベクトル距離の平均を使用します。
- **manual weights** 各ターゲット ベクトルに対して指定された重みを使い、加重距離の合計を使用します。
- **relative score** 各ターゲット ベクトルに対して指定された重みを使い、正規化された距離の加重合計を使用します。

## ターゲット ベクトル名のみを指定

最低限、名前付きベクトルの配列としてターゲット ベクトル名を指定します。これにより[デフォルトの結合戦略](#available-join-strategies)が使用されます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCodeV4}
  startMarker="# START MultiBasic"
  endMarker="# END MultiBasic"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeV3}
  startMarker="// START MultiBasic"
  endMarker="// END MultiBasic"
  language="js"
/>
</TabItem>
<TabItem value="go" label="Go">
<FilteredTextBlock
  text={GoCode}
  startMarker="// START MultiBasic"
  endMarker="// END MultiBasic"
  language="go"
/>
<details>
  <summary>Complete code</summary>
<FilteredTextBlock
  text={GoCode}
  startMarker="// START BasicFull"
  endMarker="// END BasicFull"
  language="go"
/>
</details>
</TabItem>
</Tabs>

## クエリ ベクトルを指定

`nearVector` 検索に複数のクエリ ベクトルを指定できます。これにより、それぞれのターゲット ベクトルに対して異なるクエリ ベクトルを使用できます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCodeV4}
  startMarker="# START MultiTargetNearVector"
  endMarker="# END MultiTargetNearVector"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeV3}
  startMarker="// START MultiTargetNearVector"
  endMarker="// END MultiTargetNearVector"
  language="ts"
/>
</TabItem>
</Tabs>

また、クエリ ベクトルをベクトルの配列として指定することもできます。配列は、指定されたターゲット ベクトルの順序に従って解釈されます。

### クエリ ベクトル配列の指定

:::info `v1.27` で追加
:::

同じターゲット ベクトルを異なるクエリ ベクトルで複数回指定することも可能です。つまり、同一のターゲット ベクトルに対して複数のクエリ ベクトルを使用できます。

この場合、クエリ ベクトルはベクトルの配列として指定します。ターゲット ベクトルの指定方法はいくつかあります。

#### ターゲット ベクトル名のみ

ターゲット ベクトルを次のように配列で指定できます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCodeV4}
  startMarker="# START MultiTargetMultipleNearVectorsV1"
  endMarker="# END MultiTargetMultipleNearVectorsV1"
  language="python"
/>
</TabItem>

<TabItem value="ts" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeV3}
  startMarker="// START MultiTargetMultipleNearVectorsV1"
  endMarker="// END MultiTargetMultipleNearVectorsV1"
  language="ts"
/>
</TabItem>
</Tabs>
#### ターゲット ベクトルと重み

各ターゲット ベクトルに重みを指定したい場合は、以下の例をご参照ください。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCodeV4}
  startMarker="# START MultiTargetMultipleNearVectorsV2"
  endMarker="# END MultiTargetMultipleNearVectorsV2"
  language="python"
/>
</TabItem>

<TabItem value="ts" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeV3}
  startMarker="// START MultiTargetMultipleNearVectorsV2"
  endMarker="// END MultiTargetMultipleNearVectorsV2"
  language="ts"
/>
</TabItem>
</Tabs>

## ターゲット ベクトル名と結合戦略の指定

ターゲット ベクトルを名前付き配列で指定し、結果セットの結合方法を設定します。

`sum`、`average`、`minimum` の各結合戦略では、戦略名とターゲット ベクトルのみを指定すれば十分です。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCodeV4}
  startMarker="# START MultiTargetWithSimpleJoin"
  endMarker="# END MultiTargetWithSimpleJoin"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeV3}
  startMarker="// START MultiTargetWithSimpleJoin"
  endMarker="// END MultiTargetWithSimpleJoin"
  language="ts"
/>
</TabItem>
</Tabs>

## 生のベクトル距離に重み付け

各ターゲット ベクトルとの **生** 距離に重みを掛け、その合計で検索します。

<details>
  <summary>重み付けの詳細</summary>

クエリ ベクトルとターゲット ベクトル間の各距離に指定した重みを掛け、その結果を合計してオブジェクトごとの合算距離を算出します。検索結果はこの合算距離でソートされます。

</details>

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCodeV4}
  startMarker="# START MultiTargetManualWeights"
  endMarker="# END MultiTargetManualWeights"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeV3}
  startMarker="// START MultiTargetManualWeights"
  endMarker="// END MultiTargetManualWeights"
  language="ts"
/>
</TabItem>
</Tabs>

## 正規化したベクトル距離に重み付け

各ターゲット ベクトルとの **正規化** 距離に重みを掛け、その合計で検索します。

<details>
  <summary>重み付けの詳細</summary>

距離をターゲット ベクトルごとの他結果に対して正規化した後、クエリ ベクトルとの正規化距離に指定した重みを掛けます。得られた重み付き距離を合計してオブジェクトごとの合算距離を算出し、検索結果はこの合算距離でソートされます。

スコアの正規化方法を詳しく知りたい方は、[ハイブリッド相対スコアフュージョン](https://weaviate.io/blog/hybrid-search-fusion-algorithms#relative-score-fusion) に関するブログ記事をご覧ください。
</details>

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCodeV4}
  startMarker="# START MultiTargetRelativeScore"
  endMarker="# END MultiTargetRelativeScore"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeV3}
  startMarker="// START MultiTargetRelativeScore"
  endMarker="// END MultiTargetRelativeScore"
  language="ts"
/>
</TabItem>
</Tabs>

## 関連ページ

- [Weaviate への接続](/weaviate/connections/index.mdx)

## ご質問・フィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>