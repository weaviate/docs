---
title: Databricks
sidebar_position: 3
image: og/integrations/home.jpg
---

[Databricks](https://www.databricks.com/) は、レイクハウス上でデータ、 AI 、ガバナンスを統合するデータインテリジェンスプラットフォームです。

## Databricks と Weaviate

 Databricks の Foundation Model API は Weaviate から直接呼び出すことができ、`text2vec-databricks` と `generative-databricks` モジュールを通じて Databricks プラットフォーム上にホストされたモデルを利用できます。

## Spark Connector and Weaviate

[Apache Spark](https://spark.apache.org/docs/latest/api/python/index.html)（または Python API である [PySpark](https://spark.apache.org/docs/latest/api/python/index.html#:~:text=PySpark%20is%20the%20Python%20API,for%20interactively%20analyzing%20your%20data.)）は、リアルタイムかつ大規模なデータ処理に用いられるオープンソースのデータ処理フレームワークです。 

 Databricks から Spark のデータ構造を Weaviate に取り込むには、 Weaviate Spark コネクターを使用します。コネクターの詳細は Weaviate Spark コネクターのリポジトリをご覧ください。

## 参考リソース 
以下のリソースは 2 つのカテゴリに分かれています:  
1. [**Hands on Learning**](#hands-on-learning): エンドツーエンドのチュートリアルで技術的理解を深めます。  
2. [**Read and Listen**](#read-and-listen): これらのテクノロジーに関する概念的理解を深めます。  

### Hands on Learning

| トピック | 説明 | リソース | 
| --- | --- | --- |
| Weaviate チュートリアル | Spark を使用して Weaviate にデータを取り込む方法を学びます。 | [Tutorial](/weaviate/tutorials/spark-connector) |
| Weaviate 用 Spark コネクターの使用 | Spark データフレームからデータを取得して Weaviate に投入する方法を学びます。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/data-platforms/spark/spark-connector.ipynb) |
| Spark から Weaviate へのデータ取り込み | Spark データフレームから Weaviate へデータを取り込み、`text2vec-databricks` と `generative-databricks` モジュールを使用する方法を学びます。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/data-platforms/databricks/databricks-spark-connector.ipynb) |

### Read and Listen 

| トピック | 説明 | リソース | 
| --- | --- | --- |
| Weaviate での Sphere データセット | Sphere データセットを Weaviate にインポートしてクエリする方法を学びます。 | [Blog](https://weaviate.io/blog/sphere-dataset-in-weaviate) |
| Weaviate での Sphere データセットの詳細 | 約 10 億件の記事スニペットを Weaviate に取り込んだ詳細を解説します。 | [Blog](https://weaviate.io/blog/details-behind-the-sphere-dataset-in-weaviate) |
| Weaviate と Databricks でスケーラブルな Gen AI データパイプラインを構築 | Weaviate と Databricks を用いて大規模な生成 AI データパイプラインを構築する方法を学びます。 | [Blog](https://weaviate.io/blog/genai-apps-with-weaviate-and-databricks) |


