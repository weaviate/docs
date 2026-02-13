---
title: 生成 AI
description: OpenAI-Azure 生成モデルプロバイダー
sidebar_position: 50
image: og/docs/integrations/provider_integrations_openai_azure.jpg
# tags: ['model providers', 'azure', 'openai', 'generative', 'rag']
---

# Weaviate を用いた Azure OpenAI 生成 AI


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.generative.py';
import TSCode from '!!raw-loader!../_includes/provider.generative.ts';

Weaviate と Azure OpenAI の API を統合することで、モデルの機能に Weaviate から直接アクセスできます。

[コレクションを設定](#configure-collection)して Azure OpenAI の 生成 AI モデルを使用すると、Weaviate は指定したモデルとお持ちの Azure OpenAI API キーを用いて 検索拡張生成 (RAG) を実行します。

具体的には、Weaviate が検索を行い、最も関連性の高いオブジェクトを取得し、それらを Azure OpenAI の 生成モデルに渡して出力を生成します。

![RAG 統合のイメージ](../_includes/integration_openai_azure_rag.png)

## 要件

### Weaviate の設定

お使いの Weaviate インスタンスは、Azure OpenAI 生成 AI 統合モジュール（`generative-openai`）が有効になっている必要があります。

<details>
  <summary>Weaviate Cloud (WCD) ユーザー向け</summary>

この統合は Weaviate Cloud (WCD) のサーバーレスインスタンスではデフォルトで有効になっています。

</details>

<details>
  <summary>セルフホストユーザー向け</summary>

- [クラスターメタデータ](/deploy/configuration/meta.md)を確認して、モジュールが有効かどうか検証してください。  
- Weaviate でモジュールを有効化する方法は、[モジュール設定方法](../../configuration/modules.md)をご覧ください。

</details>

### API 資格情報

この統合を使用するには、有効な Azure OpenAI API キーを Weaviate に提供する必要があります。API キーの取得については [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-foundry/models/openai/) にアクセスしてください。

以下のいずれかの方法で API キーを Weaviate に渡します。

- Weaviate から参照可能な `AZURE_APIKEY` 環境変数を設定する  
- 例に示すように、実行時に API キーを渡す

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

</Tabs>

## コレクションの設定

import MutableGenerativeConfig from '/_includes/mutable-generative-config.md';

<MutableGenerativeConfig />

OpenAI Azure の 生成モデルを使用するには、以下のように [Weaviate インデックスを設定](../../manage-collections/generative-reranker-models.mdx#specify-a-generative-model-integration)してください。

モデルを選択するには、Azure のリソース名を指定します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicGenerativeAzureOpenAI"
      endMarker="# END BasicGenerativeAzureOpenAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicGenerativeAzureOpenAI"
      endMarker="// END BasicGenerativeAzureOpenAI"
      language="ts"
    />
  </TabItem>

</Tabs>

### 生成パラメーター

以下の生成パラメーターを設定して、モデルの動作をカスタマイズできます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullGenerativeAzureOpenAI"
      endMarker="# END FullGenerativeAzureOpenAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullGenerativeAzureOpenAI"
      endMarker="// END FullGenerativeAzureOpenAI"
      language="ts"
    />
  </TabItem>

</Tabs>

これらのパラメーターの詳細については、[Azure OpenAI API ドキュメント](https://learn.microsoft.com/en-us/azure/ai-services/openai/)を参照してください。

## ヘッダー パラメーター

実行時にリクエストの追加ヘッダーを通じて、API キーといくつかのオプションパラメーターを指定できます。利用可能なヘッダーは次のとおりです。

- `X-Azure-Api-Key`: Azure API キー  
- `X-Azure-Deployment-Id`: Azure デプロイメント ID  
- `X-Azure-Resource-Name`: Azure リソース名  

実行時に指定された追加ヘッダーは、既存の Weaviate 設定を上書きします。

ヘッダーは上記の [API 資格情報の例](#api-credentials) のとおりに指定してください。

## 検索拡張生成

生成 AI 連携を設定した後、[シングル プロンプト](#single-prompt) または [グループ化タスク](#grouped-task) のいずれかの方法で RAG 操作を実行します。

### シングル プロンプト

![シングル プロンプトの RAG 連携は検索結果ごとに個別の出力を生成します](../_includes/integration_openai_azure_rag_single.png)

検索結果に含まれる各オブジェクトごとにテキストを生成するには、シングル プロンプト方式を使用します。

以下の例では、`limit` パラメーターで指定した `n` 件の検索結果それぞれに対して出力を生成します。

シングル プロンプト クエリを作成する際は、Weaviate が言語モデルに渡すオブジェクトのプロパティを波かっこ `{}` でインターポレートします。たとえば、オブジェクトの `title` プロパティを渡すには、クエリ内に `{title}` を含めます。

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START SinglePromptExample"
      endMarker="# END SinglePromptExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START SinglePromptExample"
      endMarker="// END SinglePromptExample"
      language="ts"
    />
  </TabItem>

</Tabs>

### グループ化タスク

![グループ化タスクの RAG 連携は検索結果の集合に対して 1 つの出力を生成します](../_includes/integration_openai_azure_rag_grouped.png)

検索結果全体に対して 1 つのテキストを生成するには、グループ化タスク方式を使用します。

言い換えると、`n` 件の検索結果がある場合でも、生成モデルはその集合に対して 1 つの出力のみを生成します。

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GroupedTaskExample"
      endMarker="# END GroupedTaskExample"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START GroupedTaskExample"
      endMarker="// END GroupedTaskExample"
      language="ts"
    />
  </TabItem>

</Tabs>

## 参考資料

### 利用可能なモデル

利用可能なモデルとリージョンごとの提供状況については、[Azure OpenAI ドキュメント](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models) を参照してください。

## 追加リソース

### そのほかのインテグレーション

- [Azure OpenAI 埋め込みモデル + Weaviate](./embeddings.md)

### コード例

インテグレーションがコレクションに対して設定されると、Weaviate におけるデータ管理および検索操作は他のコレクションとまったく同じ方法で動作します。モデルに依存しない次の例をご覧ください。

- [How-to: Manage collections](../../manage-collections/index.mdx) と [How-to: Manage objects](../../manage-objects/index.mdx) のガイドでは、データ操作（コレクションおよびその内部のオブジェクトの作成、読み取り、更新、削除）の方法を説明しています。  
- [How-to: Query & Search](../../search/index.mdx) のガイドでは、ベクトル、キーワード、ハイブリッドなどの検索操作および検索拡張生成の実行方法を説明しています。

### 参考リンク

- Azure OpenAI [API documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)  
- Azure OpenAI [models and availability](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

