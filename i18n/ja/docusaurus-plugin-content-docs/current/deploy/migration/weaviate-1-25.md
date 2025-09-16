---
title: 1.25 （ Kubernetes ユーザー向け）
sidebar_position: 2
image: og/docs/more-resources.jpg
# tags: ['migration']
---

# Kubernetes ユーザー向け Weaviate 1.25 移行ガイド

## 前提条件と要件

この移行ガイドでは、次の条件を満たしていることを想定しています。

-  kubernetes 、 helm 、 shell コマンドに関する実用的な知識がある  
-  Weaviate を kubernetes に `weaviate` ネームスペースでデプロイ済み  
-  helm の設定ファイル（例： `values.yaml` ）にアクセスできる  

## 移行概要

Weaviate `1.25` では、フェイルオーバー耐性を高めるためにクラスターメタデータの合意アルゴリズムとして [Raft](https://raft.github.io/) を導入しました。この変更に伴い、メタデータ全体の移行が必要です。

:::tip cluster metadata and schema
クラスターメタデータは以前は `schema` と呼ばれていました。現在は `metadata` という用語を使用し、`schema` はクラスやプロパティなど Weaviate インスタンスのデータモデルを指す用語として使用します。
:::

そのため、kubernetes 上で pre-`1.25` から `1.25` に移行するには、以下の手順を実行してください。

- デプロイ済みの [`StatefulSet`](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) を削除する  
- helm チャートをバージョン `17.0.0` 以上に更新する  
- Weaviate を再デプロイする  
- クラスターメタデータの移行完了を待つ  

詳細は後述の [アップグレード手順](#upgrade-instructions) を参照してください。

`1.25` から pre-`1.25` へダウングレードする場合は、まず `v1/cluster/schema-v1` エンドポイントへ `POST` リクエスト（ペイロード不要）を送り、メタデータをダウングレードします。その後、同様に `StatefulSet` を削除し、目的のバージョンへ Weaviate をダウングレードしてください。

詳細は [ダウングレード手順](#downgrade-instructions) を参照してください。

:::caution Cluster downtime
このアップグレードではクラスターメタデータの移行が必要です。移行中はクラスターダウンタイムが発生します。ダウンタイムの長さはデータベースのサイズに依存します。  
<br/>

影響を最小限にするため、サービス利用が少ない時間帯に実施するか、メインクラスタを再起動する間にセカンダリクラスタを用意することを推奨します。
:::

## アップグレード手順

:::note namespace
デプロイが別のネームスペースにある場合は、以下の `-n` オプションを適宜変更してください。たとえば `my_namespace` であれば、最初のコマンドは `kubectl delete sts weaviate -n my_namespace` となります。
:::

### （任意）バックアップ

アップグレード前に Weaviate データベースの [バックアップ](/deploy/configuration/backups.md) を取得することを推奨します。バックアップが難しい場合は、手動で [データをエクスポート](/weaviate/manage-collections/migrate.mdx) するなどの方法も検討してください。

### 1. StatefulSet の削除

まず、既存の StatefulSet を削除します。これによりネームスペース内のすべての Pod が削除されます。

```bash
kubectl delete sts weaviate -n weaviate
```

次のような出力が表示されます。

```bash
statefulset.apps "weaviate" deleted
```

StatefulSet が削除されると、ネームスペース内に Pod は存在しなくなります。

```bash
kubectl get pods -n weaviate
```

### 2. Helm チャートの更新

次に、リポジトリを更新して最新の変更を取得します。

```bash
helm repo update weaviate
```

以下のように helm チャートのバージョンを確認してください。（ `17.0.0` 以上である必要があります。）

```bash
helm search repo weaviate
```

### 3. Weaviate のデプロイ

続いて、以下のように Weaviate を再デプロイします。既存の設定ファイル `values.yaml` を適用し、新しい合意アルゴリズム（Raft）の下でクラスタを再起動します。

ここではイメージタグを `1.25.0` に上書きしています。 `values.yaml` 内で直接この値を変更しても構いません。

```bash
helm upgrade weaviate weaviate/weaviate \
  --namespace weaviate \
  --values ./values.yaml \
  --set image.tag="1.25.0" \
```

### 4. 更新の確認

Pod が再度起動して稼働するまでに少し時間がかかる場合があります。クラスタが稼働しているかどうかは、 `v1/cluster/statistics` エンドポイントで確認できます。

たとえば、 `curl` （および整形用に `jq` ）を使ってクラスタの状態を確認できます。（ `localhost:8080` は実際の URL とポートに置き換えてください。）

```bash
curl -s localhost:8080/v1/cluster/statistics | jq
```

成功すると、次のようなレスポンスが得られます。

```json
{
  "statistics": [
    {
      // ...
      "leaderAddress": "10.244.2.3:8300",
      "leaderId": "weaviate-0",
      "name": "weaviate-0",
      "open": true,
      "raft": {},
      "ready": true,
      "status": "HEALTHY"
    },
    {
      // ...
      "leaderAddress": "10.244.1.3:8300",
      "leaderId": "weaviate-1",
      "name": "weaviate-1",
      "open": true,
      "raft": {},
      "ready": true,
      "status": "HEALTHY"
    },
    {
      // ...
      "leaderAddress": "10.244.0.4:8300",
      "leaderId": "weaviate-2",
      "name": "weaviate-2",
      "open": true,
      "raft": {},
      "ready": true,
      "status": "HEALTHY"
    }
  ],
  // highlight-start
  "synchronized": true
  // highlight-end
}
```

`statistics` 内のオブジェクト数が `values.yaml` で設定したレプリカ数と一致し、 `synchronized` フラグが `true` であれば、クラスタは正常に稼働しています。

## ダウングレード手順

`1.25` から pre-`1.25` バージョンへダウングレードする場合は、まず `v1/cluster/schema-v1` へ `POST` リクエスト（ペイロード不要）を送り、クラスターメタデータをダウングレードする必要があります。

### 1. クラスターメタデータのダウングレード

次のリクエストを実行してクラスターメタデータをダウングレードします。これにより、pre-`1.25` バージョンへのダウングレード準備が整います。（ `localhost:8080` は実際の URL とポートに置き換えてください。）

```bash
curl -X POST -s -o /dev/null -w "%{http_code}" localhost:8080/v1/cluster/schema-v1
```

`200` ステータスコードが返されるはずです。

### 2. StatefulSet の削除

メタデータをダウングレードした後、既存の StatefulSet を削除します。これによりネームスペース内のすべての Pod が削除されます。

```bash
kubectl delete sts weaviate -n weaviate
```

### 3. Weaviate のダウングレード

では、 Weaviate をダウングレードします。たとえば、バージョン `1.24.10` へダウングレードするには、次のコマンドを実行してください。

```bash
helm upgrade weaviate weaviate/weaviate \
  --namespace weaviate \
  --values ./values.yaml \
  --set image.tag="1.24.10"
```

これにより、クラスターは指定した `1.25` 以前のバージョンに戻ります。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

