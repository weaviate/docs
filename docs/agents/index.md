---
title: Introduction
description: "Get an overview of the Weaviate Query Agent and what it can do."
image: og/docs/agents.jpg
tags: ['agents', 'query-agent', 'getting-started']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from "!!raw-loader!./_includes/code/introduction.py";
import TSCode from '!!raw-loader!./_includes/code/introduction.mts';

<CloudOnlyBadge />

The Query Agent runs agentic search over your Weaviate Cloud database. Ask a question in natural language and the agent automatically decides which collections to search, which filters and sorts to apply, and which search types to use — all in a single call.

:::info Free tier
Up to 250 ask queries or 1000 search queries per month, no credit card required. [Get started →](quickstart.md)
:::

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START FirstExample"
            endMarker="# END FirstExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START FirstExample"
            endMarker="// END FirstExample"
            language="ts"
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

![Weaviate Query Agent from a user perspective](./_includes/query_agent_architecture_light.png#gh-light-mode-only "Weaviate Query Agent from a user perspective")
![Weaviate Query Agent from a user perspective](./_includes/query_agent_architecture_dark.png#gh-dark-mode-only "Weaviate Query Agent from a user perspective")

The Weaviate Query Agent connects to your pre-existing Weaviate database and transforms natural language queries into actionable searches using an LLM. It can perform multiple searches and aggregations across one or more collections, dynamically deciding which collection(s) to search on, creating custom filters, group bys, sorts, and search types, all depending on a single natural language question.

It is designed as a pre-built agentic service for your data, with two main modes:

* [**Ask Mode**](guides/ask_mode.md): Return a natural language answer after searching your data. Chat-like; best for end-user-facing apps where the user wants a written response instead of raw data.
* [**Search Mode**](guides/search_mode.md): Return the raw matching objects directly from your collection(s), with filters, sorts, and search types chosen for you. Lookup-like; best for internal search, dashboards, or the retrieval step in a larger pipeline.

### Example use cases

- **Customer-facing chat assistant** (Ask Mode) — Answer questions like *"Recommend me vintage shoes under $70 in size 9"* with a written response, sourced from your product catalog.
- **Natural-language filter on an internal dashboard** (Search Mode) — Turn *"orders flagged last week from EU customers"* into a filtered Weaviate query and render the rows in your UI.
- **Retrieval step inside your own RAG or agent stack** (Search Mode) — Fetch the most relevant objects via the agent, then pass them to a downstream generative step you control.

## Get started

:::info Query Agent in cloud
[You can try the Query Agent without any setup on Weaviate Cloud. Simply go to the 'Agents' tab to start asking questions about data in your collections.](/go/console?utm_content=agents)
:::

You need a Weaviate Cloud cluster — [a 14-day sandbox is free](https://weaviate.io/deployment/serverless). With a cluster and some data, install [the Python or TypeScript client](./installation.md) and you can run your first query in minutes.

Already have a cluster but no data? Upload via CSV in the cloud console, or [via the Weaviate APIs](/weaviate/manage-objects/create).

## Further resources

- [**Quickstart**](quickstart.md) — Set up the client and run your first ask and search calls.
- [**Modes**](guides/index.md) — Detailed pages on Ask Mode, Search Mode, and other modes.
- [**Configuration**](reference/instantiation.md) — Constructor options, collection configuration, additional filters, system prompts, and conversational inputs.
- [**Recipes**](recipes.mdx) — End-to-end example notebooks.


## Questions and feedback


<!-- :::info Changelog and feedback
The official changelog for Weaviate Agents can be [found here](https://weaviateagents.featurebase.app/changelog). If you have feedback, such as feature requests, bug reports or questions, please [submit them here](https://weaviateagents.featurebase.app/), where you will be able to see the status of your feedback and vote on others' feedback.
::: -->

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
