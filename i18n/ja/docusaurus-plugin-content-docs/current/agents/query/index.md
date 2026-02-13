---
title: クエリ エージェント
description: 自然言語理解を用いて複数の Weaviate コレクションにわたる複雑なクエリを処理する AI エージェントの概要。
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'query agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/\_includes/query_agent.py';
import TSCode from '!!raw-loader!/docs/agents/\_includes/query_agent.mts';

# Weaviate クエリ エージェント：概要

Weaviate クエリ エージェントは、Weaviate Cloud に保存されたデータを基に自然言語の問い合わせに回答するために設計された、あらかじめ構築済みのエージェント サービスです。

ユーザーは自然言語でプロンプトや質問を入力するだけで、`Query Agent` が回答を生成するまでのすべての工程を自動で実行します。

![ユーザー視点の Weaviate クエリ エージェント](../_includes/query_agent_usage_light.png#gh-light-mode-only "Weaviate Query Agent from a user perspective")
![ユーザー視点の Weaviate クエリ エージェント](../_includes/query_agent_usage_dark.png#gh-dark-mode-only "Weaviate Query Agent from a user perspective")

## アーキテクチャ

`Query Agent` は Weaviate Cloud 上のサービスとして提供されます。

ユーザーがプロンプトやクエリを送信すると、`Query Agent` はそれと既知のコンテキストを解析し、必要な検索を自律的に実行します。

:::tip Query Agent のコンテキスト
Query Agent は、コレクションやプロパティの説明を解析し、関連するクエリの構築方法をより深く理解します。<br/>

また、コンテキストには以前の会話履歴やその他の関連情報が含まれる場合があります。
:::

## Query Agent：可視化されたワークフロー

![Weaviate クエリ エージェントの全体像](../_includes/query_agent_architecture_light.png#gh-light-mode-only "Weaviate Query Agent at a high level")
![Weaviate クエリ エージェントの全体像](../_includes/query_agent_architecture_dark.png#gh-dark-mode-only "Weaviate Query Agent at a high level")

`Query Agent` は次のような高レベルの手順で動作します。

- 適切な生成モデル（例: 大規模言語モデル）を使用してタスクと必要なクエリを解析し、実行すべき具体的なクエリを決定します。（ステップ 1 & 2）
- クエリを Weaviate に送信します。Weaviate は指定された ベクトライザー 連携を使用して、必要に応じてクエリをベクトル化します。（ステップ 3〜5）
- Weaviate から結果を受け取り、適切な生成モデルを使用してユーザーのプロンプト／クエリに対する最終的な回答を生成します。（ステップ 6）

その後、`Query Agent` は回答に加えて、Weaviate から得られた検索結果などの中間成果物もユーザーに返します。

なお、`Query Agent` という用語はシステム全体を指します。`Query Agent` は、特定のタスクを担当する複数のマイクロサービスやエージェントなど、複数のサブシステムで構成されている場合があります。

![Weaviate クエリ エージェントは複数のエージェントで構成](../_includes/query_agent_info_light.png#gh-light-mode-only "Weaviate Query Agent comprises multiple agents")
![Weaviate クエリ エージェントは複数のエージェントで構成](../_includes/query_agent_info_dark.png#gh-dark-mode-only "Weaviate Query Agent comprises multiple agents")

## クエリ実行

`Query Agent` は 2 種類のクエリをサポートします。

- **`Search`**: 自然言語を使って `Query Agent` 経由で Weaviate を検索します。`Query Agent` が質問を処理し、Weaviate で必要な検索を実行し、関連オブジェクトを返します。
- **`Ask`**: 自然言語で `Query Agent` に質問します。`Query Agent` が質問を処理し、Weaviate で必要な検索を実行し、回答を返します。

## 基本的な使用方法

ここでは、この Weaviate エージェントの使い方を概観します。詳細は [Usage](./usage.md) ページをご覧ください。

:::note 前提条件
このエージェントは、[Weaviate Cloud](/cloud/index.mdx) インスタンスと、サポートされているバージョンの Weaviate [client library](./usage.md#client-library) でのみ利用できます。
:::

### 使用例

Weaviate クライアントのインスタンスを `Query Agent` に渡すと、`Query Agent` がクライアントから必要な情報を取得してクエリを実行します。

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

次に、自然言語のクエリを入力します。`Query Agent` がクエリを処理し、Weaviate で必要な検索を実行し、回答を返します。

### `Search` （検索のみ）

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicSearchQuery"
            endMarker="# END BasicSearchQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicSearchQuery"
            endMarker="// END BasicSearchQuery"
            language="ts"
        />
    </TabItem>
</Tabs>

`Query Agent` は、前回の応答を追加のコンテキストとして使用し、後続の質問にも対応できます。

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

### `Ask` （回答生成付き）

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicAskQuery"
            endMarker="# END BasicAskQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
     <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicAskQuery"
            endMarker="// END BasicAskQuery"
            language="ts"
        />
    </TabItem>
</Tabs>

## 追加リソース

この エージェント の使用方法の詳細については、[使用方法](./usage.md) ページをご覧ください。

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

