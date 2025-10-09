---
layout: recipe
colab: https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/query-agent-get-started.ipynb
toc: True
title: "Weaviate Query Agent を構築する – E コマースアシスタント"
featured: True
integration: False
agent: True
tags: ['Query Agent']
---
<a href="https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/query-agent-get-started.ipynb" target="_blank">
  <img src="https://img.shields.io/badge/Open%20in-Colab-4285F4?style=flat&logo=googlecolab&logoColor=white" alt="Open In Google Colab" width="130"/>
</a>

このレシピでは、[Weaviate Query Agent](https://docs.weaviate.io/agents) を使ってシンプルな E コマースアシスタント エージェントを構築します。エージェントは複数の Weaviate コレクションへアクセスでき、各コレクションの情報を利用してブランドや衣類アイテムに関する複雑な質問に回答します。

> 📚 本サービスの詳細はブログ「[Introducing the Weaviate Query Agent](https://weaviate.io/blog/query-agent)」をご覧ください。

まず、Hugging Face で公開されているオープンデータセットを用意しています。最初のステップとして、Weaviate Cloud のコレクションにデータを投入する方法を説明します。

- [**E-commerce**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-ecommerce): 衣類アイテム、価格、ブランド、レビューなどを含むデータセット
- [**Brands**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-brands): 親ブランド・子ブランド、平均カスタマーレーティングなどブランド情報を含むデータセット

加えて、今回のレシピ内で他のエージェントに機能や多様性を持たせる際に使用できる、無関係なデータセットも用意しています。

- [**Financial Contracts**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-financial-contracts): 個人または企業間の金融契約、契約タイプや作成者情報を含むデータセット
- [**Weather**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-weather): 気温、風速、降水量、気圧などの日次気象情報

## 1. Weaviate のセットアップとデータのインポート

Weaviate Query Agent を使用するには、まず [Weaviate Cloud](https://weaviate.io/deployment/serverless) アカウントを作成します👇  
1. [Serverless Weaviate Cloud アカウントを作成](https://weaviate.io/deployment/serverless)し、無料の [Sandbox](https://docs.weaviate.io/cloud/manage-clusters/create#sandbox-clusters) をセットアップ  
2. 「Embedding」セクションで有効化します。デフォルトでは `Snowflake/snowflake-arctic-embed-l-v2.0` が埋め込みモデルとして使用されます。  
3. クラスター接続用に `WEAVIATE_URL` と `WEAVIATE_API_KEY` を控えておきます。  

> Info: 外部埋め込みプロバイダーのキーを追加する必要がないため、[Weaviate Embeddings](https://docs.weaviate.io/weaviate/model-providers/weaviate) の利用を推奨します。

```python
!pip install weaviate-client[agents] datasets
```

```python
import os
from getpass import getpass

if "WEAVIATE_API_KEY" not in os.environ:
  os.environ["WEAVIATE_API_KEY"] = getpass("Weaviate API Key")
if "WEAVIATE_URL" not in os.environ:
  os.environ["WEAVIATE_URL"] = getpass("Weaviate URL")
```

```python
import weaviate
from weaviate.auth import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)
```

### コレクションの準備

以下のコードでは、デモデータセットを Hugging Face から取得し、Weaviate Serverless クラスターに新しいコレクションとして書き込みます。

> ❗️ `QueryAgent` は、クエリを解決する際に使用するコレクションやプロパティを決定するため、またプロパティの詳細情報にアクセスするために、コレクションおよびプロパティの説明を利用します。説明を変更したり、詳細を追加したりといった実験を行うと良いでしょう。例えば下記では、価格がすべて USD であることを `QueryAgent` に伝えています。これは説明がなければ得られない情報です。

```python
from weaviate.classes.config import Configure, Property, DataType

# To re-run cell you may have to delete collections
# client.collections.delete("Brands")
client.collections.create(
    "Brands",
    description="A dataset that lists information about clothing brands, their parent companies, average rating and more.",
    vector_config=Configure.Vectors.text2vec_weaviate()
)

# client.collections.delete("Ecommerce")
client.collections.create(
    "Ecommerce",
    description="A dataset that lists clothing items, their brands, prices, and more.",
    vector_config=Configure.Vectors.text2vec_weaviate(),
    properties=[
        Property(name="collection", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT),
        Property(name="tags", data_type=DataType.TEXT_ARRAY),
        Property(name="subcategory", data_type=DataType.TEXT),
        Property(name="name", data_type=DataType.TEXT),
        Property(name="description", data_type=DataType.TEXT),
        Property(name="brand", data_type=DataType.TEXT),
        Property(name="product_id", data_type=DataType.UUID),
        Property(name="colors", data_type=DataType.TEXT_ARRAY),
        Property(name="reviews", data_type=DataType.TEXT_ARRAY),
        Property(name="image_url", data_type=DataType.TEXT),
        Property(name="price", data_type=DataType.NUMBER, description="price of item in USD"),
    ]
)

# client.collections.delete("Weather")
client.collections.create(
    "Weather",
    description="Daily weather information including temperature, wind speed, percipitation, pressure etc.",
    vector_config=Configure.Vectors.text2vec_weaviate(),
    properties=[
        Property(name="date", data_type=DataType.DATE),
        Property(name="humidity", data_type=DataType.NUMBER),
        Property(name="precipitation", data_type=DataType.NUMBER),
        Property(name="wind_speed", data_type=DataType.NUMBER),
        Property(name="visibility", data_type=DataType.NUMBER),
        Property(name="pressure", data_type=DataType.NUMBER),
        Property(name="temperature", data_type=DataType.NUMBER, description="temperature value in Celsius")
    ]
)

# client.collections.delete("Financial_contracts")
client.collections.create(
    "Financial_contracts",
    description="A dataset of financial contracts between indivicuals and/or companies, as well as information on the type of contract and who has authored them.",
    vector_config=Configure.Vectors.text2vec_weaviate(),
)
```

```python
from datasets import load_dataset

brands_dataset = load_dataset("weaviate/agents", "query-agent-brands", split="train", streaming=True)
ecommerce_dataset = load_dataset("weaviate/agents", "query-agent-ecommerce", split="train", streaming=True)
weather_dataset = load_dataset("weaviate/agents", "query-agent-weather", split="train", streaming=True)
financial_dataset = load_dataset("weaviate/agents", "query-agent-financial-contracts", split="train", streaming=True)

brands_collection = client.collections.use("Brands")
ecommerce_collection = client.collections.use("Ecommerce")
weather_collection = client.collections.use("Weather")
financial_collection = client.collections.use("Financial_contracts")

with brands_collection.batch.dynamic() as batch:
    for item in brands_dataset:
        batch.add_object(properties=item["properties"])

with ecommerce_collection.batch.dynamic() as batch:
    for item in ecommerce_dataset:
        batch.add_object(properties=item["properties"])

with weather_collection.batch.dynamic() as batch:
    for item in weather_dataset:
        batch.add_object(properties=item["properties"])

with financial_collection.batch.dynamic() as batch:
    for item in financial_dataset:
        batch.add_object(properties=item["properties"])
```

## 2. Query Agent のセットアップ

Query Agent を設定する際には、以下を渡す必要があります。  
- `client`  
- エージェントにアクセスさせたい `collection`  
- （オプション）エージェントの振る舞いを説明する `system_prompt`  
- （オプション）タイムアウト（デフォルトは 60 秒）

まずはシンプルなエージェントを作成しましょう。ここでは `Brands` と `Ecommerce` の両データセットにアクセスできる `agent` を作成しています。

```python
from weaviate.agents.query import QueryAgent

agent = QueryAgent(
    client=client, collections=["Ecommerce", "Brands"],
)
```

## 3. Query Agent を実行する

エージェントを実行すると、クエリに応じて以下の判断を行います。

1. どのコレクションを参照するか  
2. 通常の ***検索クエリ***、使用する ***フィルター***、***集約クエリ*** を行うかどうか、またはそれらを組み合わせるか  
3. その後、**`QueryAgentResponse`** 内で応答を返します。`print_query_agent_response` 関数を用いて、レスポンスオブジェクトに含まれる各情報をわかりやすく表示します。

### 質問してみる
**まずはシンプルな質問から始めましょう: 「ヴィンテージの服が好きです。200ドル未満のアイテムをいくつか教えてくれますか？」**

エージェントがどのように回答し、どのコレクションでどのような検索を行ったか、最終回答に不足情報があるかどうかなどを確認できます👇

```python
from weaviate.agents.utils import print_query_agent_response

response = agent.run("I like the vintage clothes, can you list me some options that are less than $200?")
print_query_agent_response(response)
```

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────────── 🔍 Original Query ───────────────────────────────────────────────╮
│                                                                                                                 │
│ I like the vintage clothes, can you list me some options that are less than &#36;200?                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭──────────────────────────────────────────────── 📝 Final Answer ────────────────────────────────────────────────╮
│                                                                                                                 │
│ If you are looking for vintage clothing options under &#36;200, here are some great choices:                        │
│                                                                                                                 │
│ 1. **Vintage Philosopher Midi Dress** - Priced at &#36;125, this dress from Echo &amp; Stitch embraces a classic        │
│ scholarly look with its deep green velvet fabric and antique gold detailing. It's tailored for elegance and is  │
│ ideal for sophisticated occasions.                                                                              │
│                                                                                                                 │
│ 2. **Vintage Gale Pleated Dress** - This &#36;120 dress from Solemn Chic features deep burgundy pleats and          │
│ vintage-inspired sleeve details, perfect for a timeless scholarly appearance.                                   │
│                                                                                                                 │
│ 3. **Retro Groove Flared Pants** - For &#36;59, these electric blue flared pants from Vivid Verse bring back the    │
│ playful spirit of the early 2000s with a modern touch.                                                          │
│                                                                                                                 │
│ 4. **Vintage Scholar Tote** - At &#36;90, this tote from Echo &amp; Stitch combines functionality and elegance, ideal   │
│ for everyday use, especially if you enjoy a scholarly aesthetic.                                                │
│                                                                                                                 │
│ 5. **Electric Velvet Trousers** - Priced at &#36;60, these neon green velvet trousers from Vivid Verse offer a fun, │
│ throwback vibe to early Y2K fashion.                                                                            │
│                                                                                                                 │
│ 6. **Victorian Velvet Jumpsuit** - For &#36;120, this jumpsuit from Solemn Chic offers an elegant blend of romance  │
│ and scholarly charm, suited for library visits or cultured gatherings.                                          │
│                                                                                                                 │
│ 7. **Vintage Scholar Turtleneck** - This &#36;55 turtleneck from Echo &amp; Stitch suits the Dark Academia vibe,        │
│ perfect for layering or wearing alone.                                                                          │
│                                                                                                                 │
│ 8. **Vintage Ivy Loafers** - These &#36;120 loafers from Solemn Chic offer timeless sophistication, with a deep     │
│ burgundy finish that complements any vintage wardrobe.                                                          │
│                                                                                                                 │
│ These options cater to various preferences, from dresses and jumpsuits to pants and accessories, all capturing  │
│ the vintage essence at an affordable price.                                                                     │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────── 🔭 Searches Executed 1/1 ────────────────────────────────────────────╮
│                                                                                                                 │
│ QueryResultWithCollection(                                                                                      │
│     queries=['vintage clothes'],                                                                                │
│     filters=[                                                                                                   │
│         [                                                                                                       │
│             IntegerPropertyFilter(                                                                              │
│                 property_name='price',                                                                          │
│                 operator=&lt;ComparisonOperator.LESS_THAN: '&lt;'&gt;,                                                   │
│                 value=200.0                                                                                     │
│             )                                                                                                   │
│         ]                                                                                                       │
│     ],                                                                                                          │
│     filter_operators='AND',                                                                                     │
│     collection='Ecommerce'                                                                                      │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│ 📊 No Aggregations Run                                                                                          │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭────────────────────────────────────────────────── 📚 Sources ───────────────────────────────────────────────────╮
│                                                                                                                 │
│  - object_id='5e9c5298-5b3a-4d80-b226-64b2ff6689b7' collection='Ecommerce'                                      │
│  - object_id='48896222-d098-42e6-80df-ad4b03723c19' collection='Ecommerce'                                      │
│  - object_id='00b383ca-262f-4251-b513-dafd4862c021' collection='Ecommerce'                                      │
│  - object_id='cbe8f8be-304b-409d-a2a1-bafa0bbf249c' collection='Ecommerce'                                      │
│  - object_id='c18d3c5b-8fbe-4816-bc60-174f336a982f' collection='Ecommerce'                                      │
│  - object_id='1811da1b-6930-4bd1-832e-f8fa2119d4df' collection='Ecommerce'                                      │
│  - object_id='2edd1bc5-777e-4376-95cd-42a141ffb71e' collection='Ecommerce'                                      │
│  - object_id='9819907c-1015-4b4c-ac75-3b3848e7c247' collection='Ecommerce'                                      │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>




<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>   📊 Usage Statistics
┌────────────────┬──────┐
│ LLM Requests:  │ 3    │
│ Input Tokens:  │ 7774 │
│ Output Tokens: │ 512  │
│ Total Tokens:  │ 8286 │
└────────────────┴──────┘</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>Total Time Taken: 16.93s</pre>



### フォローアップ質問

エージェントには追加のコンテキストを渡すこともできます。たとえば、前回の応答をコンテキストとして渡し、`new_response` を取得できます。

```python
new_response = agent.run("What about some nice shoes, same budget as before?", context=response)
print_query_agent_response(new_response)
```

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────────── 🔍 Original Query ───────────────────────────────────────────────╮
│                                                                                                                 │
│ What about some nice shoes, same budget as before?                                                              │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭──────────────────────────────────────────────── 📝 Final Answer ────────────────────────────────────────────────╮
│                                                                                                                 │
│ Here are some great shoe options under &#36;200 that you might like:                                                │
│                                                                                                                 │
│ 1. **Vintage Noir Loafers** - Priced at &#36;125, these loafers are part of the Dark Academia collection by Solemn  │
│ Chic. They come in black and grey, featuring a classic design with a modern twist. Reviews highlight their      │
│ comfort and stylish appearance, making them suitable for both casual and formal settings.                       │
│                                                                                                                 │
│ 2. **Parchment Boots** - At &#36;145, these boots from Nova Nest's Light Academia collection are noted for their    │
│ elegant ivory leather and classical detail stitching. They are praised for their comfort and versatile style.   │
│                                                                                                                 │
│ 3. **Bramble Berry Loafers** - These loafers, priced at &#36;75, come in pink and green and are marked by their     │
│ eco-friendly material and countryside aesthetic. Produced by Eko &amp; Stitch, they are loved for their comfort and │
│ sustainability.                                                                                                 │
│                                                                                                                 │
│ 4. **Glide Platforms** - Available for &#36;90 from the Y2K collection by Vivid Verse, these platform sneakers are  │
│ both comfortable and stylish with a high-shine pink finish.                                                     │
│                                                                                                                 │
│ 5. **Sky Shimmer Sneaks** - Costing &#36;69, these sneakers are from the Y2K collection by Nova Nest and offer a    │
│ comfortable fit with a touch of sparkle for style.                                                              │
│                                                                                                                 │
│ These selections offer a mix of formal and casual styles, ensuring you can find a perfect pair under your       │
│ budget of &#36;200.                                                                                                 │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────── 🔭 Searches Executed 1/1 ────────────────────────────────────────────╮
│                                                                                                                 │
│ QueryResultWithCollection(                                                                                      │
│     queries=['nice shoes'],                                                                                     │
│     filters=[                                                                                                   │
│         [                                                                                                       │
│             IntegerPropertyFilter(                                                                              │
│                 property_name='price',                                                                          │
│                 operator=&lt;ComparisonOperator.LESS_THAN: '&lt;'&gt;,                                                   │
│                 value=200.0                                                                                     │
│             )                                                                                                   │
│         ]                                                                                                       │
│     ],                                                                                                          │
│     filter_operators='AND',                                                                                     │
│     collection='Ecommerce'                                                                                      │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│ 📊 No Aggregations Run                                                                                          │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭────────────────────────────────────────────────── 📚 Sources ───────────────────────────────────────────────────╮
│                                                                                                                 │
│  - object_id='96b30047-8ce1-4096-9bcf-009733cf8613' collection='Ecommerce'                                      │
│  - object_id='61e4fcd7-d2bc-4861-beb6-4c16948d9921' collection='Ecommerce'                                      │
│  - object_id='6e533f7d-eba1-4e74-953c-9d43008278e7' collection='Ecommerce'                                      │
│  - object_id='f873ac48-1311-462a-86b2-a28b15fdda7a' collection='Ecommerce'                                      │
│  - object_id='93b8b13e-a417-4be2-9cce-fda8c767f35e' collection='Ecommerce'                                      │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>




<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>   📊 Usage Statistics
┌────────────────┬───────┐
│ LLM Requests:  │ 4     │
│ Input Tokens:  │ 9783  │
│ Output Tokens: │ 574   │
│ Total Tokens:  │ 10357 │
└────────────────┴───────┘</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>Total Time Taken: 18.02s</pre>

次に、集計が必要となる質問を試してみましょう。どのブランドが最も多くの靴を掲載しているかを見てみます。

```python
response = agent.run("What is the the name of the brand that lists the most shoes?")
print_query_agent_response(response)
```

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────────── 🔍 Original Query ───────────────────────────────────────────────╮
│                                                                                                                 │
│ What is the the name of the brand that lists the most shoes?                                                    │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭──────────────────────────────────────────────── 📝 Final Answer ────────────────────────────────────────────────╮
│                                                                                                                 │
│ The brand that lists the most shoes is Loom &amp; Aura with a total of 118 shoe listings.                           │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│ 🔭 No Searches Run                                                                                              │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭──────────────────────────────────────────── 📊 Aggregations Run 1/1 ────────────────────────────────────────────╮
│                                                                                                                 │
│ AggregationResultWithCollection(                                                                                │
│     search_query=None,                                                                                          │
│     groupby_property='brand',                                                                                   │
│     aggregations=[                                                                                              │
│         IntegerPropertyAggregation(property_name='collection', metrics=&lt;NumericMetrics.COUNT: 'COUNT'&gt;)         │
│     ],                                                                                                          │
│     filters=[],                                                                                                 │
│     collection='Ecommerce'                                                                                      │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>




<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>   📊 Usage Statistics
┌────────────────┬──────┐
│ LLM Requests:  │ 3    │
│ Input Tokens:  │ 3976 │
│ Output Tokens: │ 159  │
│ Total Tokens:  │ 4135 │
└────────────────┴──────┘</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>Total Time Taken: 5.33s</pre>



### 複数コレクションでの検索

場合によっては、複数のコレクションに対する検索結果を組み合わせる必要があります。上記の結果から、 ' Loom & Aura ' が最も多くの靴を掲載していることが分かります。

ここでは、ユーザーがこの会社について _さらに_ 、そして彼らが販売しているアイテムについても詳しく知りたいと想定してみましょう。

```python
response = agent.run("Does the brand 'Loom & Aura' have a parent brand or child brands and what countries do they operate from? "
                     "Also, what's the average price of a item from 'Loom & Aura'?")

print_query_agent_response(response)
```

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────────── 🔍 Original Query ───────────────────────────────────────────────╮
│                                                                                                                 │
│ Does the brand 'Loom &amp; Aura' have a parent brand or child brands and what countries do they operate from? Also, │
│ what's the average price of a item from 'Loom &amp; Aura'?                                                          │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭──────────────────────────────────────────────── 📝 Final Answer ────────────────────────────────────────────────╮
│                                                                                                                 │
│ Loom &amp; Aura is itself a well-established brand based in Italy and operates as the parent brand to several child │
│ brands. These child brands include 'Loom &amp; Aura Active', 'Loom &amp; Aura Kids', 'Nova Nest', 'Vivid Verse', 'Loom  │
│ Luxe', 'Saffron Sage', 'Stellar Stitch', 'Nova Nectar', 'Canvas Core', and 'Loom Lure'. The countries           │
│ associated with the operations or origins of these child brands include Italy, USA, UK, Spain, South Korea,     │
│ Japan, and some extend beyond Italy as suggested by the presence of these brands in different countries.        │
│                                                                                                                 │
│ The average price of an item from Loom &amp; Aura is approximately &#36;87.11. This reflects the brand's positioning as │
│ offering items of timeless elegance and quality craftsmanship.                                                  │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────── 🔭 Searches Executed 1/2 ────────────────────────────────────────────╮
│                                                                                                                 │
│ QueryResultWithCollection(                                                                                      │
│     queries=['parent brand of Loom &amp; Aura', 'child brands of Loom &amp; Aura'],                                     │
│     filters=[[], []],                                                                                           │
│     filter_operators='AND',                                                                                     │
│     collection='Brands'                                                                                         │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭─────────────────────────────────────────── 🔭 Searches Executed 2/2 ────────────────────────────────────────────╮
│                                                                                                                 │
│ QueryResultWithCollection(                                                                                      │
│     queries=['Loom &amp; Aura'],                                                                                    │
│     filters=[                                                                                                   │
│         [                                                                                                       │
│             TextPropertyFilter(                                                                                 │
│                 property_name='name',                                                                           │
│                 operator=&lt;ComparisonOperator.LIKE: 'LIKE'&gt;,                                                     │
│                 value='Loom &amp; Aura'                                                                             │
│             )                                                                                                   │
│         ]                                                                                                       │
│     ],                                                                                                          │
│     filter_operators='AND',                                                                                     │
│     collection='Brands'                                                                                         │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭──────────────────────────────────────────── 📊 Aggregations Run 1/1 ────────────────────────────────────────────╮
│                                                                                                                 │
│ AggregationResultWithCollection(                                                                                │
│     search_query=None,                                                                                          │
│     groupby_property=None,                                                                                      │
│     aggregations=[IntegerPropertyAggregation(property_name='price', metrics=&lt;NumericMetrics.MEAN: 'MEAN'&gt;)],    │
│     filters=[                                                                                                   │
│         TextPropertyFilter(                                                                                     │
│             property_name='brand',                                                                              │
│             operator=&lt;ComparisonOperator.EQUALS: '='&gt;,                                                          │
│             value='Loom &amp; Aura'                                                                                 │
│         )                                                                                                       │
│     ],                                                                                                          │
│     collection='Ecommerce'                                                                                      │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭────────────────────────────────────────────────── 📚 Sources ───────────────────────────────────────────────────╮
│                                                                                                                 │
│  - object_id='88433e18-216d-489a-8719-81a29b0ae915' collection='Brands'                                         │
│  - object_id='99f42d07-51e9-4388-9c4b-63eb8f79f5fd' collection='Brands'                                         │
│  - object_id='0852c2a4-0c5a-4c69-9762-1be10bc44f2b' collection='Brands'                                         │
│  - object_id='d172a342-da41-45c3-876e-d08db843b8b3' collection='Brands'                                         │
│  - object_id='a7ad0ed7-812e-4106-a29f-40442c3a106e' collection='Brands'                                         │
│  - object_id='b6abfa02-18e5-44cf-a002-ba140e3623ad' collection='Brands'                                         │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>




<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>   📊 Usage Statistics
┌────────────────┬───────┐
│ LLM Requests:  │ 5     │
│ Input Tokens:  │ 9728  │
│ Output Tokens: │ 479   │
│ Total Tokens:  │ 10207 │
└────────────────┴───────┘</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>Total Time Taken: 11.38s</pre>

### システムプロンプトの変更

場合によっては、エージェントに対してカスタムの `system_prompt` を定義したいことがあります。これにより、エージェントにデフォルトの指示を与え、どのように振る舞うかを指定できます。たとえば、常にユーザーの言語でクエリに回答するエージェントを作成してみましょう。

さらに、`QueryAgent` に `Financial_contracts` と `Weather` という 2 つのコレクションへのアクセス権を持たせます。次に、ぜひ自分でもクエリを試してみてください！

```python
multi_lingual_agent = QueryAgent(
    client=client, collections=["Ecommerce", "Brands", "Financial_contracts", "Weather"],
    system_prompt="You are a helpful assistant that always generated the final response in the users language."
    " You may have to translate the user query to perform searches. But you must always respond to the user in their own language."
)
```

今回は、天気に関する質問をしてみましょう！

```python
response = multi_lingual_agent.run("Quelles sont les vitesses minimales, maximales et moyennes du vent?")
print(response.final_answer)
```

Python 出力:
```text
Les vitesses de vent minimales, maximales et moyennes sont respectivement de 8,40 km/h, 94,88 km/h et 49,37 km/h. Ces données offrent une vue d'ensemble des conditions de vent typiques mesurées dans une période ou un lieu donné.
```

### さらに質問を試す

たとえば、 ' Eko & Stitch ' というブランドについてもっと調べてみましょう。

```python
response = multi_lingual_agent.run("Does Eko & Stitch have a branch in the UK? Or if not, does it have parent or child company in the UK?")

print(response.final_answer)
```

Python 出力:
```text
Yes, Eko & Stitch has a branch in the UK. The brand is part of the broader company Nova Nest, which serves as Eko & Stitch's parent brand. Eko & Stitch itself operates in the UK and has its child brands, Eko & Stitch Active and Eko & Stitch Kids, also within the UK.
```

`multi_lingual_agent` には "Financial_contracts" というコレクションにもアクセス権があります。このデータセットについてさらに情報を探してみましょう。

```python
response = multi_lingual_agent.run("What kinds of contracts are listed? What's the most common type of contract?")

print(response.final_answer)
```

Python 出力:
```text
The query seeks to identify the types of contracts listed and determine the most common type. Among the types of contracts provided in the results, the following were identified: employment contracts, sales agreements, invoice contracts, service agreements, and lease agreements. The most common type of contract found in the search results is the employment contract. However, when considering data from both search and aggregation results, the aggregation reveals that the invoice contract is the most common, followed by service agreements and lease agreements. While employment contracts appear frequently in the search results, they rank fourth in the aggregation data in terms of overall occurrences.
```

