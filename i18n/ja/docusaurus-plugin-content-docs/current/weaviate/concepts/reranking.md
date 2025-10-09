---
title: リランキング
sidebar_position: 28
description: "検索結果の関連性と精度を向上させるために、別モデルを用いて結果を並べ替える手法。"
image: og/docs/concepts.jpg
# tags: ['basics']
---

リランキングは、検索で返された結果セットを別のモデルで並べ替えることにより、検索の関連性を改善します。

リランキングはクエリと各データオブジェクトとの関連度スコアを計算し、最も関連性の高いものから低いものへ並べ替えたリストを返します。すべての `(query, data_object)` ペアでこのスコアを計算することは通常非常に時間がかかるため、リランキングはまず関連オブジェクトを取得した後の第 2 段階として使用されます。

リランキングは取得後の小さなデータサブセットに対して動作するため、計算コストが高いアプローチを用いても検索関連性を改善できます。

:::info

コレクションに対して [リランキングモデルを設定](../manage-collections/generative-reranker-models.mdx#specify-a-reranker-model-integration) し、[検索結果にリランキングを適用](../search/rerank.md) する方法をご覧ください。

:::

## Weaviate におけるリランキング

当社のリランキングモジュールを使用すると、Weaviate 内で簡単に [マルチステージ検索](https://weaviate.io/blog/cross-encoders-as-reranker) を実行できます。

言い換えると、例えばベクトル検索を実行し、その結果をリランキングで再度並べ替えることができます。リランキングモジュールはベクトル検索、bm25 検索、ハイブリッド検索のすべてと互換性があります。

### リランキングを含む GraphQL クエリ例

以下のように GraphQL クエリでリランキングを利用できます。

```graphql
{
  Get {
    JeopardyQuestion(
      nearText: {
        concepts: "flying"
      }
      limit: 10
    ) {
      answer
      question
      _additional {
        distance
        rerank(
          property: "answer"
          query: "floating"
        ) {
          score
        }
      }
    }
  }
}
```

このクエリは `JeopardyQuestion` クラスから 10 件の結果を取得し、クエリ “flying” を用いたハイブリッド検索を実行します。その後、`answer` プロパティとクエリ “floating” を使って結果を再ランク付けします。

リランキングに渡す `JeopardyQuestion` クラスの `property` を指定できます。ここで返される `score` にはリランキングによるスコアが含まれる点に注意してください。

## さらなるリソース

:::info Related pages
- [API 参照: GraphQL - 追加プロパティ](../api/graphql/additional-properties.md#rerank)
- [検索の方法: リランキング](../search/rerank.md)
- [Cohere リランキング統合](../model-providers/cohere/reranker.md)
- [Transformers リランキング統合](../model-providers/transformers/reranker.md)
- [VoyageAI リランキング統合](../model-providers/voyageai/reranker.md)
:::

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>