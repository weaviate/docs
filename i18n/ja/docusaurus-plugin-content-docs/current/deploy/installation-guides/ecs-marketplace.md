---
title: Marketplace - EC2
description: EC2 インスタンス上で Docker を使用して Weaviate をデプロイします。
---

Docker を使用して AWS Marketplace 経由で、完全に稼働する Weaviate インスタンスを EC2 インスタンス上にデプロイできるようになりました。このオプションは、Weaviate を迅速かつ簡単にプロトタイプ作成やテストを行いたい開発者に最適です。デプロイには [CloudFormation template](https://aws.amazon.com/cloudformation/) を使用します。 

:::tip 前提条件

- 十分なクレジットを持つ AWS アカウント  
- (推奨) AWS とマネジメントコンソールに慣れていること  
- CloudFormation を使用して EC2 インスタンスをデプロイできる十分な AWS 権限  
:::

## インストール

:::info 背景情報 

Weaviate は、単一の EC2 インスタンス上で Docker コンテナとしてデプロイされます。これは月額契約で、請求は AWS から即時行われます。1 か月契約の現在の価格は $149 です。  

このソリューションはテストおよび開発に最適であり、**エンタープライズサポートは含まれていません**。 
:::

<div style={{position: "relative", paddingBottom: "calc(54.10879629629629% + 50px)", height: 0}}>
  <iframe 
    id="xrgwj91u1p" 
    src="https://app.guideflow.com/embed/xrgwj91u1p" 
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
  <script src="https://app.guideflow.com/assets/opt.js" data-iframe-id="xrgwj91u1p"></script>
</div>

### 手順

1. Weaviate の [AWS Marketplace リスティング](https://aws.amazon.com/marketplace/pp/prodview-5h4od6j4wtcrw?sr=0-4&ref_=beagle&applicationId=AWSMPContessa) に移動します。  
1. ページの指示に従って製品をサブスクライブします。  
1. <kbd>"View Purchase Options"</kbd> をクリックし、次のページへ進みます。  
1. 既定では契約期間は 1 か月ですが、"auto-renew" を選択して契約を自動更新できます。  
1. 既定では m7g.medium の EC2 インスタンスが使用されます。  
1. <kbd>"Create contract"</kbd> をクリックすると契約が作成されます。  
1. "Continue to configuration" をクリックして次のページへ進みます。  
1. "ECS" をクリックし、"Quick launch the template" を選択して設定を開始します。  
1. このページで "stack name" を作成し、既存の VPC を選択し、サブネットを選択し、必要に応じてタグを追加します。  
1. CloudFormation テンプレートの設定が完了したら、確認のチェックボックスをオンにします。  
1. "Create stack" をクリックすると CloudFormation テンプレートがデプロイされます。  
   AWS からスタックが作成されたことが通知されます。  

## インスタンスの削除

CloudFormation スタックを削除することでクラスターを削除できます。

### いくつかのリソースは手動での削除が必要になる場合があります

:::caution
使用していないリソースがすべて削除されていることを確認してください。未削除のリソースは引き続き料金が発生します。
:::

#### ヒント

- CloudFormation スタックが "DELETE_FAILED" と表示される場合、それらのリソースの削除を再試行できることがあります。  
- CloudFormation スタックの `Resources` タブを確認し、削除されていないリソースを探します。  

### 請求

Weaviate と関連リソースの料金は AWS から直接請求されます。

### その他の Marketplace オファリング

- [Weaviate serverless cloud](https://aws.amazon.com/marketplace/pp/prodview-ng2dfhb4yjoic?sr=0-2&ref_=beagle&applicationId=AWSMPContessa)
- [Weaviate enterprise cloud](https://aws.amazon.com/marketplace/pp/prodview-27nbweprm7hha?sr=0-3&ref_=beagle&applicationId=AWSMPContessa)


## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

