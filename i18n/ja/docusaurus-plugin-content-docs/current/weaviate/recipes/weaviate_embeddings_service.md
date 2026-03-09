---
layout: recipe
toc: True
title: "Weaviate 埋め込みサービスの使用方法"
featured: True
integration: False
agent: False
tags: ['Weaviate Embeddings', 'Weaviate Cloud']
---
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/weaviate/recipes/weaviate-services/embedding-service/weaviate_embeddings_service.ipynb)

# Weaviate 埋め込みサービス

[Weaviate Embeddings](https://docs.weaviate.io/cloud/embeddings) を使用すると、[Weaviate Cloud](https://console.weaviate.cloud/) データベース インスタンスから直接埋め込みを生成できます。 

*このサービスは Weaviate Cloud の一部であり、オープンソースからはアクセスできません。また、現在はテクニカル プレビュー段階です。アクセスを希望される場合は [こちら](https://events.weaviate.io/embeddings-preview) からリクエストしてください。*

このノートブックでは、次の方法を説明します。
1. Weaviate コレクションを定義する
1. ベクトル検索クエリを実行する
1. ハイブリッド検索クエリを実行する
1. メタデータ フィルター付きハイブリッド検索クエリを実行する
1. 生成検索 (RAG) クエリを実行する

## 要件

1. Weaviate Cloud (WCD) アカウント: [こちら](https://console.weaviate.cloud/) から登録できます  
1. WCD でクラスターを作成: サンドボックスまたはサーバーレス クラスターで問題ありません。クラスター URL と admin API キーが必要です  
1. `GPT-4o mini` にアクセスするための OpenAI キー  

```python
!pip install --q weaviate-client
```

```python
!pip show weaviate-client # you need to have the Python client version 4.9.5 or higher
```

## ライブラリとキーのインポート

```python
import weaviate
from weaviate.classes.init import Auth
import os
import weaviate.classes.config as wc
from weaviate.classes.query import Filter

import requests, json
import pandas as pd
from io import StringIO
```

```python
WCD_CLUSTER_URL = os.getenv("WCD_CLUSTER_URL")
WCD_CLUSTER_KEY = os.getenv("WCD_CLUSTER_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
```

## Weaviate に接続

```python
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=WCD_CLUSTER_URL,
    auth_credentials=Auth.api_key(WCD_CLUSTER_KEY),

    headers={
        "X-OpenAI-Api-Key": OPENAI_API_KEY,
    }
)

print(client.is_ready())
```

Python 出力:
```text
True
```
## コレクションの定義

```python
# Note: This will delete your data stored in "JeopardyQuestion".and
# It will require you to re-import again.

# Delete the collection if it already exists
if (client.collections.exists("JeopardyQuestion")):
    client.collections.delete("JeopardyQuestion")

client.collections.create(
    name="JeopardyQuestion",

    vector_config=wc.Configure.Vectors.text2vec_weaviate( # specify the vectorizer and model type you're using
        model="Snowflake/snowflake-arctic-embed-l-v2.0", # default model
    ),

    generative_config=wc.Configure.Generative.openai( 
        model="gpt-4o-mini" # select model, default is gpt-3.5-turbo 
    ),

    properties=[ # defining properties (data schema) is optional
        wc.Property(name="Question", data_type=wc.DataType.TEXT), 
        wc.Property(name="Answer", data_type=wc.DataType.TEXT, skip_vectorization=True),
        wc.Property(name="Category", data_type=wc.DataType.TEXT, skip_vectorization=True),
        wc.Property(name="Value", data_type=wc.DataType.TEXT, skip_vectorization=True)
    ]
)

print("Successfully created collection: JeopardyQuestion.")
```

Python 出力:
```text
Successfully created collection: JeopardyQuestion.
```
## データのインポート

例として、小規模な jeopardy データセットを使用します。1,000 件のオブジェクトが含まれています。

```python
url = 'https://raw.githubusercontent.com/weaviate/weaviate-examples/main/jeopardy_small_dataset/jeopardy_small.csv'
resp = requests.get(url)

df = pd.read_csv(StringIO(resp.text))
```

```python
# Get a collection object for "JeopardyQuestion"
collection = client.collections.use("JeopardyQuestion")

# Insert data objects with batch import
with collection.batch.dynamic() as batch:
    for _, row in df.iterrows():
        properties = {
            "question": row['Question'],
            "answer": row['Answer'],
            "category": row["Category"],
            "value": row["Value"]
        }
        batch.add_object(properties)

failed_objects = collection.batch.failed_objects
if failed_objects:
    print(f"Number of failed imports: {len(failed_objects)}")
else:
    print("Insert complete.")
```

Python 出力:
```text
Insert complete.
```
```python
# count the number of objects

collection = client.collections.use("JeopardyQuestion")
response = collection.aggregate.over_all(total_count=True)

print(response.total_count)
```

Python 出力:
```text
1000
```
## クエリ実行

### ベクトル検索

```python
collection = client.collections.use("JeopardyQuestion")

response = collection.query.near_text(
    query="marine mamal with tusk", 
    limit=2 # limit to only 2
)

for item in response.objects:
    print("Data:", json.dumps(item.properties, indent=2), "\n")
```

Python 出力:
```text
Data: {
  "value": "NaN",
  "answer": "the narwhal",
  "question": "A part of this marine mammal was prized by medieval folk, who thought it belonged to a unicorn",
  "category": "THE ANIMAL KINGDOM"
} 

Data: {
  "value": "$400",
  "answer": "the walrus",
  "question": "You could say this Arctic mammal, Odobenus rosmarus, has a Wilford Brimley mustache",
  "category": "MAMMALS"
} 
```
### ハイブリッド検索

このノートブックの目的は埋め込みサービスの使い方を示すことです。ハイブリッド検索の詳細については [このフォルダー](https://github.com/weaviate/recipes/tree/main/weaviate-features/hybrid-search) または [ドキュメント](https://docs.weaviate.io/weaviate/search/hybrid) を参照してください。

`alpha` パラメーターは、スパース検索とディープ検索 (ベクトル検索) に与える重みを決定します。`alpha = 0` は純粋なスパース (bm25) 検索、`alpha = 1` は純粋なディープ (ベクトル) 検索です。 

`alpha` はオプション パラメーターで、デフォルトは `0.75` に設定されています。

```python
collection = client.collections.use("JeopardyQuestion")

response = collection.query.hybrid(
    query="unicorn-like artic animal",
    alpha=0.7, 
    limit=2
)

for item in response.objects:
    print("Data:", json.dumps(item.properties, indent=2), "\n")
```

Python 出力:
```text
Data: {
  "value": "NaN",
  "answer": "the narwhal",
  "question": "A part of this marine mammal was prized by medieval folk, who thought it belonged to a unicorn",
  "category": "THE ANIMAL KINGDOM"
} 

Data: {
  "value": "$400",
  "answer": "the walrus",
  "question": "You could say this Arctic mammal, Odobenus rosmarus, has a Wilford Brimley mustache",
  "category": "MAMMALS"
} 
```
### メタデータ フィルター付きオブジェクト取得

さまざまなフィルター演算子の詳細は [こちら](https://docs.weaviate.io/weaviate/search/filters) を参照してください。

```python
collection = client.collections.use("JeopardyQuestion")

response = collection.query.fetch_objects(
    limit=2,
    filters=Filter.by_property("category").equal("BUSINESS & INDUSTRY")
)

for item in response.objects:
    print("Data:", json.dumps(item.properties, indent=2), "\n")
```

Python 出力:
```text
Data: {
  "value": "$200",
  "answer": "Disney",
  "question": "This company operates the 4 most popular theme parks in North America",
  "category": "BUSINESS & INDUSTRY"
} 

Data: {
  "value": "$400",
  "answer": "Yamaha",
  "question": "This firm began in 1897 as Nippon Gakki Company, an organ manufacturer; electronic organs came along in 1959",
  "category": "BUSINESS & INDUSTRY"
} 
```
### 生成検索 (RAG)

```python
collection = client.collections.use("JeopardyQuestion")

response = collection.generate.hybrid(
    query="unicorn-like artic animal",
    alpha=0.7, 
    grouped_task="Explain why people thought these animals were unicorn-like",
    limit=2
)

print(f"Generated output: {response.generated}") 
```

Python 出力:
```text
Generated output: People thought these animals were unicorn-like for a few reasons:

1. **Narwhal**: The narwhal is a marine mammal known for its long, spiral tusk, which can reach lengths of up to 10 feet. In medieval times, this tusk was often sold as a "unicorn horn" and was believed to possess magical properties. The resemblance of the narwhal's tusk to the mythical unicorn's horn led to the association between the two, as people were fascinated by the idea of unicorns and sought to find evidence of their existence in the natural world.

2. **Walrus**: While the walrus does not have a direct connection to unicorns like the narwhal, its large tusks and unique appearance may have contributed to some fantastical interpretations. The walrus's tusks, which can be quite prominent, might have sparked the imagination of those who were already inclined to believe in mythical creatures. Additionally, the walrus's size and distinctive features could have led to comparisons with other legendary animals, including unicorns, in folklore and storytelling.

Overall, the combination of physical characteristics and the cultural context of the time contributed to the perception of these animals as unicorn-like.
```

