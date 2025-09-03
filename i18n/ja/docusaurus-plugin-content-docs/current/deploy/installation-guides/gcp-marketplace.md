---
title: GCP Marketplace - Weaviate Serverless
description: Set up Weaviate using Google Cloud Marketplace for simplified deployment.
image: og/docs/installation.jpg
tags: ['installation', 'Google Cloud Marketplace']
---

A Weaviate cluster is easy to deploy with Google Cloud Marketplace (GCP).

:::info Prerequisites

- A Google Cloud account with sufficient credit / payment method.
- (Recommended) Familiarity with Google Cloud and the Google Cloud console.
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

## Installation instructions

1. Go to Weaviate's [Google Cloud Marketplace listing](https://console.cloud.google.com/marketplace/product/weaviate-gcp-mktplace/weaviate) page and click <kbd>Subscribe</kbd>.
1. Configure and deploy Weaviate by following the on-screen instructions.

Once completed, you will have a [Weaviate serverless cloud](/cloud/index.mdx) deployment. 

:::info
<details>

<summary> A little background information </summary>

- When you deploy Weaviate Serverless Cloud through the GCP Marketplace, you're subscribing to a Software as a Service (SaaS) solution that is specifically built for GCP customers. 

- GCP will notify you once your Weaviate serverless cluster is available. 

**This solution is ideal for:**

- Organizations requiring GCP billing integration. 
- Organizations with regulatory requirements who need specific regional deployments. 

</details>

:::

## Billing

You will be charged for Weaviate and associated resources directly by Google Cloud.

:::warning

If you cancel your Weaviate GCP marketplace subscription, your Weaviate organization and its clusters will be deleted by Weaviate.

:::

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
