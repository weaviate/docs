---
title: Aryn
sidebar_position: 2
image: og/integrations/home.jpg
---

Aryn は AI によって強化された ETL システムで、言語モデル アプリケーションと ベクトル データベース向けに設計されています。 

Aryn には次の 2 つのコンポーネントがあります:  
* [Aryn Partitioning Service](https://sycamore.readthedocs.io/en/stable/aryn_cloud/accessing_the_partitioning_service.html)  
* [Sycamore](https://github.com/aryn-ai/sycamore)

## Aryn と Weaviate
Weaviate は Aryn でサポートされている [コネクター](https://sycamore.readthedocs.io/en/stable/sycamore/connectors/weaviate.html) です。

次のことができます:  
1. `write.weaviate()` を使用して [Weaviate に書き込む](https://sycamore.readthedocs.io/en/stable/sycamore/connectors/weaviate.html#writing-to-weaviate)  
2. `read.weaviate()` を使用して [Weaviate から読み取る](https://sycamore.readthedocs.io/en/stable/sycamore/connectors/weaviate.html#reading-from-weaviate)  

## Our Resources 
リソースは 2 つのカテゴリに分かれています:  
1. [**Hands on Learning**](#hands-on-learning): エンドツーエンドのチュートリアルで技術的理解を深めます。  
2. [**Read and Listen**](#read-and-listen): これらのテクノロジーに関する概念的理解を高めます。  

### Hands on Learning

| トピック | 説明 | リソース | 
| --- | --- | --- |
| Aryn を使用して Weaviate にデータを取り込む | Sycamore を使用してデータを準備し、Weaviate にロードする方法のデモ。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/data-platforms/aryn/weaviate_blog_post.ipynb) |

### Read and Listen 
| トピック | 説明 | リソース | 
| --- | --- | --- |
| Aryn でデータを拡充して Weaviate に取り込む | Aryn を使用して PDF を Weaviate に取り込む方法のデモ。 | [Blog](https://weaviate.io/blog/sycamore-and-weaviate) |



