---
layout: recipe
colab: https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/query-agent-get-started.ipynb
toc: True
title: "Get started with the Weaviate Query Agent"
featured: True
integration: False
agent: True
sidebar_position: 10
# tags: ['Query Agent']
---
<a href="https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/query-agent-get-started.ipynb" target="_blank">
  <img src="https://img.shields.io/badge/Open%20in-Colab-4285F4?style=flat&logo=googlecolab&logoColor=white" alt="Open In Google Colab" width="130"/>
</a>

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/query-agent/_includes/code/query_agent_get_started.py';

In this recipe, we will get started with the [Weaviate Query Agent](https://docs.weaviate.io/query-agent). We'll set up Weaviate Cloud, import a handful of open datasets, and run a few queries across them using **Ask Mode**, **Search Mode**, and the **Suggest Queries** feature.

> 📚 You can read and learn more about this service in our ["Introducing the Weaviate Query Agent"](https://weaviate.io/blog/query-agent) blog.

To follow along, we've prepared four open datasets, available on Hugging Face. We'll load all of them so the same agent can answer questions across very different kinds of data.

- [**E-commerce:**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-ecommerce) A dataset that lists clothing items, prices, brands, reviews, etc.
- [**Brands:**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-brands) A dataset that lists clothing brands and information about them such as their parent brand, child brands, average customer rating, etc.
- [**Financial Contracts**:](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-financial-contracts) A dataset of financial contracts between individuals and/or companies, as well as information on the type of contract and who has authored them.
- [**Weather**:](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-weather) Daily weather information including temperature, wind speed, precipitation, pressure, etc.

## 1. Setting up Weaviate & importing data

To use the Weaviate Query Agent, first, create a [Weaviate Cloud](https://console.weaviate.cloud) account👇
1. [Create a Weaviate Cloud account](https://console.weaviate.cloud) and set up a free [cluster](https://docs.weaviate.io/cloud/manage-clusters/create#free-clusters)
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

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START Connect"
  endMarker="# END Connect"
  language="py"
/>

</TabItem>
</Tabs>

### Prepare the collections

In the following code blocks, we are pulling our demo datasets from Hugging Face and writing them to new collections in our Weaviate Cloud cluster.

> ❗️ The `QueryAgent` uses the descriptions of collections and properties to decide which ones to use when solving queries, and to access more information about properties. You can experiment with changing these descriptions, providing more detail, and more. It's good practice to provide property descriptions too. For example, below we make sure that the `QueryAgent` knows that prices are all in USD, which is information that would otherwise be unavailable.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START CreateCollections"
  endMarker="# END CreateCollections"
  language="py"
/>

</TabItem>
</Tabs>

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START ImportData"
  endMarker="# END ImportData"
  language="py"
/>

</TabItem>
</Tabs>

## 2. Set up the Query Agent

When setting up the Query Agent, we have to provide it a few things:
- The `client`
- The `collections` which we want the agent to have access to.
- (Optionally) A `system_prompt` that describes how our agent should behave
- (Optionally) Timeout - which for now defaults to 60s.

Here we'll give it access to all four collections so it can route any question to the right place.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START InstantiateAgent"
  endMarker="# END InstantiateAgent"
  language="py"
/>

</TabItem>
</Tabs>

## 3. Ask Mode

Ask Mode returns a natural-language answer composed from the underlying data. The agent decides which collection(s) to search, which filters to apply, and how to phrase the response.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START AskWeather"
  endMarker="# END AskWeather"
  language="py"
/>

</TabItem>
</Tabs>

The `display()` method prints a rich view of the original query, the searches and aggregations that were executed, the sources used, and the final answer. You can also access individual pieces of the response directly:

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START AskAccessResponse"
  endMarker="# END AskAccessResponse"
  language="py"
/>

</TabItem>
</Tabs>

Because our agent has access to all four collections, it can route the query to the right one without us specifying. The same agent can also answer questions about clothing:

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START AskClothing"
  endMarker="# END AskClothing"
  language="py"
/>

</TabItem>
</Tabs>

## 4. Search Mode

Search Mode skips the final answer-generation step and returns the raw matching objects from your collection(s). This is what you want when you need rows, not a written response — for example as the retrieval step in your own pipeline, or to render results in a UI.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START SearchMode"
  endMarker="# END SearchMode"
  language="py"
/>

</TabItem>
</Tabs>

You can inspect the agent's chosen filters and target collection through `search_response.searches`, just like in Ask Mode.

## 5. Suggest Queries

If you're not sure what to ask, the Query Agent can suggest queries based on the data in your collections. This is useful for surfacing what's available in a new dataset, or for populating example prompts in a UI.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START SuggestQueries"
  endMarker="# END SuggestQueries"
  language="py"
/>

</TabItem>
</Tabs>

You can also constrain the style or focus of the suggestions with the `instructions` argument:

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START SuggestQueriesInstructions"
  endMarker="# END SuggestQueriesInstructions"
  language="py"
/>

</TabItem>
</Tabs>

## Further resources

- [**Build a Query Agent E-Commerce Assistant**](./query-agent-ecommerce-assistant.md) — A use-case-focused tutorial that wraps the Query Agent into a reusable customer-facing assistant.
- [**Ask Mode**](../guides/ask_mode.md) — Streaming, system prompts, result evaluation, multi-turn conversations.
- [**Search Mode**](../guides/search_mode.md) — Pagination, diversity ranking.
- [**Collection Configuration**](../reference/advanced_collections.md) — Target vectors, view properties, multi-tenancy, additional filters.

Finally, free up resources by closing the client:

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START Close"
  endMarker="# END Close"
  language="py"
/>

</TabItem>
</Tabs>
