---
title: Weaviate のインストール方法
sidebar_position: 0
image: og/docs/installation.jpg
# tags: ['installation']
---

Weaviate はホスト型サービスの [Weaviate Cloud (WCD)](https://console.weaviate.cloud/) またはセルフマネージドのインスタンスとして利用できます。セルフマネージドの場合、ローカルまたはクラウドプロバイダー上でホストできます。セルフマネージド環境でも WCD と同じ Weaviate データベースを使用します。

以前のバージョンから Weaviate をアップグレードする場合は、インストールに影響する変更点について [Migration Guide](/deploy/migration/index.md) をご確認ください。

## インストール方法

- **[Weaviate Cloud](/cloud/quickstart.mdx)**：開発および運用環境向けのマネージドサービス。  
- **[Docker Compose](/deploy/installation-guides/docker-installation.md)**：Docker コンテナは開発やテストに適しています。  
- **[Kubernetes](/deploy/installation-guides/k8s-installation.md)**：Kubernetes はスケーラブルな本番環境のデプロイに最適です。  
- **[AWS Marketplace](./aws-marketplace.md)**：AWS Marketplace から直接 Weaviate をデプロイします。  
- **[Snowpark Container Services](docs/deploy/installation-guides/spcs-integration.mdx)**：Snowflake の Snowpark 環境に Weaviate をデプロイします。  
- **[Embedded Weaviate](docs/deploy/installation-guides/embedded.md)**：実験的。Embedded Weaviate はクライアントベースのツールです。  

:::caution ネイティブ Windows サポート

Weaviate は [Docker](/deploy/installation-guides/docker-installation.md) や [WSL](https://learn.microsoft.com/en-us/windows/wsl/) などのコンテナ化環境を介して Windows で利用できますが、現時点ではネイティブ Windows サポートは提供していません。

:::

## 設定ファイル

Docker Compose と Kubernetes では、Weaviate インスタンスの設定に `yaml` ファイルを使用します。Docker では [`docker-compose.yml`](/deploy/installation-guides/docker-installation.md) を、Kubernetes では [Helm チャート](/deploy/installation-guides/k8s-installation.md#weaviate-helm-chart) と `values.yaml` を利用します。Weaviate のドキュメントでは、これらのファイルを `configuration yaml files` と呼ぶこともあります。

セルフホスティングの場合、まずは Docker で小規模に試し、Weaviate に慣れてきたら設定を Kubernetes の Helm チャートへ移行することをお勧めします。

## 未リリース版

import RunUnreleasedImages from '/_includes/configuration/run-unreleased.mdx'

<RunUnreleasedImages />

未公開機能をお試しいただいた際は、[フィードバック](https://github.com/weaviate/weaviate/issues/new/choose) をぜひお寄せください。皆さまからのご意見は Weaviate の改善に役立ちます。

## 関連ページ

- [Weaviate への接続](docs/weaviate/connections/index.mdx)
- [Weaviate クイックスタート](docs/weaviate/quickstart/index.md)
- [Weaviate Cloud クイックスタート](docs/cloud/quickstart.mdx)
- [リファレンス: 設定](../configuration/index.mdx)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

