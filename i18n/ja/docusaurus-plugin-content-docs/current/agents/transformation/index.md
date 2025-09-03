---
title: 変換エージェント
sidebar_position: 30
description: "Weaviate のコレクションにある既存データを強化・拡充・変換する AI エージェントの概要。"
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'transformation agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/transformation_agent.py';

# Weaviate 変換エージェント

:::caution Technical Preview

![この Weaviate エージェントはテクニカルプレビュー版です。](../_includes/agents_tech_preview_light.png#gh-light-mode-only "この Weaviate エージェントはテクニカルプレビュー版です。")  
![この Weaviate エージェントはテクニカルプレビュー版です。](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "この Weaviate エージェントはテクニカルプレビュー版です。")

[こちらからサインアップ](https://events.weaviate.io/weaviate-agents)して Weaviate エージェントの通知を受け取るか、[このページ](https://weaviateagents.featurebase.app/)で最新情報の確認やフィードバックの送信を行ってください。

:::

:::warning 本番環境では使用しないでください
Weaviate 変換エージェントは、Weaviate 内のデータをその場で変更するよう設計されています。**テクニカルプレビュー期間中は、本番環境で使用しないでください。** エージェントが期待どおりに動作しない可能性があり、Weaviate インスタンス内のデータが予期せぬ形で変更される場合があります。
:::

Weaviate 変換エージェント (Transformation Agent) は、生成モデルを用いてデータを拡張・変換するエージェント型サービスです。既存のオブジェクトに対して新しいプロパティを追加したり、既存プロパティを更新したりできます。

![Weaviate 変換エージェントの例 - 追加](../_includes/transformation_agent_append_example_light.png#gh-light-mode-only "Weaviate 変換エージェントの例 - 追加")  
![Weaviate 変換エージェントの例 - 追加](../_includes/transformation_agent_append_example_dark.png#gh-dark-mode-only "Weaviate 変換エージェントの例 - 追加")

これにより、アプリケーションでのさらなる活用に向けて、Weaviate コレクション内オブジェクトの品質を向上させられます。

## アーキテクチャ

変換エージェントは Weaviate Cloud 上のサービスとして提供され、既存の Weaviate オブジェクトに対して新しいプロパティの追加や既存プロパティの更新を行います。

![Weaviate 変換エージェントの概要](../_includes/transformation_agent_overview_light.png#gh-light-mode-only "Weaviate 変換エージェントの概要")  
![Weaviate 変換エージェントの概要](../_includes/transformation_agent_overview_dark.png#gh-dark-mode-only "Weaviate 変換エージェントの概要")

変換エージェントには、更新対象のコレクション名や確認対象の既存プロパティ、そして instructions などの指示を渡してください。エージェントは指定されたオブジェクトに対し、指示どおりの操作を実行します。

:::note オブジェクト総数は変わりません
オブジェクト数自体は増減せず、指定オブジェクトのプロパティのみが更新されます。
:::

## 変換エージェント：ワークフローの可視化

既存オブジェクトを変換する際、変換エージェントは以下の手順で動作します。

- 変換エージェントが指定条件に基づき Weaviate から既存オブジェクトを取得します（ステップ 1–2）。
- 取得した既存プロパティのコンテキストと instructions を基に、生成モデルで新しいプロパティ値を生成します（ステップ 3–4）。
- 変換後のオブジェクトを Weaviate に更新します。必要に応じ、指定した ベクトライザー でベクトル化が行われます（ステップ 5–7）。
- Weaviate からジョブステータスが返され、最終的にユーザーへ返却されます（ステップ 8）。

### 既存オブジェクトのプロパティを更新

既存プロパティを更新する場合、変換エージェントは既存値を新しい値で置き換えます。ワークフローは以下のとおりです。

![Weaviate 変換エージェント: 既存オブジェクトのプロパティを更新](../_includes/transformation_agent_existing_update_light.png#gh-light-mode-only "Weaviate 変換エージェント: 既存オブジェクトのプロパティを更新")  
![Weaviate 変換エージェント: 既存オブジェクトのプロパティを更新](../_includes/transformation_agent_existing_update_dark.png#gh-dark-mode-only "Weaviate 変換エージェント: 既存オブジェクトのプロパティを更新")

### 既存オブジェクトに新しいプロパティを追加

プロパティを追加する場合、変換エージェントは新しい値を新規プロパティとしてオブジェクトに追加します。ワークフローは以下のとおりです。

![Weaviate 変換エージェント: 既存オブジェクトに新しいプロパティを追加](../_includes/transformation_agent_existing_append_light.png#gh-light-mode-only "Weaviate 変換エージェント: 既存オブジェクトに新しいプロパティを追加")  
![Weaviate 変換エージェント: 既存オブジェクトに新しいプロパティを追加](../_includes/transformation_agent_existing_append_dark.png#gh-dark-mode-only "Weaviate 変換エージェント: 既存オブジェクトに新しいプロパティを追加")

## 基本的な使い方

ここでは Weaviate 変換エージェントの基本的な利用方法を概説します。詳細は [Usage](./usage.md) ページをご覧ください。

### 前提条件

本エージェントは Weaviate Cloud インスタンスと、対応するバージョンの Weaviate クライアントライブラリでのみ利用できます。

### 使用例

変換エージェントを使用するには、次の入力でインスタンス化します。

- Weaviate Cloud インスタンスに接続した Weaviate クライアント（例：Python の `WeaviateClient` オブジェクト）
- 変換対象コレクションの名前
- 実行する変換操作のリスト

その後、操作を開始します。

変換操作は非同期で実行されます。各操作はワークフロー ID を返すので、ユーザーはその ID を用いてステータスを確認できます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SimpleTransformationAgentExample"
            endMarker="# END SimpleTransformationAgentExample"
            language="py"
        />
    </TabItem>

</Tabs>

変換された属性は処理が進むにつれて各オブジェクトに反映されます。

### さらに詳しいドキュメント

本エージェントの詳細な使用方法については、[Usage](./usage.md) ページを参照してください。

## 質問とフィードバック

:::info Changelog and feedback
Weaviate エージェントの公式変更履歴は[こちら](https://weaviateagents.featurebase.app/changelog)で確認できます。機能要望・バグ報告・質問などのフィードバックは、[こちら](https://weaviateagents.featurebase.app/)から送信してください。フィードバックのステータス確認や他の提案への投票も可能です。
:::

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>