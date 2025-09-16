---
title: DeepEval
sidebar_position: 2
image: og/integrations/home.jpg
---

[DeepEval](https://www.deepeval.com/) はオープンソースの LLM 評価フレームワークで、エンジニアが LLM アプリケーションや AI エージェントをユニットテストできるように設計されています。RAG、会話、レッドチーミング、エージェント指向、マルチモーダル、そしてカスタムメトリクスなど、すぐに使える LLM ベースのメトリクスを提供します。

## DeepEval と Weaviate
DeepEval のカスタムメトリクスおよび RAG メトリクスを活用することで、Weaviate の検索・リトリーバル・RAG を最適化し、`embedding model` や `top-K` など Weaviate コレクションのハイパーパラメーターを最良に調整できます。

### カスタムメトリクス 
1. [G-Eval](https://www.deepeval.com/docs/metrics-llm-evals)
2. [DAG](https://www.deepeval.com/docs/metrics-dag)

### RAG メトリクス 
1. [Answer Relevancy](https://www.deepeval.com/docs/metrics-answer-relevancy)
2. [Faithfulness](https://www.deepeval.com/docs/metrics-faithfulness)
3. [Contextual Precision](https://www.deepeval.com/docs/metrics-contextual-precision)
4. [Contextual Recall](https://www.deepeval.com/docs/metrics-contextual-recall)
5. [Contextual Relevancy](https://www.deepeval.com/docs/metrics-contextual-relevancy)

## ハンズオン学習

| トピック | 説明 | リソース |
| --- | --- | --- |
| DeepEval で RAG を最適化 | この Notebook では、Weaviate を使用して RAG パイプラインを構築し、そのパフォーマンスを DeepEval で最適化する方法を示します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/operations/deepeval/rag_evaluation_deepeval.ipynb) |


