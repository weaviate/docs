---
title: GCP Marketplace - Weaviate サーバーレス
description: Google Cloud Marketplace を使用して Weaviate を簡単にデプロイする
image: og/docs/installation.jpg
tags: ['installation', 'Google Cloud Marketplace']
---

Weaviate クラスタは Google Cloud Marketplace ( GCP ) を使用して簡単にデプロイできます。

:::info 前提条件

- 十分なクレジットまたは支払い方法が設定されている Google Cloud アカウント  
- （推奨）Google Cloud および Google Cloud コンソールに慣れていること
:::

<div style={{position: "relative", paddingBottom: "calc(54.10879629629629% + 50px)", height: 0}}>
  <iframe 
    id="zklzyv5bop" 
    src="https://app.guideflow.com/embed/dr97j66hop" 
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
  <script src="https://app.guideflow.com/assets/opt.js" data-iframe-id="dr97j66hop"></script>
</div>

## インストール手順

1. Weaviate の [Google Cloud Marketplace のリスティング](https://console.cloud.google.com/marketplace/product/weaviate-gcp-mktplace/weaviate) ページに移動し、<kbd>Subscribe</kbd> をクリックします。  
1. 画面の指示に従って Weaviate を構成してデプロイします。  

完了すると、[Weaviate サーバーレス クラウド](/cloud/index.mdx) がデプロイされます。 

:::info
<details>

<summary>背景情報</summary>

- GCP Marketplace から Weaviate Serverless Cloud をデプロイすると、GCP のお客様向けに構築された Software as a Service ( SaaS ) ソリューションにサブスクライブすることになります。  
- Weaviate サーバーレス クラスタが利用可能になると、GCP から通知が届きます。  

**このソリューションは次のようなケースに最適です:**

- GCP の請求連携が必要な組織  
- 規制要件により特定のリージョンでのデプロイが必要な組織  

</details>

:::

## 課金

Weaviate と関連リソースの料金は Google Cloud から直接請求されます。

:::warning

Weaviate GCP Marketplace のサブスクリプションを解約すると、Weaviate によりお客様の Weaviate 組織およびそのクラスタが削除されます。

:::

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

