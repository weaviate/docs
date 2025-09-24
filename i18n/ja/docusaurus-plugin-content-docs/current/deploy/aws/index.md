---
title: AWS での Weaviate のデプロイ
sidebar_title:
sidebar_position: 0
---

このセクションでは、Amazon Web Services (AWS) 上で Weaviate をデプロイして実行するための包括的なガイドを提供します。開発環境のセットアップ、運用環境へのデプロイ、AWS サービスとの統合など、AWS エコシステム向けに特化したインストールガイド、チュートリアル、ハウツー、リファレンス資料をご覧いただけます。

## 本ドキュメントの内容

- **インストールガイド:** さまざまな AWS サービスを利用して Weaviate をデプロイするためのステップバイステップ手順  
- **チュートリアル:** よくある AWS デプロイシナリオを対象としたエンドツーエンドのウォークスルー  
- **ハウツーガイド:** 特定の AWS 設定や統合を行うためのタスク指向の手順  
- **リファレンスドキュメント:** AWS 固有の設定オプション、ベストプラクティス、トラブルシューティングガイド  

## デプロイ方法

Weaviate は複数の方法で AWS にデプロイでき、ユースケースや運用要件に応じて選択できます。

### Marketplace オプション

#### [AWS Marketplace ‐ Serverless Cloud](../installation-guides/aws-marketplace.md)

AWS Marketplace から Weaviate Serverless Cloud を直接デプロイし、AWS の課金統合を備えた迅速なクラウドデプロイを実現します。

この SaaS ソリューションは、次のようなニーズを持つ AWS 利用者向けに設計されています。

- AWS の課金統合
- 特定リージョンでのデプロイが求められる規制要件
- インフラ管理なしでの迅速なセットアップ

#### [AWS Marketplace ‐ Kubernetes クラスター](../installation-guides/eks-marketplace.md)

AWS CloudFormation テンプレートを使用して AWS Marketplace から Amazon EKS 上に Weaviate をデプロイします。これにより、単一ノードグループの EKS クラスター、ロードバランサーコントローラー、および EBS CSI ドライバーが CloudFormation テンプレート経由でセットアップされます。

#### 生成されるリソース

- 単一ノードグループを持つ EKS クラスター  
- EKS 用ロードバランサーコントローラー  
- 永続ストレージ用 AWS EBS CSI ドライバー  
- 公式 Helm チャートによる最新選択バージョンの Weaviate  

**最適な用途:** 本番環境、セットアップの複雑さを回避したいチーム、エンタープライズグレードのデプロイ

#### [AWS Marketplace ‐ EC2 インスタンス](../installation-guides/ecs-marketplace.md)

AWS Marketplace を通じて CloudFormation テンプレートを使用し、Docker で単一の EC2 インスタンス上に完全稼働する Weaviate をデプロイします。プロトタイプやテストを迅速に行いたい開発者に最適です。

#### 仕様

- 単一の EC2 インスタンス (デフォルト: m7g.medium)  
- Docker コンテナデプロイ  
- 月額契約 (AWS 経由で即時課金)  
- テストおよび開発向け (エンタープライズサポートは含まれません)  

### セルフマネージドオプション

#### [セルフマネージド EKS](../installation-guides/eks.md)

`eksctl` コマンドラインツールを用いて独自の EKS クラスターを作成・管理し、クラスター構成、スケーリング、管理を完全に制御できます。

#### 特長

- クラスター構成を完全に制御  
- カスタムオートスケーリングノードグループ  
- インスタンスタイプとストレージクラスを自由に選択  
- 永続ストレージ用 AWS EBS CSI ドライバーとの統合  

**最適な用途:** Kubernetes の専門知識を持つ組織、カスタムインフラ要件、最大限の柔軟性と制御

### デプロイ方法の比較

![デプロイ比較マトリックス](./img/deployment-matrix.png)

各デプロイオプションは、管理および制御のレベルが異なります。

- **Serverless Cloud:** 自動スケーリングとインフラ管理不要の完全マネージド SaaS  
- **Marketplace EKS:** CloudFormation で事前構成されたインフラを備えたマネージド Kubernetes コントロールプレーン  
- **Marketplace EC2:** 月額課金の単一インスタンス Docker デプロイで、開発に最適  
- **セルフマネージド EKS:** EKS クラスターの構成と管理を完全に制御可能  

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

