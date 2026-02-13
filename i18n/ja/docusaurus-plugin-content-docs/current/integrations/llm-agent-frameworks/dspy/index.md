---
title: DSPy
sidebar_position: 1
image: og/docs/more-resources.jpg
---

[DSPy](https://github.com/stanfordnlp/dspy) は、Stanford NLP 発の言語モデルプログラミングフレームワークです。  

DSPy では 2 つの重要なコンセプト、**プログラミングモデル** と **オプティマイザー** が導入されています。

- **プログラミングモデル**: プログラミングモデルでは、言語モデルにリクエストを送る一連のコンポーネントを定義できます。コンポーネントには、入力フィールド・出力フィールド・タスク説明・Weaviate のような ベクトル データベースへの呼び出しなどが含まれます。

- **オプティマイザー**: オプティマイザーは DSPy プログラムをコンパイルし、言語モデルのプロンプトや重みをチューニングします。

## DSPy と Weaviate

Weaviate はリトリーバーモデル経由で DSPy と統合されています。

Weaviate クラスター（WCD またはローカルインスタンス）を DSPy に接続し、[リトリーバーモジュール](https://github.com/stanfordnlp/dspy/blob/6270e951b1f20b2cb02a3fdc769156e7e16dbd26/dspy/retrieve/weaviate_rm.py#L17) を使用してコレクションを渡します。

```python
weaviate_client = weaviate.Client("http://localhost:8080") # or pass in your WCD cluster url

retriever_module = WeaviateRM("WeaviateBlogChunk", # collection name
                    weaviate_client=weaviate_client)
```

## リソース
以下は、DSPy の活用方法について Weaviate チームが提供するリソースです。

リソースは 2 つのカテゴリに分かれています。  
1. [**Hands on Learning**](#hands-on-learning): エンドツーエンドのチュートリアルで技術的理解を深める  
2. [**Read and Listen**](#read-and-listen): コンセプト面の理解を深める  

### Hands on Learning 

| Topic | Description | Resource | 
| --- | --- | --- |
| DSPy での RAG 入門 | DSPy の概要とプログラムの構築方法を学習: インストール、設定、データセット、LLM メトリクス、DSPy プログラミングモデル、最適化。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/1.Getting-Started-with-RAG-in-DSPy.ipynb)、[Video](https://youtu.be/CEuUG4Umfxs?si=4Gp8gR9glmoMJNaU) |
| DSPy + Weaviate で次世代 LLM アプリを構築 | クエリからブログ記事を生成する 4 レイヤーの DSPy プログラムを構築。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/2.Writing-Blog-Posts-with-DSPy.ipynb)、[Video](https://youtu.be/ickqCzFxWj0?si=AxCbD9tq2cbAH6bB)|
| Persona 付き RAG | DSPy・Cohere・Weaviate を用いて、言語モデルにパーソナを追加する複合 AI システムを構築。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/fullstack-recipes/RAGwithPersona/4.RAG-with-Persona.ipynb)、[Post](https://twitter.com/ecardenas300/status/1765444492348243976)|
| RAG プログラムに深みを追加 | 独自の入出力例や複数 LLM を統合して DSPy プログラムを強化。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/3.Adding-Depth-to-RAG-Programs.ipynb)、[Video](https://youtu.be/0c7Ksd6BG88?si=YUF2wm1ncUTkSuPQ) |
| Hurricane: 生成フィードバックループでブログ記事を作成 | ブログ記事の生成フィードバックループをデモする Web アプリ Hurricane の紹介。 | [Notebook](https://github.com/weaviate-tutorials/Hurricane)、[Blog](https://weaviate.io/blog/hurricane-generative-feedback-loops) |
| DSPy での構造化出力 | DSPy プログラムで出力を構造化する 3 つの方法。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/4.Structured-Outputs-with-DSPy.ipynb)、[Video](https://youtu.be/tVw3CwrN5-8?si=P7fWeXzQ7p-2SFYF) |
| Cohere の Command R+ と DSPy・Weaviate で RAG 構築 | Command R+ の概要と DSPy での簡単な RAG デモ。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/llms/Command-R-Plus.ipynb)、[Video](https://youtu.be/6dgXALb_5Ag?si=nSX2AnmpbUau_2JF) |
| DSPy の高度なオプティマイザー | さまざまな手法で DSPy プログラムを最適化。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/5.Advanced-Optimizers.ipynb) |
| Llama 3 RAG デモ: DSPy 最適化・Ollama・Weaviate | Llama 3 を DSPy に統合し、MIPRO でプロンプトを最適化。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/llms/Llama3.ipynb)、[Video](https://youtu.be/1h3_h8t3L14?si=G4d-aY5Ynpv8ckea)|
| BigQuery と Weaviate を DSPy でオーケストレーション | BigQuery と Weaviate を使用したエンドツーエンドの RAG パイプラインを DSPy で構築。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/cloud-hyperscalers/google/bigquery/BigQuery-Weaviate-DSPy-RAG.ipynb)|
| DSPy と Weaviate Query Agent | Query Agent を DSPy の Tool として利用 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/Query-Agent-as-a-Tool.ipynb) |

### Read and Listen

| Topic | Description | Resource | 
| --- | --- | --- |
| DSPy と ColBERT - Omar Khattab 登場！Weaviate Podcast #85 | Omar Khattab が登場し、DSPy と ColBERT について語ります。 | [Video](https://www.youtube.com/watch?v=CDung1LnLbY) |
| DSPy Explained | DSPy のコアコンセプトを学習。イントロノートブックで Retrieve-Then-Read RAG と Multi-Hop RAG を実装。 | [Video](https://youtu.be/41EfOY0Ldkc?si=sFieUeHc9rXRn6uk)|
| XMC.dspy - Karel D'Oosterlinck 登場！Weaviate Podcast #87 | Karel D'Oosterlinck が IReRa（Infer-Retrieve-Rank）を解説。 | [Video](https://youtu.be/_ye26_8XPcs?si=ZBodgHbOcaq2Kwky)
| Intro to DSPy: Goodbye Prompting, Hello Programming | DSPy の概要と、LLM アプリにおける脆弱性問題の解決方法。 | [Blog](https://towardsdatascience.com/intro-to-dspy-goodbye-prompting-hello-programming-4ca1c6ce3eb9)|
| Fine-Tuning Cohere’s Reranker | DSPy で合成データを生成し、Cohere の reranker モデルをファインチューニング。 |[Blog](https://weaviate.io/blog/fine-tuning-coheres-reranker)|
| Your Language Model Deserves Better Prompting | プロンプトチューニング用 DSPy オプティマイザーの概要。 | [Blog](https://weaviate.io/blog/dspy-optimizers)|


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

