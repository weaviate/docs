---
title: テキスト Embeddings
description: "Weaviate の Google Gemini API および Google Vertex AI API との統合により、これらのモデルの機能へ Weaviate から直接アクセスできます。"
sidebar_position: 20
image: og/docs/integrations/provider_integrations_google.jpg
# tags: ['model providers', 'google', 'embeddings']
---

# Weaviate での Google テキスト Embeddings


import Tabs from '@theme/Tabs';  
import TabItem from '@theme/TabItem';  
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';  
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';  
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';  
import GoConnect from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/1-connect/main.go';  
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';  
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';  
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/2-usage-text/main.go';  

Weaviate と [Google Gemini API](https://ai.google.dev/?utm_source=weaviate&utm_medium=referral&utm_campaign=partnerships&utm_content=) および [Google Vertex AI](https://cloud.google.com/vertex-ai) API との統合により、これらのモデルの機能へ Weaviate から直接アクセスできます。

[Weaviate ベクトルインデックスを設定](#configure-the-vectorizer) して Google の埋め込みモデルを使用すると、Weaviate は指定したモデルとお持ちの Google API キーを用いてさまざまな操作のために埋め込みを生成します。この機能は *ベクトライザー* と呼ばれます。

[インポート時](#data-import) には、Weaviate がテキストオブジェクトの埋め込みを生成し、インデックスに保存します。[ベクトル](#vector-near-text-search) および [ハイブリッド](#hybrid-search) 検索操作では、Weaviate がテキストクエリを埋め込みに変換します。

![Embedding integration illustration](../_includes/integration_google_embedding.png)

:::info Gemini API の提供状況
執筆時点（2023 年 11 月）では、Gemini API はすべてのリージョンで利用できるわけではありません。最新情報は [こちらのページ](https://ai.google.dev/gemini-api/docs/available-regions) をご覧ください。
:::

## 要件

### Weaviate の設定

お使いの Weaviate インスタンスには、Google ベクトライザー統合（`text2vec-google`）モジュールが有効になっている必要があります。

:::info モジュール名の変更
`text2vec-google` は Weaviate v1.27 より前のバージョンでは `text2vec-palm` と呼ばれていました。
:::

<details>
  <summary>Weaviate Cloud (WCD) ユーザーの方へ</summary>

この統合は Weaviate Cloud (WCD) のサーバーレスインスタンスではデフォルトで有効になっています。

</details>

<details>
  <summary>セルフホストユーザーの方へ</summary>

- モジュールが有効かどうかを確認するには、[クラスターメタデータ](/deploy/configuration/meta.md) をチェックしてください。  
- Weaviate でモジュールを有効にする方法は、[モジュール設定方法](../../configuration/modules.md) ガイドをご覧ください。

</details>

### API 認証情報

該当する統合用の有効な API 認証情報を Weaviate に提供する必要があります。

#### Gemini API

[Google Gemini API](https://aistudio.google.com/app/apikey/?utm_source=weaviate&utm_medium=referral&utm_campaign=partnerships&utm_content=) にアクセスし、サインアップして API キーを取得してください。

#### Vertex AI

Google Cloud では `access token` と呼ばれます。

##### 自動トークン生成

import UseGoogleAuthInstructions from './_includes/use_google_auth_instructions.mdx';

<UseGoogleAuthInstructions/>

[Google Cloud CLI ツール](https://cloud.google.com/cli) がインストール済みで設定されている場合、次のコマンドでトークンを確認できます。

```shell
gcloud auth print-access-token
```

#### Vertex AI ユーザー向けのトークン有効期限

import GCPTokenExpiryNotes from '/_includes/gcp.token.expiry.notes.mdx';

<GCPTokenExpiryNotes/>

#### API キーの提供

以下の例のように、実行時に Weaviate へ API キーを渡してください。

[Gemini API](#gemini-api) と [Vertex AI](#vertex-ai) 向けに用意された別々のヘッダーに注意してください。

import ApiKeyNote from '../_includes/google-api-key-note.md';

<ApiKeyNote />

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START GoogleInstantiation"
      endMarker="# END GoogleInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START GoogleInstantiation"
      endMarker="// END GoogleInstantiation"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoConnect}
      startMarker="// START GoogleInstantiation"
      endMarker="// END GoogleInstantiation"
      language="goraw"
    />
  </TabItem>

</Tabs>



## ベクトライザーの設定

[Weaviate インデックスを設定](../../manage-collections/vector-config.mdx#specify-a-vectorizer) して、 Google 埋め込みモデルを使用するには次のようにします:

必須パラメーターは Vertex AI と Gemini API で異なる点にご注意ください。

Weaviate で使用する [利用可能なモデル](#available-models) のいずれかを [指定](#vectorizer-parameters) できます。モデルを指定しない場合は、[デフォルトモデル](#available-models) が使用されます。

### Vertex AI

Vertex AI のユーザーは、ベクトライザー設定で Google Cloud プロジェクト ID を指定する必要があります。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerGoogleVertex"
      endMarker="# END BasicVectorizerGoogleVertex"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerGoogleVertex"
      endMarker="// END BasicVectorizerGoogleVertex"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerGoogleVertex"
      endMarker="// END BasicVectorizerGoogleVertex"
      language="goraw"
    />
  </TabItem>

</Tabs>

### Gemini API

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerGoogleStudio"
      endMarker="# END BasicVectorizerGoogleStudio"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerGoogleStudio"
      endMarker="// END BasicVectorizerGoogleStudio"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerGoogleStudio"
      endMarker="// END BasicVectorizerGoogleStudio"
      language="goraw"
    />
  </TabItem>

</Tabs>

import VectorizationBehavior from '/_includes/vectorization.behavior.mdx';

<details>
  <summary>ベクトル化の動作</summary>

<VectorizationBehavior/>

</details>

### ベクトライザーのパラメーター

以下の例では、 Google 固有のオプションを設定する方法を示します。

- `projectId` ( Vertex AI 使用時のみ必須): 例 `cloud-large-language-models`
- `apiEndpoint` (任意): 例 `us-central1-aiplatform.googleapis.com`
- `modelId` (任意): 例 `gemini-embedding-001`
<!-- - `titleProperty` (Optional): The Weaviate property name for the `gecko-002` or `gecko-003` model to use as the title. -->

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullVectorizerGoogle"
      endMarker="# END FullVectorizerGoogle"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullVectorizerGoogle"
      endMarker="// END FullVectorizerGoogle"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FullVectorizerGoogle"
      endMarker="// END FullVectorizerGoogle"
      language="goraw"
    />
  </TabItem>

</Tabs>



## データのインポート

ベクトライザーを設定したら、Weaviate に [データをインポート](../../manage-objects/import.mdx) します。Weaviate は指定したモデルを使用してテキストオブジェクトの埋め込みを生成します。

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
互換性のあるモデルベクトルがすでにある場合は、それを直接 Weaviate に渡すことができます。これは同じモデルで埋め込みをすでに生成しており、他システムからデータを移行する際などに Weaviate でそれらを再利用したい場合に役立ちます。
:::

## 検索

ベクトライザーを設定すると、Weaviate は指定した Google モデルを使用してベクトル検索およびハイブリッド検索を実行します。

![Embedding integration at search illustration](../_includes/integration_google_embedding_search.png)

### ベクトル（ near text ）検索

[ベクトル検索](../../search/similarity.md#search-with-text)を実行すると、Weaviate はテキストクエリを指定したモデルでベクトル化し、データベースからもっとも類似したオブジェクトを返します。

以下のクエリは、`limit` で指定された `n` 件のもっとも類似したオブジェクトを返します。

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
ハイブリッド検索はベクトル検索とキーワード（BM25）検索を実行し、その後 [結果を結合](../../search/hybrid.md) してデータベースから最適なオブジェクトを返します。
:::

[ハイブリッド検索](../../search/hybrid.md)を実行すると、Weaviate はテキストクエリを指定したモデルでベクトル化し、データベースからもっともスコアの高いオブジェクトを返します。

以下のクエリは、`limit` で指定された `n` 件のもっともスコアの高いオブジェクトを返します。

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

## 参照

### 利用可能なモデル

Vertex AI:
- `gemini-embedding-001` (デフォルト、 1.29.9 、 1.30.11 、 1.31.5 以降で追加)
- `text-embedding-005` (v 1.29.9 、 1.30.11 、 1.31.5 以降で追加)
- `text-multilingual-embedding-002` (v 1.29.9 、 1.30.11 、 1.31.5 以降で追加)

<details>
  <summary>非推奨モデル</summary>

以下のモデルは Google によって非推奨となり、サポートされていません。期待どおりに動作しない可能性があります。

- `textembedding-gecko@001`
- `textembedding-gecko@002`
- `textembedding-gecko@003`
- `textembedding-gecko@latest`
- `textembedding-gecko-multilingual@001`
- `textembedding-gecko-multilingual@latest`
- `text-embedding-preview-0409`
- `text-multilingual-embedding-preview-0409`

</details>

Gemini API:
- `gemini-embedding-001` (デフォルト)
    - `embedding-001` (`gemini-embedding-001` の旧名、非推奨)
- `text-embedding-004`

## 追加リソース

### その他のインテグレーション

- [Google generative models + Weaviate](./generative.md)。

### コード例

コレクションでインテグレーションを設定すると、 Weaviate におけるデータ管理および検索操作は他のコレクションと同一に動作します。以下のモデル非依存の例をご覧ください。

- [How-to: コレクションの管理](../../manage-collections/index.mdx) と [How-to: オブジェクトの管理](../../manage-objects/index.mdx) のガイドでは、データ操作（すなわちコレクションおよびその内部のオブジェクトの作成、読み取り、更新、削除）の方法を説明しています。
- [How-to: クエリ & 検索](../../search/index.mdx) のガイドでは、ベクトル、キーワード、ハイブリッド検索を含む検索操作および 検索拡張生成 の実行方法を説明しています。

### 外部リソース

- [Google Vertex AI](https://cloud.google.com/vertex-ai)
- [Google Gemini API](https://ai.google.dev/?utm_source=weaviate&utm_medium=referral&utm_campaign=partnerships&utm_content=)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

