---
title: 生成 AI
sidebar_position: 51
# image: og/docs/integrations/provider_integrations_xai.jpg
# tags: ['model providers', 'xAI', 'generative', 'rag']
---

# Weaviate による xAI 生成 AI

:::info `v1.30.0` で追加
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.generative.py';
import TSCode from '!!raw-loader!../_includes/provider.generative.ts';

Weaviate の xAI API との統合により、xAI のモデル機能に Weaviate から直接アクセスできます。

xAI の生成 AI モデルを使用するために、[Weaviate コレクションを設定](#configure-collection) してください。Weaviate は、指定したモデルとお客様の xAI API Key を用いて 検索拡張生成 (RAG) を実行します。

より具体的には、Weaviate は検索を実行して最も関連性の高いオブジェクトを取得し、それらを xAI 上の生成モデルに渡して出力を生成します。

![RAG 統合の図](../_includes/integration_xai_rag.png)

## 要件

### Weaviate の構成

ご利用の Weaviate インスタンスには xAI 生成 (`generative-xai`) モジュールを構成する必要があります。

<details>
  <summary>Weaviate Cloud (WCD) 利用者向け</summary>

この統合は Weaviate Cloud (WCD) の serverless インスタンスではデフォルトで有効になっています。

</details>

<details>
  <summary>セルフホスト環境向け</summary>

- モジュールが有効になっているか確認するには、[クラスターメタデータ](/deploy/configuration/meta.md) を確認してください。  
- モジュールを有効化するには、[モジュール設定方法](../../configuration/modules.md) ガイドに従ってください。

</details>

### API 認証情報

この統合を使用するには、有効な API Key を Weaviate に提供する必要があります。[xAI](https://console.x.ai/) にアクセスしてサインアップし、API Key を取得してください。

次のいずれかの方法で API Key を Weaviate に渡してください。

- Weaviate から参照可能な `XAI_APIKEY` 環境変数を設定します。  
- 以下の例のように、実行時に API Key を渡します。

<Tabs groupId="languages">

 <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyConnect}
      startMarker="# START XaiInstantiation"
      endMarker="# END XaiInstantiation"
      language="py"
    />
  </TabItem>

 <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSConnect}
      startMarker="// START XaiInstantiation"
      endMarker="// END XaiInstantiation"
      language="ts"
    />
  </TabItem>

</Tabs>

## コレクションの設定

import MutableGenerativeConfig from '/_includes/mutable-generative-config.md';

<MutableGenerativeConfig />

xAI 生成 AI モデルを使用するには、次のように [Weaviate インデックスを設定](../../manage-collections/generative-reranker-models.mdx#specify-a-generative-model-integration) します。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BasicGenerativexAI"
      endMarker="# END BasicGenerativexAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START BasicGenerativexAI"
      endMarker="// END BasicGenerativexAI"
      language="ts"
    />
  </TabItem>

</Tabs>

### モデルの選択

以下の設定例のように、Weaviate が使用する [利用可能なモデル](#available-models) のいずれかを指定できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GenerativexAICustomModel"
      endMarker="# END GenerativexAICustomModel"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START GenerativexAICustomModel"
      endMarker="// END GenerativexAICustomModel"
      language="ts"
    />
  </TabItem>

</Tabs>

Weaviate が使用するモデルとして、[利用可能なモデル](#available-models) のいずれかを[指定](#generative-parameters)できます。モデルを指定しない場合は、[デフォルトモデル](#available-models) が使用されます。

### 生成パラメーター

以下の生成パラメーターを設定して、モデルの動作をカスタマイズします。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FullGenerativexAI"
      endMarker="# END FullGenerativexAI"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS API v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START FullGenerativexAI"
      endMarker="// END FullGenerativexAI"
      language="ts"
    />
  </TabItem>

</Tabs>

モデルパラメーターの詳細については、[xAI API ドキュメント](https://docs.x.ai/docs/guides/chat#parameters)をご覧ください。

## 実行時のモデル選択

コレクションを作成するときにデフォルトのモデルプロバイダーを設定するだけでなく、クエリ実行時に上書きすることもできます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python API v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RuntimeModelSelectionxAI"
      endMarker="# END RuntimeModelSelectionxAI"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RuntimeModelSelectionxAI"
      endMarker="// END RuntimeModelSelectionxAI"
      language="ts"
    />
  </TabItem>
</Tabs>

## 検索拡張生成

生成 AI との統合を設定した後、[単一プロンプト](#single-prompt) または [グループタスク](#grouped-task) の方法で RAG 操作を実行します。

### 単一プロンプト

![Single prompt RAG integration generates individual outputs per search result](../_includes/integration_xai_rag.png)

検索結果の各オブジェクトに対してテキストを生成するには、単一プロンプト方式を使用します。

次の例では、`limit` パラメーターで指定した `n` 件の検索結果それぞれに対して出力を生成します。

単一プロンプトクエリを作成するときは、波かっこ `{}` を使用して、Weaviate が言語モデルに渡すオブジェクトのプロパティを補間します。たとえば、オブジェクトの `title` プロパティを渡すには、クエリに `{title}` を含めます。

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

### グループタスク

![Grouped task RAG integration generates one output for the set of search results](../_includes/integration_xai_rag.png)

検索結果全体に対して 1 つのテキストを生成するには、グループタスク方式を使用します。

言い換えれば、`n` 件の検索結果がある場合でも、生成モデルはそのグループ全体に対して 1 つの出力を返します。

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

## 参考情報

### 利用可能なモデル

Weaviate では、[xAI の API](https://docs.x.ai/docs/models) 上の任意の生成モデルを使用できます。

デフォルトモデルは `grok-2-latest` です。

## 追加リソース

### コード例

インテグレーションをコレクションで設定すると、 Weaviate でのデータ管理および検索操作は他のコレクションとまったく同じ方法で動作します。次の model-agnostic な例を参照してください。

- [How-to: コレクションを管理する](../../manage-collections/index.mdx) および [How-to: オブジェクトを管理する](../../manage-objects/index.mdx) ガイドでは、データ操作（すなわちコレクションおよびその中のオブジェクトの作成、読み取り、更新、削除）の方法を示します。
- [How-to: クエリ & 検索](../../search/index.mdx) ガイドでは、ベクトル、キーワード、ハイブリッド検索に加えて 検索拡張生成 の実行方法を示します。

### 参考資料

- [ xAI API ドキュメント ](https://docs.x.ai/docs/introduction)

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

