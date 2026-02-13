---
title: 検索（GraphQL | gRPC）
sidebar_position: 0
description: "Weaviate で柔軟なクエリとデータ取得を行うための GraphQL と gRPC API ドキュメント。"
image: og/docs/api.jpg
# tags: ['GraphQL references']
---


## API

Weaviate は、クエリ用に [GraphQL](https://graphql.org/) と gRPC の API を提供しています。

基盤となる API 呼び出しを抽象化し、アプリケーションへの Weaviate 統合を容易にするため、Weaviate クライアントライブラリ（[client library](../../client-libraries/index.mdx)）の使用を推奨します。

しかし、`/graphql` エンドポイントに対して POST リクエストを送信して GraphQL を直接使用して Weaviate をクエリしたり、[gRPC](../grpc.md) の protobuf 仕様に基づいて独自の `gRPC` 呼び出しを作成したりすることもできます。


## すべてのリファレンス

各リファレンスには個別のサブページがあります。詳細については、以下のリンクをクリックしてください。

- [オブジェクトレベルクエリ](./get.md)
- [集約](./aggregate.md)
- [検索演算子](./search-operators.md)
- [条件フィルター](./filters.md)
- [追加演算子](./additional-operators.md)
- [追加プロパティ](./additional-properties.md)
- [探索](./explore.md)


## GraphQL API

### GraphQL を選ぶ理由

GraphQL はグラフデータ構造を利用して構築されたクエリ言語です。他のクエリ言語でよく発生する over-fetch と under-fetch の問題を軽減するため、データの取得および変更を効率的に行えます。

:::tip GraphQL is case-sensitive
GraphQL は大文字と小文字を区別します（[reference](https://spec.graphql.org/June2018/#sec-Names)）。クエリを記述する際は正しい大文字・小文字を使用してください。
:::

### クエリ構造

GraphQL クエリは次のように Weaviate へ POST できます。

```bash
curl http://localhost/v1/graphql -X POST -H 'Content-type: application/json' -d '{GraphQL query}'
```

GraphQL JSON オブジェクトは次のように定義されます。

```json
{
    "query": "{ # GRAPHQL QUERY }"
}
```

GraphQL クエリは定義済みの構造に従います。クエリは次のように構成されます。

```graphql
{
  <Function> {
      <Collection> {
        <property>
        _<underscore-property>
      }
  }
}
```

### 制限事項

GraphQL の _integer_ データは現在 `int32` のみをサポートし、`int64` には対応していません。そのため、Weaviate の _integer_ フィールドに `int32` を超える値が入っている場合、GraphQL クエリでは返されません。この[課題](https://github.com/weaviate/weaviate/issues/1563)に取り組んでいます。現時点での回避策としては `string` を使用してください。

### 整合性レベル

GraphQL（`Get`）クエリは、可変の [整合性レベル](../../concepts/replication-architecture/consistency.md#tunable-read-consistency)で実行されます。

## gRPC API

Weaviate v1.19.0 から、gRPC インターフェースが段階的に追加されています。

gRPC は高性能でオープンソースの汎用 RPC フレームワークで、契約ベースであらゆる環境で利用できます。HTTP/2 と Protocol Buffers を基盤としているため、高速かつ効率的です。

gRPC API の詳細は[こちら](../grpc.md)をご覧ください。


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

