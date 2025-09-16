---
title: Ref2Vec Centroid ベクトライザー
description: Ref2Vec Centroid でより強力なデータ表現を用いた ベクトル 検索を強化します。
sidebar_position: 25
image: og/docs/modules/ref2vec-centroid.jpg
# tags: ['ref2vec', 'ref2vec-centroid', 'centroid']
---

## 概要

`ref2Vec-centroid` モジュールは、参照先 ベクトル の重心 (centroid) を基にオブジェクトの ベクトル を計算するために使用します。この重心 ベクトル は、オブジェクトが参照する ベクトル から算出され、オブジェクト群のクラスタ間の関連付けを可能にします。これは、ユーザーの行動や嗜好を集約して提案を行うようなアプリケーションに役立ちます。

## 有効化方法

### Weaviate Cloud

このモジュールは WCD ではデフォルトで有効になっています。

### Weaviate Database

どのモジュールを Weaviate インスタンスで使用するかは、`Docker Compose` ファイルで指定できます。`ref2Vec-centroid` を追加するには次のようにします:

```yaml
---
services:html
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
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'ref2vec-centroid'
      CLUSTER_HOSTNAME: 'node1'
...
```

## 設定方法

Weaviate スキーマ内で、このモジュールがデータをどのように ベクトル 化するかを定義する必要があります。Weaviate のスキーマに不慣れな場合は、まず [Weaviate スキーマに関するチュートリアル](../starter-guides/managing-collections/index.mdx) をご覧ください。

例えば、`ref2vec-centroid` を使用するように設定された `Article` クラスは次のとおりです。これにはクラス レベルの `moduleConfig` で 2 つのフィールドを指定するだけで済みます:

1. `referenceProperties`: 重心計算に使用する参照プロパティのリスト  
2. `method`: 重心を計算する方法。現在は `mean` のみサポートされています。

`Article` クラスでは、`hasParagraphs` プロパティを唯一の参照プロパティとして指定し、`Article` オブジェクトの ベクトル を計算します。

他のベクトライザー モジュール（例: text2vec / multi2vec / img2vec）とは異なり、ref2vec-centroid はオブジェクトの内容から埋め込みを生成しない点に注意してください。本モジュールの目的は、オブジェクトが *参照する* ベクトル を基にオブジェクト自身の ベクトル を計算することです。

この例では、`Paragraph` クラスは text2vec-contextionary モジュールで ベクトル を生成するように設定されています。そのため、`Article` クラスの ベクトル 埋め込みは、参照された `Paragraph` インスタンスから取得した text2vec-contextionary ベクトル の平均になります。

この例では `Paragraph` クラスの ベクトル 生成に text2vec-contextionary を使用していますが、ユーザーが独自に用意した ベクトル を使用する場合でも ref2vec-centroid の挙動は同じです。その場合でも、ref2vec-centroid の出力は参照 ベクトル の平均として計算され、参照 ベクトル の由来だけが異なります。

```json
{
  "classes": [
    {
      "class": "Article",
      "description": "A class representing a published article",
      "moduleConfig": {
        "ref2vec-centroid": {
          "referenceProperties": ["hasParagraphs"],
          "method": "mean"
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Title of the article",
          "name": "title"
        }
        ,
        {
          "dataType": [
            "Paragraph"
          ],
          "description": "Paragraphs belonging to this article",
          "name": "hasParagraphs"
        }
      ],
      "vectorizer": "ref2vec-centroid"
    },
    {
      "class": "Paragraph",
      "description": "Paragraphs belonging to an Article",
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          "moduleConfig": {
            "text2vec-contextionary": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "name": "content"
        }
      ],
      "vectorizer": "text2vec-contextionary"
    }
  ]
}
```

## 利用方法

`Article` クラスを ref2vec-centroid モジュールで正しく設定できたので、オブジェクトの作成を始められます。まだ参照する `Paragraph` オブジェクトが存在しない場合、あるいは `Paragraph` オブジェクトをまだ参照したくない場合は、新しく作成した `Article` オブジェクトの ベクトル は `nil` に設定されます。

既存の（`nil` ではない ベクトル を持つ）`Paragraph` オブジェクトを 1 つ以上参照すると、`Article` オブジェクトには自動的に重心 ベクトル が割り当てられます。この ベクトル は、`Article` オブジェクトが参照するすべての `Paragraph` オブジェクトの ベクトル から計算されます。

### 重心の更新

ref2vec-centroid を使用するよう設定されたクラスのオブジェクトは、以下のイベントが発生したときに ベクトル が計算（再計算）されます:
- 参照を含むプロパティを設定した状態でオブジェクトを作成したとき  
  - Object `POST`: 参照付きで 1 件のオブジェクトを作成  
  - Batch object `POST`: 複数のオブジェクトを一度に作成し、それぞれに参照を付与
- 既存のオブジェクトの参照リストを更新したとき。これには複数の方法があります:  
  - Object `PUT`: オブジェクトのすべてのプロパティを新しい参照セットで更新（既存の参照リストを完全に置き換え）  
  - Object `PATCH`: 既存のオブジェクトに新しい参照を追加  
  - Reference `POST`: 既存のオブジェクトに対して新しい参照を作成  
  - Reference `PUT`: オブジェクトのすべての参照を更新
- オブジェクトから参照を削除したとき。これには複数の方法があります:  
  - Object `PUT`: オブジェクトのすべてのプロパティを更新し、すべての参照を削除  
  - Reference `DELETE`: オブジェクトの参照リストから既存の参照を削除

**注意:** 参照をバッチで追加することは現在サポートされていません。バッチ参照機能は ベクトル インデックスの更新コストを回避するために設計されているためです。もしこのユースケースが重要な場合は、GitHub で [feature request](https://github.com/weaviate/weaviate/issues/new) を作成してください。

### クエリの実行

このモジュールは、既存の [nearVector](/weaviate/api/graphql/search-operators.md#nearvector) フィルターおよび [`nearObject`](/weaviate/api/graphql/search-operators.md#nearobject) フィルターと組み合わせて使用できます。`nearText` のような追加の GraphQL 拡張は提供しません。

## 追加情報

:::caution
注意: _参照先_ オブジェクトを更新しても、_参照元_ オブジェクトの ベクトル は自動的には更新されません。
:::

言い換えると、前述の `Article` / `Paragraph` の例を用いると:

`"On the Philosophy of Modern Ant Colonies"` という `Article` オブジェクトが `"intro"`, `"body"`, `"conclusion"` の 3 つの `Paragraph` オブジェクトを参照しているとします。時間の経過とともに、働きアリと兵隊アリのダイナミクスに関する研究が進み、`"body"` が更新されるかもしれません。この場合でも、記事の既存 ベクトル は、リファクタリングされた `"body"` に基づいて自動的に更新されることはありません。

`"On the Philosophy of Modern Ant Colonies"` の重心 ベクトル を再計算したい場合は、何らかの形で更新をトリガーする必要があります。例えば、`"body"` への参照を一度削除してから再追加する、あるいは同一内容のまま `Article` オブジェクトを `PUT` するなどの方法です。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

