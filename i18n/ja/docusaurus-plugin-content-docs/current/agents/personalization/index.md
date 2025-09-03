---
title: パーソナライゼーション エージェント
sidebar_position: 10
description: ユーザープロファイルとインタラクション履歴に基づき、パーソナライズされたレコメンデーションを提供する AI エージェントの概要。
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'personalization agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/personalization_agent.py';

# Weaviate パーソナライゼーション エージェント

:::caution Technical Preview

![この Weaviate エージェントはテクニカルプレビューです。](../_includes/agents_tech_preview_light.png#gh-light-mode-only "この Weaviate エージェントはテクニカルプレビューです。")
![この Weaviate エージェントはテクニカルプレビューです。](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "この Weaviate エージェントはテクニカルプレビューです。")

[こちらから登録してください](https://events.weaviate.io/weaviate-agents) Weaviate エージェントの通知を受け取るには、または[このページ](https://weaviateagents.featurebase.app/)で最新情報を確認し、フィードバックをお寄せください。

:::

Weaviate パーソナライゼーション エージェントは、各ユーザーに合わせたレコメンデーションを返すために設計されたエージェントサービスです。パーソナライゼーション エージェントは、関連する Weaviate Cloud インスタンスのデータを利用してレコメンデーションを提供します。

:::tip 用語: ユーザーと開発者
パーソナライゼーション エージェントは、特定の人に合わせたパーソナライズレコメンデーションを提供します。この文脈では、その人を `user` と呼びます。`user` に対してレコメンデーションを提供するためにパーソナライゼーション エージェントを使用する人が開発者です。
:::

開発者はユーザープロファイルを渡すだけで、パーソナライゼーション エージェントが途中の手順をすべて処理し、Weaviate から一連のパーソナライズレコメンデーションを返します。開発者視点でのワークフローは以下のとおりです。

![Weaviate Personalization Agent from a developer perspective](../_includes/personalization_agent_overview_light.png#gh-light-mode-only "Weaviate Personalization Agent from a developer perspective")
![Weaviate Personalization Agent from a developer perspective](../_includes/personalization_agent_overview_dark.png#gh-dark-mode-only "Weaviate Personalization Agent from a developer perspective")

:::info 変更履歴とフィードバック
Weaviate エージェントの公式変更履歴は[こちら](https://weaviateagents.featurebase.app/changelog)にあります。機能要望・バグ報告・質問などのフィードバックは[こちら](https://weaviateagents.featurebase.app/)からお寄せください。フィードバックの状況を確認したり、他の提案に投票したりできます。
:::

## アーキテクチャ

パーソナライゼーション エージェントは Weaviate Cloud 上のサービスとして提供されます。

ユーザー固有のレコメンデーション要求が行われると、パーソナライゼーション エージェントはユーザープロファイルおよび既知のコンテキストを解析し、自律的に検索を実行します。コンテキストには、以前のユーザーインタラクション、ユーザー自身に関する情報、その他関連情報が含まれます。

パーソナライゼーション エージェントはコンテキスト情報を活用して、最も関連性の高いレコメンデーションを取得するだけでなく、ユーザー向けにランキングも行います。

## パーソナライゼーション エージェント: ワークフローの可視化

![Weaviate Personalization Agent at a high level](../_includes/personalization_agent_architecture_light.png#gh-light-mode-only "Weaviate Personalization Agent at a high level")
![Weaviate Personalization Agent at a high level](../_includes/personalization_agent_architecture_dark.png#gh-dark-mode-only "Weaviate Personalization Agent at a high level")

パーソナライゼーション エージェントは、高レベルでは以下のように動作します。

- Weaviate が管理するユーザーコレクションを作成し、各ユーザーのプロファイルと過去のインタラクションを保存します。
- パーソナライゼーション レコメンデーションが要求されると、エージェントはユーザーデータを取得し、パターンや好みを解析します。
- 解析結果に基づき、Weaviate で初期検索を実行して最も関連性の高いレコメンデーションを取得します。
- 適切な生成モデルを使用して追加の検索戦略を決定し、必要に応じて取得データを再ランキングします。
- 最終的なレコメンデーションを取得するために、必要に応じて Weaviate で追加検索を行います。
- レコメンデーションをユーザープロファイルと好みに基づいて統合・ランキングします。

その後、パーソナライゼーション エージェントはユーザー固有のレコメンデーションをレスポンスとして返します。レスポンスには、Weaviate から得た基礎的な検索結果など、中間生成物も含まれます。

パーソナライゼーション エージェントについて、もう少し詳しく見ていきましょう。

### ユーザープロファイル

パーソナライゼーション エージェントはユーザープロファイルを利用してパーソナライズレコメンデーションを提供します。この情報は特定の名前で、あなたの Weaviate インスタンス内のコレクションに保存されます。ユーザープロファイルには、ユーザーの好みや過去のインタラクション（例: 好き・嫌いなど）が含まれる場合があります。

![Weaviate Personalization Agent - User Data Collection](../_includes/personalization_agent_users_light.png#gh-light-mode-only "Weaviate Personalization Agent - User Data Collection")
![Weaviate Personalization Agent - User Data Collection](../_includes/personalization_agent_users_dark.png#gh-dark-mode-only "Weaviate Personalization Agent - User Data Collection")

ここに示すように、ユーザーデータコレクションは時間とともに更新できます。新しいユーザーの情報を追加したり、既存ユーザーの新しい情報で更新したりできます。

これにより、パーソナライゼーション エージェントは学習を続け、各ユーザーに対して最も関連性が高く最新のレコメンデーションを提供し続けることができます。

### レコメンデーション

パーソナライゼーション エージェントのレコメンデーションには大きく２つの要素があります。検索によるレコメンデーション取得と、レコメンデーションのランキングです。

#### 検索

パーソナライゼーション エージェントは Weaviate で検索を実行し、指定されたコレクションからユーザーに最も関連性の高いレコメンデーションを取得します。

![Weaviate Personalization Agent - Searches](../_includes/personalization_agent_search_light.png#gh-light-mode-only "Weaviate Personalization Agent - Searches")
![Weaviate Personalization Agent - Searches](../_includes/personalization_agent_search_dark.png#gh-dark-mode-only "Weaviate Personalization Agent - Searches")

図が示すとおり、検索プロセスは複数の要素に基づく可能性があります。

- ユーザープロファイルと好み（ユーザーデータコレクションから取得）
- ユーザーの過去インタラクション（ユーザーデータコレクションから取得）
- レコメンデーションのコンテキスト（要求されたレコメンデーションの種類など）
- パーソナライゼーション エージェントが決定した追加検索戦略

パーソナライゼーション エージェントは、関連性の高いレコメンデーションを取得するために Weaviate で複数回の検索を行い、それらを統合・ランキングします。

#### （再）ランキング

パーソナライゼーション エージェントは Weaviate から取得したレコメンデーションを、複数の要素を用いてランキングし、最終的な結果セットをユーザーの好みに合わせます。

![Weaviate Personalization Agent - (re)rank](../_includes/personalization_agent_rank_light.png#gh-light-mode-only "Weaviate Personalization Agent - (re)rank")
![Weaviate Personalization Agent - (re)rank](../_includes/personalization_agent_rank_dark.png#gh-dark-mode-only "Weaviate Personalization Agent - (re)rank")

ランキングは以下の要素に基づく場合があります。

- ユーザープロファイルと好み（ユーザーデータコレクションから取得）
- ユーザーの過去インタラクション（ユーザーデータコレクションから取得）
- レコメンデーションのコンテキスト（要求されたレコメンデーションの種類など）
- パーソナライゼーション エージェントが決定した追加ランキング戦略

このプロセスにより統合された結果セット全体がランキングされ、レスポンスとして返されます。

## 基本的な使い方

ここでは、本 Weaviate エージェントの利用方法を概観します。詳細は[使用方法](./usage.md)ページをご覧ください。

### 前提条件

このエージェントは Weaviate Cloud インスタンスと、対応するバージョンの Weaviate クライアントライブラリでのみ利用可能です。
### 利用例

Personalization エージェントを使用するには、次の入力でインスタンス化します:

- Weaviate クライアントのインスタンス（例: Python の `WeaviateClient` オブジェクト）で、Weaviate Cloud インスタンスへ接続済みのもの。
- パーソナライズされたアイテムを取得する対象コレクションの名前。
- パーソナライズの基準となるユーザー属性のリスト。

Personalization エージェントは永続化される点にご注意ください。すでに Personalization エージェントを作成済みの場合、新規作成せずに再接続できます。

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

次に、推奨結果をパーソナイズするためのペルソナを追加します。

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

そのペルソナに対して一連のインタラクションを追加できます。

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

ユーザーデータを追加すると、Personalization エージェントを使用して Weaviate コレクションからパーソナライズされた推奨を取得できます。

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

### 追加ドキュメント

このエージェントの詳細な使用方法については、[使用方法](./usage.md) ページを参照してください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>