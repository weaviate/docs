---
title: 質問応答 - transformers
description: Weaviate に QnA Transformers を追加して正確な質問応答とインサイトを得ます。
sidebar_position: 40
image: og/docs/modules/qna-transformers.jpg
# tags: ['qna', 'qna-transformers', 'transformers']
---

## 概要

* Question and Answer (Q&A) モジュールは、データから回答を抽出するための Weaviate モジュールです。  
* このモジュールは、Weaviate と一緒に実行されるテキストベクトル化モジュールに依存します。  
* `ask {}` オペレーターを  GraphQL  `Get {}` クエリに追加します。  
* GraphQL の `_additional {}` フィールド内に最大 1 件の回答を返します。  
* `certainty`（信頼度）が最も高い回答が返されます。  

## はじめに

Question and Answer (Q&A) モジュールは、データから回答を抽出するための Weaviate モジュールです。BERT 系モデルを使用して回答を検索・抽出します。このモジュールは  GraphQL  `Get{...}` クエリ内で検索オペレーターとして利用できます。`qna-transformers` モジュールは、指定クラスのデータオブジェクト内から回答を探します。指定した `certainty` 範囲内で回答が見つかった場合、GraphQL の `_additional { answer { ... } }` フィールドに返されます。回答は最大 1 件で、設定された（オプション）`certainty` を上回っている場合のみ返却されます。`certainty`（信頼度）が最も高い回答が返されます。

現在利用できる Question Answering モデルは 5 種類あります（出典: [Hugging Face Model Hub](https://huggingface.co/models)）: [`distilbert-base-uncased-distilled-squad (uncased)`](https://huggingface.co/distilbert-base-uncased-distilled-squad)、[`bert-large-uncased-whole-word-masking-finetuned-squad (uncased)`](https://huggingface.co/bert-large-uncased-whole-word-masking-finetuned-squad)、[`distilbert-base-cased-distilled-squad (cased)`](https://huggingface.co/distilbert-base-cased-distilled-squad)、[`deepset/roberta-base-squad2`](https://huggingface.co/deepset/roberta-base-squad2)、[`deepset/bert-large-uncased-whole-word-masking-squad2 (uncased)`](https://huggingface.co/deepset/bert-large-uncased-whole-word-masking-squad2)。すべてのモデルがすべてのデータセットやユースケースで高性能とは限りませんが、ほとんどのデータセットで高い性能を示す `bert-large-uncased-whole-word-masking-finetuned-squad (uncased)` の使用を推奨します（ただしサイズは大きめです）。

`v1.10.0` 以降では、回答スコアを検索結果のリランキング要因として利用できます。

## 有効化方法（モジュール設定）

### Docker Compose

Q&A モジュールは Docker Compose ファイルにサービスとして追加できます。`text2vec-contextionary` もしくは `text2vec-transformers` などのテキストベクトライザーが必要です。`qna-transformers` モジュール（`bert-large-uncased-whole-word-masking-finetuned-squad (uncased)`）を `text2vec-transformers` と組み合わせて使用する Docker Compose 例は以下のとおりです。

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
      TRANSFORMERS_INFERENCE_API: 'http://text2vec-transformers:8080'
      QNA_INFERENCE_API: "http://qna-transformers:8080"
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'text2vec-transformers,qna-transformers'
      CLUSTER_HOSTNAME: 'node1'
  text2vec-transformers:
    image: cr.weaviate.io/semitechnologies/transformers-inference:sentence-transformers-msmarco-distilbert-base-v2
    environment:
      ENABLE_CUDA: '1'
      NVIDIA_VISIBLE_DEVICES: all
    deploy:
      resources:
        reservations:
          devices:
          - capabilities: [gpu]
  qna-transformers:
    image: cr.weaviate.io/semitechnologies/qna-transformers:bert-large-uncased-whole-word-masking-finetuned-squad
    environment:
      ENABLE_CUDA: '1'
      NVIDIA_VISIBLE_DEVICES: all
    deploy:
      resources:
        reservations:
          devices:
          - capabilities: [gpu]
...
```

変数の説明:  
* `QNA_INFERENCE_API`: qna モジュールが稼働している場所  
* `ENABLE_CUDA`: 1 に設定すると、ホストマシンに GPU があれば使用します  

_注: 現時点では、テキストベクトル化モジュールを 1 つのセットアップで併用することはできません。`text2vec-contextionary`、`text2vec-transformers`、あるいはテキストベクトル化モジュールなしのいずれかを選択する必要があります。_

## 使い方（ GraphQL ）

### GraphQL Ask 検索

このモジュールは  GraphQL  `Get{...}` クエリに `ask{}` 検索オペレーターを追加します。`ask{}` は以下の引数を取ります。

| Field | Data Type | Required | Example value | Description |
|-|-|-|-|-|
| `question` | string | yes | `"What is the name of the Dutch king?"` | 回答を求める質問 |
| `certainty` | float | no | `0.75` | 回答の最小信頼度。値が高いほど検索が厳格になり、低いほど曖昧になります。設定しない場合、抽出可能な回答はすべて返されます |
| `properties` | list of strings | no | `["summary"]` | テキストを含むクラスのプロパティ。指定しない場合、すべてのプロパティが対象 |
| `rerank` | bool | no | `true` | 有効にすると、qna モジュールが回答スコアで結果をリランキングします。たとえば、以前の（セマンティック）検索で 3 番目だった結果に最も有力な回答が含まれていた場合、結果 3 が位置 1 に繰り上がります。*v1.10.0 より前では非対応* |

注意:  
* GraphQL の `Explore { }` 機能も `ask` 検索をサポートしますが、結果は回答を含むオブジェクトへの beacon のみであり、実際の抽出は行われません。したがって質問で `nearText` セマンティック検索を行うのと違いはありません。  
* `'ask'` オペレーターは `'nearXXX'` オペレーターと同時には使用できません。  

### クエリ例

import CodeQnaTransformer from '/_includes/code/qna-transformers.ask.mdx';

<CodeQnaTransformer />

### GraphQL レスポンス

回答は `_additional` プロパティ内の `answer` に含まれます。フィールドは次のとおりです。  
* `hasAnswer` (`boolean`): 回答が見つかったかどうか  
* `result` (nullable `string`): 回答文字列。`hasAnswer==false` の場合は `null`  
* `certainty` (nullable `float`): 返された回答の信頼度。`hasAnswer==false` の場合は `null`  
* `property` (nullable `string`): 回答を含むプロパティ名。`hasAnswer==false` の場合は `null`  
* `startPosition` (`int`): 回答開始位置の文字オフセット。`hasAnswer==false` の場合は `0`  
* `endPosition` (`int`): 回答終了位置の文字オフセット。`hasAnswer==false` の場合は `0`  

注: レスポンスの `startPosition`、`endPosition`、`property` は必ずしも返されるとは限りません。これらは入力テキストに対して大文字小文字を区別しない文字列マッチング関数で計算されます。Transformer モデルが出力をフォーマットする際に（元入力に存在しないトークン間スペースを追加するなどして）差異が生じた場合、位置計算やプロパティの判定に失敗する可能性があります。

### レスポンス例

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "answer": {
              "certainty": 0.73,
              "endPosition": 26,
              "hasAnswer": true,
              "property": "summary",
              "result": "king willem - alexander",
              "startPosition": 48
            }
          },
          "title": "Bruised Oranges - The Dutch royals are botching covid-19 etiquette"
        }
      ]
    }
  },
  "errors": null
}
```

## カスタム Q&A Transformer モジュール

`text2vec-transformers` と同様の方法が利用できます。詳細は [こちら](/weaviate/model-providers/transformers/embeddings-custom-image.md) を参照してください。つまり、プリビルドのコンテナを選択するか、`semitechnologies/qna-transformers:custom` ベースイメージを使って独自モデルからコンテナをビルドします。モデルが Hugging Face の `transformers.AutoModelForQuestionAnswering` と互換性を持つことを確認してください。

## 仕組み（内部動作）

内部では 2 段階アプローチを採用しています。最初にセマンティック検索を行い、回答を含む可能性が高いドキュメント（例: 文、段落、記事など）を見つけます。次に、そのドキュメントのすべての `text` と `string` プロパティに対して BERT 形式の回答抽出を行います。結果は次の 3 通りです。  
1. 質問に対する回答が存在しないため、回答が見つからなかった。  
2. 回答は見つかったが、ユーザー指定の最小 `certainty` に達しておらず破棄された（トピックは合っているが実際の回答が含まれていない場合によく発生）。  
3. 指定した `certainty` を満たす回答が見つかり、ユーザーに返される。  

このモジュールは内部でセマンティック検索を実行するため、`text2vec-...` モジュールが必要です。`qna-...` モジュールと同じ種類である必要はありません。たとえば、`text2vec-contextionary` でセマンティック検索を行い、`qna-transformers` で回答を抽出することもできます。

### 長いドキュメントへの自動スライディングウィンドウ

データオブジェクト内のテキストが 512 トークンを超える場合、Q&A Transformer モジュールは自動でテキストを小さなチャンクに分割します。モジュールはスライディングウィンドウ（重複部分を持つテキスト片）を使用し、境界に回答がある場合でも見逃さないようにします。回答が重複して検出された場合は、最高スコアの回答が返されます。

## モデルのライセンス

`qna-transformers` モジュールは複数のモデルと互換性があり、それぞれ独自のライセンスを持ちます。詳細は使用するモデルのライセンスを [Hugging Face Hub](https://huggingface.co/models) でご確認ください。

ライセンス条件が意図する用途に適しているかどうかを評価する責任はユーザーにあります。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

