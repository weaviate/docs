---
title: 非同期 API
sidebar_position: 40
description: "高性能でノンブロッキングな Weaviate 操作のための非同期 Python クライアントのドキュメント。"
image: og/docs/client-libraries.jpg
# tags: ['python', 'client library']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/client-libraries/python_v4.py';
import FastAPIExample from '!!raw-loader!/_includes/code/client-libraries/minimal_fastapi.py';

:::info `weaviate-client` `v4.7.0` で追加されました
非同期 Python クライアントは `weaviate-client` の `4.7.0` 以降で利用できます。
:::

Python クライアント ライブラリはデフォルトで [同期 API](./index.mdx) を提供しますが、並列アプリケーション向けに非同期 API も利用できます。

非同期操作を行う場合は、`weaviate-client` `v4.7.0` 以降で利用可能な `WeaviateAsyncClient` を使用してください。

`WeaviateAsyncClient` は [同期クライアント](./index.mdx) である `WeaviateClient` とほぼ同じ関数とメソッドをサポートしていますが、`asyncio` イベントループで動作する `async` 関数内で使用するよう設計されている点が主な違いです。

## インストール

非同期クライアントはすでに `weaviate-client` パッケージに含まれています。[Python クライアント ライブラリのドキュメント](./index.mdx#installation) に従ってインストールしてください。

## インスタンス化

非同期クライアント `WeaviateAsyncClient` オブジェクトは、[ヘルパー関数を使用](#instantiation-helper-functions)するか、[クラスを直接インスタンス化](#explicit-instantiation)して生成できます。

### インスタンス化ヘルパー関数

<!-- TODO[g-despot]: Add link to external Python references once created for "synchronous client helper functions" -->
これらのヘルパー関数は同期クライアントのヘルパー関数と似ており、同等の非同期クライアント オブジェクトを返します。

- `use_async_with_local`
- `use_async_with_weaviate_cloud`
- `use_async_with_custom`

ただし、同期版とは異なり、非同期ヘルパー関数はサーバーへ接続を行いません。

非同期ヘルパー関数を使用する場合は、サーバーへ接続するために `async` メソッドである `.connect()` を呼び出し、終了前に `.close()` を呼び出してクリーンアップしてください。（[コンテキストマネージャ](#context-manager)を利用する場合を除く。）

<!-- TODO[g-despot]: Add link to external Python references once created for "external API keys", "connection timeout values" and "authentication details" -->
非同期ヘルパー関数は、外部 API キー、接続タイムアウト値、認証情報に対して同期版と同じ引数を受け取ります。

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

カスタムパラメーターを渡す必要がある場合は、`weaviate.WeaviateAsyncClient` クラスを使用してクライアントをインスタンス化してください。これはクライアント オブジェクトを生成する最も柔軟な方法です。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# AsyncDirectInstantiationFull"
  endMarker="# END AsyncDirectInstantiationFull"
  language="py"
/>

接続を直接インスタンス化した場合は、サーバーへ接続するために（非同期となった）`.connect()` メソッドを呼び出す必要があります。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# AsyncDirectInstantiationAndConnect"
  endMarker="# END AsyncDirectInstantiationAndConnect"
  language="py"
/>

## 同期メソッドと非同期メソッド

非同期クライアント オブジェクトは、[`asyncio` イベントループ](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio-event-loop) で動作する `async` 関数内で使用するよう設計されています。

そのため、クライアント メソッドの大部分は `async` 関数であり、戻り値として [`Coroutine` オブジェクト](https://docs.python.org/3/library/asyncio-task.html#coroutine) を返します。しかし、一部のメソッドは同期的であり、同期コンテキストでも使用できます。

一般的な目安として、Weaviate へのリクエストを伴うメソッドは `async` 関数であり、ローカルコンテキストで完結するメソッドは同期関数です。

### 非同期メソッドの識別方法

非同期メソッドはシグネチャで判別できます。非同期メソッドは `async` キーワードで定義され、`Coroutine` オブジェクトを返します。

メソッド シグネチャを確認するには、Python の `help()` 関数を使用するか、[Visual Studio Code](https://code.visualstudio.com/docs) や [PyCharm](https://www.jetbrains.com/help/pycharm/viewing-reference-information.html) のようにコード補完をサポートする IDE を利用してください。

### 非同期メソッドの例

Weaviate へリクエストを送信する操作は非同期関数となります。例えば、次の操作はいずれも `async` 関数です。

- `async_client.connect()`: Weaviate サーバーへ接続
- `async_client.collections.create()`: 新しいコレクションを作成
- `<collection_object>.data.insert_many()`: オブジェクトのリストをコレクションに挿入



### 同期メソッドの例

ローカルコンテキストで実行されるメソッドは、同期処理である場合が多いです。たとえば、次の各操作は同期関数です。

- `async_client.collections.get("<COLLECTION_NAME>")`：既存のコレクションと対話するための Python オブジェクトを作成します（コレクションを新規作成するわけではありません）
- `async_client.is_connected()`：Weaviate サーバーへの直近の接続状態を確認します

## コンテキストマネージャー

非同期クライアントは、次のような非同期コンテキストマネージャー内で使用できます。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START AsyncContextManager"
  endMarker="# END AsyncContextManager"
  language="py"
/>

コンテキストマネージャーで非同期クライアントを使用する場合、`.connect()` や `.close()` を明示的に呼び出す必要はありません。クライアントが接続と切断を自動的に処理します。

## 非同期使用例

非同期クライアントオブジェクトは、基本的には [同期 Python クライアント](./index.mdx) と同等の機能を提供しますが、いくつか重要な違いがあります。まず、非同期クライアントは [`asyncio` イベントループ](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio-event-loop) 内で実行される `async` 関数で使用するよう設計されています。そのため、多くのクライアントメソッドは `async` 関数であり、[`Coroutine` オブジェクト](https://docs.python.org/3/library/asyncio-task.html#coroutine) を返します。

非同期クライアントのメソッドを実行するには、別の `async` 関数内で `await` する必要があります。Python スクリプトで `async` 関数を実行するには、`asyncio.run(my_async_function)` を使用するか、イベントループを直接操作します。

```python
loop = asyncio.new_event_loop()
loop.run_until_complete(my_async_function())
```

### データ挿入

この例では、新しいコレクションを作成し、オブジェクトのリストを非同期クライアントを使ってコレクションに挿入します。

非同期関数内でコンテキストマネージャーを使用している点に注目してください。コンテキストマネージャーは、データ挿入処理の間、クライアントがサーバーに接続されていることを保証します。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START AsyncInsertionExample"
  endMarker="# END AsyncInsertionExample"
  language="py"
/>

### 検索と RAG

この例では、非同期クライアントを使用してハイブリッド検索結果に対し、検索拡張生成 (RAG) を実行します。

非同期関数内でコンテキストマネージャーを使用している点に注目してください。コンテキストマネージャーは、データ挿入処理の間、クライアントがサーバーに接続されていることを保証します。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START AsyncSearchExample"
  endMarker="# END AsyncSearchExample"
  language="py"
/>

### 大量データ挿入

サーバーサイドのバッチ操作には、同期クライアントとその [`batch` 操作](../../manage-objects/import.mdx) の使用を推奨します。`batch` 操作は、並列リクエストにより大量データを効率的に処理できるよう設計されています。

非同期クライアントにも `insert` と `insert_many` メソッドがあり、非同期コンテキストでデータ挿入に使用できます。

### アプリケーションレベルの例

非同期クライアントの一般的なユースケースとして、複数のリクエストを同時に処理する Web アプリケーションがあります。以下は、モジュール型 Web API マイクロサービスを作成できる人気フレームワーク [FastAPI](https://fastapi.tiangolo.com/) と非同期クライアントを統合した、簡潔なサンプルです。

<FilteredTextBlock
  text={FastAPIExample}
  startMarker="# START FastAPI Example"
  endMarker="# END FastAPI Example"
  language="py"
/>

この例を実行すると、FastAPI サーバーが `http://localhost:8000` で起動します。`/` と `/search` エンドポイントを使用してサーバーと対話できます。

:::note データ挿入は表示していません
この例は最小構成であり、コレクションの作成やオブジェクトの挿入は含んでいません。`Movie` コレクションが既に存在することを前提としています。
:::

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

