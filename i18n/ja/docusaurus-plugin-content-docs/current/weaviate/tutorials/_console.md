---
title: Weaviate コンソール概要
sidebar_position: 90
image: og/docs/quickstart-tutorial.jpg
# tags: ['Weaviate console']
---

ここでは、Weaviate コンソールの使い方を学べます。

Weaviate コンソールを使用すると、[Weaviate Cloud (WCD)](https://console.weaviate.cloud/)（弊社の SaaS ソリューション）上や、ご自身のクラスター、ローカルマシン、またはすべてのパブリックデモデータセットで稼働している Weaviate インスタンスに接続できます。コンソールが Weaviate インスタンスからデータを収集することは決してありません。VPN 越しでも安全にあらゆるインスタンスへ接続できます。

:::tip
コンソールはこちらでご利用いただけます: [console.weaviate.cloud](https://console.weaviate.cloud)
:::

## ログインページ

[Weaviate コンソール](https://console.weaviate.cloud) を開くと、次の 2 つのオプションが表示されます:

1. ["Weaviate Cloud でサインイン"](#weaviate-cloud)
2. ["Self-hosted Weaviate"](#connect-to-a-self-hosted-weaviate)

## Weaviate Cloud

Weaviate Cloud を使うと、弊社インフラ上にサーバーレス インスタンスを作成できます。セルフホストとサーバーレスのインスタンスは同じ機能を提供します。主な違いは、サーバーレス インスタンスではサーバーやインフラの管理が不要な点です。

import SandBoxExpiry from '/_includes/sandbox.expiry.mdx';

<SandBoxExpiry/>

## セルフホストされた Weaviate への接続

お使いのコンピューターからアクセスできる限り、あらゆる Weaviate インスタンスへ接続できます（はい、VPN 越しも含まれます）。GraphiQL エディターはローカルで動作し、結果やクエリが当社サーバーに転送されることはありません。

接続後は、[GraphiQL](#graphiql) インターフェースを使って Weaviate インスタンスと対話できます。

## GraphiQL

[GraphiQL](https://github.com/graphql/graphiql) は、オートコンプリートやインライン ドキュメント付きで対話的に GraphQL クエリを作成できるグラフィカル インターフェースです。興味がありますか？ニュース出版物データセットで今すぐコンソールをお試しください。

## コンソールを試す

1. 次にアクセスします: [このリンク](https://link.weaviate.io/3ThS9hG)  
2. クエリを開始してください :)

## ご自身のインスタンスでコンソールを試す

1. [https://console.weaviate.cloud](https://console.weaviate.cloud) にアクセスします。  
2. Self-hosted Weaviate セクションで、ご自身のインスタンスのエンドポイントを入力します。ローカルで Weaviate を実行している場合は `http://localhost:8080` になります。  
3. 「connect」をクリックします。

:::note
コンソールから HTTP へのダウングレードを求められる場合があります。これは [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) エラーを回避するためです。
:::

## まとめ

* Weaviate コンソールを使って、任意の Weaviate インスタンスに接続できます。  
* Weaviate コンソールを使って Weaviate Cloud に接続し、サーバーレス Weaviate インスタンスを作成できます。  
* Weaviate は GraphQL を採用しているため、コンソールの GraphiQL 統合で簡単にクエリを実行できます。

## 次のステップ

- [リファレンス: インストール](../installation/index.md)
- [リファレンス: 設定](../configuration/index.mdx)
- [リファレンス: API](../api/index.mdx)
- [コンセプト](../concepts/index.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>