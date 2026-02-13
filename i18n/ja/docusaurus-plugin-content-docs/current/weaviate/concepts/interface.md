---
title: インターフェース
sidebar_position: 85
description: "Weaviate と統合するための RESTful、GraphQL、gRPC API インターフェースおよびクライアントライブラリのサポート。"
image: og/docs/concepts.jpg
# tags: ['architecture', 'interface', 'API design']
---

Weaviate は、その API を通じて管理および利用できます。Weaviate には RESTful API と GraphQL API が あり、すべての言語向けクライアントライブラリは全 API 機能をサポートしています。Python クライアントなど一部のクライアントでは、完全なスキーマ管理やバッチ処理などの追加機能も提供されています。これにより、Weaviate はカスタムプロジェクトで簡単に利用でき、API も直感的で既存のデータ環境への統合が容易です。

このページでは、Weaviate の API 設計と、GraphQL を使用して Weaviate Console からインスタンスを検索する方法について説明します。

## API 設計

### 設計: UX と Weaviate の機能

ユーザーエクスペリエンス (UX) は、私たちの最も重要な原則の 1 つです。Weaviate は理解しやすく、直感的に使え、コミュニティにとって価値があり、望まれ、使いやすいものでなければなりません。その UX において Weaviate とのインタラクションは非常に重要です。Weaviate の API はユーザーニーズの観点から設計されており、ソフトウェアの機能を考慮しています。私たちはユーザーリサーチ、ユーザーテスト、プロトタイピングを行い、すべての機能がユーザーに共感されるよう努めています。共同ディスカッションを通じてユーザー要件を継続的に収集し、ユーザーニーズと Weaviate の機能を照合します。ユーザーまたはアプリケーションの観点から強い要望がある場合、Weaviate の機能や API を拡張することがあります。新しい Weaviate の機能が追加された場合、それは新しい API 機能として自然に利用可能になります。

Weaviate の API UX は、Peter Morville によって定義された UX ハニカムの使いやすさのルールに従って設計されています。

### RESTful API と GraphQL API

Weaviate には RESTful API と GraphQL API の両方が あります。現時点では両 API 間で機能の完全なパリティはありません (後に実装予定で、GitHub 上に [issue](https://github.com/weaviate/weaviate/issues/1540) があります)。RESTful API は主に DB 管理と CRUD 操作に使用されます。GraphQL API は主に Weaviate 内のデータオブジェクトへアクセスするために使用され、単純なルックアップからスカラー検索と ベクトル 検索の組み合わせまで対応します。大まかに言えば、API は以下のユーザーニーズをサポートします:

* **データの追加、取得、更新、削除 (CRUD)** -> RESTful API
* **Weaviate の管理操作** -> RESTful API
* **データ検索** -> GraphQL API
* **探索的データ検索** -> GraphQL API
* **データ解析 (メタデータ)** -> GraphQL API
* **本番環境での非常に大きなデータセットに対するほぼリアルタイム処理** -> クライアントライブラリ (Python、Go、Java、JavaScript) が内部で両 API を使用
* **アプリケーションへの容易な統合** -> クライアントライブラリ (Python、Go、Java、JavaScript) が内部で両 API を使用

## GraphQL

### GraphQL を採用した理由

GraphQL API を採用した理由は複数あります:

* **データ構造**  
  * Weaviate のデータは クラス-プロパティ 構造に従います。GraphQL を使うことで、クラスとプロパティを指定してデータオブジェクトをクエリできます。  
  * Weaviate ではクロスリファレンスでデータをリンクできます。この点で GraphQL のようなグラフクエリ言語が非常に有用です。  

* **パフォーマンス**  
  * GraphQL ではオーバーフェッチ/アンダーフェッチがありません。クエリした分だけ正確に情報を取得でき、パフォーマンス面で有利です。  
  * リクエスト数の削減。GraphQL では非常に効率的かつ精密なクエリが可能で、同じ結果を得るために従来の RESTful API で必要となる多数のクエリを減らせます。  

* **ユーザーエクスペリエンス**  
  * 複雑さの軽減  
  * 型付きスキーマによりエラーが起こりにくい  
  * カスタムデザインが可能  
  * データ探索やファジー検索が可能  

### GraphQL の設計原則

GraphQL クエリは直感的で Weaviate の機能に合うよう設計されています。[Hackernoon のこの記事](https://hackernoon.com/how-weaviates-graphql-api-was-designed-t93932tl) では GraphQL API がどのように設計されたかを詳しく説明しています (例は古い Weaviate と GraphQL API バージョンを示しています)。設計の鍵となる 3 点は次のとおりです:

* **自然言語**  
  GraphQL クエリは可能な限り自然言語パターンに従っています。クエリの機能が理解しやすく、書きやすく覚えやすいです。以下のクエリ例では、人間の言語を認識できます: 「*Get* the *title* of the *Articles* where the *wordcount* is *greater than* *1000*」。このクエリの最も重要な語が GraphQL クエリにも使われています:

```graphql
{
  Get {
    Article(where: {
        path: ["wordCount"],    # Path to the property that should be used
        operator: GreaterThan,  # operator
        valueInt: 1000          # value (which is always = to the type of the path property)
      }) {
      title
    }
  }
}
```

現在、GraphQL リクエストには主に `Get{}`、`Explore{}`、`Aggregate{}` の 3 つの関数があります。

* **クラスとプロパティ**  
  Weaviate のデータは クラス-プロパティ 構造を持ち、データオブジェクト間にクロスリファレンスが存在する場合があります。返すデータのクラス名は「メイン関数」の 1 階層下に書かれます。次の階層には、クラスごとに返すプロパティとクロスリファレンスプロパティを記述します:

```graphql
{
  <Function> {
      <Class> {
        <property>

        <cross_reference-property> {
            ... on <ClassOfBeacon> {
                <property>
            }
        }

        _<additional-property> {
            <additional-field>
        }
      }
  }
}
```

* **データベース設定に依存するクエリフィルター (検索引数)**  
  オブジェクトをフィルターするためにクラスレベルでフィルターを追加できます。スカラー (`where` フィルター) と ベクトル (`near<...>`) フィルターを組み合わせることが可能です。Weaviate のセットアップ (接続しているモジュール) に応じて、追加のフィルターが使用できます。以下は [`qna-transformers` モジュール](/weaviate/modules/qna-transformers.md) を使用したフィルターの例です:

```graphql
{
  Get {
    Article(
      ask: {
        question: "Who is the king of the Netherlands?",
        properties: ["summary"]
      },
      limit: 1
    ) {
      title
      _additional {
        answer {
          result
        }
      }
    }
  }
}
```

### GraphQL メイン関数の設計

1. **データ検索: `Get {}`**  
   データオブジェクトのクラス名が分かっている場合に検索します。  
2. **探索的 & ファジー検索: `Explore {}`**  
   データスキーマやクラス名が分からない場合にファジー検索を行います。  
3. **データ解析 (メタデータ): `Aggregate {}`**  
   メタデータを検索し、データ集計の解析を行います。  

## gRPC API サポート

バージョン `1.19` から、Weaviate は gRPC (gRPC Remote Procedure Calls) API のサポートを導入し、時間とともにさらに高速化を図っています。

これによりユーザー向け API の変更は発生しません。2023 年 5 月時点で、gRPC はごく小規模に追加されており、今後コアライブラリおよびクライアントへの展開が予定されています。

## Weaviate Console

[Weaviate Console](https://console.weaviate.cloud) は、WCD から Weaviate クラスターを管理し、他の場所で稼働する Weaviate インスタンスへアクセスするためのダッシュボードです。GraphQL クエリを実行するために Query Module を使用できます。

![GraphQL Query Module in Weaviate Console](./img/console-capture.png)

## Weaviate クライアント

Weaviate には [Go](/weaviate/client-libraries/go.md)、[Java](/weaviate/client-libraries/java.md)、[Python](/weaviate/client-libraries/python/index.mdx)、[TypeScript/JavaScript](/weaviate/client-libraries/typescript/index.mdx) のクライアントライブラリがあります。すべての言語向けクライアントライブラリは全 API 機能をサポートしています。一部のクライアント (例: Python クライアント) では、完全なスキーマ管理やバッチ処理などの追加機能も提供されています。これにより、Weaviate はカスタムプロジェクトで簡単に利用でき、API も直感的なため既存のデータ環境への統合が容易です。

## さらなるリソース
:::info 関連ページ
- [リファレンス: GraphQL API](../api/graphql/index.md)
- [リファレンス: RESTful API](/weaviate/api/rest)
- [リファレンス: クライアントライブラリ](../client-libraries/index.mdx)
:::


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>