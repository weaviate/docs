---
title: GCP Marketplace - Kubernetes
description: Google Cloud Marketplace を使用して Weaviate を簡単にデプロイします。
sidebar_position: 15
image: og/docs/installation.jpg
tags: ['installation', 'Google Cloud Marketplace']
---

[Google Cloud Marketplace](https://console.cloud.google.com/marketplace) を使用して Weaviate クラスターを直接起動できます。

:::info 前提条件
- 十分なクレジットまたは支払い方法が設定された Google Cloud アカウント。
- (推奨) Google Cloud および Google Cloud コンソールに慣れていること。
:::

<div style={{position: "relative", paddingBottom: "calc(54.10879629629629% + 50px)", height: 0}}>
  <iframe 
    id="zklzyv5bop" 
    src="https://app.guideflow.com/embed/8kozdnza5p" 
    width="100%" 
    height="100%" 
    style={{overflow: "hidden", position: "absolute", border: "none"}} 
    scrolling="no" 
    allow="clipboard-read; clipboard-write" 
    webKitAllowFullScreen 
    mozAllowFullScreen 
    allowFullScreen 
    allowTransparency="true"
  />
  <script src="https://app.guideflow.com/assets/opt.js" data-iframe-id="8kozdnza5p"></script>
</div>


## インストール手順

大まかな流れは次のとおりです。

1. Weaviate の Google Cloud Marketplace のリストページに移動し、<kbd>Configure</kbd> をクリックします。  
1. 画面の指示に従って Weaviate を設定してデプロイします。  
<!-- 1. Review the GC Marketplace Terms of Service, and if you agree with the terms, confirm accordingly. -->
<!-- 1. Select Deploy to start deploying Weaviate on your GKE cluster.  -->

以下でこれらの手順を詳しく説明します。

### 設定オプション

:::info 開始する前に

<!-- #### Some settings may not be changed after launch

Not all settings may be changed after launch. For example, these settings are currently not changeable after launch:
- weaviatePVCSize
- albDriver
- ebsDriver
- vpcUseDefault

#### Some settings may lead to recreation of the cluster

- Changes to the instance type will lead to recreation of the node pool. -->

#### 推奨設定

- `Global Query limit`、`Modules`、`Storage Size` などのデフォルト値は多くの場合そのままで問題ありません。  
- `Storage size`: 本番環境では 1 ポッドあたり少なくとも 500GB を推奨します。(開発環境ではより小さいディスクでも十分な場合があります。)  
<!-- - `weaviateAuthType`: We recommend not running Weaviate with anonymous access. We suggest setting it to `apikey` and setting a key, for example by excuting `pwgen -A -s 32` to generate a random string. -->

:::

デプロイページに進むと、さまざまなオプションが表示されます。

1. Weaviate をデプロイする GKE クラスターを選択します。  
    1. 任意で、新しいクラスターを作成してそれを指定することもできます。  
1. `namespace` (クラスターリソースを分割するため) と、アプリケーションを識別する一意の `app instance name` を設定します。  
1. アプリインスタンス名を設定します。  
1. 請求用のサービスアカウントを設定します。  
1. `Replicas of Weaviate Instances`、`Global Query Limit`、`Enable Modules`、`Storage Size` などの Weaviate パラメーターを設定します。  
    <!-- - Weaviate authentication parameters. -->
1. 内容に同意する場合は、利用規約を承諾し、<kbd>Deploy</kbd> をクリックします。

これで Weaviate が選択したクラスターにデプロイされます。数分かかる場合があります。

## クラスターへのアクセス

アプリケーションが作成されると、ロードバランサー経由でクラスターにアクセスできます。

`kubectl` を使用するか、Weaviate API 経由でクラスターと対話できます。以下に例を示します。

### `kubectl` での操作

次のコマンドを実行すると、Weaviate クラスター用の kubeconfig ファイルが更新または作成されます。

```
gcloud container clusters get-credentials [YOUR_CLUSTER_NAME] --zone [YOUR_GC_ZONE] --project [YOUR_GC_PROJECT]
```

:::tip kubectl コマンドの見つけ方
正確なコマンドは Kubernetes Engine ページで、対象クラスターの縦三点リーダ ( <i class="fa-solid fa-ellipsis-vertical"></i> ) をクリックし、<kbd>Connect</kbd> を選択すると確認できます。
:::

設定が完了したら、通常どおり `kubectl` コマンドを実行できます。例えば  
- `kubectl get pods -n default` で `default` ネームスペース (または指定したネームスペース) 内のすべての Pod を一覧表示します。  
- `kubectl get svc --all-namespaces` で全ネームスペースの Service を一覧表示します。  

<details>
  <summary>例の出力</summary>

`kubectl get svc --all-namespaces` の例の出力は次のとおりです。

```bash
NAMESPACE            NAME                                     TYPE           CLUSTER-IP     EXTERNAL-IP    PORT(S)            AGE
application-system   application-controller-manager-service   ClusterIP      10.24.8.231    <none>         443/TCP            11m
default              kubernetes                               ClusterIP      10.24.0.1      <none>         443/TCP            11m
default              weaviate                                 LoadBalancer   10.24.13.245   34.173.96.14   80:30664/TCP       8m38s
default              weaviate-headless                        ClusterIP      None           <none>         80/TCP             8m38s
gmp-system           alertmanager                             ClusterIP      None           <none>         9093/TCP           10m
gmp-system           gmp-operator                             ClusterIP      10.24.12.8     <none>         8443/TCP,443/TCP   10m
kalm-system          kalm-controller-manager-service          ClusterIP      10.24.7.189    <none>         443/TCP            11m
kube-system          default-http-backend                     NodePort       10.24.12.61    <none>         80:32508/TCP       10m
kube-system          kube-dns                                 ClusterIP      10.24.0.10     <none>         53/UDP,53/TCP      11m
kube-system          metrics-server                           ClusterIP      10.24.13.204   <none>         443/TCP
```

ここでは、外部からアクセス可能な Weaviate の IP は `34.173.96.14` です。

</details>

### Weaviate URL の確認

アプリケーションが作成されたら、ロードバランサーの URL から Weaviate にアクセスできます。

Weaviate のエンドポイント URL は次のいずれかの方法で確認できます:

- Google Cloud の `Kubernetes Engine` セクションで `Service & Ingress` を開き、ロードバランサーを探して `Endpoints` 列を確認します。  
- `kubectl get svc -n [YOUR_NAMESPACE_NAME]` を実行し、`weaviate` Service の `EXTERNAL-IP` を確認します。  

ロードバランサーの URL (例: `34.38.6.240`) がそのまま Weaviate の URL (例: `http://34.38.6.240`) になります。

## Weaviate とクラスターの削除

:::caution
未使用のリソースがすべて削除されていることを確認してください。残っているリソースについてはコストが発生し続けます。
:::

### Weaviate の削除

Weaviate と関連サービスを削除するには、 Google Cloud の `Kubernetes Engine` の `Applications` セクションに移動し、 Weaviate デプロイメントを削除します。

`Services & Ingress` セクションおよび `Storage` セクションも確認し、関連するサービスとストレージがすべて削除されたことを確認してください。残っているリソースがある場合は、手動で削除する必要があります。

### クラスターの削除

クラスターが不要になった場合 (例: Weaviate 用に新しいクラスターを作成した場合) は、 Google Cloud の `Kubernetes Engine` の `Applications` セクションからクラスターを削除できます。リストからクラスターを選択し、 <kbd>DELETE</kbd> をクリックして、表示される指示に従って削除してください。

## 課金

Weaviate と関連リソースの料金は Google Cloud から直接請求されます。

たとえば、コンピュートインスタンス、ボリューム、およびクラスターで使用されるその他のリソースが含まれます。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

