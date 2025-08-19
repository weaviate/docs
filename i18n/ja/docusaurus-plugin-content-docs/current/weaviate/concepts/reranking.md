---
title: リランキング
sidebar_position: 28
image: og/docs/concepts.jpg
# tags: ['basics']
---

リランキングは、検索で返された結果セットを別のモデルで並べ替えることで検索の関連性を向上させることを目指します。

リランキングはクエリと各データオブジェクトとの関連スコアを計算し、最も関連性が高いものから低いものの順に並べ替えたリストを返します。すべての `(query, data_object)` ペアに対してこのスコアを計算するのは通常、非常に時間がかかるため、リランキングはまず関連オブジェクトを取得した後の第 2 ステージとして使用されます。

リランカーは取得後のより小さなデータサブセットに対して動作するため、検索の関連性を高めるために、より計算コストの高いアプローチを採用することも可能です。

:::info

コレクションにリランカーを設定する方法は [こちら](../manage-collections/generative-reranker-models.mdx#specify-a-reranker-model-integration)、検索結果にリランキングを適用する方法は [こちら](../search/rerank.md) をご覧ください。

:::

##  Weaviate におけるリランキング

当社のリランカーモジュールを使用すると、  Weaviate から離れることなく [マルチステージ検索](https://weaviate.io/blog/cross-encoders-as-reranker) を簡単に実行できます。

言い換えると、たとえばベクトル検索を実行し、その検索結果をリランカーで再ランク付けできます。リランカーモジュールは、ベクトル検索、  BM25 検索、およびハイブリッド検索のすべてに対応しています。

###  Reranker を使用した GraphQL クエリの例

以下のように、GraphQL クエリでリランキングを利用できます。

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

このクエリは `JeopardyQuestion` クラスから 10 件の結果を取得し、クエリ “flying” を用いたハイブリッド検索を行います。その後、`answer` プロパティを使い、クエリ “floating” で結果を再ランク付けします。

リランカーに渡す `JeopardyQuestion` クラスの `property` を指定できます。ここで返される `score` にはリランカーのスコアが含まれる点にご注意ください。

##  参考リソース

:::info Related pages
- [API 参照: GraphQL - Additional properties](../api/graphql/additional-properties.md#rerank)
- [How-to 検索: Rerank](../search/rerank.md)
- [Cohere リランカー統合](../model-providers/cohere/reranker.md)
- [Transformers リランカー統合](../model-providers/transformers/reranker.md)
- [VoyageAI リランカー統合](../model-providers/voyageai/reranker.md)
:::

##  ご質問・フィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>