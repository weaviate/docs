---
title: Collection Configuration
description: "Configure how Weaviate collections are exposed to the Query Agent."
image: og/docs/agents.jpg
tags: ['agents', 'query-agent', 'configuration']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/code/advanced_collections.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/code/advanced_collections.mts';

<!-- Contains:
* Explanation on how the QA can choose which collections are queried
* Detail on how you can pass either string or `QueryAgentCollectionConfig` to the `collections` argument to `.ask()` or `.search()`
* Full breakdown of `QueryAgentCollectionConfig` and all its arguments:
    * `target_vector`
    * `view_properties`
    * `additional_filters` and link to additional filters reference page -->

The Query Agent, in Ask Mode or Search Mode, has the option to search one or more of any collections that are provided to it. 

These collections can either be specified by a string (the name of the collection) or via a more advanced configuration.

### Simple Configuration

To give your collections without any advanced configuration, you can just pass strings of the collection names to the Query Agent.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SimpleConfig"
            endMarker="# END SimpleConfig"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SimpleConfig"
            endMarker="// END SimpleConfig"
            language="ts"
        />
    </TabItem>
</Tabs>

### Advanced Configuration

You can provide a more detailed configuration on how you want the agents to interact with your collections to define the tenant names (for a multi-tenant collection), target vector(s), property names and any additional filters.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START AdvancedConfig"
            endMarker="# END AdvancedConfig"
            language="py"
        />
The `QueryAgentCollectionConfig` class accepts the following arguments:

| Field | Description |
| --- | --- |
| `name` | The name of the collection to query. Required. |
| `target_vector` | An optional list of target vector name(s) for collections with named vectors. Required when the collection has more than one named vector. |
| `view_properties` | An optional list of property names that the agent is allowed to view when reasoning about and querying the collection. If omitted, the agent can view all properties. |
| `tenant` | An optional tenant name for collections with multi-tenancy enabled. |
| `additional_filters` | An optional `Filter` object that is always combined with any agent-generated filters when querying this collection. [See the page on additional filters for more detail](./additional_filters.md). |

</TabItem>
<TabItem value="ts_agents" label="JavaScript/TypeScript">
    <FilteredTextBlock
        text={TSCode}
        startMarker="// START AdvancedConfig"
        endMarker="// END AdvancedConfig"
        language="ts"
    />

A collection configuration object accepts the following fields:

| Field | Description |
| --- | --- |
| `name` | The name of the collection to query. Required. |
| `targetVector` | An optional list of target vector name(s) for collections with named vectors. Required when the collection has more than one named vector. |
| `viewProperties` | An optional list of property names that the agent is allowed to view when reasoning about and querying the collection. If omitted, the agent can view all properties. |
| `tenant` | An optional tenant name for collections with multi-tenancy enabled. |
| `additionalFilters` | An optional `Filter` object that is always combined with any agent-generated filters when querying this collection. [See the page on additional filters for more detail](./additional_filters.md). |

</TabItem>
</Tabs>

## Runtime Configuration

The examples above show configuring collections at instantiation of the Query Agent. This defines the _default_ collections which will be used automatically when running Ask Mode or Search Mode.

You can instead or additionally provide collection information at runtime of the Query Agent, which will override any default collections set at instantiation.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START RuntimeConfigAsk"
            endMarker="# END RuntimeConfigAsk"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START RuntimeConfigAsk"
            endMarker="// END RuntimeConfigAsk"
            language="ts"
        />
    </TabItem>
</Tabs>

Similarly to above, this collection can also be either string(s) of the collection name(s), or a set of configurations.  

This is possible in both Ask and Search Mode.

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

