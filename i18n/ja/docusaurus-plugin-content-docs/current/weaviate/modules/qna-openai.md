---
title: 質問応答 - OpenAI
sidebar_position: 41
image: og/docs/modules/qna-openai.jpg
# tags: ['qna', 'qna-openai', 'transformers', 'openai']
---

:::caution 新しいプロジェクトには OpenAI 生成統合がおすすめです
現在、 `qna-openai` は保守されておらず、 `gpt-3.5-turbo-instruct` などの古いモデルを使用しています。新しいプロジェクトでは、 `qna-openai` の代わりに [OpenAI 生成統合](../model-providers/openai/generative.md) を使用することをおすすめします。

さらに、この生成統合は汎用性が高く、質問応答に限定されない幅広いユースケースで利用できます。 `gpt-3.5-turbo-instruct` は必ずしも質問応答専用に学習されているわけではないため、 `qna-openai` が最適となるケースは限られています。
:::


## 概要

* OpenAI Question and Answer (Q&A) モジュールは、 OpenAI [completions endpoint](https://platform.openai.com/docs/api-reference/completions) または Azure OpenAI 相当のエンドポイントを通じてデータから回答を抽出するための Weaviate モジュールです。  
* このモジュールは、 Weaviate と共に稼働しているテキスト ベクトライザー モジュールに依存します。  
* GraphQL の `Get {}` クエリに `ask {}` オペレーターを追加します。  
* GraphQL の `_additional {}` フィールドに最大 1 件の回答を返します。  
* 最も高い `certainty` （信頼度）の回答が返されます。  
* Weaviate `v1.16.6` で追加されました。  

import OpenAIOrAzureOpenAI from '/_includes/openai.or.azure.openai.mdx';

<OpenAIOrAzureOpenAI/>

## はじめに

Question and Answer (Q&A) OpenAI モジュールは、データから回答を抽出するための Weaviate モジュールです。最も関連性の高いドキュメントから回答を抽出するために、 OpenAI の completions エンドポイントを使用します。

このモジュールは、 GraphQL の `Get{...}` クエリで検索オペレーターとして使用できます。 `qna-openai` モジュールは、指定されたクラスのデータオブジェクトから回答を探します。指定した `certainty` 範囲内で回答が見つかった場合、 GraphQL の `_additional { answer { ... } }` フィールドに返されます。回答は最大 1 件で、（オプションで設定した） `certainty` を上回っている場合のみ返されます。最も高い `certainty` （信頼度）を持つ回答が返されます。

## 推論 API キー

`qna-openai` を利用するには、 OpenAI または Azure OpenAI の API キーが必要です。

:::tip
使用するサービス（OpenAI または Azure OpenAI）に応じて、いずれか一方のキーを用意すれば十分です。
:::

## 組織名

:::info `v1.21.1` で追加
:::

OpenAI の組織名が必要なリクエストでは、クエリ時に HTTP ヘッダーへ次のように追加できます。  
- `"X-OpenAI-Organization": "YOUR-OPENAI-ORGANIZATION"` （OpenAI）

### Weaviate へのキー提供

API キーは次の 2 つの方法で設定できます。

1. **構成時** — Docker インスタンスの設定中に、`Docker Compose` ファイルの `environment` セクションへ `OPENAI_APIKEY` または `AZURE_APIKEY`（サービスに応じて）を追加します。例:

  ```yaml
  environment:
    OPENAI_APIKEY: 'your-key-goes-here'  # For use with OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
    AZURE_APIKEY: 'your-key-goes-here'  # For use with Azure OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
    ...
  ```

2. **実行時**（推奨） — リクエストヘッダーに `"X-OpenAI-Api-Key"` または `"X-Azure-Api-Key"` を指定します。Weaviate クライアントを使用する場合の例:

import ClientKey from '/_includes/code/core.client.openai.apikey.mdx';

<ClientKey />

## モジュール設定

:::tip
Weaviate Cloud (WCD) をご利用の場合、このモジュールはすでに有効化・設定済みです。WCD では設定を編集できません。
:::

### Docker Compose ファイル (Weaviate Database のみ)

`docker-compose.yml` などの Docker Compose ファイルで OpenAI Q&A モジュールを有効にできます。`ENABLE_MODULES` プロパティに `qna-openai`（および必要な他のモジュール）を追加します。

```
ENABLE_MODULES: 'text2vec-openai,qna-openai'
```

以下は、`qna-openai` モジュールと `text2vec-openai` を組み合わせて使用する完全な Docker 構成例です。

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
    image:
      cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
      - 8080:8080
      - 50051:50051
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'text2vec-openai,qna-openai'
      OPENAI_APIKEY: sk-foobar  # For use with OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
      OPENAI_ORGANIZATION: your-orgname  # For use with OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
      AZURE_APIKEY: sk-foobar  # For use with Azure OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
      CLUSTER_HOSTNAME: 'node1'
```

## スキーマ設定

### OpenAI と Azure OpenAI の違い

- **OpenAI** を利用する場合、`model` パラメーターは任意です。  
- **Azure OpenAI** を利用する場合、`resourceName` と `deploymentId` の設定が必須です。  

### モデルパラメーター

下記のパラメーターを通じて、モデルの追加設定も行えます。

### スキーマ例

次のスキーマ設定では、`Document` クラスで `qna-openai` モデルを使用します。

この設定では `gpt-3.5-turbo-instruct` モデルを指定しています。

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-openai",
      "moduleConfig": {
        "qna-openai": {
          "model": "gpt-3.5-turbo-instruct", // For OpenAI
          "resourceName": "<YOUR-RESOURCE-NAME>",  // For Azure OpenAI
          "deploymentId": "<YOUR-MODEL-NAME>",  // For Azure OpenAI
          "maxTokens": 16, // Applicable to both OpenAI and Azure OpenAI
          "temperature": 0.0,  // Applicable to both OpenAI and Azure OpenAI
          "topP": 1,  // Applicable to both OpenAI and Azure OpenAI
          "frequencyPenalty": 0.0,  // Applicable to both OpenAI and Azure OpenAI
          "presencePenalty": 0.0  // Applicable to both OpenAI and Azure OpenAI
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          "name": "content"
        }
      ]
    }
  ]
}
```

個々のパラメーターの使い方については [こちら](https://platform.openai.com/docs/api-reference/completions) を参照してください。

## 使い方

このモジュールは、 GraphQL の `Get{...}` クエリに `ask{}` という検索オペレーターを追加します。`ask{}` は以下の引数を受け取ります。

| フィールド | データ型 | 必須 | 例 | 説明 |
|- |- |- |- |- |
| `question`  | string | yes | `"What is the name of the Dutch king?"` | 回答を求める質問。 |
| `properties`  | list of strings | no | `["summary"]` | テキストを含むクラスのプロパティ。未指定の場合、すべてのプロパティが対象。 |

注意:

* GraphQL の `Explore { }` でも `ask` サーチャーは使えますが、結果は回答を含むオブジェクトへのビーコンのみです。そのため、質問で `nearText` セマンティック検索を行うのと実質的に同じで、抽出は行われません。  
* `'ask'` オペレーターは `'neaXXX'` 系オペレーターと同時に使用できません。  

### クエリ例

import CodeQNAOpenAIAsk from '/_includes/code/qna-openai.ask.mdx';

<CodeQNAOpenAIAsk/>



### GraphQL レスポンス

回答は、新しい GraphQL の `_additional` プロパティ `answer` に含まれます。`answer` には次のフィールドがあります。

* `hasAnswer` (`boolean`): 回答を見つけられたかどうか  
* `result` (nullable `string`): 回答が見つかった場合の回答。`hasAnswer==false` の場合は `null`  
* `property` (nullable `string`): 回答を含むプロパティ。`hasAnswer==false` の場合は `null`  
* `startPosition` (`int`): 回答が始まる文字オフセット。`hasAnswer==false` の場合は `0`  
* `endPosition` (`int`): 回答が終わる文字オフセット。`hasAnswer==false` の場合は `0`

注: レスポンスの `startPosition`、`endPosition`、`property` は常に存在するとは限りません。これらは入力テキストに対して大文字小文字を無視した文字列一致関数で計算されます。もしトランスフォーマーモデルが出力を異なる形式で返した場合 (例: 元の入力にはなかったトークン間にスペースを挿入するなど)、位置計算やプロパティの特定に失敗します。

### レスポンス例

```json
{
  "data": {
    "Get": {
      "Document": [
        {
          "_additional": {
            "answer": {
              "hasAnswer": true,
              "result": " Stanley Kubrick is an American filmmaker who is best known for his films, including \"A Clockwork Orange,\" \"Eyes Wide Shut,\" and \"The Shining.\""
            }
          }
        }
      ]
    }
  }
}
```

### トークン制限

入力トークン数がモデルの上限を超えた場合、モジュールは OpenAI API のエラーを返します。

## 仕組み (内部動作)

内部では 2 段階のアプローチを使用します。まず、質問の回答を含む可能性が最も高いドキュメント (Sentence、Paragraph、Article など) を見つけるためにセマンティック検索を行います。次に、Weaviate が OpenAI Completions エンドポイントへの外部呼び出しに必要なプロンプトを生成します。もっとも関連性の高いドキュメントを使ってプロンプトを作成し、OpenAI が回答を抽出します。結果は次の 3 つのいずれかです。

1. 質問に回答できず、回答が見つからなかった  
2. 回答は見つかったが、ユーザーが指定した最小確信度を満たさず破棄された (通常、ドキュメントがトピックに関連しているものの実際の回答が含まれていない場合)  
3. 望ましい確信度を満たす回答が見つかり、ユーザーに返される  

モジュールは内部でセマンティック検索を実行するため、`text2vec-...` モジュールが必要です。ただし、`qna-...` モジュールと同じタイプである必要はありません。たとえば、セマンティック検索には `text2vec-contextionary`、回答抽出には `qna-openai` を使用できます。

## 追加情報

### 利用可能なモデル

推奨モデル:

- `gpt-3.5-turbo-instruct`

以下のモデルは廃止予定です:

- `text-ada-001`
- `text-babbage-001`
- `text-curie-001`
- `text-davinci-002`
- `text-davinci-003`

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

