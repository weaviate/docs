---
title: Reranker
description: NVIDIA Reranker モデルプロバイダー
sidebar_position: 70
image: og/docs/integrations/provider_integrations_nvidia.jpg
# tags: ['model providers', 'nvidia', 'reranking']
---

# Weaviate での NVIDIA Reranker モデル

:::info Added in `v1.28.5`, `v1.29.0`
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.reranker.py';
import TSCode from '!!raw-loader!../_includes/provider.reranker.ts';

Weaviate と NVIDIA の API を統合することで、NVIDIA のモデル機能を Weaviate から直接利用できます。

[Weaviate コレクションを設定](#configure-the-reranker)して NVIDIA のリランカーモデルを使用すると、指定したモデルとお持ちの NVIDIA NIM API キーを使って検索結果がリランキングされます。

この 2 段階プロセスでは、まず Weaviate が検索を実行し、その後指定したモデルで結果をリランキングします。

![Reranker integration illustration](../_includes/integration_nvidia_reranker.png)

## 要件

### Weaviate の構成

お使いの Weaviate インスタンスには、NVIDIA リランカー統合モジュール (`reranker-nvidia`) が有効化されている必要があります。

<details>
  <summary>Weaviate Cloud (WCD) ユーザーの場合</summary>

この統合は Weaviate Cloud (WCD) のサーバーレスインスタンスではデフォルトで有効です。

</details>

<details>
  <summary>セルフホストユーザーの場合</summary>

- モジュールが有効かどうかは [クラスターのメタデータ](/deploy/configuration/meta.md) で確認できます。  
- Weaviate でモジュールを有効にする方法は、[モジュール設定の手順](../../configuration/modules.md) をご覧ください。

</details>

### API 資格情報

この統合を利用するには、有効な NVIDIA NIM API キーを Weaviate に提供する必要があります。API キーの取得は [NVIDIA](https://build.nvidia.com/) でサインアップしてください。

以下のいずれかの方法で Weaviate に API キーを渡します。

- `NVIDIA_APIKEY` 環境変数を設定し、Weaviate から参照できるようにする。
- 例に示すように、実行時に API キーを渡す。

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START NVIDIAInstantiation"
      endMarker="# END NVIDIAInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START NVIDIAInstantiation"
      endMarker="// END NVIDIAInstantiation"
      language="ts"
    />
  </TabItem>

</Tabs>

## リランカーの設定

import MutableRerankerConfig from '/_includes/mutable-reranker-config.md';

<MutableRerankerConfig />

次のように Weaviate コレクションを設定し、NVIDIA のリランカーモデルを使用します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RerankerNVIDIABasic"
      endMarker="# END RerankerNVIDIABasic"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RerankerNVIDIABasic"
      endMarker="// END RerankerNVIDIABasic"
      language="ts"
    />
  </TabItem>

</Tabs>

### モデルの選択

Weaviate に使用させる [利用可能なモデル](#available-models) を指定できます。以下はその設定例です。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RerankerNVIDIACustomModel"
      endMarker="# END RerankerNVIDIACustomModel"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RerankerNVIDIACustomModel"
      endMarker="// END RerankerNVIDIACustomModel"
      language="ts"
    />
  </TabItem>

</Tabs>

モデルを指定しない場合、[デフォルトモデル](#available-models) が使用されます。



## リランキングクエリ

リランカーを設定すると、 Weaviate は指定した NVIDIA モデルを使用して [リランキング操作](../../search/rerank.md) を実行します。

具体的には、 Weaviate が初回検索を行った後、指定したモデルで結果をリランキングします。

Weaviate のあらゆる検索はリランカーと組み合わせて、リランキング操作を実行できます。

![Reranker integration illustration](../_includes/integration_nvidia_reranker.png)

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RerankerQueryExample"
      endMarker="# END RerankerQueryExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RerankerQueryExample"
      endMarker="// END RerankerQueryExample"
      language="ts"
    />
  </TabItem>

</Tabs>

## 参考資料

### 利用可能なモデル

Weaviate では、 NVIDIA NIM APIs 上の任意のリランカーモデルを利用できます。  
[モデル一覧はこちら](https://build.nvidia.com/models)

デフォルトモデルは `nnvidia/rerank-qa-mistral-4b` です。

## 追加リソース

### その他の統合

- [NVIDIA text embedding models + Weaviate](./embeddings.md)
- [NVIDIA multimodal embedding embeddings models + Weaviate](./embeddings-multimodal.md)
- [NVIDIA generative models + Weaviate](./generative.md)

### コード例

コレクションで統合を設定済みであれば、 Weaviate のデータ管理および検索操作は他のコレクションと同一の手順で行えます。モデルに依存しない以下の例をご覧ください。

- [How-to: Manage collections](../../manage-collections/index.mdx) と [How-to: Manage objects](../../manage-objects/index.mdx) ガイドでは、コレクションおよびその中のオブジェクトの作成・読み取り・更新・削除といったデータ操作方法を紹介しています。
- [How-to: Query & Search](../../search/index.mdx) ガイドでは、ベクトル検索、キーワード検索、ハイブリッド検索、そして 検索拡張生成 の実行方法を解説しています。

### 参考文献

- [NVIDIA NIM API documentation](https://docs.api.nvidia.com/nim/)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

