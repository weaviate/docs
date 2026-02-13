---
title: v3 から v4 への移行
sidebar_position: 50
description: "非推奨の v3 から現行の v4 クライアント ライブラリーへ Python アプリケーションをアップグレードするための移行ガイド。"
image: og/docs/client-libraries.jpg
# tags: ['python', 'client library']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/client-libraries/python_v4.py';

:::note Python client version
現在の Python クライアント バージョンは `v||site.python_client_version||` です  
:::

` v4 ` の Weaviate Python クライアント API はユーザー エクスペリエンスを向上させるために全面的に書き直されました。そのため、` v3 ` API とは大きく異なり、Weaviate とのやり取り方法を学び直す必要があります。

多少のオーバーヘッドが発生するかもしれませんが、` v4 ` API は開発者エクスペリエンスを大きく向上させると考えています。たとえば、` v4 ` クライアントを使用すると gRPC API を介した高速化をフルに活用でき、強い型付けによる IDE の静的解析支援も受けられます。

API の変更範囲が広いため、このガイドではすべての変更点を網羅していません。ここでは主要な変更点と、コードをどのように高いレベルで移行するかを説明します。

コード例については、[こちらの推奨セクション](#how-to-migrate-your-code) からサイト全体のドキュメントを参照してください。

## インストール

` v3 ` から ` v4 ` へ移行するには、以下を行います。

1. クライアント ライブラリーをアップグレードします。

    ```bash
    pip install -U weaviate-client
    ```

2. 互換性のあるバージョンの Weaviate にアップグレードします。各マイナー Python クライアント バージョンは、対応するマイナー Weaviate バージョンと密接に結び付いています。  
    - 例として、Weaviate ` v1.27.x ` は Python クライアント ` v4.9.x ` と共に開発されました。  
    - 一般的には、Weaviate とクライアントの最新バージョンを使用することを推奨します。バージョン互換性マトリクスは [リリース ノート](../../release-notes/index.md#weaviate-database-and-client-releases) で確認できます。

3. Weaviate に対して gRPC 用のポートが開いていることを確認します。  
    - デフォルト ポートは 50051 です。

    <details>
      <summary>docker-compose.yml の例</summary>

    Docker で Weaviate を実行している場合、` 50051 ` のデフォルト ポートをマッピングするには、`docker-compose.yml` ファイルに次を追加します。

    ```yaml
        ports:
        - 8080:8080
        - 50051:50051
    ```

    </details>

## クライアントのインスタンス化

` v4 ` クライアントは `WeaviateClient` オブジェクトによってインスタンス化されます。`WeaviateClient` オブジェクトはすべての API 操作へのメイン エントリ ポイントです。

`WeaviateClient` オブジェクトを直接インスタンス化することもできますが、ほとんどの場合は `connect_to_local` や `connect_to_weaviate_cloud` などの接続ヘルパー関数を使用する方が簡単です。

<Tabs groupId="languages">
<TabItem value="wcd" label="WCD">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# WCDInstantiation"
  endMarker="# END WCDInstantiation"
  language="py"
/>

<!-- TODO[g-despot]: Add link to external Python references once created for "Timeout values" -->
<!-- To configure connection timeout values, see [Timeout values](/weaviate/client-libraries/python#timeout-values). -->

</TabItem>
<TabItem value="local" label="ローカル">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# LocalInstantiationBasic"
    endMarker="# END LocalInstantiationBasic"
    language="py"
  />

</TabItem>
<TabItem value="embedded" label="組み込み">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# EmbeddedInstantiationBasic"
  endMarker="# END EmbeddedInstantiationBasic"
  language="py"
/>

</TabItem>
<TabItem value="custom" label="カスタム">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# CustomInstantiationBasic"
  endMarker="# END CustomInstantiationBasic"
  language="py"
/>

</TabItem>
</Tabs>

## 主な変更点

` v4 ` クライアント API は ` v3 ` API とは大きく異なります。` v4 ` クライアントの主なユーザー向け変更点は次のとおりです。

- ヘルパー クラスの大幅な活用  
- コレクションとのやり取り  
- ビルダー パターンの廃止  

### ヘルパー クラス

` v4 ` クライアントはヘルパー クラスを広範に利用します。これらのクラスは強い型付けを提供し、静的型チェックを可能にします。また、IDE の自動補完機能を通じてコーディングを容易にします。

コーディング中はオートコンプリートを頻繁に確認してください。API の変更点やクライアント オプションに関する有用なガイダンスが得られます。

import QuickStartCode from '!!raw-loader!/_includes/code/graphql.filters.nearText.generic.py';

<Tabs groupId="languages">
<TabItem value="create" label="コレクションの作成">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# START CreateCollectionExample"
    endMarker="# END CreateCollectionExample"
    language="py"
  />

</TabItem>
<TabItem value="query" label="NearText クエリ">

  <FilteredTextBlock
    text={QuickStartCode}
    startMarker="# NearTextExample"
    endMarker="# END NearTextExample"
    language="py"
  />

</TabItem>
</Tabs>

`wvc` 名前空間は、` v4 ` API でよく使用されるクラスを公開しています。この名前空間は主な用途に基づいてさらにサブモジュールに分かれています。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START WVCImportExample"
  endMarker="# END WVCImportExample"
  language="py"
/>



### コレクションの操作

Weaviate Database に接続すると、v4 API では `WeaviateClient` オブジェクトが、v3 API では `Client` オブジェクトが返されます。

`v3` API の操作は `client` オブジェクト（`Client` のインスタンス）を中心に設計されており、CRUD や検索などのサーバー操作をここから実行していました。

`v4` API では、Weaviate とのやり取りを開始する入口が別のパラダイムに変わっています。

サーバーレベルの操作（例: `client.is_ready()` でのレディネス確認や `client.cluster.nodes()` でのノード状況取得）は引き続き `client`（`WeaviateClient` のインスタンス）で行います。

CRUD と検索操作は、対象となる特定のコレクションを反映するために `Collection` オブジェクトに対して実行します。

以下の例は、`Collection` 型ヒントを持つ関数を示しています。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START CollectionInteractionExample"
  endMarker="# END CollectionInteractionExample"
  language="py"
/>

コレクションオブジェクトは自分自身の名前を属性として保持しています。そのため、`near_text` クエリなどの操作を行う際にコレクション名を指定する必要がありません。v4 のコレクションオブジェクトは、v3 のクライアントオブジェクトで利用できた幅広い操作と比べて、よりフォーカスされた名前空間を持っています。これによりコードが簡潔になり、エラーの可能性が減少します。

import ManageDataCode from '!!raw-loader!/_includes/code/howto/manage-data.read.py';
import ManageDataCodeV3 from '!!raw-loader!/_includes/code/howto/manage-data.read-v3.py';

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={ManageDataCode}
      startMarker="# ReadObject START"
      endMarker="# ReadObject END"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={ManageDataCodeV3}
      startMarker="# ReadObject START"
      endMarker="# ReadObject END"
      language="pyv3"
    />
  </TabItem>
</Tabs>

### 用語の変更（例: class → collection）

Weaviate エコシステム内のいくつかの用語が変更され、それに合わせてクライアントも更新されました。

- Weaviate の「Class」は「Collection」と呼ばれるようになりました。コレクションはデータオブジェクトとそのベクトル埋め込みをまとめて格納します。  
- 「Schema」は「Collection Configuration」と呼ばれるようになり、コレクション名、ベクトライザー、インデックス設定、プロパティ定義などを含む設定の集合です。

アーキテクチャおよび用語の変更に伴い、API の大部分が変更されました。Weaviate とのやり取り方法に違いがあると考えてください。

たとえば、`client.collections.list_all()` は `client.schema.get()` の置き換えです。

[コレクションの管理](../../manage-collections/index.mdx) には、コレクションを扱うための詳細と追加サンプルコードがあります。各種クエリやフィルターについては [検索](../../search/index.mdx) を参照してください。

### JSON からのコレクション作成

JSON 定義からコレクションを作成することは引き続き可能です。既存データを移行する際などに便利でしょう。たとえば、[既存の定義を取得](../../manage-collections/collection-operations.mdx#read-a-single-collection-definition) し、それを用いて新しいコレクションを作成できます。

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START CreateCollectionFromJSON"
  endMarker="# END CreateCollectionFromJSON"
  language="py"
/>

### ビルダーパターンの廃止

クエリを構築するビルダーパターンは削除されました。ビルダーパターンは混乱を招きやすく、静的解析では検出できない実行時エラーが発生しがちでした。

代わりに、`v4` API では特定のメソッドとそのパラメーターを使ってクエリを構築します。

import SearchSimilarityCode from '!!raw-loader!/_includes/code/howto/search.similarity.py';
import SearchSimilarityCodeV3 from '!!raw-loader!/_includes/code/howto/search.similarity-v3.py';

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={SearchSimilarityCode}
      startMarker="# GetNearTextPython"
      endMarker="# END GetNearTextPython"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={SearchSimilarityCodeV3}
      startMarker="# GetNearTextPython"
      endMarker="# END GetNearTextPython"
      language="pyv3"
    />
  </TabItem>
</Tabs>

さらに、多くの引数は `MetadataQuery` や `Filter` などのヘルパークラスを用いて構築されるようになり、IDE の支援や静的解析によって利用が容易になり、エラーも減少します。

## コード移行の方法

移行ではコードベースに大幅な変更が必要になる可能性があります。まずは [Python クライアントライブラリのドキュメント](./index.mdx) を確認し、インスタンス化の詳細や各サブモジュールを把握してください。

その後、[コレクション管理](../../manage-collections/index.mdx) や [クエリ](../../search/index.mdx) のハウツーガイドを参照してください。

特に次のページをご覧ください。

- [コレクションの管理](../../manage-collections/index.mdx)
- [バッチインポート](../../manage-objects/import.mdx)
- [クロスリファレンス](../../manage-collections/cross-references.mdx)
- [基本検索](../../search/basics.md)
- [類似検索](../../search/similarity.md)
- [フィルター](../../search/filters.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

