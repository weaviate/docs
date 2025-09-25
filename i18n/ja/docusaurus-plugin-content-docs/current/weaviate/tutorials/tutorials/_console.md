---
title: Weaviate コンソール - 入門
sidebar_position: 90
image: og/docs/quickstart-tutorial.jpg
# tags: ['Weaviate console']
---

ここでは Weaviate コンソールの使い方を学べます。

Weaviate コンソールを使用すると、[Weaviate Cloud (WCD)](https://console.weaviate.cloud/)（当社の SaaS ソリューション）上で稼働しているインスタンスや、ご自身のクラスター、ローカルマシン、公開デモデータセットにあるあらゆる Weaviate インスタンスへ接続できます。コンソールが Weaviate インスタンスからデータを収集することは一切ありませんので、VPN 経由を含め、どのインスタンスにも安全に接続できます。

:::tip
コンソールはこちらでご利用いただけます: [console.weaviate.cloud](https://console.weaviate.cloud)
:::

## ログインページ

[Weaviate コンソール](https://console.weaviate.cloud) を開くと、次の 2 つのオプションが表示されます。

1. [Weaviate Cloud でサインイン](#weaviate-cloud)
2. [セルフホスト Weaviate](#connect-to-a-self-hosted-weaviate)

## Weaviate Cloud

Weaviate Cloud を使用すると、当社インフラ上でサーバーレスインスタンスを作成できます。セルフホストインスタンスとサーバーレスインスタンスは同じ機能を提供しますが、サーバーレスインスタンスではサーバーやインフラの管理が不要です。

import SandBoxExpiry from '/_includes/sandbox.expiry.mdx';

<SandBoxExpiry/>

## セルフホスト Weaviate への接続

お使いのコンピューターからアクセスできる限り、どの Weaviate インスタンスにも接続できます（VPN 経由も含みます）。GraphiQL エディターはローカルで動作し、クエリや結果が当社サーバーへ転送されることはありません。

接続後は、[GraphiQL](#graphiql) インターフェースを使って Weaviate インスタンスと対話できます。

## GraphiQL

[GraphiQL](https://github.com/graphql/graphiql) は、オートコンプリートとインラインドキュメントを備えたインタラクティブな GraphQL クエリエディターです。気になる方は、ニュース公開データセットでコンソールを[今すぐ試してみてください](https://link.weaviate.io/3ThS9hG)。

## コンソールを試す

1. [こちらのリンク](https://link.weaviate.io/3ThS9hG)にアクセスします。  
2. クエリを開始しましょう :)

## ご自身のインスタンスでコンソールを試す

1. [https://console.weaviate.cloud](https://console.weaviate.cloud) へアクセスします。  
2. Self-hosted Weaviate セクションで、ご利用のインスタンスのエンドポイントを入力します。ローカルで Weaviate を実行している場合は `http://localhost:8080` です。  
3. 「connect」をクリックします。

:::note
コンソールが HTTP へのダウングレードを求める場合があります。これは [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) エラーを回避するためです。
:::

## まとめ

* Weaviate コンソールを使って、任意の Weaviate インスタンスへ接続できます。  
* Weaviate コンソールを使って、Weaviate Cloud でサーバーレス Weaviate インスタンスを作成・接続できます。  
* Weaviate は GraphQL を採用しているため、コンソールの GraphiQL 統合を利用して簡単にクエリを実行できます。  

## 次のステップ

- [リファレンス: インストール](../installation/index.md)
- [リファレンス: コンフィギュレーション](../configuration/index.mdx)
- [リファレンス: API](../api/index.mdx)
- [コンセプト](../concepts/index.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>