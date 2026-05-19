---
title: Quickstart
description: "Get started with the Weaviate Query Agent through a runnable example."
image: og/docs/agents.jpg
tags: ['agents', 'query-agent', 'getting-started']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/\_includes/code/quickstart.py';
import TSCode from '!!raw-loader!/docs/agents/\_includes/code/quickstart.mts';

<CloudOnlyBadge />

## Prerequisites

Ensure you have access to:
* A **Weaviate Cloud Instance**, such as a [free sandbox instance](/go/console?utm_content=agents).
* Either one of the **Python Client**, **TypeScript Client** or the functionality to call the **API endpoints** directly.

Installation - [see the page for more details](./installation.md).


## Start the Query Agent

You only need to provide:
- Your Weaviate client object, which points to a target [Weaviate Cloud instance](/cloud/manage-clusters/connect.mdx)
- The collections you want to make possible to be searched.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START InstantiateQueryAgent"
            endMarker="# END InstantiateQueryAgent"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START InstantiateQueryAgent"
            endMarker="// END InstantiateQueryAgent"
            language="ts"
        />
    </TabItem>

</Tabs>

## Search with the Query Agent

Perform a search using Search Mode (retrieval only, no answer generation). The LLM decides dynamic search options (such as filters, sorts, etc.) and returns the search results.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicSearchQuery"
            endMarker="# END BasicSearchQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicSearchQuery"
            endMarker="// END BasicSearchQuery"
            language="ts"
        />
    </TabItem>
</Tabs>

Search Mode returns the raw Weaviate objects, as if you had performed the search in Weaviate directly.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicSearchResponse"
            endMarker="# END BasicSearchResponse"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicSearchResponse"
            endMarker="// END BasicSearchResponse"
            language="ts"
        />
    </TabItem>
</Tabs>

<details>
  <summary>Example output</summary>
```
Product: Sky Shimmer Sneaks - $69.0
Product: Garden Serenade Sandals - $56.0
Product: Forest Murmur Sandals - $59.0
Product: Mystic Garden Strappy Flats - $59.0
```
</details>

## Ask the Query Agent

Perform a query using Ask Mode (with answer generation). The LLM creates a search with dynamic filters and other search settings, and then answers the question using the search results to inform the answer.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicAskQuery"
            endMarker="# END BasicAskQuery"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicAskQuery"
            endMarker="// END BasicAskQuery"
            language="ts"
        />
    </TabItem>
</Tabs>


You can access specific search results via `ask_response.sources`, the final response via `ask_response.final_answer`, or view all outputs via `ask_response.display()`.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicAskResponse"
            endMarker="# END BasicAskResponse"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicAskResponse"
            endMarker="// END BasicAskResponse"
            language="ts"
        />
    </TabItem>
</Tabs>
<details>
  <summary>Example output</summary>
```
╭───────────────────────────────────────────── 💬 Ask Mode Response ──────────────────────────────────────────────╮
│                                                                                                                 │
│ Here are some vintage-leaning clothes and nice shoes under $60:                                                 │
│                                                                                                                 │
│ **Clothes**                                                                                                     │
│ - Vintage Scholar Turtleneck — $55                                                                              │
│ - Victorian Noir Turtleneck — $58                                                                               │
│ - Retro Glitz Halter Top — $29.98                                                                               │
│ - RetroFuturist Tee — $29.98                                                                                    │
│ - Retro Pop Glitz Blouse — $46                                                                                  │
│ - Futurist Flashback Blouse — $59                                                                               │
│ - Space-Age Sequin Top — $46                                                                                    │
│ - Pop Glitz Button-Up — $46                                                                                     │
│ - Shimmering Pastel Crop Tee — $29.98                                                                           │
│ - Retro Groove Flared Pants — $59                                                                               │
│ - Pastel Dawn Jeans — $59                                                                                       │
│ - Twilight Spark Mini Dress — $59                                                                               │
│                                                                                                                 │
│ **Shoes**                                                                                                       │
│ - Mystic Garden Strappy Flats — $59                                                                             │
│ - Forest Murmur Sandals — $59                                                                                   │
│ - Garden Serenade Sandals — $56                                                                                 │
│                                                                                                                 │
│ If you want, I can also narrow these down by style, like more **true vintage**, **Y2K**, or **dark academia**.  │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────── 🔭 Search 1/2 ─────────────────────────────────────────────────╮
│                                                                                                                 │
│ QueryResultWithCollectionNormalized(                                                                            │
│     query='vintage style clothes retro apparel old-fashioned garments dresses tops bottoms outerwear            │
│ accessories',                                                                                                   │
│     filters=IntegerPropertyFilter(                                                                              │
│         property_name='price',                                                                                  │
│         operator=<ComparisonOperator.LESS_THAN: '<'>,                                                           │
│         value=60.0                                                                                              │
│     ),                                                                                                          │
│     collection='ECommerce',                                                                                     │
│     sort_property=None,                                                                                         │
│     uuid_value=None                                                                                             │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────── 🔭 Search 2/2 ─────────────────────────────────────────────────╮
│                                                                                                                 │
│ QueryResultWithCollectionNormalized(                                                                            │
│     query='stylish shoes footwear boots sneakers heels flats loafers',                                          │
│     filters=IntegerPropertyFilter(                                                                              │
│         property_name='price',                                                                                  │
│         operator=<ComparisonOperator.LESS_THAN: '<'>,                                                           │
│         value=60.0                                                                                              │
│     ),                                                                                                          │
│     collection='ECommerce',                                                                                     │
│     sort_property=None,                                                                                         │
│     uuid_value=None                                                                                             │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│ 📊 No Aggregations Run                                                                                          │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭────────────────────────────────────────────────── 📚 Sources ───────────────────────────────────────────────────╮
│                                                                                                                 │
│  - object_id='7a0730cc-b5ef-477c-af49-3f48812717d5' collection='ECommerce'                                      │
│  - object_id='60faa7af-ecb2-48f4-a496-74807b8e1856' collection='ECommerce'                                      │
│  - object_id='00d9638a-8ded-4bfe-8a36-fcf5b067a1b4' collection='ECommerce'                                      │
│  - object_id='c45bed45-aa7a-40c3-a7b3-2d59b9f43e1f' collection='ECommerce'                                      │
│  - object_id='d85a4802-45c4-4563-9d5e-b24db2a1bf75' collection='ECommerce'                                      │
│  - object_id='7550957b-b68e-41cd-aa5e-8ad9df1160b7' collection='ECommerce'                                      │
│  - object_id='afe828a6-a6de-4484-b7cb-933ec705a751' collection='ECommerce'                                      │
│  - object_id='ca2858c7-c303-43e1-baf6-f85c4e8cf0e7' collection='ECommerce'                                      │
│  - object_id='7fe657e7-d496-4302-8e77-3cca8f336a7c' collection='ECommerce'                                      │
│  - object_id='6188d087-ccde-416c-bb60-819db860280a' collection='ECommerce'                                      │
│  - object_id='7a75acf7-9cdd-46c1-9d3c-b033f92783f8' collection='ECommerce'                                      │
│  - object_id='84d6cba0-397b-4b55-9e51-b4c2fde2480b' collection='ECommerce'                                      │
│  - object_id='f8e4ac67-79e0-489b-a30c-c2af788ad4f6' collection='ECommerce'                                      │
│  - object_id='296ed34e-a0c8-4d1a-9259-abff65dcad0a' collection='ECommerce'                                      │
│  - object_id='cd1330f3-5e1e-47c3-85ef-7af92ab5bf52' collection='ECommerce'                                      │
│  - object_id='80d2d7f6-915e-4750-a27a-f6ae33735859' collection='ECommerce'                                      │
│  - object_id='5ac48f1f-204c-4498-9ed7-356418ef9f93' collection='ECommerce'                                      │
│  - object_id='e08017a4-8444-4eae-bd2e-7dd6abc21be6' collection='ECommerce'                                      │
│  - object_id='d1bfbcfe-08a7-4eec-bebd-33b35f771e32' collection='ECommerce'                                      │
│  - object_id='5f2d1c2c-51ce-478b-b4a5-d700f041110e' collection='ECommerce'                                      │
│  - object_id='2880c69e-fa19-4ecc-9f4c-7816db3302e5' collection='ECommerce'                                      │
│  - object_id='3822e271-a9b8-46d2-9402-1da2a605c970' collection='ECommerce'                                      │
│  - object_id='66eef8a1-f72f-44fe-86fb-ccbe928d3c1d' collection='ECommerce'                                      │
│  - object_id='56d4e9cf-27a6-4120-be5a-52ba70df9ad6' collection='ECommerce'                                      │
│  - object_id='a7a4577d-087b-466b-b99c-b7db5e1f2855' collection='ECommerce'                                      │
│  - object_id='423392a3-10db-4009-8f1e-d2ee0fe04257' collection='ECommerce'                                      │
│  - object_id='1185d4e0-013b-4ad2-9d08-9fb75c953417' collection='ECommerce'                                      │
│  - object_id='91b09adb-2903-4b4b-a750-18db6db8a787' collection='ECommerce'                                      │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
        📊 Usage Statistics        
┌──────────────────────────┬──────┐
│ Model Units:             │ 662  │
│ Usage in Plan:           │ True │
│ Remaining Plan Requests: │ -1   │
└──────────────────────────┴──────┘
Total Time Taken: 6.69s
```
</details>


## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
