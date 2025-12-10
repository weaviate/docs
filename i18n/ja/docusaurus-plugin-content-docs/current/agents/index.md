---
title: 概要
sidebar_position: 10
description: "パーソナライゼーション、クエリ、データ変換用エージェント向け Weaviate AI エージェント ドキュメントの概要。"
image: og/docs/agents.jpg
# tags: ['agents', 'getting started']
---

# Weaviate エージェント - 概要

Weaviate エージェントは、特定のタスク向けに設計された事前構築済みのエージェント型サービスです。Weaviate Cloud ユーザーはすぐに利用でき、Weaviate Cloud 内のデータと対話してデータエンジニアリングおよび AI 開発のワークフローを簡素化できます。

:::info Changelog and feedback
Weaviate エージェントの公式変更履歴は [こちら](https://weaviateagents.featurebase.app/changelog) でご覧いただけます。機能リクエスト、バグ報告、質問などのフィードバックは [こちら](https://weaviateagents.featurebase.app/) からご提出ください。フィードバックの状況を確認したり、他のフィードバックに投票したりできます。
:::

## Weaviate エージェントの仕組み

Weaviate エージェントは Weaviate の API に関して事前学習されており、Weaviate 固有のデータタスクを実行するエキスパートです。

必要なのは入力を提供するだけで、対象のエージェントがデータを用いて必要なタスクを実行します。

:::info Weaviate Agents is not an agent framework
Weaviate エージェントはエージェントを構築するためのフレームワークではありません。Weaviate 用に事前構築されたエージェント型サービスのセットです。
:::

## クエリ エージェント

[クエリ エージェント](./query/index.md) は、自然言語の質問に対して保存されたデータをクエリし、回答を提供します。

[![クエリ エージェントの詳細を読むにはクリック](./_includes/query_agent_usage_light.png#gh-light-mode-only "クエリ エージェントの詳細を読むにはクリック")](./query/index.md)
[![クエリ エージェントの詳細を読むにはクリック](./_includes/query_agent_usage_dark.png#gh-dark-mode-only "クエリ エージェントの詳細を読むにはクリック")](./query/index.md)

[クエリ エージェントの詳細を読む](./query/index.md)

## 変換 エージェント

:::caution Technical Preview

![Weaviate エージェントはテクニカルプレビューです。](./_includes/agents_tech_preview_light.png#gh-light-mode-only "Weaviate エージェントはテクニカルプレビューです。")
![Weaviate エージェントはテクニカルプレビューです。](./_includes/agents_tech_preview_dark.png#gh-dark-mode-only "Weaviate エージェントはテクニカルプレビューです。")

[こちらから登録](https://events.weaviate.io/weaviate-agents) して Weaviate エージェントの通知を受け取るか、[このページ](https://weaviateagents.featurebase.app/) で最新情報の確認やフィードバックの提供ができます。

:::

[変換 エージェント](./transformation/index.md) は、instructions に基づいてデータを操作し、データを強化します。

[![変換 エージェントの詳細を読むにはクリック](./_includes/transformation_agent_overview_light.png#gh-light-mode-only "変換 エージェントの詳細を読むにはクリック")](./transformation/index.md)
[![変換 エージェントの詳細を読むにはクリック](./_includes/transformation_agent_overview_dark.png#gh-dark-mode-only "変換 エージェントの詳細を読むにはクリック")](./transformation/index.md)

[変換 エージェントの詳細を読む](./transformation/index.md)

## パーソナライゼーション エージェント

:::caution Technical Preview

![Weaviate エージェントはテクニカルプレビューです。](./_includes/agents_tech_preview_light.png#gh-light-mode-only "Weaviate エージェントはテクニカルプレビューです。")
![Weaviate エージェントはテクニカルプレビューです。](./_includes/agents_tech_preview_dark.png#gh-dark-mode-only "Weaviate エージェントはテクニカルプレビューです。")

[こちらから登録](https://events.weaviate.io/weaviate-agents) して Weaviate エージェントの通知を受け取るか、[このページ](https://weaviateagents.featurebase.app/) で最新情報の確認やフィードバックの提供ができます。

:::

[パーソナライゼーション エージェント](./personalization/index.md) は、特定のペルソナ情報に基づいて出力をカスタマイズし、時間とともに学習することも可能です。

[![パーソナライゼーション エージェントの詳細を読むにはクリック](./_includes/personalization_agent_overview_light.png#gh-light-mode-only "パーソナライゼーション エージェントの詳細を読むにはクリック")](./personalization/index.md)
[![パーソナライゼーション エージェントの詳細を読むにはクリック](./_includes/personalization_agent_overview_dark.png#gh-dark-mode-only "パーソナライゼーション エージェントの詳細を読むにはクリック")](./personalization/index.md)

[パーソナライゼーション エージェントの詳細を読む](./personalization/index.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

