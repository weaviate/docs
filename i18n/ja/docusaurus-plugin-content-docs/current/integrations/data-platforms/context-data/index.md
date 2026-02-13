---
title: コンテキスト データ
sidebar_position: 8
image: og/integrations/home.jpg
---

[Context Data](https://contextdata.ai/) による VectorETL は、AI や Data Engineers がデータを扱う際に役立つ、モジュラー式のノーコード Python フレームワークです。

* 複数のデータソース（データベース、クラウド ストレージ、ローカル ファイル）からデータを素早く抽出  
* OpenAI、Cohere、Google Gemini などの主要モデルを用いて埋め込みを実行  
* ベクトル データベースへ書き込み  

## Context Data と Weaviate
Weaviate は Context Data における [ターゲット接続](https://context-data.gitbook.io/context-data-1/adding-target-connections#add-a-weaviate-target-connection) です。 

Context Data に接続するには、コンソールを開き、プロンプトが表示されたら Weaviate インスタンスの URL と認証情報を入力してください。

## リソース 
[**Hands on Learning**](#hands-on-learning)：エンドツーエンドのチュートリアルで技術的な理解を深めましょう。

### Hands on Learning

| トピック | 説明 | リソース | 
| --- | --- | --- |
| VectorETL を Weaviate へ取り込む | Google Cloud Storage、Postgres、S3 から Weaviate へデータを取り込む 3 つの例を紹介します。 | [ノートブック](https://github.com/weaviate/recipes/tree/main/integrations/data-platforms/context-data) |


