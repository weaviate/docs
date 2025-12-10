---
title: テキスト埋め込み
sidebar_position: 20
image: og/docs/integrations/provider_integrations_gpt4all.jpg
# tags: ['model providers', 'gpt4all', 'embeddings']
---

# Weaviate での GPT4All 埋め込み


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.local.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.local.ts';
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';

:::caution Deprecated integration
この統合は非推奨で、今後のリリースで削除される予定です。新しいプロジェクトでは、他のモデルプロバイダーの利用を推奨します。

ローカル AI モデルの統合には、[Ollama](../ollama/index.md) または [ローカル HuggingFace](../transformers/) モデル統合の利用をご検討ください。
:::

Weaviate と GPT4All のモデルの統合により、Weaviate から直接それらのモデル機能へアクセスできます。

[ベクトルインデックスを設定](#configure-the-vectorizer) して GPT4All の埋め込みモデルを使用すると、Weaviate は GPT4All 推論コンテナ経由で指定したモデルを使用して、さまざまな操作のための埋め込みを生成します。この機能は * ベクトライザー * と呼ばれます。

[インポート時](#data-import) に、Weaviate はテキストオブジェクトの埋め込みを生成し、それらをインデックスに保存します。また、[ ベクトル ](#vector-near-text-search) や [ ハイブリッド ](#hybrid-search) 検索操作では、テキストクエリを埋め込みに変換します。

![埋め込み統合のイメージ](../_includes/integration_gpt4all_embedding.png)

このモジュールは `ggml` ライブラリを利用して CPU に最適化されており、GPU がなくても高速に推論できます。

## 要件

現在、GPT4All 統合は `amd64/x86_64` アーキテクチャデバイスのみで利用可能です。`gpt4all` ライブラリが ARM デバイス（Apple M シリーズなど）をまだサポートしていないためです。

### Weaviate の設定

ご利用の Weaviate インスタンスには、GPT4All ベクトライザー統合（`text2vec-gpt4all`）モジュールが設定されている必要があります。

<details>
  <summary>Weaviate Cloud (WCD) のユーザー向け</summary>

この統合はローカルで動作する GPT4All インスタンスを必要とするため、Weaviate Cloud (WCD) のサーバーレスインスタンスでは利用できません。
</details>

<details>
  <summary>セルフホストユーザー向け</summary>

- [クラスターメタデータ](/deploy/configuration/meta.md) でモジュールが有効になっているか確認してください。
- Weaviate でモジュールを有効化するために、[モジュール設定方法](../../configuration/modules.md) ガイドに従ってください。
</details>

#### 統合の設定

この統合を使用するには、GPT4All モデルのコンテナイメージと、コンテナ化されたモデルの推論エンドポイントを設定する必要があります。

以下は、Weaviate で GPT4All 統合を設定する例です。

<Tabs groupId="languages">
<TabItem value="docker" label="Docker">

#### Docker オプション 1: 事前構成済み `docker-compose.yml` ファイルを使用する

[Weaviate Docker インストールコンフィギュレーター](/deploy/installation-guides/docker-installation.md#configurator) の手順に従い、選択したモデルを含む事前構成済みの `docker-compose.yml` ファイルをダウンロードします。
<br/>

#### Docker オプション 2: 設定を手動で追加する

代わりに、以下の例のように `docker-compose.yml` ファイルに設定を手動で追加します。

```yaml
services:
  weaviate:
    # Other Weaviate configuration
    environment:
      GPT4ALL_INFERENCE_API: http://text2vec-gpt4all:8080  # Set the inference API endpoint
  text2vec-gpt4all:  # Set the name of the inference container
    image: cr.weaviate.io/semitechnologies/gpt4all-inference:all-MiniLM-L6-v2
```

- `GPT4ALL_INFERENCE_API` 環境変数で推論 API エンドポイントを指定します  
- `text2vec-gpt4all` は推論コンテナの名前です  
- `image` はコンテナイメージを示します  

</TabItem>
<TabItem value="k8s" label="Kubernetes">

Weaviate Helm チャートの `values.yaml` ファイル内の `modules` セクションに `text2vec-gpt4all` モジュールを追加または更新して、GPT4All 統合を設定します。例として、`values.yaml` ファイルを次のように変更します。

```yaml
modules:

  text2vec-gpt4all:

    enabled: true
    tag: all-MiniLM-L6-v2
    repo: semitechnologies/gpt4all-inference
    registry: cr.weaviate.io
```

より詳細な設定オプションについては、[Weaviate Helm チャート](https://github.com/weaviate/weaviate-helm/blob/master/weaviate/values.yaml) の `values.yaml` 例をご覧ください。

</TabItem>
</Tabs>

### 認証情報

この統合はローカルの GPT4All コンテナへ接続するため、追加の認証情報（API キーなど）は不要です。以下の例のように、通常どおり Weaviate に接続してください。

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START BasicInstantiation"
      endMarker="# END BasicInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START BasicInstantiation"
      endMarker="// END BasicInstantiation"
      language="ts"
    />
  </TabItem>

</Tabs>

## ベクトライザーの設定

GPT4All 埋め込みモデルを使用するために、[Weaviate インデックスを設定](../../manage-collections/vector-config.mdx#specify-a-vectorizer) してください。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerGPT4All"
      endMarker="# END BasicVectorizerGPT4All"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerGPT4All"
      endMarker="// END BasicVectorizerGPT4All"
      language="ts"
    />
  </TabItem>

</Tabs>

現在利用可能なモデルは [`all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) のみです。

import VectorizationBehavior from '/_includes/vectorization.behavior.mdx';

<details>
  <summary>ベクトル化の動作</summary>

<VectorizationBehavior/>

</details>



## データ インポート

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

</Tabs>

:::tip 既存のベクトルの再利用
すでに互換性のあるモデルベクトルがある場合は、それを直接 Weaviate に渡すことができます。これは、同じモデルで埋め込みを生成済みで、それらを Weaviate で利用したい場合、たとえば別のシステムからデータを移行する際に便利です。
:::

## 検索

ベクトライザーを設定すると、Weaviate は指定した GPT4All モデルを使用してベクトル検索およびハイブリッド検索を実行します。

![Embedding integration at search illustration](../_includes/integration_gpt4all_embedding_search.png)

### ベクトル (near text) 検索

[ベクトル検索](../../search/similarity.md#search-with-text)を実行すると、Weaviate はテキストクエリを指定したモデルで埋め込みに変換し、データベースから最も類似したオブジェクトを返します。

以下のクエリは、`limit` で設定された件数 ( n 件) の最も類似したオブジェクトをデータベースから返します。

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

</Tabs>

### ハイブリッド検索

:::info ハイブリッド検索とは？
ハイブリッド検索はベクトル検索とキーワード (BM25) 検索を行い、その後[結果を組み合わせて](../../search/hybrid.md)データベースから最適なオブジェクトを返します。
:::

[ハイブリッド検索](../../search/hybrid.md)を実行すると、Weaviate はテキストクエリを指定したモデルで埋め込みに変換し、データベースからスコアの高いオブジェクトを返します。

以下のクエリは、`limit` で設定された件数 ( n 件) の最もスコアが高いオブジェクトをデータベースから返します。

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

</Tabs>

## 参考資料

<!-- #### Example configuration -->

<!-- Hiding "full" examples as no other parameters exist than shown above -->

<!-- <Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullVectorizerGPT4All"
      endMarker="# END FullVectorizerGPT4All"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullVectorizerGPT4All"
      endMarker="// END FullVectorizerGPT4All"
      language="ts"
    />
  </TabItem>

</Tabs> -->

### 利用可能なモデル

現在利用可能なモデルは [`all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) のみです。

## 追加リソース

### コード例

コレクションで統合を設定すると、 Weaviate におけるデータ管理および検索操作は他のコレクションとまったく同じように機能します。以下のモデル非依存の例をご覧ください:

- [How-to: コレクションを管理する](../../manage-collections/index.mdx) と [How-to: オブジェクトを管理する](../../manage-objects/index.mdx) の各ガイドでは、データ操作 (例: コレクションおよびその中のオブジェクトの作成、読み取り、更新、削除) の方法を示しています。  
- [How-to: クエリ & 検索](../../search/index.mdx) ガイドでは、検索操作 (例: ベクトル、キーワード、ハイブリッド) や 検索拡張生成 について説明しています。

### 外部リソース

- [GPT4All ドキュメント](https://docs.gpt4all.io/)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

