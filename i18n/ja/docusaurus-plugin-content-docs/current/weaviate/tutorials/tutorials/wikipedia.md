---
title: カスタム ベクトル 付き Wikipedia
description: Weaviate を使って Wikipedia を拡張データソースとして活用し、洞察を得る方法を学びます。
sidebar_position: 50
image: og/docs/tutorials.jpg  # TODO
# tags: ['import']
---

import UpdateInProgressNote from '/_includes/update-in-progress.mdx';

<UpdateInProgressNote />

このチュートリアルでは、すでにベクトル（OpenAI で生成した埋め込み）を含む大規模データセット（ Wikipedia の記事 25,000 件）をインポートする方法を紹介します。具体的には、以下を行います。

* Wikipedia 記事を含む CSV ファイルをダウンロードして解凍する  
* Weaviate インスタンスを作成する  
* スキーマを作成する  
* Python と JavaScript のコードでファイルを解析し、レコードをバッチ インポートする  
* データが正しくインポートされたか確認する  
* セマンティック検索機能を示すクエリをいくつか実行する  


## 前提条件

import BasicPrereqs from '/_includes/prerequisites-quickstart.md';

<BasicPrereqs />

このチュートリアルを始める前に、以下を用意してください。

- [OpenAI API キー](https://platform.openai.com/api-keys)  
  すでに OpenAI で生成されたベクトル埋め込みがありますが、検索クエリをベクトライズしたり、オブジェクト内容を更新した際に再計算するために OpenAI キーが必要です。  
- お好みの Weaviate [クライアント ライブラリ](../client-libraries/index.mdx)  

<details>
  <summary>
    以前のチュートリアル（またはこのチュートリアルの前回実行分）のデータを削除する方法
  </summary>

import CautionSchemaDeleteClass from '/_includes/schema-delete-class.mdx'

<CautionSchemaDeleteClass />

</details>


## データセットのダウンロード

今回使用するのは、OpenAI がホストしている [Simple English](https://simple.wikipedia.org/wiki/Simple_English_Wikipedia) Wikipedia の [データセット](https://cdn.openai.com/API/examples/data/vector_database_wikipedia_articles_embedded.zip) です（ zip 約 700 MB、解凍後の CSV は 1.7 GB）。このファイルにはベクトル埋め込みが含まれています。特に次の列が重要で、`content_vector` は OpenAI の `text-embedding-ada-002` モデルで生成された [1536 次元](https://openai.com/index/new-and-improved-embedding-model) の [ベクトル埋め込み](https://weaviate.io/blog/vector-embeddings-explained) です。

| id | url | title | text | content_vector |
|----|-----|-------|------|----------------|
| 1 | https://simple<wbr/>.wikipedia.org<wbr/>/wiki/April | April | "April is the fourth month of the year..." | [-0.011034, -0.013401, ..., -0.009095] |

まだダウンロードしていない場合は、データセットをダウンロードして解凍してください。作業ディレクトリに `vector_database_wikipedia_articles_embedded.csv` ができあがります。レコードはほぼ（厳密ではありませんが）タイトル順に並んでいます。

import {DownloadButton} from '@theme/Buttons';

<p>
  <DownloadButton link="https://cdn.openai.com/API/examples/data/vector_database_wikipedia_articles_embedded.zip">Wikipedia データセット ZIP をダウンロード</DownloadButton>
</p>


## Weaviate インスタンスの作成

Weaviate インスタンスは、Linux なら [embedded](/docs/deploy/installation-guides/embedded.md) オプション（最も透過的かつ高速）、任意の OS で Docker（インポートと検索が最速）、またはクラウドの Weaviate Cloud（セットアップが最も簡単。ただしネットワーク速度によりインポートが遅い場合あり）で作成できます。各オプションの詳細は [Installation](/docs/deploy/index.mdx) ページを参照してください。

:::caution text2vec-openai
Docker オプションを使用する場合は、Docker コンフィギュレータで「With Modules」を選択し、"Vectorizer & Retriever Text Module" ステップで `text2vec-openai` モジュールを有効にしてください。"OpenAI Requires an API Key" ステップでは、「各リクエストでキーを渡す」を選択できます。本チュートリアルでもその方法を使用します。
:::

## インスタンスと OpenAI への接続

OpenAI API キーをクライアントに設定し、Weaviate へクエリを送信する際に OpenAI ベクトライザー API を利用できるようにします。

import ProvideOpenAIAPIKey from '/_includes/provide-openai-api-key-headers.mdx'

<ProvideOpenAIAPIKey />

## スキーマの作成

[スキーマ](../starter-guides/managing-collections/index.mdx) は、特定の Weaviate クラスにおけるオブジェクトのデータ構造を定義します。今回は Wikipedia の `Article` クラス用スキーマを作成し、CSV の列をマッピングしつつ [text2vec-openai ベクトライザー](../manage-collections/vector-config.mdx#specify-a-vectorizer) を使用します。スキーマには次の 2 つのプロパティを持たせます。

* `title` - 記事タイトル（ベクトライズしない）  
* `content` - 記事本文。CSV の `text` 列に対応  

Weaviate 1.18 以降、`text2vec-openai` ベクトライザーはデフォルトで OpenAI の `text-embedding-ada-002` モデルを使用します。将来デフォルトが変更された場合でもチュートリアルが同じように動作するよう、スキーマで使用するモデルを明示的に指定します。

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

さらに注意すべき点として、`content_vector` 埋め込みをどのように保存するかがあります。[Weaviate はオブジェクト全体](../config-refs/indexing/vector-index.mdx#configure-semantic-indexing) をベクトライズし、デフォルトではクラス名も文字列シリアライズに含めます。今回は OpenAI が `text`（本文）フィールドのみに対して埋め込みを提供しているため、Weaviate が `Article` オブジェクトを同じ方法でベクトライズする必要があります。そのため、`moduleConfig` 内の `text2vec-openai` セクションで `vectorizeClassName: false` を設定し、クラス名をベクトライズ対象から除外します。これらをまとめると、スキーマ設定は次のようになります。

import CreateSchema from '/_includes/code/tutorials.wikipedia.schema.mdx';

<CreateSchema />

スキーマが正しく作成されたかを簡単に確認するには、`<weaviate-endpoint>/v1/schema` にアクセスします。たとえば Docker インストールの場合は `http://localhost:8080/v1/schema` にアクセスするか、以下を実行します。

```bash
curl -s http://localhost:8080/v1/schema | jq
```

:::tip jq
[`jq`](https://stedolan.github.io/jq/) は便利な JSON プロセッサです。テキストをパイプで渡すだけで整形・シンタックスハイライトされた状態で表示してくれます。
:::


## 記事のインポート

準備が整ったら記事をインポートしましょう。最大限のパフォーマンスを得るため、[バッチ インポート](../manage-objects/import.mdx) を使用します。

import ImportArticles from '/_includes/code/tutorials.wikipedia.import.mdx';

<ImportArticles />


### インポートの確認

インポートが意図通り行われたかを簡単に確認する 2 つの方法です。

1. 記事数を取得する  
2. 5 件の記事を取得する  

- [Weaviate Query アプリ](/cloud/tools/query-tool) を開きます。  
- `http://localhost:8080` または `https://WEAVIATE_INSTANCE_URL` の Weaviate エンドポイントに接続します。（WEAVIATE_INSTANCE_URL はご自身のインスタンス URL に置き換えてください。）  
- 次の GraphQL クエリを実行します。  

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

`Aggregate.Article.meta.count` フィールドがインポートした記事数（例: 25,000）と一致し、`title` と `url` を含むランダムな 5 件の記事が表示されれば成功です。
## クエリ

記事をインポートできたので、クエリを実行してみましょう！

### nearText

[`nearText` フィルター](../api/graphql/search-operators.md#neartext) を使うと、1 つ以上のコンセプトのベクトル埋め込みに近い（ベクトル空間上で近接する）オブジェクトを検索できます。たとえば、「modern art in Europe」というクエリのベクトルは、次のように説明されている記事 [Documenta](https://simple.wikipedia.org/wiki/Documenta) のベクトルに近くなります。
> "one of the most important exhibitions of modern art in the world... [taking] place in Kassel, Germany".

import NearText from '/_includes/code/tutorials.wikipedia.nearText.mdx';

<NearText />

### hybrid

`nearText` は密なベクトルを用いてクエリと意味的に類似したオブジェクトを見つけますが、キーワード検索にはあまり向いていません。例えば、この Simple English Wikipedia データセットで「jackfruit」を `nearText` で検索すると、最上位の結果は「cherry tomato」になります。こうした（実際にはほとんどの）ケースでは、密なベクトル検索とキーワード検索を組み合わせた [`hybrid` フィルター](../api/graphql/search-operators.md#hybrid) を使うことで、より良い検索結果が得られます。

import Hybrid from '/_includes/code/tutorials.wikipedia.hybrid.mdx';

<Hybrid />


## まとめ

このチュートリアルでは、以下を学びました。  
* Weaviate のバッチ処理と CSV レイジーローディングを `pandas` / `csv-parser` で利用し、大規模データセットを効率的にインポートする方法  
* 既存のベクトルをインポートする「Bring Your Own Vectors」の方法  
* すべてのレコードがインポートされたかを素早く確認する方法  
* `nearText` と `hybrid` 検索の使い方  


## 推奨読書

- [チュートリアル: スキーマの詳細](../starter-guides/managing-collections/index.mdx)
- [チュートリアル: クエリの詳細](./query.md)
- [チュートリアル: モジュール入門](./modules.md)



## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>