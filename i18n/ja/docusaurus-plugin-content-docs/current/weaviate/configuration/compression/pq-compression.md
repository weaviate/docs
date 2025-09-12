---
title: 直積量子化 (PQ)
sidebar_position: 5
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'pq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure.pq-compression.py';
import PyCodeV3 from '!!raw-loader!/\_includes/code/howto/configure.pq-compression-v3.py';
import TSCodeAutoPQ from '!!raw-loader!/\_includes/code/howto/configure.pq-compression.autopq.ts';
import TSCodeManualPQ from '!!raw-loader!/\_includes/code/howto/configure.pq-compression.manual.ts';
import TSCodeLegacy from '!!raw-loader!/\_includes/code/howto/configure.pq-compression-v2.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.pq_test.go';
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/pq-compression.java';

:::note
v1.23 から、AutoPQ は新しいコレクションでの PQ 設定を簡素化します。
:::

import PQOverview from '/\_includes/configuration/pq-compression/overview-text.mdx' ;

<PQOverview />

import PQTradeoffs from '/\_includes/configuration/pq-compression/tradeoffs.mdx' ;

<PQTradeoffs />

HNSW を設定するには、[設定: ベクトル インデックス](/weaviate/config-refs/indexing/vector-index.mdx) を参照してください。

## PQ 圧縮の有効化

PQ はコレクション単位で設定します。PQ 圧縮を有効にする方法は 2 つあります。

- [AutoPQ を使用して PQ 圧縮を有効化](./pq-compression.md#configure-autopq)
- [手動で PQ 圧縮を有効化](./pq-compression.md#manually-configure-pq)

## AutoPQ の設定

:::info v1.23.0 で追加
:::

新しいコレクションでは AutoPQ を使用してください。AutoPQ は、コレクションのサイズに基づき PQ のトレーニング ステップのトリガーを自動化します。

### 1. 環境変数の設定

AutoPQ には非同期インデックス作成が必要です。

- **オープンソース版 Weaviate 利用者**: AutoPQ を有効にするには、環境変数 `ASYNC_INDEXING=true` を設定し、Weaviate インスタンスを再起動します。  
- [**Weaviate Cloud (WCD)**](https://console.weaviate.cloud/) 利用者: WCD コンソールで非同期インデックス作成を有効にし、Weaviate インスタンスを再起動します。

### 2. PQ の設定

コレクションで PQ を設定するには、[PQ パラメーター](./pq-compression.md#pq-parameters) を使用します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
     <FilteredTextBlock
       text={PyCode}
       startMarker="# START CollectionWithAutoPQ"
       endMarker="# END CollectionWithAutoPQ"
       language="py"
     />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
     <FilteredTextBlock
       text={PyCodeV3}
       startMarker="# START CollectionWithAutoPQ"
       endMarker="# END CollectionWithAutoPQ"
       language="pyv3"
     />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
     <FilteredTextBlock
       text={TSCodeAutoPQ}
       startMarker="// START CollectionWithAutoPQ"
       endMarker="// END CollectionWithAutoPQ"
       language="ts"
     />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
     <FilteredTextBlock
       text={TSCodeLegacy}
       startMarker="// START CollectionWithAutoPQ"
       endMarker="// END CollectionWithAutoPQ"
       language="tsv2"
     />
  </TabItem>

</Tabs>

### 3. データのロード

データをロードします。トレーニング用の初期データをロードする必要はありません。

AutoPQ は、オブジェクト数がトレーニング上限に達した時点で PQ コードブックを作成します。デフォルトでは、トレーニング上限はシャードあたり 100,000 オブジェクトです。

## PQ を手動で設定

既存のコレクションに対して PQ を手動で有効にできます。PQ を有効にすると、Weaviate は PQ コードブックをトレーニングします。PQ を有効にする前に、トレーニング セットがシャードあたり 100,000 オブジェクトあることを確認してください。

PQ を手動で有効にするには、次の手順に従います。

- フェーズ 1: コードブックの作成

  - [PQ なしでコレクションを定義](./pq-compression.md#1-define-a-collection-without-pq)  
  - [トレーニング データをロード](./pq-compression.md#2-load-training-data)  
  - [PQ を有効化し、コードブックを作成](./pq-compression.md#3-enable-pq-and-create-the-codebook)

- フェーズ 2: 残りのデータをロード

  - [残りのデータをロード](./pq-compression.md#4-load-the-rest-of-your-data)

:::tip トレーニング セットの推奨サイズ
シャードあたり 10,000 〜 100,000 オブジェクトを推奨します。
:::

PQ が有効になったとき、そしてベクトル圧縮が完了したときに、Weaviate は[メッセージをログに出力](#check-the-system-logs)します。初期トレーニング ステップが完了するまでは、残りのデータをインポートしないでください。

以上が、PQ を手動で有効にする手順です。



### 1. PQ なしのコレクション定義

[コレクションを作成](../../manage-collections/collection-operations.mdx#create-a-collection) し、量子化器を指定しません。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
     <FilteredTextBlock
       text={PyCode}
       startMarker="# START InitialSchema"
       endMarker="# END InitialSchema"
       language="py"
     />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
     <FilteredTextBlock
       text={PyCodeV3}
       startMarker="# START InitialSchema"
       endMarker="# END InitialSchema"
       language="pyv3"
     />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
     <FilteredTextBlock
       text={TSCodeManualPQ}
       startMarker="// START InitClassDef"
       endMarker="// END InitClassDef"
       language="ts"
     />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
     <FilteredTextBlock
       text={TSCodeLegacy}
       startMarker="// START InitClassDef"
       endMarker="// END InitClassDef"
       language="tsv2"
     />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START InitialSchema"
      endMarker="// END InitialSchema"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START InitialSchema"
      endMarker="// END InitialSchema"
      language="java"
    />
  </TabItem>
</Tabs>

### 2. 学習データの読み込み

PQ の学習に使用する [オブジェクトを追加](/weaviate/manage-objects/import.mdx) します。Weaviate は、学習上限とコレクションサイズのうち大きい方を使用して PQ を学習します。

学習済みのセントロイドが全データセットを代表するように、代表的なサンプルを読み込むことを推奨します。

バージョン v1.27.0 から、Weaviate は手動で PQ を有効にした場合に利用可能なオブジェクトから学習セットを選択するため、疎な [Fisher-Yates アルゴリズム](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle) を使用します。それでもなお、学習済みのセントロイドがデータセット全体を代表するように、代表的なサンプルを読み込むことを推奨します。

### 3. PQ の有効化とコードブックの作成

コレクション定義を更新して PQ を有効化します。PQ が有効になると、Weaviate は学習データを使用してコードブックを学習します。

import PQMakesCodebook from '/\_includes/configuration/pq-compression/makes-a-codebook.mdx' ;

<PQMakesCodebook />

PQ を有効にするには、以下のようにコレクション定義を更新します。追加の設定オプションについては、[PQ パラメータ一覧](./pq-compression.md#pq-parameters) を参照してください。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
     <FilteredTextBlock
       text={PyCode}
       startMarker="# START UpdateSchema"
       endMarker="# END UpdateSchema"
       language="py"
     />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
     <FilteredTextBlock
       text={PyCodeV3}
       startMarker="# START UpdateSchema"
       endMarker="# END UpdateSchema"
       language="pyv3"
     />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
     <FilteredTextBlock
       text={TSCodeManualPQ}
       startMarker="// START UpdateSchema"
       endMarker="// END UpdateSchema"
       language="ts"
     />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
     <FilteredTextBlock
       text={TSCodeLegacy}
       startMarker="// START UpdateSchema"
       endMarker="// END UpdateSchema"
       language="tsv2"
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



### 4. 残りのデータのロード

[コードブックのトレーニング完了後](#3-enable-pq-and-create-the-codebook)、通常どおりにデータを追加できます。Weaviate は新しいデータをデータベースに追加する際に圧縮します。

コードブックを作成する時点で既に Weaviate インスタンスにデータが存在する場合、Weaviate は残りのオブジェクト（初期トレーニングセット以降のもの）を自動的に圧縮します。

## PQ パラメーター

コレクションレベルで以下のパラメーターを設定することで、PQ 圧縮を構成できます。

import PQParameters from '/\_includes/configuration/pq-compression/parameters.mdx' ;

<PQParameters />

## 追加ツールと留意事項

### コードブックのトレーニング上限の変更

一般的なユースケースでは、100,000 オブジェクトが最適なトレーニングサイズです。`trainingLimit` を増やしても大きな効果は得られません。`trainingLimit` を大きくするとトレーニング時間が長くなるほか、高すぎるとメモリ不足が発生する可能性があります。

小規模データセットで圧縮を有効にしたい場合は、[バイナリ量子化 (BQ)](./bq-compression.md) の利用を検討してください。BQ はトレーニングを必要としない、よりシンプルな圧縮方式です。

### システムログの確認

圧縮が有効になると、Weaviate は次のような診断メッセージをログに記録します。

```bash
pq-conf-demo-1  | {"action":"compress","level":"info","msg":"switching to compressed vectors","time":"2023-11-13T21:10:52Z"}

pq-conf-demo-1  | {"action":"compress","level":"info","msg":"vector compression complete","time":"2023-11-13T21:10:53Z"}
```

`docker-compose` で Weaviate を実行している場合、システムコンソールからログを取得できます。

```bash
docker compose logs -f --tail 10 weaviate
```

また、ログファイルを直接確認することもできます。ファイルの場所は `docker` でご確認ください。

```bash
docker inspect --format='{{.LogPath}}' <your-weaviate-container-id>
```

### 現在の `pq` 設定の確認

現在の `pq` 設定を確認するには、次のように取得できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GetSchema"
      endMarker="# END GetSchema"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START GetSchema"
      endMarker="# END GetSchema"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCodeManualPQ}
      startMarker="// START ViewConfig"
      endMarker="// END ViewConfig"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START GetSchema"
      endMarker="// END GetSchema"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GetSchema"
      endMarker="// END GetSchema"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START GetSchema"
      endMarker="// END GetSchema"
      language="java"
    />
  </TabItem>
</Tabs>

### 複数ベクトル埋め込み（名前付きベクトル）

import NamedVectorCompress from '/\_includes/named-vector-compress.mdx';

<NamedVectorCompress />

### マルチベクトル埋め込み（ColBERT、ColPali など）

import MultiVectorCompress from '/\_includes/multi-vector-compress.mdx';

<MultiVectorCompress />

## さらなる参考資料

- [スターターガイド: 圧縮](/docs/weaviate/starter-guides/managing-resources/compression.mdx)
- [リファレンス: ベクトルインデックス](/weaviate/config-refs/indexing/vector-index.mdx)
- [コンセプト: ベクトル量子化](/docs/weaviate/concepts/vector-quantization.md)
- [コンセプト: ベクトルインデックス](/weaviate/concepts/indexing/vector-index.md)

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

