---
layout: recipe
colab: https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-features/generative-search/generative_search_aws_bedrock.ipynb
toc: True
title: "AWS Bedrock を用いた生成検索 ( RAG )"
featured: False
integration: False
agent: False
tags: ['Generative Search', 'RAG', 'AWS']
---
<a href="https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-features/generative-search/generative_search_aws_bedrock.ipynb" target="_blank">
  <img src="https://img.shields.io/badge/Open%20in-Colab-4285F4?style=flat&logo=googlecolab&logoColor=white" alt="Open In Google Colab" width="130"/>
</a>

## 依存関係

```python
!pip install weaviate-client
```

## 設定

```python
import weaviate, os

# Connect to your local Weaviate instance deployed with Docker
client = weaviate.connect_to_local(
    headers={
        "X-AWS-Access-Key": os.getenv("AWS_ACCESS_KEY"), # Replace with your AWS access key - recommended: use env var
        "X-AWS-Secret-Key": os.getenv("AWS_SECRET_KEY"), # Replace with your AWS secret key - recommended: use env var
    }
)

# Option 2
# Connect to your Weaviate Client Service cluster
# client = weaviate.connect_to_wcs(
#     cluster_url="WCS-CLUSTER-ID",                             # Replace with your WCS cluster ID
#     auth_credentials=weaviate.auth.AuthApiKey("WCS-API-KEY"), # Replace with your WCS API KEY - recommended: use env var
#     headers={
#         "X-AWS-Access-Key": os.getenv("AWS_ACCESS_KEY"), # Replace with your AWS access key - recommended: use env var
#         "X-AWS-Secret-Key": os.getenv("AWS_SECRET_KEY"), # Replace with your AWS secret key - recommended: use env var
#     }
# )

client.is_ready()
```

## コレクションの作成
> コレクションは、データと ベクトル 埋め込みを保存します。

```python
# Note: in practice, you shouldn"t rerun this cell, as it deletes your data
# in "JeopardyQuestion", and then you need to re-import it again.
import weaviate.classes.config as wc

# Delete the collection if it already exists
if (client.collections.exists("JeopardyQuestion")):
    client.collections.delete("JeopardyQuestion")

client.collections.create(
    name="JeopardyQuestion",

    vector_config=wc.Configure.Vectors.text2vec_aws(
        service="bedrock",   #this is crucial
        model="cohere.embed-english-v3", # select the model, make sure it is enabled for your account
        # model="amazon.titan-embed-text-v1", # select the model, make sure it is enabled for your account
        region="eu-west-2"               # select your region
    ),

    # Enable generative model from AWS
    generative_config=wc.Configure.Generative.aws(
        service="bedrock",   #this is crucial
        model="amazon.titan-text-express-v1", # select the model, make sure it is enabled for your account
        region="eu-west-2"               # select your region
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
import requests, json
url = "https://raw.githubusercontent.com/weaviate/weaviate-examples/main/jeopardy_small_dataset/jeopardy_tiny.json"
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

## 生成検索クエリ

### 単一結果

単一結果では、検索結果ごとに個別に生成を行います。 

以下の例では、 Elephants に関する Jeopardy の問題から Facebook ad を作成します。 

```python
generatePrompt = "Turn the following Jeogrady question into a Facebook Ad: {question}"

jeopardy = client.collections.get("JeopardyQuestion")
response = jeopardy.generate.near_text(
    query="Elephants",
    limit=2,
    single_prompt=generatePrompt
)

for item in response.objects:
    print(json.dumps(item.properties, indent=1))
    print("-----vvvvvv-----")
    print(item.generated)
    print("-----^^^^^^-----")
```

### グループ化結果

グループ化結果では、すべての検索結果をまとめて 1 つの応答を生成します。 

次の例では、取得した 2 件の動物に関する Jeopardy の問題から Facebook ad を作成します。 

```python
generateTask = "Explain why these Jeopardy questions are under the Animals category."

jeopardy = client.collections.get("JeopardyQuestion")
response = jeopardy.generate.near_text(
    query="Animals",
    limit=3,
    grouped_task=generateTask
)

print(response.generated)
```

