---
title: Weaviate の設定
sidebar_position: 1
image: og/docs/tutorials.jpg
# tags: ['getting started']
---

Weaviate は多様な方法で設定およびデプロイできます。主な設定に関する決定事項は次のとおりです。

- [デプロイ構成](/deploy/index.mdx)
- 有効にする [モデル統合](../model-providers/index.md)

このページでは、プロジェクトに最適な組み合わせを見つけるお手伝いをします。

## Weaviate のデプロイ

Weaviate は次の方法でデプロイできます:
- [Embedded Weaviate](/deploy/installation-guides/embedded.md)
- [Docker-Compose](/deploy/installation-guides/docker-installation.md)
- [Weaviate Cloud (WCD)](/deploy/installation-guides/weaviate-cloud.md)
- [自己管理 Kubernetes](/deploy/installation-guides/k8s-installation.md)
- [Hybrid SaaS](https://weaviate.io/pricing)

## ベクトル化のオプション

データオブジェクトを Weaviate に追加するとき、次の 2 つの選択肢があります:
- オブジェクトのベクトルを直接指定する。
- Weaviate のベクトライザー モジュールを使用してオブジェクトのベクトルを生成する。

ベクトライザー モジュールを使用する場合、入力メディア / モダリティと、ローカルか API ベースかのどちらのベクトライザーを選ぶかによって選択肢が変わります。

一般に API ベースのベクトライザーの方が便利ですが、追加コストが発生します。ローカル ベクトライザーはコストを抑えられる可能性がありますが、同等の速度で動作させるには GPU などの専用ハードウェアが必要になる場合があります。

テキストの場合、[このオープンソースのベンチマーク](https://huggingface.co/blog/mteb) がさまざまなベクトライザーの性能を概観しています。ただし、ドメイン固有または実環境での性能は異なる可能性がある点にご注意ください。

## ユースケース

ユースケースごとの推奨構成を以下に示します。

### クイック評価

Weaviate を評価する段階では、次のインスタンスタイプのいずれかを使用すると迅速に開始できます:

- Weaviate Cloud (WCD) サンドボックス
- [Embedded Weaviate](/deploy/installation-guides/embedded)

インスタンスでは推論 API ベースのテキスト ベクトライザーを使用してください。例: `text2vec-cohere`, `text2vec-huggingface`, `text2vec-openai`, `text2vec-google`.

[クイックスタート ガイド](/weaviate/quickstart) では WCD サンドボックスと API ベースのベクトライザーを使用して例を実行しています。

### 開発

開発用途には、次の構成を推奨します。

- [Weaviate Cloud (WCD)](https://console.weaviate.cloud/) または [Docker-Compose](/deploy/installation-guides/docker-installation.md)
- 本番環境と一致するベクトル化戦略

#### Docker-Compose と Weaviate Cloud (WCD) の比較

2 つのうち Docker-Compose はすべての設定項目にアクセスでき、ローカル開発環境で使用できるため柔軟性が高いです。さらに `text2vec-transformers` や `multi2vec-clip` などのローカル ベクトライザーモジュールも利用できます。

一方、WCD インスタンスは立ち上げが簡単で、デプロイを自分で管理する必要がありません。

Embedded Weaviate は現在実験段階のため、本格的な開発用途には推奨していません。

#### ベクトル化戦略

開発環境では、少なくとも要件を概ね満たすベクトライザーモジュールの使用をお勧めします。

まず次のいずれかを選択してください:
- データを自分でベクトル化して Weaviate にインポートする。
- Weaviate のベクトライザーモジュールを使用する。

そのうえで、本番環境の要件にできるだけ近いベクトライザーモジュールを選びましょう。たとえば検索品質が最重要な場合、開発環境でも同じベクトライザーモジュールを使用することをお勧めします。

考慮すべきその他の要素としてコストとフットプリントがあります。
- API ベースのベクトライザーなどによるベクトル化は高価になる場合があります。特に非常に大きなデータセットを扱う場合は要注意です。
- ベクトル長は最大で約 5 倍異なることがあり、これがストレージとメモリの要件に影響します。最終的にはコストにも反映されます。

### 本番環境

本番環境のデプロイでは、次のホスティングモデルを検討してください。

- [Weaviate Cloud (WCD)](/cloud)
- [自己管理 Kubernetes](/deploy/installation-guides/k8s-installation.md)
- [Hybrid SaaS](/cloud)

すべてスケーラブルですが、Kubernetes と Hybrid SaaS が最も柔軟に設定できます。

セットアップと保守が最も簡単なのは WCD ベースのソリューションです。自己管理 Kubernetes は柔軟性とスケーラビリティを両立します。

さらに詳細な設定を行いたいが Weaviate の運用管理は任せたい場合、Hybrid SaaS が両方の長所を兼ね備えています。

## ベクトライザー & リランカー別

Weaviate は、モダリティ (メディアタイプ) ごとにさまざまなベクトライザー & リランカーモジュールを提供しています。

Ollama や Transformers モデルなど一部のモデルはローカルホスト型ですが、Cohere や OpenAI などは API ベースであり、Weaviate のセットアップによって利用可否が変わります。

利用可能な [モデル統合](../model-providers/index.md) と、各 Weaviate セットアップでの可用性を確認し、ニーズに最適なものを選択してください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>