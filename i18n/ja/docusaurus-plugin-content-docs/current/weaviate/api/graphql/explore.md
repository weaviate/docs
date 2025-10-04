---
title: Explore 関数
sidebar_position: 99
description: "単一の推論モジュールが有効な場合にデータ間の関連性を発見するための Explore 関数リファレンス。"
image: og/docs/api.jpg
# tags: ['graphql', 'explore{}']
---

:::note ベクトル空間と Explore

複数の推論モジュール（例: `text2vec-xxx`）が有効な場合、`Explore` 関数は無効になります。

そのため、AWS、Cohere、Google、OpenAI など複数の推論モジュールが事前構成されている Weaviate Cloud (WCD) では `Explore` を利用できません。

:::

`Explore` を使用して、複数のコレクションにまたがる ベクトル 検索を実行できます。なお、`Explore` は現在 gRPC API では利用できません。

### 要件

`Explore` を利用するには次の要件を満たす必要があります。

- Weaviate インスタンスに設定できる ベクトライザー モジュールは最大 1 つまでです（例: `text2vec-transformers`, `text2vec-openai`）。
- 各 `Explore` クエリは `nearText` または `nearVector` を使用した ベクトル 検索のみ実行できます。

## `Explore` クエリ

### `Explore` の構造と構文

`Explore` 関数の構文は次のとおりです。

```graphql
{
  Explore (
    limit: <Int>,              # The maximum amount of objects to return
    nearText: {                # Either this or 'nearVector' is required
      concepts: [<String>]!,   # Required - An array of search items. If the text2vec-contextionary is the vectorization module, the concepts should be present in the Contextionary.
      certainty: <Float>,      # Minimal level of certainty, computed by normalized distance
      moveTo: {                # Optional - Giving directions to the search
        concepts: [<String>]!, # List of search items
        force: <Float>!        # The force to apply for a particular movement. Must be between 0 (no movement) and 1 (largest possible movement).
      },
      moveAwayFrom: {          # Optional - Giving directions to the search
        concepts: [<String>]!, # List of search items
        force: <Float>!        # The force to apply for a particular movement. Must be between 0 (no movement) and 1 (largest possible movement).
      }
    },
    nearVector: {              # Either this or 'nearText' is required
      vector: [<Float>]!,      # Required - An array of search items, which length should match the vector space
      certainty: <Float>       # Minimal level of certainty, computed by normalized distance
    }
  ) {
    beacon
    certainty                  # certainty value based on a normalized distance calculation
    className
  }
}
```

クエリ例:

import GraphQLExploreVec from '/_includes/code/graphql.explore.vector.mdx';

<GraphQLExploreVec/>

結果例:

```json
{
  "data": {
    "Explore": [
      {
        "beacon": "weaviate://localhost/7e9b9ffe-e645-302d-9d94-517670623b35",
        "certainty": 0.975523,
        "className": "Publication"
      }
    ]
  },
  "errors": null
}
```

### 検索オペレーター

`nearText` と `nearVector` オペレーターは、他のクエリと同様に `Explore` でも動作します。詳細は [検索オペレーター](search-operators.md) を参照してください。

### フィルター

`Explore` クエリはフィルターと組み合わせることができます。詳細は [フィルター](filters.md) を参照してください。

### ページネーション

`Explore` クエリでは、ページネーション（`limit` と `offset`）は使用できません。

#### 移動

多次元ストレージではページネーションができないため、さらなるクエリの洗練が必要な場合は `moveTo` と `moveAwayFrom` の使用を推奨します。これらは他のクエリと同様に動作します。詳細は [検索オペレーター#nearText](search-operators.md#neartext) を参照してください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

