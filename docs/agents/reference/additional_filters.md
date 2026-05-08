---
title: Additional Filters
sidebar_position: 25
description: "Add custom filters that always get used in the query agent."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'query agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/code/additional_filters.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/code/additional_filters.mts';

<!-- Details on using the `additional_filters` argument, as well as typical usecases or examples where this might be useful. -->

## Overview

Additional filters can be used to subset the data in a single collection manually in addition to whatever filters the query agent decides to use in a particular search.

These persistent filters are defined at the specification of the collection, and combined with agent-generated filters using logical `AND` operations at search time.

Additional filters are available in both [ask mode](../guides/ask_mode.md) and [search mode](../guides/search_mode.md).

The syntax used is that of a standard Weaviate filter, [see more on filtering in Weaviate for details.](../../weaviate/search/filters.md)

These can be specified at **instantiation of the query agent**.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START OverviewInInit"
            endMarker="# END OverviewInInit"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START OverviewInInit"
            endMarker="// END OverviewInInit"
            language="ts"
        />
    </TabItem>
</Tabs>

Or at **runtime of ask or search mode**.


<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START OverviewInRuntime"
            endMarker="# END OverviewInRuntime"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START OverviewInRuntime"
            endMarker="// END OverviewInRuntime"
            language="ts"
        />
    </TabItem>
</Tabs>


The additional filters are an argument to `QueryAgentCollectionConfig`, and used as part of advanced collection configuration, [see the page for more details](./advanced_collections.md).

You can add as many layers of complexity to the custom filter as you need - a single filter on one property, or multiple nested filters across multiple properties.

## How is it used?

The filters are applied in addition to any filters determined by any agent in a run of the query agent. The query agent could decide one or many filters, and these are combined with the additional filters specified when the final result set is being retrieved.

In addition, a sample of data from the collection is provided to the agents to better understand the data they have access to. This data subset is also filtered using the additional filters provided.

## Usecases

Additional filters reduce the sample space of data to be retrieved. If you have a large data collection but only want to use the query agent across a subset of that data, specifying a filter enforces only a portion of the data can be used.

Since the query agent is a non-deterministic process (via the usage of LLMs), if you want to enforce a particular property is always being filtered, you can do so here.

For example, instead of directly trying to enforce the filter in the prompt, you could replace
<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START FilterExampleBad"
            endMarker="# END FilterExampleBad"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START FilterExampleBad"
            endMarker="// END FilterExampleBad"
            language="ts"
        />
    </TabItem>
</Tabs>

with

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START FilterExampleGood"
            endMarker="# END FilterExampleGood"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START FilterExampleGood"
            endMarker="// END FilterExampleGood"
            language="ts"
        />
    </TabItem>
</Tabs>

<details>
<summary>Additional Information</summary>

You would expect both examples to provide the same (or similar) output. The directness in the first prompt is very likely to ensure that the agent provides an accurate filter based on the request. 

However, since the LLM agent is a non-deterministic process, it is never guaranteed. Directly passing the filter ensures it will always be used.

</details>

Another example could be in a user-facing app, if you want to restrict search results to only a single user ID, you can directly pass the filter instead of relying on the agent to use the correct filter.

## Basic Filtering

A single filter, such as limiting the search to only a single category, can be constructed simply.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicFilter"
            endMarker="# END BasicFilter"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicFilter"
            endMarker="// END BasicFilter"
            language="ts"
        />
    </TabItem>
</Tabs>

## Nested Filtering

If you want to provide more than one filter, you can wrap it in either a logical `AND` or `OR` using Weaviate filter construction, such as:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START NestedFilter"
            endMarker="# END NestedFilter"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START NestedFilter"
            endMarker="// END NestedFilter"
            language="ts"
        />
    </TabItem>
</Tabs>

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
