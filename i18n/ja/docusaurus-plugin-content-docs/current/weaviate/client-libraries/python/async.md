---
title: 非同期 API
sidebar_position: 40
description: "高パフォーマンスでノンブロッキングな Weaviate 操作を実現する非同期 Python クライアントのドキュメント。"
image: og/docs/client-libraries.jpg
# tags: ['python', 'client library']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/client-libraries/python_v4.py';
import FastAPIExample from '!!raw-loader!/_includes/code/client-libraries/minimal_fastapi.py';

:::info `weaviate-client` `v4.7.0` で追加
非同期 Python クライアントは、`weaviate-client` バージョン `4.7.0` 以降で利用できます。
:::

Python クライアントライブラリはデフォルトで [同期 API](./index.mdx) を提供しますが、並列アプリケーション向けに非同期 API も利用できます。

非同期処理を行う場合は、`weaviate-client` `v4.7.0` 以降で利用可能な `WeaviateAsyncClient` async クライアントを使用してください。

`WeaviateAsyncClient` async クライアントは、`WeaviateClient` [同期クライアント](./index.mdx) とほぼ同じ関数およびメソッドをサポートしていますが、async クライアントは [`asyncio` イベントループ](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio-event-loop) で実行される `async` 関数内で使用するよう設計されています。

## インストール

async クライアントはすでに `weaviate-client` パッケージに含まれています。[Python クライアントライブラリのドキュメント](./index.mdx#installation) に従ってインストールしてください。

## インスタンス化

async クライアント `WeaviateAsyncClient` オブジェクトは、[ヘルパー関数を使用して](#instantiation-helper-functions) あるいは [クラスのインスタンスを明示的に生成して](#explicit-instantiation) 作成できます。

### インスタンス化ヘルパー関数

<!-- TODO[g-despot]: Add link to external Python references once created for "synchronous client helper functions" -->
これらのインスタンス化ヘルパー関数は同期クライアントのヘルパー関数と似ており、同等の async クライアントオブジェクトを返します。

- `use_async_with_local`
- `use_async_with_weaviate_cloud`
- `use_async_with_custom`

ただし、async ヘルパー関数は同期版と異なり、サーバーへ接続しません。

async ヘルパー関数を使用する場合は、サーバーに接続するために async メソッド `.connect()` を呼び出し、終了前に `.close()` を呼び出してクリーンアップしてください（[コンテキストマネージャ](#context-manager) を使用する場合を除く）。

<!-- TODO[g-despot]: Add link to external Python references once created for "external API keys", "connection timeout values" and "authentication details" -->
async ヘルパー関数は、外部 API キー、接続タイムアウト値、および認証情報に関して同期版と同じパラメーターを受け取ります。

<Tabs groupId="languages">
<TabItem value="wcd" label="WCD">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# AsyncWCDInstantiation"
  endMarker="# END AsyncWCDInstantiation"
  language="py"
/>

</TabItem>
<TabItem value="local" label="Local">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# AsyncLocalInstantiationBasic"
    endMarker="# END AsyncLocalInstantiationBasic"
    language="py"
  />

</TabItem>

<!-- TODO - add embedded equivalent when available in client -->

<TabItem value="custom" label="Custom">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# AsyncCustomInstantiationBasic"
  endMarker="# END AsyncCustomInstantiationBasic"
  language="py"
/>

</TabItem>
</Tabs>

### 明示的なインスタンス化

カスタムパラメーターを渡す必要がある場合は、`weaviate.WeaviateAsyncClient` クラスを使用してクライアントをインスタンス化します。これはクライアントオブジェクトを生成する最も柔軟な方法です。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# AsyncDirectInstantiationFull"
  endMarker="# END AsyncDirectInstantiationFull"
  language="py"
/>

接続を直接インスタンス化した場合、サーバーへ接続するには（非同期化された）`.connect()` メソッドを呼び出す必要があります。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# AsyncDirectInstantiationAndConnect"
  endMarker="# END AsyncDirectInstantiationAndConnect"
  language="py"
/>

## 同期メソッドと非同期メソッド

async クライアントオブジェクトは、[`asyncio` イベントループ](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio-event-loop) で実行される `async` 関数内で使用するよう設計されています。

そのため、クライアントメソッドの大半は `Coroutine` オブジェクトを返す `async` 関数ですが、一部のメソッドは同期的であり同期コンテキストで使用できます。

一般的な目安として、Weaviate へリクエストを送信するメソッドは async 関数であり、ローカルコンテキストで完結するメソッドは同期関数です。

### 非同期メソッドの識別方法

非同期メソッドはメソッドシグネチャで識別できます。async メソッドは `async` キーワードで定義され、`Coroutine` オブジェクトを返します。

メソッドシグネチャを確認するには、Python の `help()` 関数を使用するか、[Visual Studio Code](https://code.visualstudio.com/docs) や [PyCharm](https://www.jetbrains.com/help/pycharm/viewing-reference-information.html) などのコード補完をサポートする IDE を利用してください。

### 非同期メソッドの例

Weaviate にリクエストを送信する操作はすべて async 関数です。例えば、次の各操作は async 関数です。

- `async_client.connect()`: Weaviate サーバーへ接続
- `async_client.collections.create()`: 新しいコレクションを作成
- `<collection_object>.data.insert_many()`: オブジェクトのリストをコレクションに追加



### 同期メソッドの例

ローカルコンテキストで実行されるメソッドは同期である場合が多いです。例えば、次の操作はいずれも同期関数です。

- `async_client.collections.use("<COLLECTION_NAME>")`: 既存のコレクションと対話するための Python オブジェクトを作成します（コレクションを作成するわけではありません）
- `async_client.is_connected()`: Weaviate サーバーへの最新の接続状況を確認します

## コンテキストマネージャー

async クライアントは、非同期コンテキストマネージャー内で次のようなパターンで使用できます。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START AsyncContextManager"
  endMarker="# END AsyncContextManager"
  language="py"
/>

コンテキストマネージャーで async クライアントを使用する場合、`.connect()` や `.close()` を明示的に呼び出す必要はありません。クライアントが接続と切断を自動的に処理します。

## 非同期使用例

async クライアントオブジェクトは、[同期版 Python クライアント](./index.mdx) とほぼ同じ機能を提供しますが、いくつかの重要な違いがあります。まず、async クライアントは [`asyncio` イベントループ](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio-event-loop) で動作する `async` 関数内での使用を前提としています。そのため、多くのメソッドは `async` 関数であり、[`Coroutine` オブジェクト](https://docs.python.org/3/library/asyncio-task.html#coroutine) を返します。

async クライアントのメソッドを実行するには、別の `async` 関数内で `await` する必要があります。Python スクリプトで `async` 関数を実行するには、`asyncio.run(my_async_function)` またはイベントループを直接使用できます。

```python
loop = asyncio.new_event_loop()
loop.run_until_complete(my_async_function())
```

### データ挿入

この例では、新しいコレクションを作成し、async クライアントを使用してオブジェクトのリストを挿入します。

async 関数内でコンテキストマネージャーを使用している点に注目してください。これはデータ挿入中にクライアントがサーバーに接続されていることを保証するためです。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START AsyncInsertionExample"
  endMarker="# END AsyncInsertionExample"
  language="py"
/>

### 検索 & RAG

この例では、async クライアントを使用してハイブリッド検索結果に対して検索拡張生成 (RAG) を実行します。

async 関数内でコンテキストマネージャーを使用している点に注目してください。これはデータ挿入中にクライアントがサーバーに接続されていることを保証するためです。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START AsyncSearchExample"
  endMarker="# END AsyncSearchExample"
  language="py"
/>

### 大量データ挿入

サーバーサイドのバッチ操作には、同期クライアントの [`batch` 操作](../../manage-objects/import.mdx) を使用することを推奨します。`batch` 操作は、すでに並行リクエストによって大量データを効率的に処理できるよう設計されています。

async クライアントでも `insert` と `insert_many` メソッドを提供しており、非同期コンテキストで使用できます。

### アプリケーションレベルの例

async クライアントの一般的なユースケースに、複数のリクエストを同時に処理する Web アプリケーションがあります。以下は、モジュラーな Web API マイクロサービスを作成するための人気フレームワーク FastAPI と async クライアントを統合した最小限の例です。

<FilteredTextBlock
  text={FastAPIExample}
  startMarker="# START FastAPI Example"
  endMarker="# END FastAPI Example"
  language="py"
/>

この例を実行すると、FastAPI サーバーが `http://localhost:8000` で起動します。`/` と `/search` エンドポイントを使用してサーバーと対話できます。

:::note データ挿入は表示していません
この例は最小構成であり、コレクションの作成やオブジェクトの挿入は含まれていません。`Movie` というコレクションが既に存在していることを前提としています。
:::

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

