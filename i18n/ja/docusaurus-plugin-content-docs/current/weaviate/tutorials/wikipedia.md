---
title: カスタム ベクトル対応 Wikipedia
description: Wikipedia を Weaviate と組み合わせて、データ ソースを拡充しインサイトを得る方法。
sidebar_position: 50
image: og/docs/tutorials.jpg  # TODO
# tags: ['import']
---

import UpdateInProgressNote from '/_includes/update-in-progress.mdx';

<UpdateInProgressNote />

このチュートリアルでは、すでにベクトル（ OpenAI により生成された埋め込みベクトル）を含む大規模データセット（ Wikipedia の 25k 件の記事）をインポートする方法をご紹介します。以下を行います。

* Wikipedia の記事を含む CSV ファイルをダウンロードして解凍する  
* Weaviate インスタンスを作成する  
* スキーマを作成する  
* ファイルを解析し、 Python と JavaScript コードでレコードをバッチ インポートする  
* データが正しくインポートされたことを確認する  
* いくつかクエリを実行してセマンティック検索機能を確認する  


## 前提条件

import BasicPrereqs from '/_includes/prerequisites-quickstart.md';

<BasicPrereqs />

本チュートリアルを開始する前に、以下を用意してください。

- OpenAI API キー  
  すでに OpenAI によって生成されたベクトル埋め込みが含まれていますが、検索クエリのベクトル化やオブジェクト内容を更新した際のベクトル再計算に OpenAI キーが必要です。  
- お好みの Weaviate クライアント ライブラリをインストールしておくこと。  

<details>
  <summary>
    以前のチュートリアル（または本チュートリアルの前回の実行）で作成したデータを削除する方法を見る
  </summary>

import CautionSchemaDeleteClass from '/_includes/schema-delete-class.mdx'

<CautionSchemaDeleteClass />

</details>


## データセットのダウンロード

[Simple English](https://simple.wikipedia.org/wiki/Simple_English_Wikipedia) の Wikipedia データセットを [OpenAI がホスト](https://cdn.openai.com/API/examples/data/vector_database_wikipedia_articles_embedded.zip) しています（約 700 MB の ZIP、1.7 GB の CSV）。このファイルにはベクトル埋め込みが含まれており、`content_vector` は OpenAI の `text-embedding-ada-002` モデルで生成された 1536 次元のベクトルです。

| id | url | title | text | content_vector |
|----|-----|-------|------|----------------|
| 1 | https://simple<wbr/>.wikipedia.org<wbr/>/wiki/April | April | "April is the fourth month of the year..." | [-0.011034, -0.013401, ..., -0.009095] |

まだダウンロードしていない場合は、データセットをダウンロードしてファイルを解凍してください。作業ディレクトリに `vector_database_wikipedia_articles_embedded.csv` が生成されます。レコードは主に（厳密ではありませんが）タイトル順に並んでいます。

import {DownloadButton} from '@theme/Buttons';

<p>
  <DownloadButton link="https://cdn.openai.com/API/examples/data/vector_database_wikipedia_articles_embedded.zip">Wikipedia データセット ZIP をダウンロード</DownloadButton>
</p>


## Weaviate インスタンスの作成

Weaviate インスタンスは、 Linux で [embedded](/docs/deploy/installation-guides/embedded.md) オプション（最速かつ透過）、任意の OS で Docker（最速のインポートと検索）、または Weaviate Cloud（セットアップが最も簡単。ただしネットワーク速度によりインポートが遅くなる可能性あり）で作成できます。各オプションの詳細は [Installation](/docs/deploy/index.mdx) ページをご覧ください。

:::caution text2vec-openai
Docker オプションを使用する場合は、スタンドアロンではなく「With Modules」を選択し、「Vectorizer & Retriever Text Module」のステップで `text2vec-openai` モジュールを選択してください。「OpenAI Requires an API Key」のステップでは、本チュートリアルと同様に「各リクエストでキーを渡す」を選択できます。
:::

## インスタンスと OpenAI への接続

クライアントに OpenAI API キーを追加し、 Weaviate にクエリを送信する際に OpenAI ベクトライザー API を利用できるようにします。

import ProvideOpenAIAPIKey from '/_includes/provide-openai-api-key-headers.mdx'

<ProvideOpenAIAPIKey />

## スキーマの作成

[スキーマ](../starter-guides/managing-collections/index.mdx) は、指定した Weaviate クラス内のオブジェクトのデータ構造を定義します。ここでは CSV の列にマッピングした Wikipedia の `Article` クラスを作成し、[text2vec-openai ベクトライザー](../manage-collections/vector-config.mdx#specify-a-vectorizer) を使用します。スキーマには 2 つのプロパティを定義します。  
* `title`  – 記事のタイトル（ベクトル化しません）  
* `content` – 記事の本文。 CSV の `text` 列に相当  

Weaviate 1.18 以降、`text2vec-openai` ベクトライザーはデフォルトで OpenAI データセットと同じ `text-embedding-ada-002` モデルを使用します。将来デフォルトが変更されてもチュートリアルが同じように動作するよう、スキーマで使用モデルを明示的に指定します。

```json
{
  "moduleConfig": {
    "text2vec-openai": {
      "model": "ada",
      "modelVersion": "002",
      "type": "text"
    }
  }
}
```

`content_vector` 埋め込みの保存方法にも注意が必要です。[Weaviate はオブジェクト全体をベクトル化](../config-refs/indexing/vector-index.mdx#configure-semantic-indexing) し、デフォルトではクラス名を文字列シリアライズに含めます。 OpenAI からは `text`（本文）フィールドのみの埋め込みが提供されているため、 Weaviate が `Article` オブジェクトを同じ方法でベクトル化できるよう、`text2vec-openai` の `moduleConfig` で `vectorizeClassName: false` を設定します。これらをまとめたスキーマ設定は次のようになります。

import CreateSchema from '/_includes/code/tutorials.wikipedia.schema.mdx';

<CreateSchema />

スキーマが正しく作成されたかを素早く確認するには、`<weaviate-endpoint>/v1/schema` にアクセスします。たとえば Docker であれば `http://localhost:8080/v1/schema` にアクセスするか、次のコマンドを実行します。

```bash
curl -s http://localhost:8080/v1/schema | jq
```

:::tip jq
[`jq`](https://stedolan.github.io/jq/) は便利な JSON プリプロセッサです。単にパイプでテキストを渡すだけで、整形およびシンタックス ハイライトされた JSON を出力してくれます。
:::


## 記事のインポート

準備ができたので、記事をインポートします。最高のパフォーマンスを得るため、[バッチ インポート](../manage-objects/import.mdx) を使用します。

import ImportArticles from '/_includes/code/tutorials.wikipedia.import.mdx';

<ImportArticles />


### インポートの確認

インポートが期待どおりに行われたかを確認する簡単な方法は 2 つあります。

1. 記事数を取得する  
2. 5 件の記事を取得する  

- [Weaviate Query app](/cloud/tools/query-tool) を開く  
- `http://localhost:8080` または `https://WEAVIATE_INSTANCE_URL`（WEAVIATE_INSTANCE_URL はご自身のエンドポイントに置き換えてください）に接続する  
- 次の GraphQL クエリを実行する  

```graphql
query {
  Aggregate { Article { meta { count } } }

  Get {
    Article(limit: 5) {
      title
      url
    }
  }
}
```

`Aggregate.Article.meta.count` フィールドがインポートした記事数（例：25,000）になっていること、そして `title` と `url` フィールドを持つランダムな 5 件の記事が取得できることを確認してください。
## クエリ

記事のインポートが完了したので、クエリを実行してみましょう。

### nearText

[`nearText` フィルター](../api/graphql/search-operators.md#neartext)を使用すると、1 つまたは複数のコンセプトの ベクトル 埋め込みに近い ( ベクトル 空間上 ) オブジェクトを検索できます。  
たとえば、「modern art in Europe」というクエリの ベクトル は、次のように説明されている [Documenta](https://simple.wikipedia.org/wiki/Documenta) という記事の ベクトル に近くなります。

> 「世界で最も重要な現代美術の展覧会の 1 つで… ドイツのカッセルで開催される」

import NearText from '/_includes/code/tutorials.wikipedia.nearText.mdx';

<NearText />

### hybrid

`nearText` は高密度 ベクトル を用いて検索クエリと意味的に近いオブジェクトを見つけますが、キーワード検索にはあまり向いていません。  
たとえば、この Simple English Wikipedia データセットで「jackfruit」を `nearText` 検索すると、最上位の結果として「cherry tomato」が返されます。こうした場合 (実際にはほとんどのケースで) には、高密度 ベクトル 検索とキーワード検索を組み合わせた [`hybrid` フィルター](../api/graphql/search-operators.md#hybrid) を使用することで、より良い検索結果を得られます。

import Hybrid from '/_includes/code/tutorials.wikipedia.hybrid.mdx';

<Hybrid />


## まとめ

このチュートリアルでは、次の内容を学びました。  
* Weaviate のバッチ処理と `pandas` / `csv-parser` の CSV レイジーローディングを使用して、大規模データセットを効率良くインポートする方法  
* 既存の ベクトル をインポートする方法 (「Bring Your Own Vectors」)  
* すべてのレコードがインポートされたかを素早く確認する方法  
* `nearText` と `hybrid` 検索の使い方  


## 参考資料

- [チュートリアル: スキーマの詳細](../starter-guides/managing-collections/index.mdx)
- [チュートリアル: クエリの詳細](./query.md)
- [チュートリアル: モジュール入門](./modules.md)



## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>