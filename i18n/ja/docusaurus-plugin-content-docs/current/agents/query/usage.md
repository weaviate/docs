---
title: 使用方法
sidebar_position: 30
description: "Query Agent を実装するための技術ドキュメントと使用例。"
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'query agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/query_agent.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/query_agent.mts';

# Weaviate Query Agent：使用方法

:::caution Technical Preview

![この Weaviate エージェントは技術プレビュー版です。](../_includes/agents_tech_preview_light.png#gh-light-mode-only "この Weaviate エージェントは技術プレビュー版です。")
![この Weaviate エージェントは技術プレビュー版です。](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "この Weaviate エージェントは技術プレビュー版です。")

[こちら](https://events.weaviate.io/weaviate-agents)から Weaviate エージェントに関する通知に登録するか、[このページ](https://weaviateagents.featurebase.app/)で最新情報の確認とフィードバックをお願いします。

:::

Weaviate Query Agent は、Weaviate Cloud に保存されたデータを基に自然言語クエリへ回答するために設計された、あらかじめ構築されたエージェントサービスです。

ユーザーは自然言語でプロンプト／質問を入力するだけで、Query Agent が間の処理をすべて行い、回答を提供します。

![Weaviate Query Agent をユーザー視点で示した図](../_includes/query_agent_usage_light.png#gh-light-mode-only "Weaviate Query Agent をユーザー視点で示した図")
![Weaviate Query Agent をユーザー視点で示した図](../_includes/query_agent_usage_dark.png#gh-dark-mode-only "Weaviate Query Agent をユーザー視点で示した図")

このページでは、Weaviate Cloud に保存されたデータを用いて、Query Agent で自然言語クエリに回答する方法を説明します。

## 前提条件

### Weaviate インスタンス

このエージェントは Weaviate Cloud インスタンスでのみご利用いただけます。Weaviate Cloud インスタンスのセットアップ方法については、[Weaviate Cloud ドキュメント](/cloud/index.mdx)をご覧ください。

[Weaviate Cloud](https://console.weaviate.cloud/) の無料 Sandbox インスタンスで、この Weaviate エージェントをお試しいただけます。

### クライアントライブラリ

:::note Supported languages
現時点では、このエージェントは Python と JavaScript のみ対応しています。他の言語は今後サポート予定です。
:::

Python では、Weaviate エージェントを利用するために `agents` というオプション付きで Weaviate クライアントライブラリをインストールできます。これにより `weaviate-client` パッケージと共に `weaviate-agents` パッケージがインストールされます。JavaScript では、`weaviate-client` パッケージと併せて `weaviate-agents` パッケージをインストールしてください。

次のコマンドでクライアントライブラリをインストールします。

<Tabs groupId="languages">
<TabItem value="py_agents" label="Python">

```shell
pip install -U weaviate-client[agents]
```

#### トラブルシューティング：`pip` で最新バージョンを強制インストールする

既存のインストールがある場合、`pip install -U "weaviate-client[agents]"` を実行しても `weaviate-agents` が[最新バージョン](https://pypi.org/project/weaviate-agents/)にアップグレードされないことがあります。その際は、`weaviate-agents` パッケージを明示的にアップグレードしてください。

```shell
pip install -U weaviate-agents
```

または[特定のバージョン](https://github.com/weaviate/weaviate-agents-python-client/tags)をインストールします。

```shell
pip install -U weaviate-agents==||site.weaviate_agents_version||
```

</TabItem>
<TabItem value="ts_agents" label="JavaScript/TypeScript">

```shell
npm install weaviate-agents@latest
```

</TabItem>

</Tabs>

## Query Agent のインスタンス化

### 基本的なインスタンス化

以下を指定します。
- 対象 Weaviate Cloud インスタンスの詳細（例：`WeaviateClient` オブジェクト）
- クエリ対象となるデフォルトのコレクション一覧

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START InstantiateQueryAgent"
            endMarker="# END InstantiateQueryAgent"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START InstantiateQueryAgent"
            endMarker="// END InstantiateQueryAgent"
            language="ts"
        />
    </TabItem>

</Tabs>

### コレクションの設定

クエリ対象のコレクション一覧は、次の項目でさらに設定できます。
- テナント名（マルチテナントコレクションの場合は必須）
- クエリに使用するコレクションのベクトル（任意）
- エージェントが使用するプロパティ名のリスト（任意）

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentCollectionConfiguration"
            endMarker="# END QueryAgentCollectionConfiguration"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START QueryAgentCollectionConfiguration"
            endMarker="// END QueryAgentCollectionConfiguration"
            language="ts"
        />
    </TabItem>

</Tabs>

:::info Query Agent がアクセスできる範囲

Query Agent は、渡された Weaviate クライアントオブジェクトから認証情報を取得します。このアクセス範囲は、Query Agent に指定したコレクション名でさらに制限できます。

例えば、関連付けられた Weaviate の認証情報が一部のコレクションにしかアクセス権限を持たない場合、Query Agent もそのコレクションにのみアクセスできます。

:::
### 追加オプション

 Query Agent は、次のような追加オプションを指定してインスタンス化できます。

- `system_prompt`: Weaviate チームが提供するデフォルトのシステムプロンプトを置き換えるカスタムシステムプロンプト（JavaScript では `systemPrompt`）。
- `timeout`: 1 件のクエリに対して Query Agent が費やす最大時間（秒）。サーバー側のデフォルトは 60 です。

### 非同期 Python クライアント

非同期 Python クライアントでの使用例については、[非同期 Python クライアントのセクション](#usage---async-python-client)を参照してください。

## クエリの実行

 Query Agent に自然言語のクエリを渡してください。 Query Agent はクエリを処理し、 Weaviate で必要な検索を実行して、回答を返します。

これは同期操作です。回答が得られ次第、 Query Agent はただちにユーザーへ返します。

:::tip クエリを慎重に検討しましょう
 Query Agent は、あなたのクエリを基に戦略を立てます。そのため、可能な限りあいまいさがなく、十分でありつつ簡潔なクエリを心がけましょう。
:::

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicQuery"
            endMarker="# END BasicQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicQuery"
            endMarker="// END BasicQuery"
            language="ts"
        />
    </TabItem>

</Tabs>

### 実行時にコレクションを設定

クエリ時に、クエリ対象のコレクション一覧を名前だけ、または詳細設定付きで上書きできます。

#### コレクション名のみを指定

この例では、今回のクエリに限り Query Agent に設定されているコレクションを上書きします。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentRunBasicCollectionSelection"
            endMarker="# END QueryAgentRunBasicCollectionSelection"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START QueryAgentRunBasicCollectionSelection"
            endMarker="// END QueryAgentRunBasicCollectionSelection"
            language="ts"
        />
    </TabItem>

</Tabs>

#### コレクションを詳細に設定

この例では、今回のクエリに限り Query Agent に設定されているコレクションを上書きし、必要に応じて追加オプションも指定しています。例えば次のような項目です。
- 対象ベクトル
- 表示するプロパティ
- 対象テナント

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentRunCollectionConfig"
            endMarker="# END QueryAgentRunCollectionConfig"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START QueryAgentRunCollectionConfig"
            endMarker="// END QueryAgentRunCollectionConfig"
            language="ts"
        />
    </TabItem>

</Tabs>

### フォローアップクエリ

 Query Agent は、前回のレスポンスを追加コンテキストとして利用し、フォローアップクエリにも対応できます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START FollowUpQuery"
            endMarker="# END FollowUpQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START FollowUpQuery"
            endMarker="// END FollowUpQuery"
            language="ts"
        />
    </TabItem>

</Tabs>
## ストリーム応答

Query Agent では応答をストリーム配信することもでき、生成中の回答をリアルタイムで受け取れます。

ストリーミング応答は、次のオプションパラメーターで要求できます。

- `include_progress` : `True` にすると、 Query Agent はクエリを処理する過程で進捗情報をストリーム配信します。
- `include_final_state` : `True` にすると、回答が生成され次第、 Query Agent が最終的な回答をストリーム配信し、全体が生成完了するまで待たずに返します。

`include_progress` と `include_final_state` の両方を `False` にすると、 Query Agent は進捗更新や最終状態を含めず、生成された回答トークンのみを配信します。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START StreamResponse"
            endMarker="# END StreamResponse"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START StreamResponse"
            endMarker="// END StreamResponse"
            language="ts"
        />
    </TabItem>
</Tabs>

## 応答の検査

Query Agent からの応答には、最終的な回答に加えて追加の補足情報が含まれます。

補足情報には、実行された検索や集約、欠けていた可能性のある情報、エージェントが使用した LLM トークン数などが含まれる場合があります。

### 補助関数

提供されている補助関数 (例: `.display()` メソッド) を使用すると、応答を読みやすい形式で表示できます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicQuery"
            endMarker="# END BasicQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicQuery"
            endMarker="// END BasicQuery"
            language="ts"
        />
    </TabItem>

</Tabs>

これにより、応答と Query Agent が取得した補足情報の概要が表示されます。

<details>
  <summary>Example output</summary>

```text
╭──────────────────────────────────────────────────────── 🔍 Original Query ─────────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ I like vintage clothes and and nice shoes. Recommend some of each below $60.                                                       │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────────── 📝 Final Answer ──────────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ For vintage clothes under $60, here are some great options:                                                                        │
│                                                                                                                                    │
│ 1. **Vintage Scholar Turtleneck** - $55.00: This piece from the Dark Academia collection offers comfort with a stylish pleated     │
│ detail, perfect for a scholarly wardrobe (available in black and grey).                                                            │
│ 2. **Retro Pop Glitz Blouse** - $46.00: Part of the Y2K collection, this blouse adds shimmer and features a dramatic collar for a  │
│ pop culture-inspired look (available in silver).                                                                                   │
│ 3. **Retro Glitz Halter Top** - $29.98: Embrace early 2000s glamour with this halter top, suitable for standing out with its shiny │
│ pastel fabric (available in pink and purple).                                                                                      │
│ 4. **Metallic Pastel Dream Cardigan** - $49.00: This cardigan features a metallic sheen and is perfect for a colorful, nostalgic   │
│ touch (available in blue and pink).                                                                                                │
│                                                                                                                                    │
│ For nice shoes under $60:                                                                                                          │
│                                                                                                                                    │
│ 1. **Mystic Garden Strappy Flats** - $59.00: These gold flats feature delicate vine and floral patterns, ideal for adding a touch  │
│ of magic to your outfit.                                                                                                           │
│ 2. **Garden Serenade Sandals** - $56.00: These sandals from the Cottagecore collection have ivy-green straps with cream floral     │
│ patterns, embodying a romantic countryside aesthetic.                                                                              │
│ 3. **Forest Murmur Sandals** - $59.00: With a soft green hue and gold accents, these sandals from the Fairycore collection are     │
│ both elegant and whimsical.                                                                                                        │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────── 🔭 Searches Executed 1/2 ─────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ QueryResultWithCollection(                                                                                                         │
│     queries=['vintage clothes'],                                                                                                   │
│     filters=[[IntegerPropertyFilter(property_name='price', operator=<ComparisonOperator.LESS_THAN: '<'>, value=60.0)]],            │
│     filter_operators='AND',                                                                                                        │
│     collection='Ecommerce'                                                                                                         │
│ )                                                                                                                                  │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────── 🔭 Searches Executed 2/2 ─────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ QueryResultWithCollection(                                                                                                         │
│     queries=['nice shoes'],                                                                                                        │
│     filters=[[IntegerPropertyFilter(property_name='price', operator=<ComparisonOperator.LESS_THAN: '<'>, value=60.0)]],            │
│     filter_operators='AND',                                                                                                        │
│     collection='Ecommerce'                                                                                                         │
│ )                                                                                                                                  │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                    │
│ 📊 No Aggregations Run                                                                                                             │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────── 📚 Sources ────────────────────────────────────────────────────────────╮
│                                                                                                                                    │
│  - object_id='3e3fc965-0a08-4095-b538-5362404a4aab' collection='Ecommerce'                                                         │
│  - object_id='3ce04def-fe06-48bd-ba0e-aa491ba2b3c5' collection='Ecommerce'                                                         │
│  - object_id='cece6613-0ad8-44a5-9da3-a99bcbe67141' collection='Ecommerce'                                                         │
│  - object_id='1be234ae-7665-4e8c-9758-07ba87997ca1' collection='Ecommerce'                                                         │
│  - object_id='5ee7874b-e70b-4af7-b053-cce74c10e406' collection='Ecommerce'                                                         │
│  - object_id='c7dd08d3-fe8e-44c2-8f99-8271c3ba24ee' collection='Ecommerce'                                                         │
│  - object_id='5f35dc8f-18f5-4388-845d-0383927dfee0' collection='Ecommerce'                                                         │
│                                                                                                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯


   📊 Usage Statistics
┌────────────────┬──────┐
│ LLM Requests:  │ 4    │
│ Input Tokens:  │ 8621 │
│ Output Tokens: │ 504  │
│ Total Tokens:  │ 9125 │
└────────────────┴──────┘

Total Time Taken: 15.80s
```

</details>

### 検査例

この例では、次の内容が出力されます。

- 元のユーザークエリ
- Query Agent が提供した回答
- Query Agent が実行した検索と集約 (存在する場合)
- 不足している情報

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START InspectResponseExample"
            endMarker="# END InspectResponseExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START InspectResponseExample"
            endMarker="// END InspectResponseExample"
            language="ts"
        />
    </TabItem>

</Tabs>

## Async Python クライアントの利用

非同期 Python Weaviate クライアントを使用する場合も、インスタンス化のパターンはほぼ同じです。相違点は `QueryAgent` クラスの代わりに `AsyncQueryAgent` クラスを使用することです。

結果として、非同期パターンは以下のように動作します。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START UsageAsyncQueryAgent"
            endMarker="# END UsageAsyncQueryAgent"
            language="py"
        />
    </TabItem>
</Tabs>

### ストリーミング

非同期 Query Agent も応答のストリーム配信に対応しており、生成中の回答を受け取ることができます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START StreamAsyncResponse"
            endMarker="# END StreamAsyncResponse"
            language="py"
        />
    </TabItem>
</Tabs>
## 制限事項とトラブルシューティング

:::caution Technical Preview

![この Weaviate エージェントはテクニカルプレビューです。](../_includes/agents_tech_preview_light.png#gh-light-mode-only "この Weaviate エージェントはテクニカルプレビューです。")
![この Weaviate エージェントはテクニカルプレビューです。](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "この Weaviate エージェントはテクニカルプレビューです。")

[こちらから登録](https://events.weaviate.io/weaviate-agents)して Weaviate Agents に関する通知を受け取るか、最新情報とフィードバックの送信については[このページ](https://weaviateagents.featurebase.app/)をご覧ください。

:::

### 利用制限

import UsageLimits from "/_includes/agents/query-agent-usage-limits.mdx";

<UsageLimits />

### カスタムコレクションの説明

import CollectionDescriptions from "/_includes/agents/query-agent-collection-descriptions.mdx";

<CollectionDescriptions />

### 実行時間

import ExecutionTimes from "/_includes/agents/query-agent-execution-times.mdx";

<ExecutionTimes />

## 質問とフィードバック

:::info Changelog and feedback
Weaviate Agents の公式変更履歴は[こちら](https://weaviateagents.featurebase.app/changelog)でご覧いただけます。機能の要望、バグ報告、質問などがありましたら、[こちら](https://weaviateagents.featurebase.app/)からご提出ください。送信したフィードバックのステータスを確認したり、他のフィードバックへ投票したりできます。
:::

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>