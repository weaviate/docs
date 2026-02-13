---
title: テキスト埋め込み
description: "Weaviate と Voyage AI の API 統合により、Weaviate から直接モデルの機能にアクセスできます。"
sidebar_position: 20
image: og/docs/integrations/provider_integrations_voyageai.jpg
# tags: ['model providers', 'voyageai', 'embeddings']
---


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import GoConnect from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/1-connect/main.go';
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/2-usage-text/main.go';

# Weaviate における Voyage AI 埋め込み

Weaviate と Voyage AI の API 統合により、Weaviate から直接それらのモデルの機能にアクセスできます。

[Weaviate のベクトル インデックスを設定](#configure-the-vectorizer)して Voyage AI の埋め込みモデルを使用すると、指定したモデルとお持ちの Voyage AI API キーを使って、さまざまな操作向けに埋め込みを生成します。この機能は *ベクトライザー* と呼ばれます。

[インポート時](#data-import)に、Weaviate はテキストオブジェクトの埋め込みを生成してインデックスに保存します。[ベクトル](#vector-near-text-search)および[ハイブリッド](#hybrid-search)検索操作では、Weaviate がテキストクエリを埋め込みに変換します。

![埋め込み統合のイメージ](../_includes/integration_voyageai_embedding.png)

## 要件

### Weaviate の構成

ご利用の Weaviate インスタンスには、Voyage AI ベクトライザー統合（`text2vec-voyageai`）モジュールが有効になっている必要があります。

<details>
  <summary>Weaviate Cloud (WCD) ユーザー向け</summary>

この統合は、Weaviate Cloud (WCD) のサーバーレスインスタンスではデフォルトで有効になっています。

</details>

<details>
  <summary>セルフホストユーザー向け</summary>

- [クラスター メタデータ](/deploy/configuration/meta.md)を確認し、モジュールが有効になっているか確認してください。  
- Weaviate でモジュールを有効にする方法は、[モジュール設定ガイド](../../configuration/modules.md)をご覧ください。

</details>

### API 認証情報

この統合を利用するには、有効な Voyage AI API キーを Weaviate に提供する必要があります。API キーは [Voyage AI](https://www.voyageai.com/) でサインアップして取得できます。

以下のいずれかの方法で Weaviate に API キーを渡してください。

- Weaviate がアクセス可能な環境変数 `VOYAGEAI_APIKEY` を設定する  
- 以下の例のように、実行時に API キーを渡す

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

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoConnect}
      startMarker="// START VoyageAIInstantiation"
      endMarker="// END VoyageAIInstantiation"
      language="goraw"
    />
  </TabItem>

</Tabs>

## ベクトライザーの設定

Voyage AI 埋め込みモデルを使用するよう、[Weaviate インデックスを設定](../../manage-collections/vector-config.mdx#specify-a-vectorizer)します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerVoyageAI"
      endMarker="# END BasicVectorizerVoyageAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerVoyageAI"
      endMarker="// END BasicVectorizerVoyageAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerVoyageAI"
      endMarker="// END BasicVectorizerVoyageAI"
      language="goraw"
    />
  </TabItem>

</Tabs>



### モデルの選択

以下の設定例に示すように、ベクトライザーで使用する [利用可能なモデル](#available-models) のいずれかを指定できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VectorizerVoyageAICustomModel"
      endMarker="# END VectorizerVoyageAICustomModel"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START VectorizerVoyageAICustomModel"
      endMarker="// END VectorizerVoyageAICustomModel"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START VectorizerVoyageAICustomModel"
      endMarker="// END VectorizerVoyageAICustomModel"
      language="goraw"
    />
  </TabItem>

</Tabs>

[利用可能なモデル](#available-models) のいずれかを [指定](#vectorizer-parameters) して  Weaviate で使用できます。モデルを指定しない場合は、[デフォルトモデル](#available-models) が使用されます。

import VectorizationBehavior from '/_includes/vectorization.behavior.mdx';

<details>
  <summary>ベクトル化の挙動</summary>

<VectorizationBehavior/>

</details>

### ベクトライザーのパラメーター

以下の例は、 Voyage AI 固有のオプションを設定する方法を示しています。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullVectorizerVoyageAI"
      endMarker="# END FullVectorizerVoyageAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullVectorizerVoyageAI"
      endMarker="// END FullVectorizerVoyageAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FullVectorizerVoyageAI"
      endMarker="// END FullVectorizerVoyageAI"
      language="goraw"
    />
  </TabItem>

</Tabs>

モデルパラメーターの詳細については、[Voyage AI Embedding API ドキュメント](https://docs.voyageai.com/docs/embeddings) を参照してください。

## ヘッダーパラメーター

実行時にリクエストの追加ヘッダーを通じて、 API キーおよびいくつかのオプションパラメーターを渡すことができます。利用可能なヘッダーは次のとおりです。

- `X-VoyageAI-Api-Key`: Voyage AI の API キー。
- `X-VoyageAI-Baseurl`: デフォルトの Voyage AI URL の代わりに使用するベース URL（例: プロキシ）。

実行時に指定された追加ヘッダーは、既存の  Weaviate  の設定を上書きします。

上記の [API 資格情報の例](#api-credentials) に示すようにヘッダーを指定してください。

## データインポート

ベクトライザーを設定したら、[データをインポート](../../manage-objects/import.mdx) して  Weaviate に取り込みます。 Weaviate は、指定したモデルを使用してテキストオブジェクトの埋め込みを生成します。

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BatchImportExample"
      endMarker="# END BatchImportExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BatchImportExample"
      endMarker="// END BatchImportExample"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BatchImportExample"
      endMarker="// END BatchImportExample"
      language="goraw"
    />
  </TabItem>

</Tabs>

:::tip 既存ベクトルの再利用
互換性のあるモデルのベクトルが既にある場合は、それを直接  Weaviate  に提供できます。同じモデルで既に埋め込みを生成しており、他のシステムからの移行などでそれらを Weaviate で使用したい場合に便利です。
:::

## 検索

ベクトライザーを設定すると、Weaviate は指定した Voyage AI モデルを用いて ベクトル検索およびハイブリッド検索を実行します。

![検索時の埋め込み統合の図](../_includes/integration_voyageai_embedding_search.png)

### ベクトル（near text）検索

[ベクトル検索](../../search/similarity.md#search-with-text)を実行すると、Weaviate はテキストクエリを指定したモデルで埋め込みに変換し、データベースから最も類似したオブジェクトを返します。

以下のクエリは、`limit` で指定した件数 `n` の最も類似したオブジェクトをデータベースから返します。

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START NearTextExample"
      endMarker="# END NearTextExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START NearTextExample"
      endMarker="// END NearTextExample"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START NearTextExample"
      endMarker="// END NearTextExample"
      language="goraw"
    />
  </TabItem>

</Tabs>

### ハイブリッド検索

:::info ハイブリッド検索とは？
ハイブリッド検索は、ベクトル検索とキーワード（BM25）検索を実行し、その後 [結果を結合](../../search/hybrid.md) してデータベースから最も一致するオブジェクトを返します。
:::

[ハイブリッド検索](../../search/hybrid.md)を実行すると、Weaviate はテキストクエリを指定したモデルで埋め込みに変換し、データベースから最もスコアの高いオブジェクトを返します。

以下のクエリは、`limit` で指定した件数 `n` の最もスコアの高いオブジェクトをデータベースから返します。

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START HybridExample"
      endMarker="# END HybridExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START HybridExample"
      endMarker="// END HybridExample"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START HybridExample"
      endMarker="// END HybridExample"
      language="goraw"
    />
  </TabItem>

</Tabs>

## 参考情報

### 利用可能なモデル

- voyage-3.5
- voyage-3.5-lite
- voyage-3-large
- voyage-3 (default)
- voyage-3-lite
- voyage-large-2 (default for &lt;= `v1.24.24`, `v1.25.17`, `v1.26.4`)
- voyage-code-2
- voyage-2
- voyage-law-2
- voyage-large-2-instruct
- voyage-finance-2
- voyage-multilingual-2

<details>
  <summary>
    モデルサポート履歴
  </summary>

- `v1.24.25`, `v1.25.18`, `v1.26.5`:
    - `voyage-3`, `voyage-3-lite` を追加
    - デフォルトモデルが `voyage-large-2` から `voyage-3` に変更
- `v1.24.14`, `v1.25.1`:
    - `voyage-large-2-instruct` を追加
    - `voyage-lite-02-instruct` を削除
- `v1.24.9`:
    - `voyage-law-2`, `voyage-lite-02-instruct` を追加
- `v1.24.2`:
    - `text2vec-voyage` を導入し、`voyage-large-2`, `voyage-code-2`, `voyage-2` をサポート

</details>

## 追加リソース

### その他のインテグレーション

- [Voyage AI マルチモーダル埋め込みモデル + Weaviate](./embeddings-multimodal.md)
- [Voyage AI リランカー モデル + Weaviate](./embeddings.md).

### コード例

コレクションでインテグレーションを設定すると、Weaviate におけるデータ管理および検索操作は他のコレクションとまったく同じように動作します。以下のモデル非依存の例をご覧ください。

- [How-to: Manage collections](../../manage-collections/index.mdx) と [How-to: Manage objects](../../manage-objects/index.mdx) の各ガイドでは、データ操作（コレクションおよびその内部のオブジェクトの作成、読み取り、更新、削除）を実行する方法を解説しています。
- [How-to: Query & Search](../../search/index.mdx) ガイドでは、ベクトル検索、キーワード検索、ハイブリッド検索に加えて、検索拡張生成を実行する方法を説明しています。

### 外部リソース

- Voyage AI [Embeddings API documentation](https://docs.voyageai.com/docs/embeddings)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

