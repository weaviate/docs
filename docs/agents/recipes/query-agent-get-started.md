---
layout: recipe
colab: https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/query-agent-get-started.ipynb
toc: True
title: "Get Started with the Weaviate Query Agent"
featured: True
integration: False
agent: True
sidebar_position: 10
tags: ['Query Agent']
---
<a href="https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/query-agent-get-started.ipynb" target="_blank">
  <img src="https://img.shields.io/badge/Open%20in-Colab-4285F4?style=flat&logo=googlecolab&logoColor=white" alt="Open In Google Colab" width="130"/>
</a>

In this recipe, we will get started with the [Weaviate Query Agent](https://docs.weaviate.io/agents). We'll set up Weaviate Cloud, import a handful of open datasets, and run a few queries across them using **Ask Mode**, **Search Mode**, and the **Suggest Queries** feature.

> 📚 You can read and learn more about this service in our ["Introducing the Weaviate Query Agent"](https://weaviate.io/blog/query-agent) blog.

To follow along, we've prepared four open datasets, available on Hugging Face. We'll load all of them so the same agent can answer questions across very different kinds of data.

- [**E-commerce:**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-ecommerce) A dataset that lists clothing items, prices, brands, reviews etc.
- [**Brands:**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-brands) A dataset that lists clothing brands and information about them such as their parent brand, child brands, average customer rating etc.
- [**Financial Contracts**:](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-financial-contracts) A dataset of financial contracts between individuals and/or companies, as well as information on the type of contract and who has authored them.
- [**Weather**:](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-weather) Daily weather information including temperature, wind speed, precipitation, pressure etc.

## 1. Setting Up Weaviate & Importing Data

To use the Weaviate Query Agent, first, create a [Weaviate Cloud](https://weaviate.io/deployment/serverless) account👇
1. [Create Serverless Weaviate Cloud account](https://weaviate.io/deployment/serverless) and setup a free [Sandbox](https://docs.weaviate.io/cloud/manage-clusters/create#sandbox-clusters)
2. Go to 'Embedding' and enable it, by default, this will make it so that we use `Snowflake/snowflake-arctic-embed-l-v2.0` as the embedding model
3. Take note of the `WEAVIATE_URL` and `WEAVIATE_API_KEY` to connect to your cluster below

> Info: We recommend using [Weaviate Embeddings](https://docs.weaviate.io/weaviate/model-providers/weaviate) so you do not have to provide any extra keys for external embedding providers.

```python
!pip install "weaviate-client[agents]" datasets
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

### Prepare the Collections

In the following code blocks, we are pulling our demo datasets from Hugging Face and writing them to new collections in our Weaviate Serverless cluster.

> ❗️ The `QueryAgent` uses the descriptions of collections and properties to decide which ones to use when solving queries, and to access more information about properties. You can experiment with changing these descriptions, providing more detail, and more. It's good practice to provide property descriptions too. For example, below we make sure that the `QueryAgent` knows that prices are all in USD, which is information that would otherwise be unavailable.

```python
from weaviate.classes.config import Configure, Property, DataType

# To re-run cell you may have to delete collections
# client.collections.delete("Brands")
client.collections.create(
    "Brands",
    description="A dataset that lists information about clothing brands, their parent companies, average rating and more.",
    vector_config=Configure.Vectors.text2vec_weaviate()
)

# client.collections.delete("ECommerce")
client.collections.create(
    "ECommerce",
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
ecommerce_collection = client.collections.use("ECommerce")
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

## 2. Set Up the Query Agent

When setting up the Query Agent, we have to provide it a few things:
- The `client`
- The `collections` which we want the agent to have access to.
- (Optionally) A `system_prompt` that describes how our agent should behave
- (Optionally) Timeout - which for now defaults to 60s.

Here we'll give it access to all four collections so it can route any question to the right place.

```python
from weaviate.agents.query import QueryAgent

agent = QueryAgent(
    client=client,
    collections=["ECommerce", "Brands", "Weather", "Financial_contracts"],
)
```

## 3. Ask Mode

Ask Mode returns a natural-language answer composed from the underlying data. The agent decides which collection(s) to search, which filters to apply, and how to phrase the response.

```python
response = agent.ask("What was the average temperature in the first week of May 2025?")
response.display()
```

The `display()` method prints a rich view of the original query, the searches and aggregations that were executed, the sources used, and the final answer. You can also access individual pieces of the response directly:

```python
print(response.final_answer)
print(response.sources)
```

Because our agent has access to all four collections, it can route the query to the right one without us specifying. The same agent can also answer questions about clothing:

```python
response = agent.ask("I like vintage clothes and nice shoes. Recommend some of each below $60.")
print(response.final_answer)
```

## 4. Search Mode

Search Mode skips the final answer-generation step and returns the raw matching objects from your collection(s). This is what you want when you need rows, not a written response — for example as the retrieval step in your own pipeline, or to render results in a UI.

```python
search_response = agent.search(
    "Find me some vintage shoes under $70",
    limit=10,
)

for obj in search_response.search_results.objects:
    print(f"Product: {obj.properties['name']} - ${obj.properties['price']}")
```

You can inspect the agent's chosen filters and target collection through `search_response.searches`, just like in Ask Mode.

## 5. Suggest Queries

If you're not sure what to ask, the Query Agent can suggest queries based on the data in your collections. This is useful for surfacing what's available in a new dataset, or for populating example prompts in a UI.

```python
suggestions = agent.suggest_queries(num_queries=3)
for q in suggestions.queries:
    print(q.query)
```

You can also constrain the style or focus of the suggestions with the `instructions` argument:

```python
suggestions = agent.suggest_queries(
    num_queries=3,
    instructions="Focus on questions a customer would ask about the clothing items.",
)
for q in suggestions.queries:
    print(q.query)
```

## Next Steps

- [**Build a Query Agent E-Commerce Assistant**](./query-agent-ecommerce-assistant.md) — A use-case-focused tutorial that wraps the Query Agent into a reusable customer-facing assistant.
- [**Ask Mode**](../guides/ask_mode.md) — Streaming, system prompts, result evaluation, multi-turn conversations.
- [**Search Mode**](../guides/search_mode.md) — Pagination, diversity ranking.
- [**Collection Configuration**](../reference/advanced_collections.md) — Target vectors, view properties, multi-tenancy, additional filters.

Finally, free up resources by closing the client:

```python
client.close()
```
