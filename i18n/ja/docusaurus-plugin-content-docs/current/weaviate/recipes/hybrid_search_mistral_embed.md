---
layout: recipe
toc: True
title: "Mistral を使ったハイブリッド検索"
featured: False
integration: False
agent: False
tags: ['Hybrid Search', 'Mistral']
---
[![Colab で開く](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-features/model-providers/mistral/hybrid_search_mistral_embed.ipynb)

# Mistral を使ったハイブリッド検索

このレシピでは、Mistral の埋め込みを用いたハイブリッド検索の実行方法を説明します。

## 必要条件

1. Weaviate クラスター  
    1. [WCD](https://console.weaviate.cloud/) で 14 日間無料のサンドボックスを作成できます  
    2. [Embedded Weaviate](https://docs.weaviate.io/deploy/installation-guides/embedded)  
    3. [ローカルデプロイ](https://docs.weaviate.io/deploy/installation-guides/docker-installation)  
    4. [その他のオプション](https://docs.weaviate.io/deploy)

2. Mistral API キー — [こちら](https://docs.mistral.ai/api/) で取得できます。

```python
import weaviate, os
from weaviate.embedded import EmbeddedOptions
import weaviate.classes as wvc
import weaviate.classes.config as wc
import requests, json
import weaviate.classes.query as wq
```

## Weaviate へ接続

以下から 1 つだけ選択してください。

**Weaviate クラウドデプロイ**

```python
WCD_URL = os.environ["WEAVIATE_URL"] # Replace with your Weaviate cluster URL
WCD_AUTH_KEY = os.environ["WEAVIATE_AUTH"] # Replace with your cluster auth key
MISTRAL_KEY = os.environ["MISTRAL_API_KEY"] # Replace with your Mistral key

# Weaviate Cloud Deployment
client = weaviate.connect_to_wcs(
    cluster_url=WCD_URL,
    auth_credentials=weaviate.auth.AuthApiKey(WCD_AUTH_KEY),
      headers={ "X-Mistral-Api-Key": MISTRAL_KEY}
)

print(client.is_ready())
```

**Embedded Weaviate**

```python
# MISTRAL_KEY = os.environ["MISTRAL_API_KEY"] # Replace with your Mistral key

# client = weaviate.WeaviateClient(
#     embedded_options=EmbeddedOptions(
#         version="1.26.1",
#         additional_env_vars={
#             "ENABLE_MODULES": "text2vec-mistral"
#         }),
#         additional_headers={
#             "X-Mistral-Api-Key": MISTRAL_KEY
#         }
# )

# client.connect()
```

**ローカルデプロイ**

```python
# MISTRAL_KEY = os.environ["MISTRAL_API_KEY"] # Replace with your Mistral key

# client = weaviate.connect_to_local(
#   headers={
#     "X-Mistral-Api-Key": MISTRAL_KEY
#   }
# )
# print(client.is_ready())
```

## コレクションの作成
> コレクションはデータとベクトル埋め込みを保存します。

```python
# Note: in practice, you shouldn't rerun this cell, as it deletes your data
# in "JeopardyQuestion", and then you need to re-import it again.

# Delete the collection if it already exists
if (client.collections.exists("JeopardyQuestion")):
    client.collections.delete("JeopardyQuestion")

client.collections.create(
    name="JeopardyQuestion",

    vector_config=wc.Configure.Vectors.text2vec_mistral( # specify the vectorizer and model
        model="mistral-embed",
    ),

    properties=[ # defining properties (data schema) is optional
        wc.Property(name="Question", data_type=wc.DataType.TEXT), 
        wc.Property(name="Answer", data_type=wc.DataType.TEXT),
        wc.Property(name="Category", data_type=wc.DataType.TEXT, skip_vectorization=True), 
    ]
)

print("Successfully created collection: JeopardyQuestion.")
```

## データのインポート

```python
url = 'https://raw.githubusercontent.com/weaviate/weaviate-examples/main/jeopardy_small_dataset/jeopardy_tiny.json'
resp = requests.get(url)
data = json.loads(resp.text)

# Get a collection object for "JeopardyQuestion"
jeopardy = client.collections.use("JeopardyQuestion")

# Insert data objects
response = jeopardy.data.insert_many(data)

# Note, the `data` array contains 10 objects, which is great to call insert_many with.
# However, if you have a milion objects to insert, then you should spit them into smaller batches (i.e. 100-1000 per insert)

if (response.has_errors):
    print(response.errors)
else:
    print("Insert complete.")
```

## ハイブリッド検索

`alpha` パラメーターは、スパース検索とデンス検索に与える重みを決定します。`alpha = 0` は純粋なスパース検索 (bm25)、`alpha = 1` は純粋なデンス検索 (ベクトル) です。

`alpha` は省略可能で、デフォルト値は `0.75` です。

### ハイブリッド検索のみ

以下のクエリは動物に関する Jeopardy の質問を検索し、結果を 2 件に制限しています。`alpha` を `0.80` に設定しているため、ベクトル検索結果が bm25 よりも重視されます。`alpha = 0.25` にすると、異なる結果が得られます。

```python
response = jeopardy.query.hybrid(
    query="northern beast",
    query_properties=["question"],
    alpha=0.8,
    limit=3
)

for item in response.objects:
    print("ID:", item.uuid)
    print("Data:", json.dumps(item.properties, indent=2), "\n")
```

### `where` フィルターを用いたハイブリッド検索

カテゴリが Animals に設定された象 (elephants) に関する Jeopardy の質問を検索します。

```python
response = jeopardy.query.hybrid(
    query="northern beast",
    alpha=0.8,
    filters=wq.Filter.by_property("category").equal("Animals"),
    limit=3
)

for item in response.objects:
    print("ID:", item.uuid)
    print("Data:", json.dumps(item.properties, indent=2), "\n")
```

