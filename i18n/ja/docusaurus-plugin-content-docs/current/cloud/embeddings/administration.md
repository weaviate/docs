---
title: 管理
sidebar_position: 3
description: "組織レベルでの Weaviate Embeddings サービスの設定と管理。"
image: og/wcd/user_guides.jpg
---

import Link from '@docusaurus/Link';


:::info
Weaviate Embeddings はデフォルトで組織レベルで有効になっており、すべての Weaviate Cloud ユーザーが利用できます。 
:::

## Weaviate Embeddings の無効化

Weaviate Embeddings は組織レベルで **デフォルトで有効** になっています。組織全体で Weaviate Embeddings サービスを無効にするには、次の手順に従ってください。

import DisableWeaviateEmbeddings from '/docs/cloud/img/weaviate-cloud-disable-embeddings.png';

<div class="row">
  <div class="col col--4">
    <ol>
      <li>
        <Link to="https://console.weaviate.cloud/">Weaviate Cloud コンソール</Link> を開きます。
      </li>
      <li>
        左側のサイドバー (<span class="callout">1</span>) で <code>Weaviate Embeddings</code> をクリックします。 
      </li>
      <li>
        <code>Enabled</code> トグルボタン (<span class="callout">2</span>) を使用してサービスを有効化または無効化します。 
      </li>
    </ol>
  </div>
  <div class="col col--8">
    <div class="card">
      <div class="card__image">
        <img src={DisableWeaviateEmbeddings} alt="Weaviate Embeddings をグローバルで無効化" />
      </div>
      <div class="card__body">Weaviate Embeddings をグローバルで無効化します。</div>
    </div>
  </div>
</div>

<!-- TODO[g-despot] Update screenshot if necessary -->

## 料金と課金

<!-- TODO[g-despot] Update link -->
料金モデルの詳細については、Weaviate Embeddings の [製品ページ](https://weaviate.io/product/embeddings) をご覧ください。  
料金はトークン単位で計算されます。つまり、実際に消費されたトークン分のみ課金されます。言い換えると、API から有効なレスポンスが返されたリクエストのみが課金対象になります。

Weaviate Cloud の課金に関する詳細は [こちらのページ](/cloud/platform/billing) でご確認いただけます。

## 追加リソース

- [Weaviate Embeddings: 概要](/cloud/embeddings)
- [Weaviate Embeddings: クイックスタート](/cloud/embeddings/quickstart)
- [Weaviate Embeddings: モデルの選択](/cloud/embeddings/models)
- [モデルプロバイダー統合: Weaviate Embeddings](/weaviate/model-providers/weaviate/embeddings.md)

## サポートとフィードバック

import SupportAndTrouble from '/_includes/wcs/support-and-troubleshoot.mdx';

<SupportAndTrouble />


