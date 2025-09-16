---
title: "Contextionary ベクトライザー"
description: Weaviate で Text2Vec Contextionary を使用し、コンテキストに基づくテキスト ベクトル化を向上させます。
sidebar_position: 10
image: og/docs/modules/text2vec-contextionary.jpg
# tags: ['text2vec', 'text2vec-contextionary', 'contextionary']
---

`text2vec-contextionary` モジュールを使用すると、軽量モデルでローカルにベクトルを取得できます。

:::caution Deprecated module
`Contextionary` モデルは古く、どのユースケースにも推奨されません。代わりに他のモジュールをご利用ください。

ローカルかつ軽量なモデルをテストや開発目的でお探しの場合は、[`text2vec-model2vec` モジュール](../model-providers/model2vec/embeddings.md) をお試しください。

本番環境などでベクトル品質が重要な場合は、よりモダンな Transformer ベースのアーキテクチャを採用している[他のモデル統合](../model-providers/index.md)を推奨します。
:::

主なポイント:

- このモジュールは Weaviate Cloud (WCD) では利用できません。
- モジュールを有効にすると、[`nearText` 検索オペレーター](/weaviate/api/graphql/search-operators.md#neartext) が使用可能になります。
- このモジュールは FastText に基づき、語彙の重み付き平均 (WMOWE) を使用してベクトルを生成します。
- 複数言語に対応しています。

## Weaviate インスタンス設定

:::info Not applicable to WCD
このモジュールは Weaviate Cloud では利用できません。
:::

### Docker Compose ファイル

`text2vec-contextionary` を使うには、Docker Compose ファイル (例: `docker-compose.yml`) で有効化する必要があります。

:::tip Use the configuration tool
手動でも設定できますが、[`Weaviate` 設定ツール](/deploy/installation-guides/docker-installation.md#configurator)を使用して `Docker Compose` ファイルを生成することを推奨します。
:::

#### パラメーター

Weaviate:

- `ENABLE_MODULES` (必須): 有効にするモジュール。`text2vec-contextionary` を含めてください。
- `DEFAULT_VECTORIZER_MODULE` (任意): 既定のベクトライザーモジュール。`text2vec-contextionary` を設定すると、すべてのクラスで既定になります。

Contextionary:

* `EXTENSIONS_STORAGE_MODE`: Contextionary の拡張を保存する場所  
* `EXTENSIONS_STORAGE_ORIGIN`: カスタム拡張ストレージのホスト  
* `NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE`: 非常にまれな単語を非表示にできます。たとえば `5` を設定すると、出現頻度の第 5 パーセンタイルに当たる単語が最近傍探索 (GraphQL の `_additional { nearestNeighbors }` 機能など) から除外されます。  
* `ENABLE_COMPOUND_SPLITTING`: [こちら](#compound-splitting) を参照してください。  

#### 例

この設定では `text2vec-contextionary` を有効化し、既定のベクトライザーとして設定し、Contextionary 用 Docker コンテナのパラメーターを指定しています。

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
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      # highlight-start
      ENABLE_MODULES: 'text2vec-contextionary'
      # highlight-end
      CLUSTER_HOSTNAME: 'node1'
  # highlight-start
  contextionary:
    environment:
      OCCURRENCE_WEIGHT_LINEAR_FACTOR: 0.75
      EXTENSIONS_STORAGE_MODE: weaviate
      EXTENSIONS_STORAGE_ORIGIN: http://weaviate:8080
      NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE: 5
      ENABLE_COMPOUND_SPLITTING: 'false'
    image: cr.weaviate.io/semitechnologies/contextionary:en0.16.0-v1.2.1
    ports:
    - 9999:9999
  # highlight-end
...
```

## コレクション設定

各クラスでのモジュール動作は、[コレクション設定](../manage-collections/vector-config.mdx)で制御できます。

### ベクトル化設定

クラスおよびプロパティごとに、`moduleConfig` セクションでベクトライザーの動作を設定できます。

#### クラスレベル

- `vectorizer` – データのベクトル化に使用するモジュール  
- `vectorizeClassName` – クラス名をベクトル化するかどうか。既定値: `true`  

#### プロパティレベル

- `skip` – プロパティのベクトル化を完全にスキップするかどうか。既定値: `false`  
- `vectorizePropertyName` – プロパティ名をベクトル化するかどうか。既定値: `false`  

#### 例

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-contextionary",
      "moduleConfig": {
        // highlight-start
        "text2vec-contextionary": {
          "vectorizeClassName": false
        }
        // highlight-end
      },
      "properties": [
        {
          "name": "content",
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          // highlight-start
          "moduleConfig": {
            "text2vec-contextionary": {
              "skip": false,
              "vectorizePropertyName": false
            }
          }
          // highlight-end
        }
      ],
    }
  ]
}
```

### クラス / プロパティ名

このモジュールを使用し、クラス名やプロパティ名をベクトル化する場合、それらの名前は `text2vec-contextionary` に含まれている必要があります。

複数語をクラスまたはプロパティ定義に使用する場合は、以下のように結合してください。
- クラス名やプロパティ名: camelCase (例: `bornIn`)  
- プロパティ名: snake_case (例: `born_in`)  

たとえば、次の例はすべて有効です。

```yaml
Publication
  name
  hasArticles
Article
  title
  summary
  wordCount
  url
  hasAuthors
  inPublication        # CamelCase (all versions)
  publication_date     # snake_case (from v1.7.2 on)
Author
  name
  wroteArticles
  writesFor
```

## 使用例

`text2vec-contextionary` を使った `nearText` クエリの例です。

import CodeNearText from '/_includes/code/graphql.filters.nearText.mdx';

<CodeNearText />

## 追加情報

### コンセプトの検索

概念や単語を検索したり、コンセプトが Contextionary に含まれているか確認したりするには、`v1/modules/text2vec-contextionary/concepts/<concept>` エンドポイントを使用します。

```js
GET /v1/modules/text2vec-contextionary/concepts/<concept>
```

#### パラメーター

唯一のパラメーター `concept` は文字列で、複合語の場合は camelCase、または単語のリストを指定します。

#### レスポンス
<!-- TODO: (phase 2) can we make a list of parameters like this look better? -->
結果には以下のフィールドが含まれます:
- `"individualWords"`: クエリ内の各単語またはコンセプトの結果リスト  
  - `"word"`: 要求したコンセプトまたは単語  
  - `"present"`: 単語が Contextionary に存在する場合は `true`  
  - `"info"`: 次のフィールドを持つオブジェクト  
    - `""nearestNeighbors"`: 最近傍のリストで、`"word"` と高次元空間での `"distance"` を含みます。`"word"` にはデータオブジェクトが含まれる場合もあります。  
    - `"vector"`: 300 次元の生ベクトル値  
  - `"concatenatedWord"`: 結合されたコンセプトのオブジェクト  
    - `"concatenatedWord"`: 指定したコンセプトが camelCase の場合、その結合語  
      - `"singleWords"`: 結合コンセプト内の単語リスト  
      - `"concatenatedVector"`: 結合コンセプトのベクトル値リスト  
      - `"concatenatedNearestNeighbors"`: 最近傍のリストで、`"word"` と高次元空間での `"distance"` を含みます。`"word"` にはデータオブジェクトが含まれる場合もあります。

#### 例

```bash
curl http://localhost:8080/v1/modules/text2vec-contextionary/concepts/magazine
```

または ( camelCased の複合コンセプトである点に注意してください)

import CodeContextionary from '/_includes/code/contextionary.get.mdx';

<CodeContextionary />

結果は次のようになります:

```json
{
  "individualWords": [
    {
      "inC11y": true,
      "info": {
        "nearestNeighbors": [
          {
            "word": "magazine"
          },
          {
            "distance": 6.186641,
            "word": "editorial"
          },
          {
            "distance": 6.372504,
            "word": "featured"
          },
          {
            "distance": 6.5695524,
            "word": "editor"
          },
          {
            "distance": 7.0328364,
            "word": "titled"
          },
          ...
        ],
        "vector": [
          0.136228,
          0.706469,
          -0.073645,
          -0.099225,
          0.830348,
          ...
        ]
      },
      "word": "magazine"
    }
  ]
}
```

### モデル詳細

`text2vec-contextionary` (Contextionary) は、Wiki と CommonCrawl データに対して [fastText](https://fasttext.cc/) を用いて学習された Weaviate 独自の言語 ベクトライザー です。

`text2vec-contextionary` モデルは 300 次元の ベクトル を出力します。この ベクトル は Weighted Mean of Word Embeddings (WMOWE) 手法によって計算されます。

この ベクトル は、元の学習テキストコーパスにおける各単語の出現回数で重み付けされた単語のセントロイドに基づいて計算されます (例: 単語 `"has"` は 単語 `"apples"` よりも重要度が低いと見なされます)。

![contextionary を用いたデータから ベクトル への変換](./img/data2vec-c11y.svg "contextionary を用いたデータから ベクトル への変換")

### 利用可能な言語

Contextionary モデルは以下の言語で利用できます:

* CommonCrawl と Wiki を用い、GloVe で学習
  * English
  * Dutch
  * German
  * Czech
  * Italian
* Wiki で学習
  * English
  * Dutch

### Contextionary の拡張

カスタムの単語や略語 (すなわち「コンセプト」) は、`v1/modules/text2vec-contextionary/extensions/` エンドポイントを通じて `text2vec-contextionary` に追加できます。

このエンドポイントを使用すると、[transfer learning](https://en.wikipedia.org/wiki/Transfer_learning) により、独自の単語・略語・コンセプトを Contextionary にコンテキストごと追加して拡充できます。`v1/modules/text2vec-contextionary/extensions/` エンドポイントを使用すると、コンセプトはリアルタイムで追加または更新されます。

データを追加する前に新しいコンセプトを Weaviate に導入する必要があります。そうしないと Weaviate が ベクトル を自動更新することはありません。

#### パラメーター

Contextionary に追加したい拡張単語または略語を持つボディ (JSON または YAML) には、以下のフィールドを含めます:
- `"concept"`: 単語、複合語、略語を指定する文字列
- `"definition"`: コンセプトのコンテキストを作成し、高次元 Contextionary 空間に配置するための明確な説明
- `"weight"`: コンセプトの相対的重みを表す float 値 (Contextionary 既定のコンセプトは 1.0)

#### レスポンス

拡張が成功すると、入力パラメーターと同じフィールドがレスポンスボディに含まれます。

#### 例

コンセプト `"weaviate"` を Contextionary に追加してみましょう。

import CodeContextionaryExtensions from '/_includes/code/contextionary.extensions.mdx';

<CodeContextionaryExtensions />

新しいコンセプトが Contextionary に存在するかは、いつでも確認できます:

```bash
curl http://localhost:8080/v1/modules/text2vec-contextionary/concepts/weaviate
```

なお、連結語や複数単語から成るコンセプトで Contextionary を拡張することは (まだ) できません。

このエンドポイントで既存のコンセプトを上書きすることも可能です。たとえば、`Application Programming Interface` ではなく `Academic Performance Index` を表す略語 `API` を使用しており、このコンセプトを Contextionary で再配置したい場合は次のようにします:

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "concept": "api",
    "definition": "Academic Performance Index a measurement of academic performance and progress of individual schools in California",
    "weight": 1
  }' \
  http://localhost:8080/v1/modules/text2vec-contextionary/extensions
```

これで `API` の意味があなたの Weaviate 環境で変更されました。

### ストップワード

camelCased や CamelCased の名前からは、ストップワードが自動的に削除されます。

<!-- ### What stopwords are and why they matter

Stopwords are words that don't add semantic meaning to your concepts and are extremely common in texts across different contexts. For example, the sentence "a car is parked on the street" contains the following stopwords: "a", "is", "on", "the". If we look at the sentence "a banana is lying on the table", you would find the exact same stop words. So in those two sentences, over 50% of the words overlap. Therefore they would be considered somewhat similar (based on the overall vector position).

However, if we remove stopwords from both sentences, they become "car parked street" and "banana lying table". Suddenly there are 0% identical words in the sentences, so it becomes easier to perform vector comparisons. Note at this point we cannot say whether both sentences are related or not. For this we'd need to know how close the vector position of the sentence "car parked street" is to the vector position of "banana lying table". But we do know that the result can now be calculated with a lot less noise. -->

#### ベクトル化の挙動

ストップワードは役立つ場合もあるため、完全に除外することを推奨するわけではありません。代わりに Weaviate は ベクトル化 の際にストップワードを取り除きます。

多くの場合、この処理は裏側で行われるため気付きませんが、検証エラーを引き起こす可能性があるいくつかのエッジケースがあります:

* camelCased のクラス名またはプロパティ名がストップワード **のみ** で構成されている場合、検証は失敗します。例: `TheInA` は無効ですが、`TheCarInAField` は有効です (内部では `CarField` として扱われます)。

* キーワードリストにストップワードが含まれている場合、それらは削除されます。ただし、すべてのキーワードがストップワードである場合、検証は失敗します。

#### Weaviate によるストップワードの判定方法

ストップワードのリストは使用している Contextionary バージョンから派生しており、Contextionary ファイルと一緒に公開されています。

### 複合語分割

Weaviate の Contextionary が、本来理解できるはずの単語から成る複合語を理解できないことがあります。この影響は、任意の複合語が許される言語 (オランダ語やドイツ語など) では大きく、複合語があまり一般的でない言語 (英語など) では小さくなります。

#### 効果

クラス `Post` のオブジェクトを `This is a thunderstormcloud` という内容でインポートすると仮定します。任意に複合された `thunderstormcloud` という単語は Contextionary に存在しません。そのため、オブジェクトの位置は Contextionary が認識する `"post", "this"` のみで決定されます (`"is"` と `"a"` はストップワードのため削除)。

`_interpretation` 機能を使ってこの内容がどのように ベクトル化 されたかを確認すると、次のようになります:

```json
"_interpretation": {
  "source": [
    {
      "concept": "post",
      "occurrence": 62064610,
      "weight": 0.3623903691768646
    },
    {
      "concept": "this",
      "occurrence": 932425699,
      "weight": 0.10000000149011612
    }
  ]
}
```

この制限を克服するには、オプションの **Compound Splitting Feature** を Contextionary で有効にします。これにより任意の複合語を理解し、オブジェクトを次のように解釈します:

  ```json
"_interpretation": {
  "source": [
    {
      "concept": "post",
      "occurrence": 62064610,
      "weight": 0.3623903691768646
    },
    {
      "concept": "this",
      "occurrence": 932425699,
      "weight": 0.10000000149011612
    },
    {
      "concept": "thunderstormcloud (thunderstorm, cloud)",
      "occurrence": 5756775,
      "weight": 0.5926488041877747
    }
  ]
}
  ```

新しく見つかった単語 ( `thunderstorm` と `cloud` から構成) が ベクトル化 で最も高い重みを持つ点に注意してください。Compound Splitting がなければ失われていたこの意味を、いまや認識できます。

#### 有効化方法

`text2vec-contextionary` の Docker Compose ファイルで Compound Splitting を有効にできます。設定方法の詳細は [こちら](#compound-splitting) をご覧ください。

#### インポート速度と単語認識のトレードオフ

Compound Splitting は、通常は認識されない単語に対して実行されます。データセットによっては、インポート時間が最大で 100% 長くなる可能性があります。そのため、より高い認識精度と高速なインポートのどちらがご利用のユースケースにとって重要かを慎重に評価してください。この機能のメリットは言語によって異なり（例：オランダ語やドイツ語では大きく、英語では小さい）、デフォルトではオフになっています。

### ノイズ フィルタリング

「ノイズ ワード」とは、容易に意味を判別できないランダムな単語の連結語を指します。これらの単語は Contextionary の学習空間に存在しますが、極めてまれであるためランダムに分布しています。その結果、最近傍検索に依存する機能（追加プロパティ `nearestNeighbors` または `semanticPath`）でクエリを実行すると、こうしたノイズ ワードが直近の近傍として返される場合があります。

このノイズに対処するため、Contextionary には近傍フィルタリング機能が導入されており、学習セット内での出現回数に基づいて下位パーセンタイルの単語を無視します。デフォルトでは下位 5 パーセンタイルが除外対象です。この設定は上書き可能で、たとえば下位 10 パーセンタイルを無視したい場合は、Docker Compose ファイルで `text2vec-contextionary` コンテナに環境変数 `NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE=10` を指定してください。

## モデル ライセンス

`text2vec-contextionary` モジュールは、MIT ライセンスで公開されている [`fastText`](https://github.com/facebookresearch/fastText/tree/main) ライブラリに基づいています。詳細については [license file](https://github.com/facebookresearch/fastText/blob/main/LICENSE) をご確認ください。

本ライブラリのライセンス条件が、ご利用目的に適切かどうかを評価する責任は利用者にあります。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

