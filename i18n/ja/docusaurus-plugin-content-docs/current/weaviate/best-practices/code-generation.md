---
title: AI ベースの Weaviate コード生成
sidebar_position: 50
description: 生成型 AI モデルで Weaviate 関連のコードをより良く記述するためのヒントと手法。
image: og/docs/howto.jpg
# tags: ['best practices', 'how-to']
---

# AI ベースの Weaviate コード生成（ vibe-coding ）

生成型 AI モデルはコードの自動生成能力を高めつつあります。この実践は一般的に「 vibe-coding 」または「 AI 支援コーディング」と呼ばれます。開発を高速化できる一方で、学習データに最新情報がない場合などにはハルシネーションが発生するなどの落とし穴もあります。

ここでは、私たちの経験を基に、生成型 AI モデルやツールを使って Weaviate クライアントライブラリのコードを書く際のヒントをご紹介します。

![Weaviate vibe-coding ガイド](./_img/weaviate_vibe_coding_guide.png "Weaviate vibe-coding ガイド")

## 具体的な推奨事項

### 高性能モデル

2025 年 7 月時点で、以下のモデルはコード生成で良好な結果を示しました（ [Python v4 クライアントライブラリ](/weaviate/client-libraries/python/index.mdx) のコード正確性を評価）。

- Anthropic `claude-sonnet-4-20250514`
- Google `gemini-2.5-pro`
- Google `gemini-2.5-flash`

Python クライアントライブラリをご使用の場合、上記モデルのいずれかがユースケースに合うかお試しください。

これらのモデルはいずれもゼロショット（タスク説明のみ）で完全に正しいコードを生成できるわけではありませんが、インコンテキストのサンプルを与えると大半で正しく生成できました。

### インコンテキストコードサンプル

上記 LLM の性能は、インコンテキストサンプルを与えることで大幅に向上しました。目的のタスクに関連するサンプルを提示すると、より良い結果が得られるでしょう。

まずは、以下にまとめたコードサンプルをプロンプトにコピー & ペーストしてみてください。

import CodeExamples from '!!raw-loader!/_includes/code/python/best-practices.python.ai.py';  
import CodeBlock from '@theme/CodeBlock';

<div style={{height: '300px', overflow: 'auto'}}>

  <CodeBlock language="python">{CodeExamples}</CodeBlock>

</div>
<br/>

もし上記のコードサンプルが十分でない場合、次の方法をお試しください。

- Weaviate ドキュメントの該当セクションからコードサンプルを収集する。
- Weaviate ドキュメントの `Ask AI` 機能で具体的なタスク方法を検索し、そこで得たコードをプロンプトに使用する。

:::tip 小規模モデル
一般に、小規模モデルはゼロショットのコード生成が得意ではありません。しかし Anthropic の `claude-3-5-haiku-20241022` と OpenAI の `gpt-4.1` / `gpt-4.1-mini` は、インコンテキストサンプルがあれば良質なコードを生成できました。
:::

## 一般的なヒント

上記の具体的推奨事項に加え、以下の一般的なヒントもご覧ください。

### 最新モデルを使用する

すでに好みのモデルプロバイダーがある場合でも、最新モデルを試してみてください。

後発モデルはより新しいデータで学習されているため、ゼロショットのコード生成性能が高い可能性があります。これは、2024 年に書き換えられた Weaviate Python クライアントのようにコードベースが大幅に更新されたケースで特に重要です。

### 指示追従性の高いモデルを探す

モデルによっては、インコンテキストの指示をより忠実に守るものがあります。

そのようなモデルは、最新のインコンテキストサンプルをより尊重してくれます。

### 生成コードをハルシネーションチェックする

生成されたコードにハルシネーションの兆候がないか確認しましょう。

Weaviate Python クライアントの場合、`weaviate.Client` クラスを用いて接続しようとしているコードは、旧バージョン（ v3 ）の書き方であり、 v4 では存在しません。これはハルシネーションまたは古い情報に基づくコードの典型例です。

最新の Weaviate Python クライアントでは、`WeaviateClient` クラスと `weaviate.connect_to_xyz()` の各ヘルパー関数で接続します。

### 追加ドキュメントをインデックスする

Cursor など一部の AI 支援コード生成ツールでは、追加ドキュメントをインデックスできます。これにより、コード生成に必要なコンテキストを拡充できます。 IDE にインデックスしたドキュメントを基にコード生成を促すことも可能です。

お使いの IDE がこの機能を備えているか、またその利用方法を確認してください。

### Weaviate エージェントの利用を検討する

[Weaviate エージェント](/agents) は、[クエリ](/agents/query)、[データ変換](/agents/transformation/)、[コンテンツのパーソナライズ](/agents/personalization) など特定タスク向けに設計されたエージェント型サービスです。

Weaviate Cloud ユーザーは、自然言語でインスタンスと対話できるエージェントを利用できます。ユースケースによっては、 AI 支援コード生成ツールより適している場合があります。

## このページの改善にご協力ください

上記の推奨事項は、生成型 AI モデルを使ったコード生成の経験に基づいています。

このページのために体系的なデータを収集する目的で、[こちらのリポジトリ](https://github.com/weaviate-tutorials/weaviate-vibe-eval) で一連の評価を実施しました。

テストでは、さまざまな LLM を用いて Weaviate Python クライアント v4 のコードを生成し、実行可能かどうかを確認しました。各タスクはゼロショットで一度、インコンテキストサンプル付きで少なくとも一度実行しました。

一部の結果は [このディレクトリ](https://github.com/weaviate-tutorials/weaviate-vibe-eval/tree/main/example_results) に掲載しています。

ご注意: これはガイドライン提供を目的とした小規模評価です。独自の評価を実施したい場合は、ぜひリポジトリをご覧ください。

質問やフィードバックがありましたら、[GitHub](https://github.com/weaviate-tutorials/weaviate-vibe-eval/issues) で Issue を開いてお知らせください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

