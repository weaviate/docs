---
title: リランカー
description: VoyageAI リランカーモデルプロバイダー
sidebar_position: 70
image: og/docs/integrations/provider_integrations_voyageai.jpg
# tags: ['model providers', 'voyageai', 'reranking']
---


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.reranker.py';
import TSCode from '!!raw-loader!../_includes/provider.reranker.ts';

# Weaviate と Voyage AI のリランカーモデル

 Weaviate と Voyage AI の API を統合することで、Weaviate から直接モデルの機能を利用できます。

 Voyage AI のリランカーモデルを使用するように Weaviate コレクションを設定すると、Weaviate は指定したモデルとお客様の Voyage AI API キーを使用して検索結果を再ランキングします。

 この 2 ステップのプロセスでは、まず Weaviate が検索を実行し、その後指定したモデルで結果を再ランキングします。

![リランカー統合のイメージ](../_includes/integration_voyageai_reranker.png)

## 必要条件

### Weaviate の設定

 お使いの Weaviate インスタンスは Voyage AI リランカー統合（`reranker-voyageai`）モジュールで設定されている必要があります。

<details>
  <summary>Weaviate Cloud (WCD) ご利用の方へ</summary>

 この統合は Weaviate Cloud (WCD) サーバーレスインスタンスではデフォルトで有効になっています。

</details>

<details>
  <summary>セルフホスト環境の方へ</summary>

- モジュールが有効になっていることを確認するために [クラスターメタデータ](/deploy/configuration/meta.md) をチェックしてください。
- Weaviate でモジュールを有効にするには、[モジュール設定方法](../../configuration/modules.md) ガイドに従ってください。

</details>

### API 認証情報

 この統合には、有効な Voyage AI API キーを Weaviate に提供する必要があります。[Voyage AI](https://www.voyageai.com/) にアクセスし、サインアップして API キーを取得してください。

 次のいずれかの方法で API キーを Weaviate に渡してください。

- `VOYAGEAI_APIKEY` という環境変数を設定し、Weaviate から参照できるようにします。
- 以下の例のように、実行時に API キーを渡します。

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START VoyageAIInstantiation"
      endMarker="# END VoyageAIInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START VoyageAIInstantiation"
      endMarker="// END VoyageAIInstantiation"
      language="ts"
    />
  </TabItem>

</Tabs>

## リランカーの設定

import MutableRerankerConfig from '/_includes/mutable-reranker-config.md';

<MutableRerankerConfig />

 次のようにして、Voyage AI リランカーモデルを使用するように Weaviate コレクションを設定します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RerankerVoyageAI"
      endMarker="# END RerankerVoyageAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RerankerVoyageAI"
      endMarker="// END RerankerVoyageAI"
      language="ts"
    />
  </TabItem>

</Tabs>

 リランカーが使用する [利用可能なモデル](#available-models) のいずれかを指定できます。

 モデルを指定しない場合は、[デフォルトモデル](#available-models) が使用されます。

## ヘッダーパラメータ

 実行時にリクエストヘッダーを追加することで、API キーおよびいくつかのオプションパラメータを渡せます。利用可能なヘッダーは次のとおりです。

- `X-VoyageAI-Api-Key`: Voyage AI API キー。
- `X-VoyageAI-Baseurl`: デフォルトの Voyage AI URL の代わりに使用するベース URL（例: プロキシ）。

 実行時に追加されたヘッダーは、既存の Weaviate 設定を上書きします。

 上記の [API 認証情報の例](#api-credentials) に示すようにヘッダーを指定してください。

## リランキング クエリ

リランカーが構成されると、 Weaviate は指定された Voyage AI モデルを使用して [リランキング操作](../../search/rerank.md) を実行します。

具体的には、 Weaviate が初期検索を行った後、その結果を指定されたモデルでリランキングします。

Weaviate では、任意の検索にリランカーを組み合わせてリランキング操作を実行できます。

![Reranker integration illustration](../_includes/integration_voyageai_reranker.png)

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

## 参考

### 利用可能なモデル

- rerank-2
- rerank-2-lite
- rerank-1
- rerank-lite-1 (default)

<details>
  <summary>
    モデルのサポート履歴
  </summary>

- `v1.24.25`, `v1.25.18`, `v1.26.5`:
    - `rerank-2`, `rerank-2-lite` を追加
- `v1.24.18`, `v1.25.3`:
    - `rerank-1` を追加
- `1.24.7`:
    - `reranker-voyageai` を導入し、 `rerank-lite-1` をサポート

</details>

## 追加リソース

### その他の統合

- [Voyage AI 埋め込みモデル + Weaviate](./embeddings.md)  
- [Voyage AI マルチモーダル埋め込みモデル + Weaviate](./embeddings-multimodal.md)

### コード例

コレクションで統合を構成すると、 Weaviate のデータ管理および検索操作は他のコレクションと同一に動作します。モデルに依存しない次の例をご覧ください。

- [How-to: Manage collections](../../manage-collections/index.mdx) と [How-to: Manage objects](../../manage-objects/index.mdx) では、データ操作 (コレクションおよびその中のオブジェクトの作成、読み取り、更新、削除) の方法を示しています。  
- [How-to: Query & Search](../../search/index.mdx) では、 ベクトル、キーワード、ハイブリッド検索および 検索拡張生成 の実行方法を説明しています。

### 参考情報

- Voyage AI [Reranker API ドキュメント](https://docs.voyageai.com/docs/reranker)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

