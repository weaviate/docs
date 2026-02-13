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
import PyCode from '!!raw-loader!/docs/agents/\_includes/query_agent.py';
import TSCode from '!!raw-loader!/docs/agents/\_includes/query_agent.mts';

# Weaviate Query Agent：使用方法

Weaviate Query Agent は、Weaviate Cloud に保存されたデータを基に自然言語クエリへ回答するよう設計された、あらかじめ構築済みの エージェント サービスです。

ユーザーは自然言語でプロンプトや質問を入力するだけで、Query Agent が途中の処理をすべて実行し、回答を返します。

![ユーザー視点での Weaviate Query Agent](../_includes/query_agent_usage_light.png#gh-light-mode-only "ユーザー視点での Weaviate Query Agent")
![ユーザー視点での Weaviate Query Agent](../_includes/query_agent_usage_dark.png#gh-dark-mode-only "ユーザー視点での Weaviate Query Agent")

このページでは、Weaviate Cloud に保存したデータを用いて Query Agent で自然言語クエリに回答する方法を説明します。

## 前提条件

### Weaviate インスタンス

このエージェントは Weaviate Cloud インスタンス専用です。Weaviate Cloud インスタンスのセットアップ方法については、[Weaviate Cloud のドキュメント](/cloud/index.mdx) を参照してください。

[Weaviate Cloud](https://console.weaviate.cloud/) の無料 Sandbox インスタンスで、この Weaviate エージェントを試すこともできます。

### クライアントライブラリ

:::note 対応言語
現在、このエージェントは Python と TypeScript/JavaScript のみ対応しています。その他の言語は今後追加予定です。
:::

Python では、Weaviate Agents を使うためにオプションの `agents` extras 付きで Weaviate クライアントライブラリをインストールできます。これにより `weaviate-client` パッケージとともに `weaviate-agents` パッケージがインストールされます。TypeScript/JavaScript では、`weaviate-client` パッケージと一緒に `weaviate-agents` パッケージをインストールしてください。

次のコマンドでクライアントライブラリをインストールします。

<Tabs groupId="languages">
<TabItem value="py_agents" label="Python">

```shell
pip install -U weaviate-client[agents]
```

#### トラブルシューティング：`pip` で最新バージョンを強制インストールする

既存環境では、`pip install -U "weaviate-client[agents]"` を実行しても `weaviate-agents` が [最新バージョン](https://pypi.org/project/weaviate-agents/) に更新されない場合があります。その際は `weaviate-agents` パッケージを明示的にアップグレードしてください。

```shell
pip install -U weaviate-agents
```

または [特定バージョン](https://github.com/weaviate/weaviate-agents-python-client/tags) をインストールします。

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

- 対象の [Weaviate Cloud インスタンスの詳細](/cloud/manage-clusters/connect.mdx)（例：`WeaviateClient` オブジェクト）
- クエリ対象とするコレクションのデフォルトリスト

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

クエリ対象コレクションのリストは、次の項目でさらに設定できます。

- テナント名（マルチテナントコレクションの場合は必須）
- クエリ対象とするコレクションの ベクトル（複数可）（任意）
- エージェントが使用するプロパティ名のリスト（任意）
- エージェントが生成したフィルターに常に上乗せする[追加フィルター](#user-defined-filters)（任意）

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

:::info Query Agent がアクセスできるものは？

Query Agent は、渡された Weaviate クライアントオブジェクトから認証情報を取得します。その後、指定されたコレクション名でさらにアクセス範囲を制限できます。

たとえば、指定した Weaviate 認証情報のユーザーが一部のコレクションにしかアクセスできない場合、Query Agent もそのコレクションのみを参照できます。

:::



### 追加オプション

Query エージェントは、次のような追加オプションを指定してインスタンス化できます:

- `system_prompt`: Weaviate チームが提供するデフォルトのシステムプロンプトを置き換えるためのカスタムシステムプロンプト（JavaScript では `systemPrompt`）。
- `timeout`: Query エージェントが 1 件のクエリに費やす最大時間（秒）。サーバーサイドのデフォルト: 60。

#### カスタムシステムプロンプト

Query エージェントの挙動を制御するためにカスタムシステムプロンプトを指定できます:

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SystemPromptExample"
            endMarker="# END SystemPromptExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    <FilteredTextBlock
            text={TSCode}
            startMarker="// START SystemPromptExample"
            endMarker="// END SystemPromptExample"
            language="ts"
        />
    </TabItem>

</Tabs>

### ユーザー定義フィルター

永続的なフィルターを設定すると、エージェントが生成したフィルターと論理 `AND` で常に結合されます。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START UserDefinedFilters"
            endMarker="# END UserDefinedFilters"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    <FilteredTextBlock
            text={TSCode}
            startMarker="// START UserDefinedFilters"
            endMarker="// END UserDefinedFilters"
            language="ts"
        />
    </TabItem>

</Tabs>

### Async Python クライアント

Async Python クライアントの使用例については、[Async Python クライアントのセクション](#usage---async-python-client)を参照してください。

## クエリ実行

Query エージェントがサポートするクエリタイプは 2 つあります:

- [**`Search`**](#search)
- [**`Ask`**](#ask)

### `Search`

自然言語で Weaviate に `Search` を実行します。Query エージェントが質問を処理し、Weaviate 内で必要な検索を行い、関連オブジェクトを返します。

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

#### `Search` 応答構造

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SearchModeResponseStructure"
            endMarker="# END SearchModeResponseStructure"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
     <FilteredTextBlock
            text={TSCode}
            startMarker="// START SearchModeResponseStructure"
            endMarker="// END SearchModeResponseStructure"
            language="ts"
        />
    </TabItem>

</Tabs>

<details>
  <summary>Example output</summary>

```
Original query: winter boots for under $100
Total time: 4.695224046707153
Usage statistics: requests=2 request_tokens=143 response_tokens=9 total_tokens=152 details=None
Search performed: queries=['winter boots'] filters=[[IntegerPropertyFilter(property_name='price', operator=<ComparisonOperator.LESS_THAN: '<'>, value=100.0)]] filter_operators='AND' collection='ECommerce'
Properties: {'name': 'Bramble Berry Loafers', 'description': 'Embrace your love for the countryside with our soft, hand-stitched loafers, perfect for quiet walks through the garden. Crafted with eco-friendly dyed soft pink leather and adorned with a subtle leaf embossing, these shoes are a testament to the beauty of understated simplicity.', 'price': 75.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.4921875, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
Properties: {'name': 'Glitter Bootcut Fantasy', 'description': "Step back into the early 2000s with these dazzling silver bootcut jeans. Embracing the era's optimism, these bottoms offer a comfortable fit with a touch of stretch, perfect for dancing the night away.", 'price': 69.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.47265625, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
Properties: {'name': 'Celestial Step Platform Sneakers', 'description': 'Stride into the past with these baby blue platforms, boasting a dreamy sky hue and cushy soles for day-to-night comfort. Perfect for adding a touch of whimsy to any outfit.', 'price': 90.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.48828125, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
Properties: {'name': 'Garden Bliss Heels', 'description': 'Embrace the simplicity of countryside elegance with our soft lavender heels, intricately designed with delicate floral embroidery. Perfect for occasions that call for a touch of whimsy and comfort.', 'price': 90.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.45703125, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
Properties: {'name': 'Garden Stroll Loafers', 'description': 'Embrace the essence of leisurely countryside walks with our soft, leather loafers. Designed for the natural wanderer, these shoes feature delicate, hand-stitched floral motifs set against a soft, cream background, making every step a blend of comfort and timeless elegance.', 'price': 90.0}
Metadata: {'creation_time': None, 'last_update_time': None, 'distance': None, 'certainty': None, 'score': 0.451171875, 'explain_score': None, 'is_consistent': None, 'rerank_score': None}
```

</details>

#### `Search` のページネーション

`Search` はページネーションに対応しており、大きな結果セットを効率的に扱えます:

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SearchPagination"
            endMarker="# END SearchPagination"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    <FilteredTextBlock
            text={TSCode}
            startMarker="// START SearchPagination"
            endMarker="// END SearchPagination"
            language="ts"
        />
    </TabItem>

</Tabs>

<details>
  <summary>Example output</summary>

```
Page 1:
  Glide Platforms - $90.0
  Garden Haven Tote - $58.0
  Sky Shimmer Sneaks - $69.0

Page 2:
  Garden Haven Tote - $58.0
  Celestial Step Platform Sneakers - $90.0
  Eloquent Satchel - $59.0

Page 3:
  Garden Haven Tote - $58.0
  Celestial Step Platform Sneakers - $90.0
  Eloquent Satchel - $59.0
```

</details>

### `Ask`

自然言語で `Ask` を使用して Query Agent に質問します。Query Agent は質問を処理し、 Weaviate で必要な検索を実行し、回答を返します。

:::tip クエリを慎重に検討してください
Query Agent は、あなたのクエリに基づいて戦略を立てます。そのため、可能な限り曖昧さがなく、情報が十分で、かつ簡潔なクエリを心掛けてください。
:::

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

### ランタイムでのコレクション設定

クエリ実行時に、照会対象のコレクション一覧を名前のリスト、または追加の設定とともに上書きできます。

#### コレクション名のみを指定

この例では、このクエリに対してのみ設定済みの Query Agent コレクションを上書きします。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentAskBasicCollectionSelection"
            endMarker="# END QueryAgentAskBasicCollectionSelection"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    <FilteredTextBlock
            text={TSCode}
            startMarker="// START QueryAgentAskBasicCollectionSelection"
            endMarker="// END QueryAgentAskBasicCollectionSelection"
            language="ts"
        />
    </TabItem>

</Tabs>

#### コレクションの詳細設定

この例では、このクエリに対してのみ設定済みの Query Agent コレクションを上書きし、必要に応じて次のような追加オプションを指定しています。

- ターゲット ベクトル
- 表示するプロパティ
- ターゲット テナント
- 追加フィルター

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START QueryAgentAskCollectionConfig"
            endMarker="# END QueryAgentAskCollectionConfig"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
    <FilteredTextBlock
            text={TSCode}
            startMarker="// START QueryAgentAskCollectionConfig"
            endMarker="// END QueryAgentAskCollectionConfig"
            language="ts"
        />
    </TabItem>

</Tabs>

### 会話形式のクエリ

Query Agent は `ChatMessage` オブジェクトのリストを渡すことで複数ターンの会話をサポートします。これは `Search` と `Ask` の両方のクエリタイプで機能します。

`ChatMessage` で会話を構築する際、メッセージには次の 2 つのロールがあります。

- **`user`** - 人間のユーザーが質問やコンテキストを提供するメッセージを表します
- **`assistant`** - Query Agent の応答、または会話履歴内の任意の AI アシスタントの応答を表します

会話履歴は Query Agent が前のやり取りからコンテキストを理解するのに役立ち、より首尾一貫した複数ターンの対話を可能にします。適切な会話の流れを維持するため、常に user と assistant のロールを交互にしてください。

<Tabs groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START ConversationalQuery"
            endMarker="# END ConversationalQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START ConversationalQuery"
            endMarker="// END ConversationalQuery"
            language="ts"
        />
    </TabItem>

</Tabs>

## ストリーム応答

Query Agent は応答をストリームすることもでき、生成中の回答をリアルタイムで受け取れます。

ストリーミング応答は、次のオプションパラメーターで要求できます。

- `include_progress`：`True` に設定すると、Query Agent はクエリを処理する進捗をストリームします。
- `include_final_state`：`True` に設定すると、Query Agent は回答全体が生成されるのを待たず、生成され次第最終回答をストリームします。

`include_progress` と `include_final_state` の両方を `False` に設定した場合、Query Agent は進捗更新や最終状態を含めず、生成された回答トークンのみをストリームします。

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



## レスポンスの確認

Query Agent からのレスポンスには最終的な回答に加えて、追加の補足情報が含まれます。

補足情報には、実行された検索や集計、欠落している可能性のある情報、Agent が使用した LLM トークン数などが含まれる場合があります。

### ヘルパー関数

提供されているヘルパー関数（例: `.display()` メソッド）を使用して、レスポンスを読みやすい形式で表示してみてください。

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

このコードは、Query Agent が見つけた補足情報の概要とともにレスポンスを出力します。

<details>
  <summary>Example output</summary>

```text
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────── 🔍 Original Query ────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ I like vintage clothes and nice shoes. Recommend some of each below $60.                                                                                                                                                                          │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────── 📝 Final Answer ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ For vintage clothing under $60, you might like the Vintage Philosopher Midi Dress by Echo & Stitch. It features deep green velvet fabric with antique gold button details, tailored fit, and pleated skirt, perfect for a classic vintage look.   │
│                                                                                                                                                                                                                                                   │
│ For nice shoes under $60, consider the Glide Platforms by Vivid Verse. These are high-shine pink platform sneakers with cushioned soles, inspired by early 2000s playful glamour, offering both style and comfort.                                │
│                                                                                                                                                                                                                                                   │
│ Both options combine vintage or retro aesthetics with an affordable price point under $60.                                                                                                                                                        │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────── 🔭 Searches Executed 1/2 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ QueryResultWithCollection(queries=['vintage clothing'], filters=[[]], filter_operators='AND', collection='ECommerce')                                                                                                                             │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────── 🔭 Searches Executed 2/2 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ QueryResultWithCollection(queries=['nice shoes'], filters=[[]], filter_operators='AND', collection='ECommerce')                                                                                                                                   │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│ 📊 No Aggregations Run                                                                                                                                                                                                                            │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────────── 📚 Sources ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                                                                                   │
│  - object_id='a7aa8f8a-f02f-4c72-93a3-38bcbd8d5581' collection='ECommerce'                                                                                                                                                                        │
│  - object_id='ff5ecd6e-8cb9-47a0-bc1c-2793d0172984' collection='ECommerce'                                                                                                                                                                        │
│                                                                                                                                                                                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯


  📊 Usage Statistics
┌────────────────┬─────┐
│ LLM Requests:  │ 5   │
│ Input Tokens:  │ 288 │
│ Output Tokens: │ 17  │
│ Total Tokens:  │ 305 │
└────────────────┴─────┘

Total Time Taken: 7.58s
```

</details>

### 確認例

この例では、以下の内容が出力されます。

- 元のユーザークエリ
- Query Agent が提供した回答
- Query Agent が実行した検索・集計（該当する場合）
- 欠落している情報

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

## 使用方法 - Async Python クライアント

async Python Weaviate クライアントを使用する場合でも、インスタンス化のパターンはほぼ同じです。違いは `QueryAgent` クラスの代わりに `AsyncQueryAgent` クラスを使用する点です。

async パターンの例は以下のとおりです。

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

async Query Agent はレスポンスをストリーミングすることもでき、生成中の回答を逐次受け取れます。

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

## 制限とトラブルシューティング

### 使用制限

import UsageLimits from "/\_includes/agents/query-agent-usage-limits.mdx";

<UsageLimits />

### カスタムコレクションの説明

import CollectionDescriptions from "/\_includes/agents/query-agent-collection-descriptions.mdx";

<CollectionDescriptions />

### 実行時間

import ExecutionTimes from "/\_includes/agents/query-agent-execution-times.mdx";

<ExecutionTimes />



## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

