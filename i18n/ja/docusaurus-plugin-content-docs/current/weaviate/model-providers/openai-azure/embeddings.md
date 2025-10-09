---
title: テキスト 埋め込み
description: "Weaviate の Azure OpenAI API 連携により、Weaviate から直接モデルの機能を利用できます。"
sidebar_position: 20
image: og/docs/integrations/provider_integrations_openai_azure.jpg
# tags: ['model providers', 'azure', 'openai', 'embeddings']
---

# Weaviate での Azure OpenAI 埋め込み


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import GoConnect from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/1-connect/main.go';
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/model-providers/2-usage-text/main.go';

Weaviate の Azure OpenAI API 連携により、Weaviate から直接モデルの機能を利用できます。

[Weaviate ベクトル インデックスを設定](#configure-the-vectorizer) して Azure OpenAI の埋め込みモデルを使用すると、指定したモデルとお持ちの Azure OpenAI API キーを使って、Weaviate が各種操作の埋め込みを生成します。この機能は *ベクトライザー* と呼ばれます。

[インポート 時](#data-import) には、Weaviate がテキスト オブジェクトの埋め込みを生成し、インデックスに保存します。また、[ベクトル](#vector-near-text-search) と [ハイブリッド](#hybrid-search) 検索時には、Weaviate がテキスト クエリを埋め込みに変換します。

![Embedding integration illustration](../_includes/integration_openai_azure_embedding.png)

## 要件

### Weaviate の設定

ご利用の Weaviate インスタンスには、Azure OpenAI ベクトライザー連携 (`text2vec-openai`) モジュールが有効になっている必要があります。

<details>
  <summary>Weaviate Cloud (WCD) ユーザー向け</summary>

この連携は、Weaviate Cloud (WCD) のサーバーレス インスタンスでデフォルトで有効になっています。

</details>

<details>
  <summary>セルフホストユーザー向け</summary>

- モジュールが有効かどうかを確認するには、[クラスタ メタデータ](/deploy/configuration/meta.md) をご確認ください。  
- Weaviate でモジュールを有効にするには、[モジュール設定方法](../../configuration/modules.md) ガイドに従ってください。

</details>

### API 認証情報

この連携を利用するには、有効な Azure OpenAI API キーを Weaviate に提供する必要があります。API キーを取得するには、[Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-foundry/models/openai/) にアクセスしてサインアップしてください。

以下のいずれかの方法で Weaviate に API キーを渡します。

- Weaviate が参照できる `AZURE_APIKEY` 環境変数を設定する  
- 下記の例のように、実行時に API キーを渡す

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START AzureOpenAIInstantiation"
      endMarker="# END AzureOpenAIInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START AzureOpenAIInstantiation"
      endMarker="// END AzureOpenAIInstantiation"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoConnect}
      startMarker="// START AzureOpenAIInstantiation"
      endMarker="// END AzureOpenAIInstantiation"
      language="goraw"
    />
  </TabItem>

</Tabs>

## ベクトライザーの設定

[Weaviate インデックスを設定](../../manage-collections/vector-config.mdx#specify-a-vectorizer) し、Azure OpenAI の埋め込みモデルを使用する方法を以下に示します。

モデルを選択するには、Azure リソース名を指定します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicVectorizerAzureOpenAI"
      endMarker="# END BasicVectorizerAzureOpenAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicVectorizerAzureOpenAI"
      endMarker="// END BasicVectorizerAzureOpenAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicVectorizerAzureOpenAI"
      endMarker="// END BasicVectorizerAzureOpenAI"
      language="goraw"
    />
  </TabItem>

</Tabs>

import VectorizationBehavior from '/_includes/vectorization.behavior.mdx';

<details>
  <summary>ベクトル化の挙動</summary>

<VectorizationBehavior/>

</details>



### ベクトライザーのパラメーター

以下の例では、Azure OpenAI 固有のオプションを設定する方法を示します。

- `resource_name` (必須): 使用する Azure OpenAI リソースの名前。  
- `deployment_id` (必須): Azure OpenAI リソースのデプロイメント ID。  
- `base_url` (任意): Azure OpenAI API のベース URL。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullVectorizerAzureOpenAI"
      endMarker="# END FullVectorizerAzureOpenAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullVectorizerAzureOpenAI"
      endMarker="// END FullVectorizerAzureOpenAI"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FullVectorizerAzureOpenAI"
      endMarker="// END FullVectorizerAzureOpenAI"
      language="goraw"
    />
  </TabItem>

</Tabs>

これらのパラメーターの詳細については、[Azure OpenAI API ドキュメント](https://learn.microsoft.com/en-us/azure/ai-services/openai/) を参照してください。

## ヘッダー パラメーター

追加のヘッダーをリクエストに含めることで、 API キーやいくつかの任意パラメーターを実行時に指定できます。利用可能なヘッダーは次のとおりです。

- `X-Azure-Api-Key`: Azure API キー。  
- `X-Azure-Deployment-Id`: Azure デプロイメント ID。  
- `X-Azure-Resource-Name`: Azure リソース名。

実行時に指定した追加ヘッダーは、既存の Weaviate 設定を上書きします。

上記の [API 資格情報の例](#api-credentials) のとおりにヘッダーを指定してください。

## データのインポート

ベクトライザーを設定したら、[データをインポート](../../manage-objects/import.mdx) して Weaviate に取り込みます。Weaviate は指定したモデルを使用してテキストオブジェクトの埋め込みを生成します。

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

:::tip 既存のベクトルを再利用
すでに互換性のあるモデルベクトルがある場合は、それを直接 Weaviate に渡すことができます。同じモデルで既に埋め込みを生成しており、それらを Weaviate で利用したい場合、たとえば他のシステムからデータを移行する際に便利です。
:::

## 検索

ベクトライザーを設定すると、Weaviate は指定した Azure OpenAI モデルを使用してベクトル検索およびハイブリッド検索を実行します。

![Embedding integration at search illustration](../_includes/integration_openai_azure_embedding_search.png)

### ベクトル (near text) 検索

[ベクトル検索](../../search/similarity.md#search-with-text) を実行すると、Weaviate はテキストクエリを指定したモデルで埋め込みに変換し、データベースから最も類似したオブジェクトを返します。

次のクエリは、`limit` で指定した件数 `n` 件の最も類似したオブジェクトを返します。

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

:::info What is a hybrid search?
ハイブリッド検索は、ベクトル検索とキーワード (BM25) 検索を実行し、その後 [結果を組み合わせて](../../search/hybrid.md) データベースから最適なオブジェクトを返します。
:::

[ハイブリッド検索](../../search/hybrid.md) を実行すると、 Weaviate はテキストクエリを指定されたモデルで埋め込みに変換し、データベースからスコアが最も高いオブジェクトを返します。

以下のクエリは、 `limit` で設定した `n` 件の最上位オブジェクトを返します。

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

利用可能なモデルとリージョンごとの提供状況については、 [Azure OpenAI のドキュメント](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#embeddings-models) を参照してください。

## 追加リソース

### その他のインテグレーション

- [Azure OpenAI 生成モデル + Weaviate](./generative.md)

### コード例

インテグレーションがコレクションに設定されると、 Weaviate のデータ管理および検索操作は他のコレクションと同様に機能します。モデルに依存しない以下の例をご覧ください。

- [How-to: コレクションを管理する](../../manage-collections/index.mdx) および [How-to: オブジェクトを管理する](../../manage-objects/index.mdx) ガイドでは、データ操作 (作成、読み取り、更新、削除) の方法を示しています。
- [How-to: クエリと検索](../../search/index.mdx) ガイドでは、ベクトル、キーワード、ハイブリッド検索や検索拡張生成の方法を説明しています。

### 外部リソース

- Azure OpenAI [API ドキュメント](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- Azure OpenAI [モデルと提供状況](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#embeddings-models)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

