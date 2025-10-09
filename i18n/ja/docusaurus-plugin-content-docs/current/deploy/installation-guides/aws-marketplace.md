---
title: Marketplace - Weaviate サーバーレス Cloud
description: AWS Marketplace 経由で Weaviate のサーバーレスインスタンスをインストールし、迅速にクラウドへデプロイできます。
image: og/docs/installation.jpg
# tags: ['installation', 'AWS Marketplace']
---

import ReactPlayer from 'react-player/lazy'

<!-- NOTE: To show this page on the sidebar, remove the `sidebar_class_name: hidden` line above. -->

AWS Marketplace を通じて、AWS から直接課金される Weaviate のサーバーレスインスタンスを起動できます。 

:::info 前提条件
- 十分なクレジットまたは支払い方法が設定された AWS アカウント  
- （推奨）AWS および AWS コンソールに精通していること
:::

[AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-ng2dfhb4yjoic?sr=0-3&ref_=beagle&applicationId=AWSMPContessa) を使用して Weaviate のサーバーレスインスタンスを起動できます。


<div style={{position: "relative", paddingBottom: "calc(54.10879629629629% + 50px)", height: 0}}>
  <iframe 
    id="zklzyv5bop" 
    src="https://app.guideflow.com/embed/zpe5o7jh3p" 
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
  <script src="https://app.guideflow.com/assets/opt.js" data-iframe-id="zpe5o7jh3p"></script>
</div>

## インストール手順

1. Weaviate の [AWS Marketplace リスティング](https://aws.amazon.com/marketplace/pp/prodview-ng2dfhb4yjoic?sr=0-3&ref_=beagle&applicationId=AWSMPContessa) にアクセスします。  
1. ページの指示に従って製品を購読します。  
    1. <kbd>View Purchase Options</kbd> をクリックし、次のページに進みます。  
    2. 価格と利用規約を確認し、<kbd>Subscribe</kbd> をクリックします。  
その後、Weaviate Cloud でアカウントを設定するように求められます。 

:::info
<details>

<summary>補足情報</summary>

- AWS Marketplace から Weaviate Serverless Cloud をデプロイすると、AWS 顧客向けに特別に構築された Software as a Service (SaaS) ソリューションにサブスクライブしたことになります。  

- Weaviate のサーバーレスクラスターが利用可能になると、AWS から通知が届きます。  

**このソリューションが最適なケース:**  

- AWS 請求統合が必要な組織  
- リージョンを指定したデプロイが必要な規制要件を持つ組織  

</details>

:::

### 課金

Weaviate の料金は AWS から直接請求されます。

:::warning

Weaviate AWS Marketplace サブスクリプションをキャンセルすると、Weaviate の組織とそのクラスターは Weaviate によって削除されます。

:::

### その他の Marketplace 製品

- [Weaviate serverless cloud](https://aws.amazon.com/marketplace/pp/prodview-ng2dfhb4yjoic?sr=0-2&ref_=beagle&applicationId=AWSMPContessa)
- [Weaviate enterprise cloud](https://aws.amazon.com/marketplace/pp/prodview-27nbweprm7hha?sr=0-3&ref_=beagle&applicationId=AWSMPContessa)


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

