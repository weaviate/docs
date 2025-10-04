---
title: 使用方法
sidebar_position: 30
description: "Transformation Agent を実装するための技術ドキュメントおよび使用例"
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'transformation agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/transformation_agent.py';


# Weaviate Transformation Agent：使用方法

:::caution Technical Preview

![この Weaviate エージェントはテクニカルプレビュー版です。](../_includes/agents_tech_preview_light.png#gh-light-mode-only "この Weaviate エージェントはテクニカルプレビュー版です。")
![この Weaviate エージェントはテクニカルプレビュー版です。](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "この Weaviate エージェントはテクニカルプレビュー版です。")

[こちらから登録](https://events.weaviate.io/weaviate-agents)して Weaviate エージェントの通知を受け取る、または[このページ](https://weaviateagents.featurebase.app/)で最新情報の確認とフィードバックの送信ができます。

:::

:::warning 本番環境での利用は避けてください
Weaviate Transformation Agent は Weaviate 内のデータをその場で変更するよう設計されています。**本エージェントがテクニカルプレビューの間は、本番環境では使用しないでください。** エージェントが期待どおりに動作しない可能性があり、Weaviate インスタンス内のデータが予期しない方法で影響を受ける可能性があります。
:::

Weaviate Transformation Agent は、生成モデルを用いてデータを拡張・変換するためのエージェント型サービスです。既存の Weaviate オブジェクトに対し、新しいプロパティを追加したり既存プロパティを更新したりできます。

これにより、アプリケーションでの利用に向けて Weaviate コレクション内のオブジェクト品質を向上させることができます。

![Weaviate Transformation Agent の概要](../_includes/transformation_agent_overview_light.png#gh-light-mode-only "Weaviate Transformation Agent の概要")
![Weaviate Transformation Agent の概要](../_includes/transformation_agent_overview_dark.png#gh-dark-mode-only "Weaviate Transformation Agent の概要")

本ページでは、Weaviate Transformation Agent を使用して Weaviate 内のデータを変換・拡張する方法を説明します。

:::info 変更履歴とフィードバック
Weaviate エージェントの公式変更履歴は[こちら](https://weaviateagents.featurebase.app/changelog)でご覧いただけます。機能要望、バグ報告、質問などのフィードバックは[こちら](https://weaviateagents.featurebase.app/)から送信してください。送信後はステータスを確認したり、他のフィードバックに投票したりできます。
:::

## 前提条件

### Weaviate インスタンス

本エージェントは Weaviate Cloud でのみ利用できます。

Weaviate Cloud インスタンスのセットアップ方法については、[Weaviate Cloud ドキュメント](/cloud/index.mdx)をご覧ください。

[Weaviate Cloud](https://console.weaviate.cloud/) の無料 Sandbox インスタンスで、この Weaviate エージェントをお試しいただけます。

### クライアントライブラリ

:::note 対応言語
現時点では、このエージェントは Python のみ対応しています。今後ほかの言語もサポート予定です。
:::

Weaviate エージェントを利用するには、`agents` 付きのオプションを使って Weaviate クライアントライブラリをインストールします。これにより、`weaviate-client` パッケージとともに `weaviate-agents` パッケージがインストールされます。

以下のコマンドでクライアントライブラリをインストールしてください。

<Tabs groupId="languages">
<TabItem value="py_agents" label="Python">

```shell
pip install -U weaviate-client[agents]
```

#### トラブルシューティング：`pip` に最新バージョンを強制インストールさせる

すでにインストール済みの場合、`pip install -U "weaviate-client[agents]"` を実行しても `weaviate-agents` が[最新バージョン](https://pypi.org/project/weaviate-agents/)に更新されないことがあります。その場合は、`weaviate-agents` パッケージを明示的にアップグレードしてください。

```shell
pip install -U weaviate-agents
```

または[特定のバージョン](https://github.com/weaviate/weaviate-agents-python-client/tags)をインストールします。

```shell
pip install -U weaviate-agents==||site.weaviate_agents_version||
```

</TabItem>

</Tabs>

## 使用方法

Transformation Agent を使用するには、必要な入力を指定してインスタンス化し、変換操作を開始します。

変換操作は非同期で実行されます。各操作はワークフロー ID を返すので、その ID を使ってステータスを確認します。

以下に使用例を示します。

### 前提条件

Transformation Agent は Weaviate Cloud と密接に統合されています。そのため、Transformation Agent は Weaviate Cloud インスタンスと、対応バージョンのクライアントライブラリでのみ利用できます。

### Weaviate への接続

Transformation Agent を利用するには、Weaviate Cloud インスタンスへ接続する必要があります。Weaviate クライアントライブラリを使用して接続してください。

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

### 変換操作の定義

Transformation Agent を開始する前に、変換操作を定義する必要があります。以下の情報を指定して操作を定義してください。

- 操作タイプ
- 対象プロパティ名
- コンテキストとして使用するプロパティ
- instructions
- （新規プロパティの場合）新規プロパティのデータ型

以下に操作例を示します。
#### データに新しいプロパティを追加

既存のプロパティ値とユーザーの instructions に基づいて、オブジェクトに新しいプロパティを追加できます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START DefineOperationsAppend"
            endMarker="# END DefineOperationsAppend"
            language="py"
        />
    </TabItem>

</Tabs>

#### 既存プロパティの更新

既存のプロパティ値とユーザーの instructions に基づいて、オブジェクトの既存プロパティの値を更新できます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START DefineOperationsUpdate"
            endMarker="# END DefineOperationsUpdate"
            language="py"
        />
    </TabItem>

</Tabs>

### 変換操作の開始

変換操作を開始するには、必要な入力で Transformation Agent をインスタンス化し、操作を開始します。

Weaviate クライアント、対象コレクション名、および変換操作のリストを指定して Transformation Agent をインスタンス化します。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START StartTransformationOperations"
            endMarker="# END StartTransformationOperations"
            language="py"
        />
    </TabItem>

</Tabs>

### ジョブステータスの監視

workflow ID を使用して、各変換操作のステータスを監視できます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START MonitorJobStatus"
            endMarker="# END MonitorJobStatus"
            language="py"
        />
    </TabItem>

</Tabs>

## 制限事項とトラブルシューティング

:::caution Technical Preview

![この Weaviate エージェントはテクニカルプレビューです。](../_includes/agents_tech_preview_light.png#gh-light-mode-only "この Weaviate エージェントはテクニカルプレビューです。")
![この Weaviate エージェントはテクニカルプレビューです。](../_includes/agents_tech_preview_dark.png#gh-dark-mode-only "この Weaviate エージェントはテクニカルプレビューです。")

[こちら](https://events.weaviate.io/weaviate-agents)から Weaviate エージェントの通知に登録するか、[このページ](https://weaviateagents.featurebase.app/)で最新情報の確認とフィードバックの送信ができます。

:::

### 使用制限

現時点では、Weaviate Cloud の [組織](/cloud/platform/users-and-organizations.mdx#organizations) ごとに 1 日あたり 50,000 件の Transformation Agent 操作という上限があります。

この制限は個々の操作単位で適用されます。つまり、2,500 オブジェクトのコレクションに対して 4 つの操作を含む Transformation Agent を実行すると、その日の上限に達します。

この制限は今後のバージョンで変更される可能性があります。

### モデル入力コンテキストの長さ

基盤モデルの制約により、変換操作の入力コンテキストの長さには制限があります。入力コンテキストの長さは約 25000 文字以下に抑えることを推奨します。

つまり、入力コンテキスト（コンテキストとして使用するプロパティ）と instructions の合計文字数がこの上限を超えないようにしてください。モデル入力コンテキストの長さが超過すると、変換操作は失敗します。

### 複数操作時の競合状態

同じコレクションで複数の変換操作を開始すると、race condition により一方の結果が上書きされる可能性があります。

これを避けるには、1 度に 1 つの操作のみを実行してください。同じコレクションで複数の操作を行う必要がある場合は、操作を順番に実行してください。

前の操作の workflow ID を使用してステータスを監視し、完了を確認してから次の操作を開始することで実現できます。

この問題は将来のバージョンで対応予定です。

## 質問とフィードバック

:::info Changelog and feedback
Weaviate エージェントの公式変更履歴は[こちら](https://weaviateagents.featurebase.app/changelog)で確認できます。機能要望、バグ報告、質問などのフィードバックは[こちら](https://weaviateagents.featurebase.app/)にご投稿ください。フィードバックの状況を確認したり、他のフィードバックに投票したりできます。
:::

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>