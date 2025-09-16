---
title: 要約
description: Weaviate の SUM Transformers モジュールを使用してデータを効率的に要約します。
sidebar_position: 80
image: og/docs/modules/sum-transformers.jpg
# tags: ['transformers']
---

## 概要

* Summarization ( `sum-transformers` ) モジュールは、段落全体を短いテキストに要約する Weaviate モジュールです。  
* このモジュールは要約に特化した transformers モデルをコンテナ化し、Weaviate から接続できるようにします。ここでは事前構築済みモデルを提供していますが、Hugging Face から別の transformer モデルを接続したり、カスタムモデルを使用したりすることも可能です。  
* モジュールは GraphQL の `_additional {}` フィールドに `summary {}` フィルターを追加します。  
* モジュールは GraphQL `_additional { summary {} }` フィールドで結果を返します。  

## はじめに

名前が示すとおり、Summarization モジュールはクエリ時に Weaviate のテキストオブジェクトを要約できます。

**例として**、Weaviate 内のデータに対してクエリを実行し、次のようなテキストを取得できます。

> <em>"The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct."</em>

このテキストを次のような短い文に変換します。

> <em>"The Eiffel Tower is a landmark in Paris, France."</em>

:::note GPUs preferred
クエリのパフォーマンスを最大化するには、transformer ベースのモデルを GPU で実行することを推奨します。  
CPU でも実行できますが、クエリ速度が大幅に低下します。
:::

### 利用可能なモジュール

現在利用可能な `SUM` モジュールの一覧です（[Hugging Face Model Hub](https://huggingface.co/models) から取得）:
* [`bart-large-cnn`](https://huggingface.co/facebook/bart-large-cnn)
* [`pegasus-xsum`](https://huggingface.co/google/pegasus-xsum)

## 有効化方法（モジュール設定）

### Docker Compose

`sum-transformers` モジュールは Docker Compose ファイルにサービスとして追加できます。  
`text2vec-contextionary` や `text2vec-transformers` などのテキストベクトライザーが稼働している必要があります。

以下は `facebook-bart-large-cnn` モデルを使用した `sum-transformers` モジュールと、`text2vec-contextionary` ベクトライザー モジュールを組み合わせた Docker Compose ファイルの例です。

```yaml
---
services:
  weaviate:
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    - 50051:50051
    restart: on-failure:0
    environment:
      CONTEXTIONARY_URL: contextionary:9999
      SUM_INFERENCE_API: "http://sum-transformers:8080"
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'text2vec-contextionary,sum-transformers'
      CLUSTER_HOSTNAME: 'node1'
  contextionary:
    environment:
      OCCURRENCE_WEIGHT_LINEAR_FACTOR: 0.75
      EXTENSIONS_STORAGE_MODE: weaviate
      EXTENSIONS_STORAGE_ORIGIN: http://weaviate:8080
      NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE: 5
      ENABLE_COMPOUND_SPLITTING: 'false'
    image: cr.weaviate.io/semitechnologies/contextionary:en0.16.0-v1.0.2
    ports:
    - 9999:9999
  sum-transformers:
    image: cr.weaviate.io/semitechnologies/sum-transformers:facebook-bart-large-cnn-1.2.0
    # image: cr.weaviate.io/semitechnologies/sum-transformers:google-pegasus-xsum-1.2.0  # Could be used instead
...
```

変数の説明:
* `SUM_INFERENCE_API`: Summarization モジュールが稼働している場所

## 使い方（GraphQL）

モジュールの機能を利用するには、クエリの `_additional` プロパティを次のように拡張します。

### GraphQL トークン

このモジュールは GraphQL クエリの `_additional` フィールドに `summary{}` という検索フィルターを追加します。  
この新しいフィルターは次の引数を取ります。

| Field | Data Type | Required | Example value | Description |
| - | - | - | - | - |
| `properties` | list of strings | yes | `["description"]` | クラスのうちテキストを含むプロパティ（ `text` または `string` データタイプ）。少なくとも 1 つのプロパティを指定する必要があります |

### クエリ例

import CodeSumTransformer from '/_includes/code/sum-transformers-module.mdx';

<CodeSumTransformer />

### GraphQL レスポンス

回答は `summary` という新しい GraphQL `_additional` プロパティに含まれ、トークンのリストを返します。  
内容は次のフィールドです:
* `property` ( `string` ): 要約されたプロパティ名。複数プロパティを要約する場合に役立ちます  
* `result` ( `string` ): 出力された要約文  

### レスポンス例

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "summary": [
              {
                "property": "summary",
                "result": "Finding the perfect pair of jeans can be a challenge."
              }
            ]
          },
          "title": "The Most Comfortable Gap Jeans to Shop Now"
        }
      ]
    }
  },
  "errors": null
}
```

## Hugging Face の別の Summarization モジュールを使用する

[Hugging Face Model Hub](https://huggingface.co/models?pipeline_tag=summarization) にある任意の要約モデルを、2 行の Dockerfile でサポートする Docker イメージを構築できます。  
以下の例では、[`google/pegasus-pubmed` モデル](https://huggingface.co/google/pegasus-pubmed) 用のカスタムイメージを作成します。

#### Step 1: `Dockerfile` を作成する

新しい `Dockerfile` を作成し、`my-model.Dockerfile` と名付けます。次の行を追加してください。  
```
FROM semitechnologies/sum-transformers:custom
RUN chmod +x ./download.py
RUN MODEL_NAME=google/pegasus-pubmed ./download.py
```

#### Step 2: Dockerfile をビルドしてタグ付けする

Dockerfile に `google-pegasus-pubmed` というタグを付けてビルドします。  
```
docker build -f my-model.Dockerfile -t google-pegasus-pubmed .
```

#### Step 3: Weaviate でイメージを使用する

イメージを任意のレジストリへプッシュするか、`docker-compose.yml` で `google-pegasus-pubmed` タグを参照して Weaviate から利用できます。

## 仕組み（内部動作）

`sum-transformers` モジュールは transformer ベースの要約モデルを使用します。  
これらは抽象的 (abstractive) 要約を行い、入力テキストから新しいテキストを生成します。例として、以下のようなテキストを入力すると:

<details>
  <summary>元のテキストを表示</summary>

> *The Loch Ness Monster (Scottish Gaelic: Uilebheist Loch Nis), affectionately known as Nessie, is a creature in Scottish folklore that is said to inhabit Loch Ness in the Scottish Highlands. It is often described as large, long-necked, and with one or more humps protruding from the water. Popular interest and belief in the creature has varied since it was brought to worldwide attention in 1933. Evidence of its existence is anecdotal, with a number of disputed photographs and sonar readings.*
> *The scientific community explains alleged sightings of the Loch Ness Monster as hoaxes, wishful thinking, and the misidentification of mundane objects. The pseudoscience and subculture of cryptozoology has placed particular emphasis on the creature.*

</details>

次のように要約を生成します。

> *The Loch Ness Monster is said to be a large, long-necked creature. Popular belief in the creature has varied since it was brought to worldwide attention in 1933. Evidence of its existence is disputed, with a number of disputed photographs and sonar readings. The pseudoscience and subculture of cryptozoology has placed particular emphasis on the creature.*

出力の多くは入力をそのままコピーせず、*基づいて* 生成されている点に注意してください。`sum-transformers` モジュールはこの出力をレスポンスとして返します。

:::note Input length
他の多くの言語モデルと同様に、要約モデルが処理できるテキスト量には制限があります。  
`sum-transformers` モジュールは使用するモデルの最大長に制限されます。例として、`facebook/bart-large-cnn` モデルは 1024 トークンまでしか処理できません。

一方、入力が短すぎたり詳細が不足したりすると、transformer モデルが [幻覚](https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)) を起こす可能性がある点にもご注意ください。
:::



## モデルライセンス

`sum-transformers` モジュールは、ライセンスがそれぞれ異なる複数のモデルと互換性があります。詳細については、[Hugging Face モデル Hub](https://huggingface.co/models) でご利用のモデルのライセンスをご確認ください。

ライセンスが存在する場合、その条件がご予定の用途に適しているかどうかを評価する責任はお客様にあります。


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

