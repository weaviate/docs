---
title: 概要
sidebar_position: 10
description: Weaviate AI エージェントのパーソナライゼーション、クエリ、およびデータ変換エージェントに関するドキュメントの概要。
image: og/docs/agents.jpg
# tags: ['agents', 'getting started']
---

# Weaviate Agents - 概要

:::caution Technical Preview

![Weaviate Agents はテクニカルプレビューです。](./_includes/agents_tech_preview_light.png#gh-light-mode-only "Weaviate Agents はテクニカルプレビューです。")
![Weaviate Agents はテクニカルプレビューです。](./_includes/agents_tech_preview_dark.png#gh-dark-mode-only "Weaviate Agents はテクニカルプレビューです。")

[こちらから登録してください](https://events.weaviate.io/weaviate-agents) Weaviate Agents の通知を受け取るか、[このページ](https://weaviateagents.featurebase.app/)で最新情報を確認しフィードバックをお寄せください。

:::

Weaviate Agents は、特定のタスク向けに設計されたあらかじめ構築されたエージェント サービスです。Weaviate Cloud ユーザーは、Weaviate Cloud 内のデータと対話してデータ エンジニアリングおよび AI 開発ワークフローを簡素化できます。

:::info 更新履歴とフィードバック
Weaviate Agents の公式更新履歴は[こちら](https://weaviateagents.featurebase.app/changelog)でご覧いただけます。機能リクエスト、不具合報告、質問などのフィードバックは[こちら](https://weaviateagents.featurebase.app/)からお送りください。送信後はステータスを確認したり、他のフィードバックに投票したりできます。
:::

## Weaviate Agents の仕組み

Weaviate Agents は Weaviate の API を事前学習しており、Weaviate 固有のデータタスクを実行するエキスパートです。

入力を提供するだけで、各エージェントがデータを使って必要なタスクを実行します。

:::info Weaviate Agents はエージェントフレームワークではありません
Weaviate Agents はエージェントを構築するためのフレームワークではなく、Weaviate 向けに事前構築されたエージェント サービスのセットです。
:::

## Query エージェント

[Query エージェント](./query/index.md) は、自然言語の質問に対し、保存されているデータをクエリして回答を提供します。

[![Query エージェントの詳細はこちら](./_includes/query_agent_usage_light.png#gh-light-mode-only "Query エージェントの詳細はこちら")](./query/index.md)
[![Query エージェントの詳細はこちら](./_includes/query_agent_usage_dark.png#gh-dark-mode-only "Query エージェントの詳細はこちら")](./query/index.md)

[Query エージェントについて詳しく読む](./query/index.md)

## Transformation エージェント

[Transformation エージェント](./transformation/index.md) は、instructions に基づいてデータを操作し、データを強化します。

[![Transformation エージェントの詳細はこちら](./_includes/transformation_agent_overview_light.png#gh-light-mode-only "Transformation エージェントの詳細はこちら")](./transformation/index.md)
[![Transformation エージェントの詳細はこちら](./_includes/transformation_agent_overview_dark.png#gh-dark-mode-only "Transformation エージェントの詳細はこちら")](./transformation/index.md)

[Transformation エージェントについて詳しく読む](./transformation/index.md)

## Personalization エージェント

[Personalization エージェント](./personalization/index.md) は、特定のペルソナ情報に基づいて出力をカスタマイズし、時間とともに学習することもできます。

[![Personalization エージェントの詳細はこちら](./_includes/personalization_agent_overview_light.png#gh-light-mode-only "Personalization エージェントの詳細はこちら")](./personalization/index.md)
[![Personalization エージェントの詳細はこちら](./_includes/personalization_agent_overview_dark.png#gh-dark-mode-only "Personalization エージェントの詳細はこちら")](./personalization/index.md)

[Personalization エージェントについて詳しく読む](./personalization/index.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>