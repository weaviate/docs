---
title: gRPC
description: "高性能で効率的な Weaviate データベースとの通信を実現する gRPC API 統合ガイド。"
image: og/docs/api.jpg
# tags: ['schema']
---

Weaviate `v1.19.0` 以降、Weaviate に gRPC インターフェースが順次追加されています。gRPC は、高性能でオープンソースの汎用 RPC フレームワークで、契約ベースのためあらゆる環境で利用できます。HTTP/2 と Protocol Buffers を基盤としているため、非常に高速かつ効率的です。

Weaviate `v1.23.7` 時点で、gRPC インターフェースは安定版と見なされています。[ Python (`v4` バージョン) ](../client-libraries/python/index.mdx) と [ TypeScript (`v3` バージョン) ](../client-libraries/typescript/index.mdx) のクライアントライブラリーが gRPC をサポートしており、その他のクライアントライブラリーも順次対応予定です。

## Protocol Buffer (Protobuf) 定義

gRPC インターフェースは、Protocol Buffer (Protobuf) 定義によって規定されます (詳細は [こちら](https://protobuf.dev/))。

Weaviate の場合、`.proto` ファイルは Core ライブラリーの [proto ディレクトリー](https://github.com/weaviate/weaviate/tree/master/grpc/proto/v1) に格納されています。

このディレクトリーには次のファイルが含まれます:

- `weaviate.proto`: メインの Protobuf 定義ファイルです。このファイルでは `Weaviate` サービスを定義し、そのサービスで利用可能な RPC メソッドを指定します。
- `batch.proto`: バッチオブジェクト操作を扱うためのデータ構造を定義します。このファイルは `weaviate.proto` からインポートされます。
- `search_get.proto`: 検索 (get) 操作を扱うためのデータ構造を定義します。このファイルは `weaviate.proto` からインポートされます。
- `base.proto`: 他の場所で使用される基本的なデータ構造を定義します。このファイルは `batch.proto` と `search_get.proto` からインポートされます。

## gRPC の使用方法

### サーバー側

例として、以下のスニペットでは、`50051` をホストポートとして公開し、コンテナーの外部からアクセスできるようにしています。`50051` ポートは gRPC 呼び出し用にコンテナー内の `50051` ポートへ、`8080` ポートは REST 呼び出し用にコンテナー内の `8080` ポートへそれぞれマッピングされています。

:::info
gRPC 呼び出しにはデフォルトポート `50051` の利用を推奨します。`GRPC_PORT` [環境変数](/deploy/configuration/env-vars/index.md) で変更可能です。  
[ Weaviate Cloud ](https://console.weaviate.cloud/) では gRPC 用にポート `443` が使用されている点にご注意ください。
:::

```yaml:

```yaml
---
services:
  weaviate:
    # ... Other settings
    ports:
     - "8080:8080"  # REST calls
     - "50051:50051"  # gRPC calls
  # ... Other settings

