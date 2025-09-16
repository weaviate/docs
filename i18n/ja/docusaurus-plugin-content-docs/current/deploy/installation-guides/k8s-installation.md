---
title: Kubernetes
sidebar_position: 3
image: og/docs/installation.jpg
# tags: ['installation', 'Kubernetes']
---

:::tip End-to-end guide
[minikube](https://minikube.sigs.k8s.io/docs/) を使って Kubernetes 上に Weaviate をデプロイするチュートリアルについては、Weaviate Academy コースの [Weaviate on Kubernetes](../../academy/deployment/k8s/index.md) をご覧ください。
:::

## Requirements

* 最新の Kubernetes クラスター（少なくともバージョン 1.23）。開発環境の場合、Docker Desktop に組み込まれている Kubernetes クラスターを使用することを検討してください。詳しくは [Docker のドキュメント](https://docs.docker.com/desktop/kubernetes/) を参照してください。
* クラスターが Kubernetes の `PersistentVolumeClaims` を使用して `PersistentVolumes` をプロビジョニングできること。
* Kubernetes の `ReadWriteOnce` アクセスモードを許可するため、単一ノードによって読み書きマウントできるファイルシステム。
* Helm バージョン v3 以上。現在の Helm チャートのバージョンは `||site.helm_version||` です。

## Weaviate Helm chart

:::note Important: Set the correct Weaviate version
ベストプラクティスとして、Helm チャート内で Weaviate のバージョンを明示的に設定してください。<br/><br/>

`values.yaml` ファイルでバージョンを設定するか、デプロイ時に [既定値を上書き](#deploy-install-the-helm-chart) してください。
:::

Kubernetes クラスターに Weaviate チャートをインストールするには、以下の手順に従います。

### ツールセットアップとクラスターアクセスの確認

```bash
# Check if helm is installed
helm version
# Make sure `kubectl` is configured correctly and you can access the cluster.
# For example, try listing the pods in the currently configured namespace.
kubectl get pods
```

### Helm チャートの取得

Weaviate Helm リポジトリを追加します。このリポジトリには Weaviate の Helm チャートが含まれています。

```bash
helm repo add weaviate https://weaviate.github.io/weaviate-helm
helm repo update
```

Weaviate Helm チャートからデフォルトの `values.yaml` 設定ファイルを取得します:
```bash
helm show values weaviate/weaviate > values.yaml
```

### values.yaml の編集

環境に合わせて Helm チャートをカスタマイズするには、[`values.yaml`](https://github.com/weaviate/weaviate-helm/blob/master/weaviate/values.yaml)
ファイルを編集します。デフォルトの `yaml` ファイルには詳細なコメントが付いており、設定の参考になります。

#### レプリケーション

デフォルト設定では、1 つの Weaviate レプリカ クラスターが定義されています。

#### ローカルモデル

`text2vec-transformers`、`qna-transformers`、`img2vec-neural` などのローカルモデルはデフォルトで無効です。モデルを有効にするには、そのモデルの `enabled` フラグを `true` に設定してください。

#### リソース制限

Helm チャート バージョン 17.0.1 以降では、パフォーマンス向上のためモジュールのリソース制約がコメントアウトされています。特定のモジュールにリソース制限を設ける場合は、`values.yaml` に制約を追加してください。

#### gRPC サービスの設定

Helm チャート バージョン 17.0.0 以降では、gRPC サービスがデフォルトで有効になっています。古い Helm チャートを使用している場合は、`values.yaml` を編集して gRPC を有効にしてください。

`enabled` フィールドが `true`、`type` フィールドが `LoadBalancer` になっていることを確認してください。これにより、Kubernetes クラスター外部から [gRPC API](https://weaviate.io/blog/grpc-performance-improvements) にアクセスできます。

```yaml
grpcService:
  enabled: true  # ⬅️ Make sure this is set to true
  name: weaviate-grpc
  ports:
    - name: grpc
      protocol: TCP
      port: 50051
  type: LoadBalancer  # ⬅️ Set this to LoadBalancer (from NodePort)
```

#### 認証と認可

以下に認証設定の例を示します。

```yaml
authentication:
  apikey:
    enabled: true
    allowed_keys:
      - readonly-key
      - secr3tk3y
    users:
      - readonly@example.com
      - admin@example.com
  anonymous_access:
    enabled: false
  oidc:
    enabled: true
    issuer: https://auth.wcs.api.weaviate.io/auth/realms/SeMI
    username_claim: email
    groups_claim: groups
    client_id: wcs
authorization:
  admin_list:
    enabled: true
    users:
      - someuser@weaviate.io
      - admin@example.com
    readonly_users:
      - readonly@example.com
```

この例では、キー `readonly-key` によって `readonly@example.com` として、`secr3tk3y` によって `admin@example.com` として認証されます。

また、OIDC 認証が有効になっており、トークン発行者／IdP として WCD を使用しています。そのため、WCD アカウントを持つユーザーは認証可能です。この設定では `someuser@weaviate.io` を管理者ユーザーとして指定しているため、`someuser@weaviate.io` が認証されると読み書き両方の権限が付与されます。

詳細な認証・認可設定については次を参照してください:
- [認証](../configuration/authentication.md)
- [認可](../configuration/authorization.md)

#### 非 root ユーザーでの実行

デフォルトでは、Weaviate は root ユーザーとして実行されます。非特権ユーザーとして実行する場合は、`containerSecurityContext` セクションの設定を編集してください。

`init` コンテナはノードを設定するため常に root として実行されます。システム起動後は、設定した非特権ユーザーで実行されます。

### デプロイ（Helm チャートのインストール）

Helm チャートは次のようにデプロイできます。

```bash
# Create a Weaviate namespace
kubectl create namespace weaviate

# Deploy
helm upgrade --install \
  "weaviate" \
  weaviate/weaviate \
  --namespace "weaviate" \
  --values ./values.yaml
```

上記コマンドは、新しいネームスペースを作成する権限があることを前提としています。ネームスペースレベルの権限しかない場合は、新規ネームスペースの作成をスキップし、`helm upgrade` の `--namespace` 引数を既存のネームスペース名に合わせて変更してください。

オプションとして、`--create-namespace` パラメータを指定すると、ネームスペースが存在しない場合に自動で作成されます。

### 初回デプロイ後のインストールの更新

前述のコマンド（`helm upgrade...`）は冪等です。設定を変更した後でも、何度でも実行でき、副作用なく望ましい状態に更新されます。

### pre-`1.25` から `1.25` 以上へのアップグレード

:::caution Important
:::

pre-`1.25` バージョンから `1.25` 以上へアップグレードするには、デプロイ済みの `StatefulSet` を削除し、Helm チャートをバージョン `17.0.0` 以上に更新してから Weaviate を再デプロイする必要があります。

詳しくは [Kubernetes 用 1.25 マイグレーションガイド](../migration/weaviate-1-25.md) を参照してください。

## 追加の設定ヘルプ

- [Cannot list resource "configmaps" in API group when deploying Weaviate k8s setup on GCP](https://stackoverflow.com/questions/58501558/cannot-list-resource-configmaps-in-api-group-when-deploying-weaviate-k8s-setup)
- [Error: UPGRADE FAILED: configmaps is forbidden](https://stackoverflow.com/questions/58501558/cannot-list-resource-configmaps-in-api-group-when-deploying-weaviate-k8s-setup)

### Weaviate での EFS の使用

場合によっては、Weaviate と併せて EFS（Amazon Elastic File System）を使用したい、あるいは使用する必要があることがあります。特に AWS Fargate を利用する場合、[PV（Persistent Volume）](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) は PVC から自動作成されないため、手動で作成する必要がある点に注意してください。

Weaviate で EFS を使用するには、次の手順が必要です。

- EFS ファイルシステムを作成する。
- Weaviate のレプリカごとに EFS アクセスポイントを作成する。
    - すべてのアクセス ポイントは別々の root-directory を持つ必要があります。Pod がデータを共有すると失敗します。
- Weaviate をデプロイする VPC の各サブネットに対して EFS マウントターゲットを作成する。
- Kubernetes で EFS を使用する StorageClass を作成する。
- Weaviate ボリュームを作成し、各ボリュームに異なる AccessPoint を VolumeHandle として設定する。
- Weaviate をデプロイする。

以下は `weaviate-0` Pod 用 PV の例です。

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: weaviate-0
spec:
  capacity:
    storage: 8Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: "efs-sc"
  csi:
    driver: efs.csi.aws.com
    volumeHandle: <FileSystemId>::<AccessPointId-for-weaviate-0-Pod>
  claimRef:
    namespace: <namespace where Weaviate is/going to be deployed>
    name: weaviate-data-weaviate-0
```

Fargate で EFS を使用したステートフル ワークロードの実行についての一般的な情報は、[AWS 公式ブログ](https://aws.amazon.com/blogs/containers/running-stateful-workloads-with-amazon-eks-on-aws-fargate-using-amazon-efs/) を参照することをお勧めします。



### Weaviate における Azure file CSI の利用
プロビジョナー `file.csi.azure.com` は **サポートされておらず**、ファイル破損を引き起こします。代わりに、`values.yaml` で定義する ` StorageClass ` がプロビジョナー `disk.csi.azure.com` を使用していることを確認してください。例:

```yaml
storage:
  size: 32Gi
  storageClassName: managed
```

クラスタで利用可能な ` StorageClass ` の一覧は次のコマンドで取得できます:

```
kubectl get storageclasses
```

## トラブルシューティング

- `No private IP address found, and explicit IP not provided` と表示された場合は、Pod サブネットを次のいずれかの有効な IP アドレス範囲に設定してください:

    ```
    10.0.0.0/8
    100.64.0.0/10
    172.16.0.0/12
    192.168.0.0/16
    198.19.0.0/16
    ```

### `CLUSTER_HOSTNAME` の設定（ホスト名が変わる場合）

一部のシステムでは、 クラスタホスト名 が時間とともに変化する場合があります。これは、単一ノードの Weaviate デプロイメントで問題を引き起こすことが知られています。これを回避するため、`values.yaml` ファイルで `CLUSTER_HOSTNAME` 環境変数を クラスタホスト名 に設定してください。

```yaml
env:
  - CLUSTER_HOSTNAME: "node-1"
```

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

