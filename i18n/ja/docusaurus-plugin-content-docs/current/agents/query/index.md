---
title: クエリ エージェント
sidebar_position: 10
description: "自然言語理解を用いて複数の Weaviate コレクションにわたる複雑なクエリを処理する AI エージェントの概要。"
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'query agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/query_agent.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/query_agent.mts';

# Weaviate Query Agent：概要

:::caution Technical Preview

![この Weaviate エージェントはテクニカルプレビューです。](../_includes/agents_tech_preview_light.png#gh-light-mode-only "この Weaviate エージェントはテクニカルプレビューです。")
![この Weaviate エージェントはテクニカルプレビューです。](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "この Weaviate エージェントはテクニカルプレビューです。")

[こちらから登録して](https://events.weaviate.io/weaviate-agents) Weaviate エージェントの通知を受け取るか、最新情報の確認とフィードバックの送信は [こちらのページ](https://weaviateagents.featurebase.app/) をご覧ください。

:::

Weaviate Query Agent は、Weaviate Cloud に保存されたデータを基に自然言語クエリへ回答するための、あらかじめ構築されたエージェントサービスです。

ユーザーは自然言語でプロンプト／質問を入力するだけで、Query Agent がその間のすべてのステップを自動で処理し、回答を返します。

![ユーザー視点から見た Weaviate Query Agent](../_includes/query_agent_usage_light.png#gh-light-mode-only "ユーザー視点から見た Weaviate Query Agent")
![ユーザー視点から見た Weaviate Query Agent](../_includes/query_agent_usage_dark.png#gh-dark-mode-only "ユーザー視点から見た Weaviate Query Agent")

:::info Changelog and feedback
Weaviate エージェントの公式変更履歴は [こちら](https://weaviateagents.featurebase.app/changelog) で確認できます。機能追加のご要望やバグ報告、ご質問などのフィードバックは [こちら](https://weaviateagents.featurebase.app/) からお送りください。送信したフィードバックのステータスや他のフィードバックへの投票も可能です。
:::

## アーキテクチャ

Query Agent は Weaviate Cloud 上のサービスとして提供されます。

ユーザーがプロンプト／クエリを送信すると、Query Agent はそれと既知のコンテキストを解析し、自律的に検索を実行します。

:::tip Query Agent のコンテキスト
Query Agent はコレクションおよびプロパティの説明を解析し、関連するクエリの構築方法をより深く理解します。<br/>

コンテキストには会話履歴やその他の関連情報も含まれる場合があります。
:::

## Query Agent：ワークフローの可視化

![高レベルでの Weaviate Query Agent](../_includes/query_agent_architecture_light.png#gh-light-mode-only "高レベルでの Weaviate Query Agent")
![高レベルでの Weaviate Query Agent](../_includes/query_agent_architecture_dark.png#gh-dark-mode-only "高レベルでの Weaviate Query Agent")

Query Agent は以下の高レベルステップで動作します。

- 適切な生成モデル（例：大規模言語モデル）を使用してタスクと必要なクエリを分析し、実行すべき正確なクエリを決定します。（ステップ 1 & 2）
- Weaviate へクエリを送信します。Weaviate は指定された ベクトライザー 統合を用いて必要に応じてクエリをベクトル化します。（ステップ 3–5）
- Weaviate から結果を受け取り、適切な生成モデルでユーザープロンプト／クエリへの最終回答を生成します。（ステップ 6）

その後、Query Agent は回答とともに、中間出力として Weaviate から得た検索結果などをユーザーへ返します。

`Query Agent` という用語はシステム全体を指します。Query Agent は複数のサブシステム（マイクロサービスやタスクごとに担当するエージェントなど）で構成されている場合があります。

![Weaviate Query Agent は複数のエージェントで構成](../_includes/query_agent_info_light.png#gh-light-mode-only "Weaviate Query Agent は複数のエージェントで構成")
![Weaviate Query Agent は複数のエージェントで構成](../_includes/query_agent_info_dark.png#gh-dark-mode-only "Weaviate Query Agent は複数のエージェントで構成")

## 基本的な使い方

ここでは Weaviate エージェントの利用方法を概観します。詳細は [使用方法](./usage.md) ページをご覧ください。

### 前提条件

本エージェントは Weaviate Cloud インスタンスと、対応バージョンの Weaviate クライアントライブラリでのみ利用できます。

### 使用例

Weaviate クライアントのインスタンスを Query Agent に渡すと、Query Agent がクライアントから必要な情報を抽出してクエリを実行します。

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

次に、自然言語のクエリを入力します。Query Agent がクエリを処理し、必要な検索を Weaviate で実行して回答を返します。

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

Query Agent はフォローアップクエリも処理でき、前回の応答を追加コンテキストとして利用します。

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
### 追加ドキュメント

より詳細なエージェントの使用方法については、[使用方法](./usage.md) ページをご覧ください。

## 質問とフィードバック

:::info 変更履歴とフィードバック
公式の Weaviate エージェントの変更ログは [こちら](https://weaviateagents.featurebase.app/changelog) でご覧いただけます。ご要望、バグ報告、質問などのフィードバックがある場合は、[こちら](https://weaviateagents.featurebase.app/) からお送りください。フィードバックの状況を確認したり、他の方のフィードバックに投票したりできます。
:::

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>