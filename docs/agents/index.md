---
title: Introduction
sidebar_position: 10
description: "Overview of the Weaviate Query Agent."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from "!!raw-loader!./_includes/code/quickstart.py";
import TSCode from '!!raw-loader!/docs/agents/\_includes/query_agent.mts';

# Weaviate Query Agent: AI Search for your Database

<CloudOnlyBadge />

The query agent uses agentic search (AI search) on your Weaviate vector database to determine the most effective query terms, filters, and other search options based on your natural language query.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START FirstExample"
            endMarker="# END FirstExample"
            language="py"
        />
    </TabItem>
</Tabs>

<details>
<summary>Example output</summary>

```
╭───────────────────────────────────────────── 💬 Ask Mode Response ──────────────────────────────────────────────╮
│                                                                                                                 │
│ The most expensive blue t-shirt is **Neotech Noir Tee** by **Vivid Verse**, priced at **$46.00**.               │
│                                                                                                                 │
│ Details:                                                                                                        │
│ - **Product ID:** 9f9fe575-be97-46d9-a5ca-ff41ae57bef4                                                          │
│ - **Colors:** black, blue                                                                                       │
│ - **Category:** Tops                                                                                            │
│ - **Subcategory:** T-Shirts                                                                                     │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────── 🔭 Search 1/1 ─────────────────────────────────────────────────╮
│                                                                                                                 │
│ QueryResultWithCollectionNormalized(                                                                            │
│     query=None,                                                                                                 │
│     filters=FilterAndOr(                                                                                        │
│         combine='AND',                                                                                          │
│         filters=[                                                                                               │
│             TextPropertyFilter(                                                                                 │
│                 property_name='subcategory',                                                                    │
│                 operator=<ComparisonOperator.EQUALS: '='>,                                                      │
│                 value='T-Shirts'                                                                                │
│             ),                                                                                                  │
│             TextArrayPropertyFilter(                                                                            │
│                 property_name='colors',                                                                         │
│                 operator=<ComparisonOperator.CONTAINS_ANY: 'contains_any'>,                                     │
│                 value=['blue']                                                                                  │
│             )                                                                                                   │
│         ]                                                                                                       │
│     ),                                                                                                          │
│     collection='ECommerce',                                                                                     │
│     sort_property=QuerySort(property_name='price', order='descending', tie_break=None),                         │
│     uuid_value=None                                                                                             │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭────────────────────────────────────────────── 📊 Aggregation 1/1 ───────────────────────────────────────────────╮
│                                                                                                                 │
│ AggregationResultWithCollectionNormalized(                                                                      │
│     groupby_property=None,                                                                                      │
│     aggregation=IntegerPropertyAggregation(property_name='price', metrics=<NumericMetrics.MAX: 'MAXIMUM'>),     │
│     filters=FilterAndOr(                                                                                        │
│         combine='AND',                                                                                          │
│         filters=[                                                                                               │
│             TextPropertyFilter(                                                                                 │
│                 property_name='category',                                                                       │
│                 operator=<ComparisonOperator.EQUALS: '='>,                                                      │
│                 value='Tops'                                                                                    │
│             ),                                                                                                  │
│             TextPropertyFilter(                                                                                 │
│                 property_name='subcategory',                                                                    │
│                 operator=<ComparisonOperator.EQUALS: '='>,                                                      │
│                 value='T-Shirts'                                                                                │
│             ),                                                                                                  │
│             TextArrayPropertyFilter(                                                                            │
│                 property_name='colors',                                                                         │
│                 operator=<ComparisonOperator.CONTAINS_ANY: 'contains_any'>,                                     │
│                 value=['blue']                                                                                  │
│             )                                                                                                   │
│         ]                                                                                                       │
│     ),                                                                                                          │
│     collection='ECommerce'                                                                                      │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

</details>

## What is the Query Agent?

The Weaviate Query Agent connects to your pre-existing Weaviate database and transforms natural language queries into actionable searches using an LLM. It can perform multiple searches and aggregations across one or more collections, dynamically deciding which collection to search on, creating custom filters, group bys, sorts, and search types, all depending on a single natural language question.

It is designed as a pre-built agentic service for your data, using AI to write and perform the most optimal search. The query agent currently has two modes:

* [**Ask Mode**](guides/ask_mode.md): Design and execute an search, and answer the user query with a final response.
* [**Search Mode**](guides/search_mode.md): Design and execute a search only, and return the retrieved data.

## Get Started

You will require a Weaviate cloud cluster, [a 14 day sandbox cluster is free](https://weaviate.io/deployment/serverless). 

If you already have a cloud cluster, and data, you just need to install [one of the clients](./clients/index.md) and you can connect straight away. Otherwise, you can upload data via a CSV on the cloud console, or via the Weaviate APIs.

You can make up to 250 ask mode queries, or 1000 search mode queries per month for free.

Check out the [quickstart guide](quickstart.md) to see an overview of the query agent and how to get started. 

## Questions and feedback


<!-- :::info Changelog and feedback
The official changelog for Weaviate Agents can be [found here](https://weaviateagents.featurebase.app/changelog). If you have feedback, such as feature requests, bug reports or questions, please [submit them here](https://weaviateagents.featurebase.app/), where you will be able to see the status of your feedback and vote on others' feedback.
::: -->

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
