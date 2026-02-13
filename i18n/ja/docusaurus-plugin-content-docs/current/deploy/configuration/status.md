---
title: ステータス
sidebar_position: 70
image: og/docs/configuration.jpg
# tags: ['status', 'reference', 'configuration']
---

Weaviate にはさまざまなクラスター ステータスがあります。

## ライブネス

`live` エンドポイントは、アプリケーションが稼働しているかどうかを確認します。Kubernetes の liveness プローブとして利用できます。

#### 使い方

エンドポイントは `GET` リクエストを受け付けます。

```js
GET /v1/.well-known/live
```

アプリケーションが HTTP リクエストに応答できる場合、エンドポイントは HTTP ステータス コード `200` を返します。

#### 例

import WellKnownLive from '/_includes/code/wellknown.live.mdx';

<WellKnownLive/>

アプリケーションが HTTP リクエストに応答できる場合、エンドポイントは HTTP ステータス コード `200` を返します。

## レディネス

`ready` エンドポイントは、アプリケーションがトラフィックを受信できる状態かどうかを確認します。Kubernetes の readiness プローブとして利用できます。

#### 使い方

このディスカバリー エンドポイントは `GET` リクエストを受け付けます。

```js
GET /v1/.well-known/ready
```

アプリケーションが HTTP リクエストに応答できる場合、エンドポイントは HTTP ステータス コード `200` を返します。現在トラフィックを処理できない場合は、HTTP ステータス コード `503` を返します。

アプリケーションが利用できず、トラフィックを受信可能な水平方向の Weaviate レプリカがある場合は、トラフィックをそのレプリカのいずれかにリダイレクトしてください。

#### 例

import WellknownReady from '/_includes/code/wellknown.ready.mdx';

<WellknownReady/>

## スキーマ同期

`v1//schema/cluster-status` エンドポイントは、スキーマ同期のステータスを表示します。エンドポイントは次のフィールドを返します。

- `healthy`: スキーマ同期のステータス  
- `hostname`: Weaviate インスタンスのホスト名  
- `ignoreSchemaSync`: 起動時にクラスター チェックを無視するかどうか（同期ずれからの復旧用）  
- `nodeCount`: クラスター内のノード数  

例のレスポンス:

```js
{
    "healthy": true,
    "hostname": "node1",
    "ignoreSchemaSync": false,
    "nodeCount": 3
}
```

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

