---
title: カスタムモジュール
description: Weaviate でカスタムモジュールを利用してパーソナライズされたデータ管理機能を探求しましょう。
sidebar_position: 90
image: og/docs/modules/custom-modules.jpg
# tags: ['modules', 'other modules', 'custom modules']
---


## 概要

標準のベクトル化モデルを使用するだけでなく、独自の機械学習モデルを Weaviate に接続することもできます。これにより、効率的なデータ保存と取得を Weaviate が担うため、ML や NLP モデルを容易にスケールできます。カスタム ベクトライザー モジュールとは、たとえば独自の学習データで学習したモデルで、テキストや画像などのデータを埋め込みへ変換できるものです。

既存のモデルアーキテクチャ（例: Transformers）に適合するモデルがすでにある場合は、カスタムコードを書く必要はありません。既存の [`text2vec-transformer` モジュール](/weaviate/model-providers/transformers/embeddings.md)でその Transformer モデルをそのまま実行できます。

このページでは、独自の ML モデルを Weaviate にモジュールとして接続する方法を説明します。まず、Weaviate における（ベクトライザー / 埋め込み）モジュールの動作について解説します。

クイックリンク:
* 既存の Weaviate Module API を利用して独自の推論コンテナを作成する場合は [こちら](/weaviate/modules/custom-modules.md#a-replace-parts-of-an-existing-module)。
* GraphQL へのフィールド追加など、完全に新しいモジュールを作成する場合は [こちら](/contributor-guide/weaviate-modules/how-to-build-a-new-module.md)。

## 動画: Weaviate でカスタムモジュールを作成する方法

<iframe width="100%" height="375" src="https://www.youtube.com/embed/uKYDHzjEsbU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

_Weaviate meetup で収録 – カスタムモジュールの章は 13:30 分から開始_

## 背景: Weaviate のモジュールアーキテクチャ

新しいモジュールを作成するには、まず Weaviate のモジュールシステムがどのように機能するかを理解する必要があります。

Weaviate は、モジュールが特定のライフサイクルフックに必要な値をどのように取得するかについては完全にアグノスティックです。たとえばベクトライザー モジュールの場合、Weaviate とモジュール間の契約は次のとおりです。インポート時に各オブジェクトが（設定された）ベクトライザー モジュールへ渡され、モジュールはそれをベクトル（埋め込み）で拡張しなければなりません。Weaviate はモジュールがその処理をどのように行うかを問いません。モジュールが既存の ML モデルを推論に使用する目的であれば、「vectorize」ライフサイクルフックの一環として別の推論サービスを用意し、そのサービスと通信してもかまいません。実際、`text2vec-contextionary` モジュールは推論サービスに gRPC API を使用していますが、`text2vec-transformers` モジュールは同じ目的で REST API を使用しています。

一般的に（ベクトライザー）モジュールは 2 つの部分で構成されます:
1. **Weaviate 用のモジュールコード (Go で記述)**  
   Weaviate のさまざまなライフサイクルにフックし、API 機能などの能力を提供して通常のフローに統合します。
2. **推論サービス**  
   通常はコンテナ化されたアプリケーションで、ML モデルをモジュール固有の API でラップし、パート 1 のモジュールコードから呼び出されます。

次の図は、モジュールが Weaviate にどのように接続されているかを示しています。黒枠が Weaviate Database、本体が灰色のボックスです。赤い部分はモジュールをどのように利用するかを示しており、一般的な Module System API を介しています。赤い Module API は 2 つの内部レイヤーにまたがり、GraphQL を拡張したり追加プロパティを提供したりして Weaviate API に影響を与えるほか、ビジネスロジックにも影響を与えます（例: オブジェクトのプロパティを取得してベクトルを設定）。

青色の部分は特定モジュールに属します（複数のモジュールを接続できますが、ここでは 1 つの例を示しています）。例として `text2vec-transformers` モジュール `bert-base-uncased` を使用しています。Weaviate Database 内の青いボックスがパート 1 のモジュールコード、外側の青いボックスがパート 2 の推論サービスです。

図では 3 つの API を示しています:
* Weaviate Database 内の灰色ボックスはユーザー向けの RESTful と GraphQL API です。
* 赤いボックスは Go で書かれた Module System API です。
* 3 つ目の API はモジュールが完全に所有しており、別コンテナとの通信に使用します。この例では左側の Python コンテナです。

![Weaviate module APIs overview](/img/contributor-guide/weaviate-modules/weaviate-module-apis.svg "Weaviate module APIs overview")

独自の ML モデルを Weaviate で使用するには、次の 2 つのオプションがあります（[詳細はこちら](#how-to-build-and-use-a-custom-module)）:
* A: 既存モジュールの一部を置き換え、推論サービス (パート 2) のみを差し替える。Weaviate Database 本体には手を加えません。
* B: 完全に新しいモジュールを作成し、既存の青いパート (1 と 2) をすべて置き換える。GraphQL API の拡張など、独自の動作を設定できますが、赤い Module System API にフックするために Go でモジュールコードを書く必要があります。


<!-- ![Weaviate module APIs overview](/img/weaviate-module-apis.svg "Weaviate module APIs overview") -->

`text2vec-transformers` モジュールを例に、Weaviate で特定のモジュールを使用する設定方法を詳しく見てみましょう。`docker-compose.yml` で `ENABLE_MODULES=text2vec-transformers` を設定すると、Weaviate に該当する Go コード（パート 1）をロードさせます。さらに推論用モデルを含む別サービス（パート 2）も `docker-compose.yml` に追加します。`text2vec-transformers` モジュールの特定の (GraphQL) 機能実装を詳しく見ると以下のようになります。

1. **Weaviate 用モジュールコード (Go):**  
   * Weaviate GraphQL API に `nearText` メソッドを提供することを通知  
   * 特定の設定やスキーマを検証し、API で利用できるようにする  
   * ベクトル（例: 単語や画像の埋め込み）が必要になった際に取得する方法を定義（この例では Python アプリケーションに HTTP リクエストを送信）
2. **推論サービス:**  
   * モデル推論を提供  
   * A と契約した API を実装（Weaviate と直接の契約ではありません）

これは一例であり、パート 1 が Go で Weaviate と接続し、パート 2 がパート 1 から利用される推論モデルを持つという点さえ満たせば、さまざまなバリエーションが可能です。たとえば、`text2vec-transformers` モジュール（パート 1）を修正し、自前のコンテナではなく Hugging Face API などのサードパーティー推論サービスを使用することもできます。

モジュールは依存するコンテナやサービスとの通信方法を完全に制御します。たとえば `text2vec-transformers` モジュールでは推論コンテナとの通信に REST API を使用していますが、`text2vec-contextionary` モジュールでは gRPC を使用しています。

### モジュールの特性

モジュールは特定のライフサイクルフックに接続して Weaviate を拡張するカスタムコードです。Weaviate が Go で書かれているため、モジュールコードも Go で書く必要があります。ただし既存モジュールの中には独立したサービスを併用しているものもあり、こうしたサービスは任意の言語で実装できます。ベクトライザー モジュールでは推論コンテナが Python で書かれていることがよくあります。

モジュールは「ベクトライザー」（データからベクトルの数値を生成する方法を定義）として機能するものや、質問応答やカスタム分類など追加機能を提供するものがあります。モジュールの特性は以下のとおりです。
- 命名規則  
  - ベクトライザー: `<media>2vec-<name>-<optional>` 例: `text2vec-contextionary`, `img2vec-neural`, `text2vec-transformers`  
  - その他: `<functionality>-<name>-<optional>`  
  - モジュール名は URL セーフである必要があります。つまり URL エンコードが必要な文字を含めてはいけません。  
  - モジュール名は大文字小文字を区別しません。`text2vec-bert` と `text2vec-BERT` は同じモジュールです。  
- モジュール情報は `v1/modules/<module-name>/<module-specific-endpoint>` RESTful エンドポイントから取得可能です。  
- 一般的なモジュール情報（接続されているモジュール、バージョンなど）は Weaviate の [`v1/meta` エンドポイント](/weaviate/api) で取得できます。  
- モジュールは RESTful API の `additional` プロパティおよび GraphQL API の [`_additional` プロパティ](/weaviate/api/graphql/additional-properties.md) を追加できます。  
- モジュールは GraphQL クエリで [フィルター](/weaviate/api/graphql/filters.md) を追加できます。  
- どのベクトライザーやその他モジュールをどのデータクラスに適用するかは、[コレクション設定](../manage-collections/vector-config.mdx) で指定します。  

## カスタムモジュールを構築して使用する方法

Weaviate をカスタムベクトル化機能で拡張する方法は 2 つあります。完全に新しいモジュール（パート 1 + 2）を構築するか、既存モジュールの推論サービス（パート 2）のみを置き換えるか（オプション A）です。後者は迅速なプロトタイプや PoC に適しています。この場合、推論モデル（パート 2）だけを差し替え、Weaviate とやり取りする Go 製インターフェースはそのまま再利用します。まったく異なるモデルタイプを素早く統合できる方法です。オプション B の完全新規モジュールは最も柔軟ですが、Weaviate インターフェースを Go で書く必要があります。まずはオプション A で結果を確認し、PoC が満足できるものになったらオプション B で正式なモジュールに移行することを推奨します。  

### A. 既存モジュールの一部を置き換える

まったく異なる推論モデルを統合する最短経路は、既存モジュールの一部を置き換える方法です。パート 1（Weaviate とのインターフェース）は再利用し、その API 契約に従いながらパート 2 だけを変更または置き換えます。

Go で書かれた Weaviate インターフェースコードに手を加えないため、パート 1 に存在しないモジュール固有の新しい設定を Weaviate の API に導入することはできません。また、新しい（GraphQL）API 関数やフィルターを追加・変更することもできません。  
_なお、Weaviate の API は安定性を保証するものではありません。互換性を損なわない Weaviate のリリースでも「内部」API は変更される可能性があります。_

既存の Weaviate インターフェース（パート 1）で新しい推論モデル（パート 2）を使用するには、既存モジュールの Go コードをすべて再利用し、別の推論コンテナを指すように設定するだけです。`text2vec-transformers` モジュールを例に、カスタム推論モジュールを使用する手順は次のとおりです。  
1. Transformers を利用するように設定された有効な `docker-compose.yml`（[設定コンフィギュレーター](/deploy/installation-guides/docker-installation.md#configurator)で作成可能）を開くと、`TRANSFORMERS_INFERENCE_API: 'http://text2vec-transformers:8080'` のような環境変数があります。これを任意のアプリへ向けるだけです。変数名 `TRANSFORMERS_INFERENCE_API` はそのまま残してください。  
2. モデルをラップする小さな HTTP API を構築します。最低限、以下のエンドポイントを実装してください（この例は `text2vec-transformers` モジュール固有であり、完全にモジュール側の制御となります）。  
   1. `GET /.well-known/live` -> アプリが動作中なら `204` を返す  
   2. `GET /.well-known/ready` -> サービス開始可能なら `204` を返す  
   3. `GET /meta` -> 推論モデルのメタ情報を返す  
   4. `POST /vectors` -> 以下のリクエスト / レスポンス例を参照（この例では Docker Compose で `ports: ["8090:8080"]` を追加し、ローカルの 8090 番ポートで公開しています）  

リクエスト:
```bash
curl localhost:8090/vectors/ -H "Content-Type: application/json" -d '{"text":"hello world"}'
```  
レスポンス:
```bash
{"text":"hello world","vector":[-0.08469954133033752,0.4564870595932007, ..., 0.14153483510017395],"dim":384}
```  

### B. 完全に新しいモジュールを構築する

パート 1 と 2 の両方を含む完全新規モジュールを実装すると、命名、API、動作などを自在に制御できます。この場合は実質的に Weaviate へ貢献する形になります。Weaviate のアーキテクチャや、モジュールが制御できる範囲（「固定」されている部分）を理解する必要があります。[Weaviate のリポジトリ](https://github.com/weaviate/weaviate) をフォークし、その中に完全新規の [module](https://github.com/weaviate/weaviate/tree/master/modules) を作成可能です。この新モジュールは複数のコンテナに依存させることもでき、依存先との通信に任意の API を使用できます（依存先がない場合も可）。

詳細手順は [コントリビューターガイド](/contributor-guide/weaviate-modules/how-to-build-a-new-module) に記載しています。

Weaviate の Go インターフェースを含む完全新規モジュールを構築する場合は、[フォーラム](https://forum.weaviate.io) または [GitHub Issue](https://github.com/weaviate/weaviate/issues) でご連絡ください。開始時のサポートを行います。

## 重要な注意点
- ベクトライザーが生成するベクトルの長さは後の利用に影響します。たとえば GraphQL の explore フィルターでデータをベクトル探索する場合、クエリに渡すベクトルの長さはデータポイントのベクトル長と一致している必要があります。
- モジュール内部で使用される Weaviate の API は安定性を保証するものではありません。互換性を損なわないリリースでも「内部」API は変更される可能性があります。  

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

