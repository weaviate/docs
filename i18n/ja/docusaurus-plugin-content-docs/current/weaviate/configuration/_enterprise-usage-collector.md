---
title: エンタープライズ使用量コレクター
sidebar_position: 7
image: og/docs/configuration.jpg
# tags: ['configuration']
---


<!-- Hidden for now as no longer used; to be removed in the future. -->
Weaviate エンタープライズを使用する場合、ユーザー（またはロードバランサー）と Weaviate の間にプロキシサービスが配置されます。このサービスは、機能・処理時間・ペイロードサイズなどの機密情報を送信することなく、Weaviate の利用状況を計測します。以下では、プロキシサービスをセットアップに追加する手順を説明します。

## 1. Weaviate Enterprise トークンの取得

- [Weaviate Console](https://console.weaviate.cloud) にログインします。  
- 上部メニューのプロフィールアイコンをクリックし、表示されるキーを取得します。このキーはシークレットです。公開リポジトリなどに公開しないようご注意ください。

## 2. Docker Compose ファイルに Weaviate Enterprise 使用量コレクターを追加

インストールコンフィギュレーターで生成された Docker Compose ファイルを使用している場合は、以下のブロックを YAML ファイルに追加します。

```yaml
services:
    enterprise-proxy:
    image: cr.weaviate.io/semitechnologies/weaviate-enterprise-usage-collector:latest
    environment:
      - weaviate_enterprise_token=[[ WEAVIATE TOKEN ]]
      - weaviate_enterprise_project=[[ PROJECT NAME ]]
    links:
      - "weaviate:weaviate.com"
    ports:
      - "8080:8080"
    depends_on:
      - weaviate
```

* `weaviate_enterprise_token` = 前の手順で取得したトークンです。  
* `weaviate_enterprise_project` = クラスターを識別する任意の文字列です。たとえば開発環境と本番環境がある場合は、`weaviate_enterprise_project=my-project-dev` と `weaviate_enterprise_project=my-project-prod` のように設定できます。

## 3. Weaviate のポートをプロキシにリダイレクト

すべてのトラフィックをエンタープライズプロキシ経由でルーティングするため、Weaviate がポート 4000 で受信できるように設定する必要があります。

```yaml
services:
  weaviate:
    command:
    - --port
    - '4000' # <== SET TO 4000
    # rest of the docker-compose.yml
```

## Docker Compose コンフィギュレーターの使用

Docker Compose の [コンフィギュレーター](/deploy/installation-guides/docker-installation.md#configurator)も利用できます。Enterprise Usage Collector オプションでは「Enabled」を選択してください。

## Helm を使用した Kubernetes 上のコレクタープロキシ

ステップ 1 と同様にトークンを取得します。

バージョン `||site.helm_version||` 以上の Weaviate [Helm チャート](https://github.com/weaviate/weaviate-helm/releases) を入手します。

`values.yaml` の `collector_proxy` キーを用いて、プロキシを有効化し設定します。

```
collector_proxy:
  enabled: true
  tag: latest
  weaviate_enterprise_token: "00000000-0000-0000-0000-000000000000"
  weaviate_enterprise_project: "demo_project"
  service:
    name: "usage-proxy"
    port: 80
    type: LoadBalancer
```

Helm チャートをデプロイし、リクエストにプロキシサービスを使用するようにしてください。


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

