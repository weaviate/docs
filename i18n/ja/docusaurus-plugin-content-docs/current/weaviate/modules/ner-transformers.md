---
title: 固有表現認識
description: Weaviate で NER Transformers を統合し、テキスト内のエンティティを識別・分類します。
sidebar_position: 60
image: og/docs/modules/ner-transformers.jpg
# tags: ['ner-transformers', 'transformers', 'token classification']
---

## 概要

* Named Entity Recognition（NER）モジュールは、トークン分類用の Weaviate モジュールです。  
* 本モジュールは Weaviate と共に稼働する NER Transformers モデルに依存します。あらかじめビルド済みのモデルも利用できますが、別の HuggingFace Transformer や独自の NER モデルを接続することも可能です。  
* GraphQL の `_additional {}` フィールドに `tokens {}` フィルターが追加されます。  
* モジュールはデータオブジェクトを通常どおり返し、その中で認識されたトークンは GraphQL の `_additional { tokens {} }` フィールドに含まれます。  

## はじめに

Named Entity Recognition（NER）モジュールは、既存の Weaviate テキストオブジェクトからエンティティをオンザフライで抽出するためのモジュールです。エンティティ抽出はクエリー時に実行されます。最高のパフォーマンスを得るには、Transformer ベースのモデルを GPU で実行することを推奨します。CPU でも動作しますが、スループットは低下します。

現在、以下の 3 種類の NER モジュールが利用可能です（[Hugging Face](https://huggingface.co/) より）: [`dbmdz-bert-large-cased-finetuned-conll03-english`](https://huggingface.co/dbmdz/bert-large-cased-finetuned-conll03-english)、[`dslim-bert-base-NER`](https://huggingface.co/dslim/bert-base-NER)、[`davlan-bert-base-multilingual-cased-ner-hrl`](https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl?text=%D8%A5%D8%B3%D9%85%D9%8A+%D8%B3%D8%A7%D9%85%D9%8A+%D9%88%D8%A3%D8%B3%D9%83%D9%86+%D9%81%D9%8A+%D8%A7%D9%84%D9%82%D8%AF%D8%B3+%D9%81%D9%8A+%D9%81%D9%84%D8%B3%D8%B7%D9%8A%D9%86.).

## 有効化方法（モジュール設定）

### Docker Compose

NER モジュールは Docker Compose ファイルにサービスとして追加できます。`text2vec-contextionary` や `text2vec-transformers` のようなテキスト ベクトライザーが稼働している必要があります。以下は、`text2vec-contextionary` と組み合わせて `ner-transformers` モジュール（`dbmdz-bert-large-cased-finetuned-conll03-english`）を使用するための Docker Compose ファイル例です。

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
      NER_INFERENCE_API: "http://ner-transformers:8080"
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'text2vec-contextionary,ner-transformers'
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
  ner-transformers:
    image: cr.weaviate.io/semitechnologies/ner-transformers:dbmdz-bert-large-cased-finetuned-conll03-english
...
```

変数の説明:  
* `NER_INFERENCE_API`: qna モジュールが稼働している場所を指定します。

## 使用方法（GraphQL）

モジュールの機能を利用するには、クエリーに次の `_additional` プロパティを追加するだけです。

### GraphQL トークン

このモジュールは、GraphQL の `_additional` フィールドに `token{}` 検索フィルターを追加します。新しいフィルターは次の引数を取ります。

| 項目 	| データタイプ 	| 必須 	| 例 	| 説明 	|
|-	|-	|-	|-	|-	|
| `properties` 	| list of strings 	| yes 	| `["summary"]` 	| クエリー対象クラスでテキスト（`text` または `string` 型）を含むプロパティ。少なくとも 1 つは指定する必要があります。 |
| `certainty` 	| float 	| no 	| `0.75` | 認識されたトークンが満たすべき最小確信度。値が高いほど分類は厳密になります。設定しない場合、モデルが検出したすべてのトークンが返されます。 |
| `limit` 	| int 	| no 	| `1` | データオブジェクトごとに返されるトークンの最大数。 |

### クエリ例

import CodeNerTransformer from '/_includes/code/ner-transformers-module.mdx';

<CodeNerTransformer />

### GraphQL レスポンス

レスポンスは新しい GraphQL `_additional` プロパティ `tokens` に含まれ、トークンのリストを返します。各トークンには以下のフィールドがあります:  
* `entity` (`string`): エンティティグループ（分類されたトークン）  
* `word` (`string`): エンティティとして認識された語  
* `property` (`string`): トークンが見つかったプロパティ  
* `certainty` (`float`): トークンが正しく分類された確信度（0.0–1.0）  
* `startPosition` (`int`): プロパティ値内で単語の最初の文字がある位置  
* `endPosition` (`int`): プロパティ値内で単語の最後の文字がある位置  

### レスポンス例

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "tokens": [
              {
                "property": "title",
                "entity": "PER",
                "certainty": 0.9894614815711975,
                "word": "Sarah",
                "startPosition": 11,
                "endPosition": 16
              },
              {
                "property": "title",
                "entity": "LOC",
                "certainty": 0.7529033422470093,
                "word": "London",
                "startPosition": 31,
                "endPosition": 37
              }
            ]
          },
          "title": "My name is Sarah and I live in London"
        }
      ]
    }
  },
  "errors": null
}
```

## HuggingFace の別 NER Transformer モジュールの使用

2 行だけの Dockerfile で、[Hugging Face model hub](https://huggingface.co/models) にある任意のモデルをサポートする Docker イメージを作成できます。以下の例では、[`Davlan/bert-base-multilingual-cased-ner-hrl` モデル](https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl) 用のカスタムイメージをビルドします。

#### ステップ 1: `Dockerfile` の作成
新しい `Dockerfile` を作成します。ここでは `my-model.Dockerfile` という名前にし、次の行を追加します。  
```
FROM semitechnologies/ner-transformers:custom
RUN chmod +x ./download.py
RUN MODEL_NAME=Davlan/bert-base-multilingual-cased-ner-hrl ./download.py
```

#### ステップ 2: Dockerfile をビルドしてタグ付けする
Dockerfile に `davlan-bert-base-multilingual-cased-ner-hrl` というタグを付けてビルドします。  
```
docker build -f my-model.Dockerfile -t davlan-bert-base-multilingual-cased-ner-hrl .
```

#### ステップ 3: 完了！
イメージを任意のレジストリにプッシュするか、`docker-compose.yml` 内で Docker タグ `davlan-bert-base-multilingual-cased-ner-hrl` を使ってローカル参照できます。

## 仕組み（内部動作）

このリポジトリのアプリケーションコードは、`My name is Sarah and I live in London` のようなテキスト入力を受け取り、次のような JSON 形式で情報を返すモデルと互換性があります。

```json
[
  {
    "entity_group": "PER",
    "score": 0.9985478520393372,
    "word": "Sarah",
    "start": 11,
    "end": 16
  },
  {
    "entity_group": "LOC",
    "score": 0.999621570110321,
    "word": "London",
    "start": 31,
    "end": 37
  }
]
```

Weaviate NER モジュールはこの出力を受け取り、GraphQL 出力に変換します。

## モデルのライセンス

`ner-transformers` モジュールは複数のモデルと互換性があり、それぞれに独自のライセンスがあります。詳しくは、使用するモデルのライセンスを [Hugging Face Model Hub](https://huggingface.co/models) でご確認ください。

ライセンス条件がご自身の用途に適しているかどうかは、利用者ご自身でご判断ください。

## ご質問・フィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

