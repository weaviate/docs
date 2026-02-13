---
title: Kubernetes
sidebar_position: 3
image: og/docs/installation.jpg
# tags: ['installation', 'Kubernetes']
---

:::tip End-to-end guide
[minikube](https://minikube.sigs.k8s.io/docs/) を使用して Kubernetes 上に Weaviate をデプロイするチュートリアルは、Weaviate Academy コースの [Weaviate on Kubernetes](../../academy/deployment/k8s/index.md) をご覧ください。
:::

## 必要条件

* 最新の Kubernetes クラスター (少なくともバージョン 1.23)。開発環境の場合は、Docker Desktop に組み込まれている Kubernetes クラスターの使用を検討してください。詳細は [Docker ドキュメント](https://docs.docker.com/desktop/kubernetes/) を参照してください。  
* クラスターが Kubernetes の `PersistentVolumeClaims` を使用して `PersistentVolumes` をプロビジョニングできること。  
* Kubernetes の `ReadWriteOnce` アクセスモードを許可するため、単一ノードが読み書きマウントできるファイルシステム。  
* Helm バージョン v3 以上。現在の Helm チャートのバージョンは `||site.helm_version||` です。  

## Weaviate Helm チャート

:::note 重要: 正しい Weaviate バージョンを設定する
ベストプラクティスとして、Helm チャートで Weaviate のバージョンを明示的に指定してください。<br/><br/>

デプロイ時に `values.yaml` ファイルでバージョンを設定するか、[既定値を上書き](#deploy-install-the-helm-chart) してください。
:::

Kubernetes クラスターに Weaviate チャートをインストールする手順は次のとおりです。

### ツールセットアップとクラスターアクセスの確認

```bash
# Check if helm is installed
helm version
# Make sure `kubectl` is configured correctly and you can access the cluster.
# For example, try listing the pods in the currently configured namespace.
kubectl get pods
```

### Helm チャートの取得

Weaviate Helm リポジトリを追加します。

```bash
helm repo add weaviate https://weaviate.github.io/weaviate-helm
helm repo update
```

Weaviate Helm チャートから既定の `values.yaml` 設定ファイルを取得します。  
```bash
helm show values weaviate/weaviate > values.yaml
```

### values.yaml の変更

環境に合わせて Helm チャートをカスタマイズするには、[`values.yaml`](https://github.com/weaviate/weaviate-helm/blob/master/weaviate/values.yaml) を編集します。既定の `yaml` ファイルには詳細なドキュメントが記載されており、設定の参考になります。

#### レプリケーション

既定の設定では、Weaviate 1 レプリカ クラスターが定義されています。

#### ローカルモデル

`text2vec-transformers`、`qna-transformers`、`img2vec-neural` などのローカルモデルは既定で無効になっています。モデルを有効にするには、各モデルの `enabled` フラグを `true` に設定してください。

#### リソース制限

Helm チャート バージョン 17.0.1 以降では、パフォーマンス向上のためモジュールリソースの制約がコメントアウトされています。特定モジュールのリソースを制限したい場合は、`values.yaml` に制約を追加してください。

#### gRPC サービス設定

Helm チャート バージョン 17.0.0 以降では、gRPC サービスが既定で有効です。古い Helm チャートを使用している場合は、`values.yaml` を編集して gRPC を有効にしてください。

`enabled` フィールドが `true`、`type` フィールドが `LoadBalancer` になっていることを確認します。これにより、Kubernetes クラスター外部から [gRPC API](https://weaviate.io/blog/grpc-performance-improvements) にアクセスできます。

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

:::tip
Weaviate Helm チャートは、Kubernetes へデプロイされるたびにランダムなユーザー名/パスワードを自動生成します。そのため、Helm チャートでデプロイされた場合、ノード間通信は常に保護されています。
:::

認証の例:

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

この例では、キー `readonly-key` は `readonly@example.com` として、`secr3tk3y` は `admin@example.com` としてユーザーを認証します。

また、OIDC 認証も有効になっており、WCD がトークン発行者/アイデンティティ プロバイダーとして設定されています。WCD アカウントを持つユーザーは認証される可能性があります。この構成では `someuser@weaviate.io` が管理者ユーザーとして設定されているため、当該ユーザーが認証されると読み書き両方の権限が付与されます。

import WCDOIDCWarning from '/_includes/wcd-oidc.mdx';

<WCDOIDCWarning/>

認証と認可の詳細なドキュメントについては以下を参照してください:
- [Authentication](../configuration/authentication.md)
- [Authorization](../configuration/authorization.md)

#### 非 root ユーザーとして実行

既定では、weaviate は root ユーザーとして実行されます。非特権ユーザーで実行したい場合は、`containerSecurityContext` セクションの設定を編集してください。

`init` コンテナはノードを設定するために常に root として実行されますが、システム起動後は設定した非特権ユーザーで実行されます。

### デプロイ (Helm チャートのインストール)

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

上記は、新しい namespace を作成する権限があることを前提としています。namespace レベルの権限のみの場合は、namespace の作成を省略し、既存 namespace 名に合わせて `helm upgrade` の `--namespace` 引数を調整してください。

オプションで `--create-namespace` パラメータを指定すると、namespace が存在しない場合に自動で作成されます。

### 初回デプロイ後のインストール更新

前述のコマンド (`helm upgrade...`) は冪等です。つまり、設定を変更した後で何度実行しても、意図しない変更や副作用は発生しません。

### pre-1.25 から `1.25` 以上へのアップグレード

:::caution 重要
:::

pre-`1.25` バージョンから `1.25` 以上へアップグレードする際は、デプロイ済みの `StatefulSet` を削除し、Helm チャートをバージョン `17.0.0` 以上に更新したうえで、Weaviate を再デプロイする必要があります。

詳細は [Kubernetes 用 1.25 移行ガイド](../migration/weaviate-1-25.md) を参照してください。



## 追加設定ヘルプ

- [GCP で Weaviate k8s をデプロイする際に「Cannot list resource "configmaps" in API group」が発生する](https://stackoverflow.com/questions/58501558/cannot-list-resource-configmaps-in-api-group-when-deploying-weaviate-k8s-setup)
- [Error: UPGRADE FAILED: configmaps is forbidden](https://stackoverflow.com/questions/58501558/cannot-list-resource-configmaps-in-api-group-when-deploying-weaviate-k8s-setup)

### Weaviate で EFS を使用する

状況によっては、Weaviate と一緒に Amazon Elastic File System（ EFS ）を使用したい、もしくは使用する必要がある場合があります。特に AWS Fargate の場合、[PV（ persistent volume ）](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) を手動で作成する必要がある点にご注意ください。PVC では PV は自動作成されません。

Weaviate で EFS を使用するには、以下を行います。

- EFS ファイルシステムを作成します。  
- Weaviate の各レプリカ用に EFS アクセス・ポイントを作成します。  
  - すべてのアクセスポイントは異なる root-directory を持つ必要があります。Pod がデータを共有すると失敗します。  
- Weaviate をデプロイしている VPC の各サブネットに対して EFS マウントターゲットを作成します。  
- EFS を使用する StorageClass を Kubernetes に作成します。  
- Weaviate 用ボリュームを作成します。各ボリュームでは、前述のとおり異なる AccessPoint を VolumeHandle に設定します。  
- Weaviate をデプロイします。  

以下のコードは `weaviate-0` Pod 用 PV の例です。

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

Fargate で EFS を実行する一般的な情報については、[こちらの AWS ブログ](https://aws.amazon.com/blogs/containers/running-stateful-workloads-with-amazon-eks-on-aws-fargate-using-amazon-efs/) をご参照ください。

### Weaviate で Azure file CSI を使用する

プロビジョナー `file.csi.azure.com` は **サポートされておらず**、ファイル破損を引き起こします。代わりに、`values.yaml` で定義するストレージクラスは必ずプロビジョナー `disk.csi.azure.com` のものにしてください。例:

```yaml
storage:
  size: 32Gi
  storageClassName: managed
```

クラスタ内で利用可能なストレージクラスの一覧は、次のコマンドで取得できます。

```
kubectl get storageclasses
```

## トラブルシューティング

- `No private IP address found, and explicit IP not provided` が表示された場合、Pod のサブネットを次の正しい IP アドレス範囲のいずれかに設定してください。

    ```
    10.0.0.0/8
    100.64.0.0/10
    172.16.0.0/12
    192.168.0.0/16
    198.19.0.0/16
    ```

### CLUSTER_HOSTNAME の変更

一部のシステムでは、クラスターのホスト名が時間とともに変わる場合があります。これは単一ノード構成の Weaviate で問題を引き起こすことが知られています。これを避けるために、`values.yaml` 内の `CLUSTER_HOSTNAME` 環境変数にクラスターのホスト名を設定してください。

```yaml
env:
  - CLUSTER_HOSTNAME: "node-1"
```

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

