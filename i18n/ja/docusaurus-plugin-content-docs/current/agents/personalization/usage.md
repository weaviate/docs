---
title: 利用方法
sidebar_position: 30
description: " Personalization Agent を実装するための技術ドキュメントと使用例。"
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'personalization agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/personalization_agent.py';

# Weaviate Personalization Agent：利用方法

:::caution Technical Preview

![この Weaviate Agent はテクニカルプレビュー版です。](../_includes/agents_tech_preview_light.png#gh-light-mode-only "この Weaviate Agent はテクニカルプレビュー版です。")
![この Weaviate Agent はテクニカルプレビュー版です。](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "この Weaviate Agent はテクニカルプレビュー版です。")

[こちらから登録してください](https://events.weaviate.io/weaviate-agents) して Weaviate Agents の通知を受け取るか、[このページ](https://weaviateagents.featurebase.app/) で最新情報の確認とフィードバックを行ってください。

:::

Weaviate Personalization Agent は、各ユーザーに合わせたパーソナライズドレコメンドを返すための エージェント型サービスです。 Personalization Agent は関連する Weaviate Cloud インスタンスのデータを使用してレコメンドを提供します。

:::tip 用語：ユーザーと開発者
Personalization Agent は特定の人物に合わせたパーソナライズドレコメンドを提供することが目的です。ここではその人物を `user` と呼びます。`developer` は、これらのレコメンドを提供するために Personalization Agent を利用する人です。
:::

開発者はユーザープロファイルを渡すだけで、 Personalization Agent が途中のすべての処理を行い、 Weaviate からのパーソナライズドレコメンドを返します。開発者視点のワークフローは次のようになります。

![Weaviate Personalization Agent from a developer perspective](../_includes/personalization_agent_overview_light.png#gh-light-mode-only "Weaviate Personalization Agent from a developer perspective")
![Weaviate Personalization Agent from a developer perspective](../_includes/personalization_agent_overview_dark.png#gh-dark-mode-only "Weaviate Personalization Agent from a developer perspective")

このページでは、 Weaviate に保存されたデータからパーソナライズドレコメンドを取得するための Weaviate Personalization Agent の使い方を説明します。

:::info Changelog and feedback
Weaviate Agents の公式変更履歴は [こちらで確認できます](https://weaviateagents.featurebase.app/changelog)。機能要望、バグ報告、質問などのフィードバックは [こちら](https://weaviateagents.featurebase.app/) から送信してください。フィードバックの状況を確認したり、他のフィードバックに投票したりできます。
:::

## 前提条件

### Weaviate インスタンス

この Agent は Weaviate Cloud インスタンスでのみ利用可能です。

Weaviate Cloud インスタンスのセットアップ方法については [Weaviate Cloud のドキュメント](/cloud/index.mdx) を参照してください。

[Weaviate Cloud](https://console.weaviate.cloud/) で無料の Sandbox インスタンスを使って、この Weaviate Agent をお試しいただけます。

### クライアントライブラリ

:::note 対応言語
現時点では、この Agent は Python のみ対応しています。他の言語は今後追加予定です。
:::

Weaviate Agents を利用するには、オプション `agents` 付きで Weaviate クライアントライブラリをインストールします。これにより `weaviate-client` パッケージと合わせて `weaviate-agents` パッケージがインストールされます。

次のコマンドでクライアントライブラリをインストールしてください。

<Tabs groupId="languages">
<TabItem value="py_agents" label="Python">

```shell
pip install -U weaviate-client[agents]
```

#### トラブルシューティング：`pip` で最新バージョンを強制インストールする

既にインストール済みの場合でも、`pip install -U "weaviate-client[agents]"` だけでは `weaviate-agents` が [最新バージョン](https://pypi.org/project/weaviate-agents/) に更新されないことがあります。その場合は `weaviate-agents` パッケージを明示的にアップグレードしてください。

```shell
pip install -U weaviate-agents
```

または [特定のバージョン](https://github.com/weaviate/weaviate-agents-python-client/tags) をインストールします。

```shell
pip install -U weaviate-agents==||site.weaviate_agents_version||
```

</TabItem>

</Tabs>

## 使い方

Personalization Agent を使用するには、次のハイレベルな手順に従います。

- パーソナライズエージェントを作成または接続する
- ユーザーペルソナを作成または選択する
- そのペルソナに対するインタラクションを追加する
- パーソナライズドレコメンドを取得する

オプションで、 Personalization Agent は以下を行えます。
- 結果のリランキング
- さらにリランキング用のカスタム instructions を指定

以下に使用例を示します。

### 前提条件

Personalization Agent は Weaviate Cloud と密接に統合されています。そのため、 Personalization Agent は Weaviate Cloud インスタンスと対応クライアントライブラリでのみ利用可能です。

### Weaviate への接続

Personalization Agent を使用するには、 Weaviate Cloud インスタンスへ接続する必要があります。 Weaviate クライアントライブラリを使用して接続します。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START ConnectToWeaviate"
            endMarker="# END ConnectToWeaviate"
            language="py"
        />
    </TabItem>
</Tabs>

### パーソナライズエージェントの作成または接続

Personalization Agent はステートフルで、ユーザーペルソナのデータが Weaviate に保持されます。そのため、新しい Personalization Agent を作成することも、既存の Agent に接続することもできます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START CreateOrConnectToAgent"
            endMarker="# END CreateOrConnectToAgent"
            language="py"
        />
    </TabItem>
</Tabs>
### ユーザー パーソナの作成

Personalization Agent は、特定ユーザー向けにパーソナライズされたレコメンデーションを提供するよう設計されています。

これを実現するには、ユーザーの属性とインタラクションをまとめた `Persona` を作成します。

各パーソナには、ユーザー ID、ユーザー プロパティの集合、およびインタラクションの集合が含まれます。

パーソナを作成するには、ユーザー ID と、パーソナライズに使用するユーザー プロパティを指定します。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START CreatePersona"
            endMarker="# END CreatePersona"
            language="py"
        />
    </TabItem>

</Tabs>

### ユーザー パーソナの管理

既存のユーザー パーソナを削除・更新したり、存在を確認できます。

#### ユーザー パーソナの削除

ユーザー パーソナを削除するには、削除対象のユーザー ID を指定します。
<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START DeletePersona"
            endMarker="# END DeletePersona"
            language="py"
        />
    </TabItem>
</Tabs>

#### ユーザー パーソナの更新

ユーザー パーソナを更新するには、更新対象のユーザー ID と新しいユーザー プロパティのセットを指定します。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START UpdatePersona"
            endMarker="# END UpdatePersona"
            language="py"
        />
    </TabItem>
</Tabs>

#### ユーザー パーソナの存在確認

ユーザー パーソナが存在するか確認するには、確認したいユーザー ID を指定します。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START CheckPersonaExists"
            endMarker="# END CheckPersonaExists"
            language="py"
        />
    </TabItem>
</Tabs>

#### ユーザー パーソナの取得

ユーザー パーソナを取得するには、取得したいユーザー ID を指定します。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START GetPersona"
            endMarker="# END GetPersona"
            language="py"
        />
    </TabItem>
</Tabs>

### インタラクションの追加

インタラクションはパーソナライズ処理の基礎データです。Personalization Agent はこれらのデータを用いてユーザーを学習し、パーソナライズされたレコメンデーションを提供します。

インタラクションを追加するには、ユーザー パーソナを選択し、インタラクションの詳細を指定します。

利用可能なパラメーターは次のとおりです。

- `persona_id`: ユーザー パーソナの ID
- `item_id`: インタラクション対象アイテムの ID
- `weight`: インタラクションの重み (例: 最も好む場合は 1、最も嫌う場合は -1)
- `replace_previous_interaction`: 同じ `item_id` の既存インタラクションを置き換えるかどうか
- `created_at`: インタラクションのタイムスタンプ (重みに影響)

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START AddUserInteractions"
            endMarker="# END AddUserInteractions"
            language="py"
        />
    </TabItem>

</Tabs>

### パーソナライズ済みオブジェクトの取得

ユーザー パーソナを作成したら、パーソナライズ済みオブジェクトを取得できます。

最低限、ユーザー ID を Personalization Agent に渡すだけで、Agent がユーザー ID を処理し、Weaviate で必要な検索を実行し、パーソナライズされたレコメンデーションを返します。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicQuery"
            endMarker="# END BasicQuery"
            language="py"
        />
    </TabItem>
</Tabs>
#### オブジェクト取得：利用可能なランキング戦略

`get_objects` を使用する際、ランキング戦略を選択できます。

Personalization Agent は、 ベクトル検索 と LLM ベースのランキングを組み合わせて、パーソナライズされたレコメンデーションを提供できます。 ベクトル検索 はユーザー ペルソナのインタラクションセットの分析に基づいています。オプションで LLM を使用して結果を再ランキングできます。

次の 3 つのモードで利用できます。

- **エージェントベースの再ランキング**: Personalization Agent はまず ベクトル検索 を実行してアイテムを取得し、その後ユーザー ペルソナに基づいて LLM で再ランキングします。これがデフォルトモードです。  
- **カスタム instructions 付きエージェントベースの再ランキング**: カスタム instructions を指定した場合、Personalization Agent はその instructions を用いて結果を再ランキングします。これにより、特定のニーズに合わせてランキングプロセスをカスタマイズできます。  
- **ベクトル検索のみ**: エージェントランキングを使用せずに結果を取得する場合、結果は ベクトル検索 のみを基に返されます。  

#### オブジェクト取得：パラメーター

パーソナライズされたオブジェクト取得で利用可能なパラメーターは次のとおりです。

- `limit`: 返却する最大アイテム数  
- `recent_interactions_count`: パーソナライズに考慮する直近インタラクション数  
- `exclude_interacted_items`: すでにユーザーがインタラクションしたアイテムを除外するかどうか  
- `decay_rate`: 古いインタラクションに対する減衰率 (1.0 = 古いインタラクションを大きく割引、0.0 = 割引なし)  
- `exclude_items`: レコメンデーションから除外するアイテム ID のリスト  
- `use_agent_ranking`: エージェントで再ランキングを行うかどうか  
- `instruction`: 再ランキング用のカスタム instructions  
- `explain_results`: 結果に説明を含めるかどうか  

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryParameters"
            endMarker="# END QueryParameters"
            language="py"
        />
    </TabItem>
</Tabs>

#### オブジェクト取得：結果の確認

Personalization Agent のレスポンスには、パーソナライズされたレコメンデーションが含まれます。

オプションに応じて、レスポンスには次の情報も含まれる場合があります。

- レコメンデーションの根拠  
- 各オブジェクトについて  
    - アイテムの元の順位  
    - パーソナライズ後の順位  

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START InspectResults"
            endMarker="# END InspectResults"
            language="py"
        />
    </TabItem>
</Tabs>

### パーソナライズされた Weaviate クエリ

Personalization Agent は、パーソナライズされた Weaviate クエリの実行にも利用できます。

[`get_objects` メソッド](#get-personalized-objects) とは異なり、パーソナライズされたクエリには追加の Weaviate クエリが含まれます。

Weaviate の `near_text`、`bm25`、`hybrid` クエリは、Personalization Agent と組み合わせてパーソナライズされた結果を提供できます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START PersonalizedWeaviateQuery"
            endMarker="# END PersonalizedWeaviateQuery"
            language="py"
        />
    </TabItem>
</Tabs>

Weaviate クエリの結果を Personalization Agent で再ランキングしたい場合に、パーソナライズされた Weaviate クエリを使用してください。

Personalization Agent はまず Weaviate クエリを実行してアイテムを取得し、その後ユーザーペルソナに基づいて LLM で再ランキングします。

#### パーソナライズされた Weaviate クエリ：パラメーター

パーソナライズされた Weaviate クエリのパラメーターは、クエリメソッド (`near_text`、`bm25`、`hybrid`) の手前で指定します。

- `persona_id`: ユーザーペルソナの ID  
- `strength`: パーソナライズの強度 (0.0 = パーソナライズなし、1.0 = 完全にパーソナライズしクエリ結果を無視)  
- `overfetch_factor`: パーソナライズ前に取得するオブジェクト数  
- `recent_interactions_count`: パーソナライズに考慮する直近インタラクション数  
- `decay_rate`: 古いインタラクションに対する減衰率 (1.0 = 古いインタラクションを大きく割引、0.0 = 割引なし)  

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START ParamsPersonalizedWeaviateQuery"
            endMarker="# END ParamsPersonalizedWeaviateQuery"
            language="py"
        />
    </TabItem>
</Tabs>

## 制限事項とトラブルシューティング

:::caution Technical Preview

![This Weaviate Agent is in technical preview.](../_includes/agents_tech_preview_light.png#gh-light-mode-only "This Weaviate Agent is in technical preview.")
![This Weaviate Agent is in technical preview.](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "This Weaviate Agent is in technical preview.")

[こちらから登録](https://events.weaviate.io/weaviate-agents) して Weaviate エージェントの通知を受け取るか、[このページ](https://weaviateagents.featurebase.app/) で最新情報を確認しフィードバックをお寄せください。

:::

### 使用制限

現在、エージェントベースの再ランキングを使用する場合、1 つの Weaviate Cloud の [組織](/cloud/platform/users-and-organizations.mdx#organizations) あたり 1 日 100 件の Personalization Agent クエリ制限があります。

ベクトル検索のみ（エージェントベースの再ランキングを行わない場合）のクエリ数には制限はありません。

この制限は Personalization Agent の将来のバージョンで変更される可能性があります。
### 既知の問題

現在、 Weaviate クエリと personalization agent クエリを組み合わせた機能は named vectors ではご利用いただけません。これは既知の問題であり、近日中に解決される予定です。

## 質問とフィードバック

:::info Changelog and feedback
Weaviate Agents の公式変更履歴は [こちら](https://weaviateagents.featurebase.app/changelog) からご覧いただけます。フィーチャーリクエスト、バグ報告、質問などのフィードバックがありましたら、[こちら](https://weaviateagents.featurebase.app/) からご送信ください。送信後は、ご自身のフィードバックのステータスを確認したり、他のユーザーのフィードバックに投票したりできます。
:::

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>