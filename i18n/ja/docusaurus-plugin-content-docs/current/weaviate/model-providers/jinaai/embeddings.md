---
title: テキスト 埋め込み
sidebar_position: 20
image: og/docs/integrations/provider_integrations_jinaai.jpg
# tags: ['model providers', 'jinaai', 'embeddings']
---

# Weaviate での Jina AI 埋め込み


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import GoConnect from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/1-connect/main.go';
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/2-usage-text/main.go';

Weaviate の Jina AI API との統合により、モデルの機能に Weaviate から直接アクセスできます。

[Jina AI 埋め込みモデルを使用するよう Weaviate の ベクトル インデックスを設定](#configure-the-vectorizer) すると、指定したモデルとお客様の Jina AI API キーを使用して、さまざまな操作のために Weaviate が埋め込みを生成します。この機能は *vectorizer* と呼ばれます。

[インポート時](#data-import) に、Weaviate はテキスト オブジェクトの埋め込みを生成し、インデックスに保存します。[ベクトル](#vector-near-text-search) および [ハイブリッド](#hybrid-search) 検索操作では、Weaviate はテキスト クエリを埋め込みに変換します。

![埋め込み統合のイメージ](../_includes/integration_jinaai_embedding.png)

## 要件

### Weaviate の設定

お使いの Weaviate インスタンスは、Jina AI ベクトライザー統合 (`text2vec-jinaai`) モジュールが有効化されている必要があります。

<details>
  <summary>Weaviate Cloud (WCD) 利用者向け</summary>

この統合は、Weaviate Cloud (WCD) のサーバーレス インスタンスではデフォルトで有効になっています。

</details>

<details>
  <summary>セルフホスティング利用者向け</summary>

- モジュールが有効になっているかどうかを確認するには、[クラスターメタデータ](/deploy/configuration/meta.md) をご確認ください。  
- Weaviate でモジュールを有効にする方法は、[モジュール設定の手順](../../configuration/modules.md) を参照してください。

</details>

### API 資格情報

この統合を利用するには、Weaviate に有効な Jina AI API キーを提供する必要があります。API キーは [Jina AI](https://jina.ai/embeddings/) でサインアップして取得してください。

以下のいずれかの方法で Weaviate に API キーを渡します。

- Weaviate が参照できる環境変数 `JINAAI_APIKEY` を設定する  
- 下記の例のように、実行時に API キーを渡す

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START JinaAIInstantiation"
      endMarker="# END JinaAIInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START JinaAIInstantiation"
      endMarker="// END JinaAIInstantiation"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoConnect}
      startMarker="// START JinaAIInstantiation"
      endMarker="// END JinaAIInstantiation"
      language="goraw"
    />
  </TabItem>

</Tabs>

## ベクトライザーの設定

以下のように [Weaviate インデックスを設定](../../manage-collections/vector-config.mdx#specify-a-vectorizer) して、Jina AI 埋め込みモデルを使用します:

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerJinaAI"
      endMarker="# END BasicVectorizerJinaAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerJinaAI"
      endMarker="// END BasicVectorizerJinaAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerJinaAI"
      endMarker="// END BasicVectorizerJinaAI"
      language="goraw"
    />
  </TabItem>

</Tabs>



### モデルの選択

以下の設定例のように、ベクトライザーで使用する [利用可能なモデル](#available-models) のいずれかを指定できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VectorizerJinaCustomModel"
      endMarker="# END VectorizerJinaCustomModel"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START VectorizerJinaCustomModel"
      endMarker="// END VectorizerJinaCustomModel"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START VectorizerJinaCustomModel"
      endMarker="// END VectorizerJinaCustomModel"
      language="goraw"
    />
  </TabItem>

</Tabs>

Weaviate で使用する [利用可能なモデル](#available-models) のいずれかを[指定](#vectorizer-parameters)できます。モデルを指定しない場合は、[デフォルトモデル](#available-models) が使用されます。

import VectorizationBehavior from '/_includes/vectorization.behavior.mdx';

<details>
  <summary>ベクトル化の動作</summary>

<VectorizationBehavior/>

</details>

### ベクトライザーのパラメーター

以下の例では、Jina AI 固有のオプションを設定する方法を示します。

`dimensions` は `jina-embeddings-v2` モデルには適用されない点にご注意ください。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullVectorizerJinaAI"
      endMarker="# END FullVectorizerJinaAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullVectorizerJinaAI"
      endMarker="// END FullVectorizerJinaAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FullVectorizerJinaAI"
      endMarker="// END FullVectorizerJinaAI"
      language="goraw"
    />
  </TabItem>

</Tabs>

## データのインポート

ベクトライザーを設定したら、Weaviate に[データをインポート](../../manage-objects/import.mdx)します。Weaviate は指定したモデルを使用してテキストオブジェクトの埋め込みを生成します。

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
互換性のあるモデルベクトルがすでにある場合、それを直接 Weaviate に渡すことができます。同じモデルで既に埋め込みを生成している場合や、他のシステムからデータを移行する際などに便利です。
:::

## 検索

ベクトライザーが設定されると、 Weaviate は指定された Jina AI モデルを使用してベクトル検索およびハイブリッド検索を実行します。

![検索時の Embedding 統合の図](../_includes/integration_jinaai_embedding_search.png)

### ベクトル（near text）検索

[ベクトル検索](../../search/similarity.md#search-with-text)を実行すると、 Weaviate はテキストクエリを指定されたモデルで埋め込みに変換し、データベースから最も類似したオブジェクトを返します。

以下のクエリは、 `limit` で設定された `n` 件の最も類似したオブジェクトを返します。

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
ハイブリッド検索はベクトル検索とキーワード（ BM25 ）検索を行い、[結果を組み合わせて](../../search/hybrid.md)データベースから最適なオブジェクトを返します。
:::

[ハイブリッド検索](../../search/hybrid.md)を実行すると、 Weaviate はテキストクエリを指定されたモデルで埋め込みに変換し、データベースから最もスコアの高いオブジェクトを返します。

以下のクエリは、 `limit` で設定された `n` 件の最もスコアが高いオブジェクトを返します。

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

## 参考

### 利用可能なモデル

- `jina-embeddings-v3`（ Weaviate `v1.26.5` と `v1.27` で追加）
    - このモデルを使用すると、 Weaviate は自動的に適切な `task` タイプを使用し、エントリの埋め込みには `retrieval.passage` を、クエリには `retrieval.query` を適用します。
    - デフォルトで Weaviate は `1024` 次元を使用します
- `jina-embeddings-v2-base-en`（デフォルト）
- `jina-embeddings-v2-small-en`

`jina-embeddings-v2` モデルでは `dimensions` は適用されませんのでご注意ください。

## 追加情報

### その他の統合

- [Jina AI ColBERT Embedding モデル + Weaviate](./embeddings-colbert.md)
- [Jina AI マルチモーダル Embedding モデル + Weaviate](./embeddings-multimodal.md)
- [Jina AI リランカー（reranker）モデル + Weaviate](./reranker.md)

### コード例

統合がコレクションで設定されると、 Weaviate のデータ管理および検索操作は他のコレクションと同一の方法で動作します。モデルに依存しない以下の例をご覧ください。

- [How-to: コレクション管理](../../manage-collections/index.mdx) と [How-to: オブジェクト管理](../../manage-objects/index.mdx) ガイドでは、データ操作（コレクションおよびその中のオブジェクトの作成・読み取り・更新・削除）の方法を示しています。
- [How-to: クエリ & 検索](../../search/index.mdx) ガイドでは、検索操作（ベクトル・キーワード・ハイブリッド）および検索拡張生成の方法を示しています。

### 外部リソース

- Jina AI [Embeddings API ドキュメント](https://jina.ai/embeddings/)

## ご質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

