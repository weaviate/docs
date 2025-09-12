---
layout: recipe
colab: https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-features/hybrid-search/hybrid_search_mistral.ipynb
toc: True
title: "Mistral を用いたハイブリッド検索"
featured: False
integration: False
agent: False
tags: ['Hybrid Search', 'Mistral']
---
<a href="https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-features/hybrid-search/hybrid_search_mistral.ipynb" target="_blank">
  <img src="https://img.shields.io/badge/Open%20in-Colab-4285F4?style=flat&logo=googlecolab&logoColor=white" alt="Open In Google Colab" width="130"/>
</a>

このレシピでは、 Mistral の埋め込みを使用してハイブリッド検索を実行する方法を示します。

## Requirements

1. Weaviate クラスター  
    1. [WCD](https://console.weaviate.cloud/) で 14 日間の無料サンドボックスを作成できます  
    2. [Embedded Weaviate](https://docs.weaviate.io/deploy/installation-guides/embedded)  
    3. [Local deployment]((https://docs.weaviate.io/deploy/installation-guides/docker-installation#starter-docker-compose-file)  
    4. [その他のオプション](https://docs.weaviate.io/deploy/installation-guides)  

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

**Weaviate Cloud Deployment**

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

**Local Deployment**

```python
# MISTRAL_KEY = os.environ["MISTRAL_API_KEY"] # Replace with your Mistral key

# client = weaviate.connect_to_local(
#   headers={
#     "X-Mistral-Api-Key": MISTRAL_KEY
#   }
# )
# print(client.is_ready())
```

## コレクションを作成する
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

## データをインポートする

```python
url = 'https://raw.githubusercontent.com/weaviate/weaviate-examples/main/jeopardy_small_dataset/jeopardy_tiny.json'
resp = requests.get(url)
data = json.loads(resp.text)

# Get a collection object for "JeopardyQuestion"
jeopardy = client.collections.get("JeopardyQuestion")

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

`alpha` パラメーターは、スパース検索とデンス検索に与える重みを決定します。`alpha = 0` は純粋なスパース（ bm25 ）検索、`alpha = 1` は純粋なデンス（ ベクトル ）検索です。  

`alpha` は任意のパラメーターで、デフォルトは `0.75` です。

### ハイブリッド検索のみ

以下のクエリは動物に関する  Jeopardy  の質問を検索し、結果を 2 件に制限します。`alpha` を `0.80` に設定しているため、 bm25 よりベクトル検索結果を重視しています。`alpha = 0.25` に設定すると、異なる結果が得られます。 

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

### `where` フィルター付きハイブリッド検索

カテゴリーが Animals の中から、象に関する  Jeopardy  の質問を検索します。

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

