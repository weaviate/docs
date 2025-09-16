# Weaviate での構築：本番運用への移行

## 概要

自社管理の K8s ( Kubernetes ) クラスターで Weaviate をデプロイしてテストする準備はできていますか？  
本ガイドでは、エンタープライズ環境で Weaviate の機能を検証する方法を説明します。  

このガイドの終わりには、以下を完了していることを想定しています。

- Helm を利用したデプロイとネットワーク設定の構成
- 基本的なスケーリング、永続ストレージ、およびリソース管理
- TLS、 RBAC、セキュリティのベストプラクティスの実装
- 監視、ログ、バックアップ戦略の有効化

### 前提条件

開始前に以下を確認してください。

#### 技術知識

- Kubernetes およびコンテナ化の基本概念
- Helm と `kubectl` の基本的な操作経験

:::note

サポートが必要な場合は、 Academy コース [「Run Weaviate on Kubernetes」](https://docs.weaviate.io/academy/deployment/k8s) をご覧ください。 

:::

#### 必要なツール

- Weaviate がインストールされた稼働中の Kubernetes クラスター
- `kubectl` のインストール
- Helm のインストール

## ステップ 1: Helm チャートの設定

- 公式の [Weaviate Helm チャート](https://github.com/weaviate/weaviate-helm) を使用してインストールします:
 
```
  helm repo add weaviate https://weaviate.github.io/weaviate-helm
  helm install my-weaviate weaviate/weaviate
```

- エンタープライズ要件に合わせて値をカスタマイズします (例：リソース割り当て、ストレージ設定)。
- チャートをデプロイし、 Pod の正常性を確認します。

## ステップ 2: ネットワークセキュリティ

- Ingress コントローラーを構成して Weaviate を安全に公開します。
- 証明書マネージャーで TLS を有効にし、クライアントとサーバー間の通信をすべて TLS で暗号化します。
- 外部アクセス用のドメイン名を割り当てます。
- RBAC または admin list を実装してユーザーアクセスを制限します。

<details>
  <summary> Helm チャートで RBAC を有効化した例 </summary>

```yaml
  authorization:
  rbac:
    enabled: true
     root_users:
    - admin_user1
    - admin_user2
```
</details>

<details>
<summary> RBAC を使用しない場合の admin list を実装した例</summary>

```yaml
  admin_list:
    enabled: true
    users:
    - admin_user1
    - admin_user2
    - api-key-user-admin
    read_only_users:
    - readonly_user1
    - readonly_user2
    - api-key-user-readOnly
```
[Admin List Configuration](/deploy/configuration/authorization.md#admin-list-kubernetes)

</details>

:::tip
Admin list を使用すると、すべての Weaviate リソースにわたり、管理者または読み取り専用のユーザー / API キーのペアを定義できます。 一方、 RBAC ではロールを定義し、それらをユーザー ( API キーまたは OIDC 経由 ) に割り当てることで、よりきめ細かな権限管理が可能です。
:::

## ステップ 3: スケーリング

- 高可用性を確保するために水平スケーリングを実装します。

```yaml
replicaCount: 3
```

- Pod の効率を最適化するために CPU / メモリの limits と requests を定義します。

<details>
<summary> CPU とメモリの limit およびコア数を定義する例 </summary>

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "1Gi"
  limits:
    cpu: "2"
    memory: "4Gi"
```
</details>

## ステップ 4: 監視とログ

- Prometheus と Grafana を使用してパフォーマンスメトリクスを収集・分析します。 
- 問題解決のためにアラートを設定します。

<details>
<summary> サービス監視を有効化する例 </summary>

```yaml
serviceMonitor:
  enabled: true
  interval: 30s
  scrapeTimeout: 10s
```
</details>


## ステップ 5: アップグレードとバックアップ

- ダウンタイムを最小化するために、 Helm が利用するローリングアップデート戦略を使用します。

<details>
<summary> ローリングアップデート戦略を構成する例 </summary>

```yaml
updateStrategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```
</details>

- 新しい Weaviate バージョンを本番環境にデプロイする前にテストします。
- データを迅速に復旧できるよう、ディザスタリカバリ手順を実装します。

### まとめ

Voila! これで本番環境に *ある程度* 対応したデプロイが完成しました。 次のステップとして、自己評価を実施し、ギャップを特定してください。 

### 次のステップ: [本番環境準備完了度セルフアセスメント](./production-readiness.md)

## 質問やフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

