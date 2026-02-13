---
title: スペルチェック
description: Weaviate にスペルチェックを統合してテキストデータの品質と検索精度を向上させます。
sidebar_position: 70
image: og/docs/modules/text-spellcheck.jpg
# tags: ['modules', 'other modules', 'spellcheck']
---


## 要点

* Spell Check モジュールは、 GraphQL クエリ内の生テキストのスペルをチェックする Weaviate のモジュールです。  
* このモジュールは Python のスペルチェックライブラリに依存します。  
* このモジュールは GraphQL の `nearText {}` 検索引数に `spellCheck {}` フィルターを追加します。  
* このモジュールはスペルチェックの結果を GraphQL の `_additional { spellCheck {} }` フィールドで返します。  

## 概要

Spell Check モジュールは、 GraphQL クエリ入力内の生テキストのスペルをチェックする Weaviate のモジュールです。 [Python spellchecker](https://pypi.org/project/pyspellchecker/) ライブラリを使用してテキストを解析し、提案を行い、自動補正を強制できます。  

## 有効化方法（モジュール設定）

### Docker Compose

Spell Check モジュールは Docker Compose ファイルにサービスとして追加できます。 `text2vec-contextionary` や `text2vec-transformers` などのテキスト ベクトライザーが稼働している必要があります。 `text2vec-contextionary` と併用して `text-spellcheck` モジュールを使うための例として、以下の Docker Compose ファイルがあります:  

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
      SPELLCHECK_INFERENCE_API: "http://text-spellcheck:8080"
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'text2vec-contextionary,text-spellcheck'
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
  text-spellcheck:
    image: cr.weaviate.io/semitechnologies/text-spellcheck-model:pyspellchecker-d933122
...
```

変数の説明:  
* `SPELLCHECK_INFERENCE_API`: Spell Check モジュールが稼働している場所  

## 利用方法（GraphQL）

Spell Check モジュールを利用して、クエリ時にユーザー入力の検索クエリが正しく綴られているか確認し、正しい綴りの候補を提案できます。クエリテキストを受け付けるフィルターには以下があります:

* [`nearText`](/weaviate/api/graphql/search-operators.md#neartext) （ `text2vec-*` モジュールを使用している場合）  
* `ask` （ [`qna-transformers`](./qna-transformers.md) モジュールが有効な場合）  

このモジュールには、スペルチェックと自動補正の 2 つの使い方があります。

### スペルチェック

このモジュールは、提供されたクエリをチェック（変更はしない）するために使用できる新しい GraphQL `_additional` プロパティを提供します。

#### クエリ例

import SpellCheckModule from '/_includes/code/spellcheck-module.mdx';

<SpellCheckModule/>

#### GraphQL レスポンス

結果は `spellCheck` という新しい GraphQL `_additional` プロパティに含まれます。含まれるフィールドは次のとおりです:  
* `changes`: 以下のフィールドを持つリスト  
  * `corrected` (`string`): 修正された綴り（修正が見つかった場合）  
  * `original` (`string`): クエリ内の元の単語  
* `didYouMean`: クエリ内の修正済み全文  
* `originalText`: クエリ内の元の全文  
* `location`: クエリ内で誤綴りがあった位置  

#### レスポンス例

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "spellCheck": [
              {
                "changes": [
                  {
                    "corrected": "housing",
                    "original": "houssing"
                  }
                ],
                "didYouMean": "housing prices",
                "location": "nearText.concepts[0]",
                "originalText": "houssing prices"
              }
            ]
          },
          "title": "..."
        }
      ]
    }
  },
  "errors": null
}
```

### 自動補正

このモジュールは既存の `text2vec-*` モジュールを拡張し、 `autoCorrect` フラグを追加します。これを使用すると、クエリの綴りが間違っている場合に自動的に修正できます。

#### クエリ例

```graphql
{
  Get {
    Article(nearText: {
      concepts: ["houssing prices"],
      autocorrect: true
    }) {
      title
      _additional {
        spellCheck {
          changes {
            corrected
            original
          }
          didYouMean
          location
          originalText
        }
      }
    }
  }
}
```


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

