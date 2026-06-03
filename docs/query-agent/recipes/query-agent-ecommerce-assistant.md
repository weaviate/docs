---
layout: recipe
toc: True
title: "Build a Query Agent e-commerce assistant"
featured: True
integration: False
agent: True
sidebar_position: 20
# tags: ['Query Agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/query-agent/_includes/code/query_agent_ecommerce_assistant.py';

In this recipe, we will be building a simple e-commerce assistant agent with the [Weaviate Query Agent](https://docs.weaviate.io/query-agent). This agent will have access to a number of Weaviate collections, and will be capable of answering complex queries about brands and clothing items, accessing information from each collection. By the end, we'll wrap the agent in a small reusable class that's ready to plug into a chatbot, CLI, or any larger application.

![Weaviate Query Agent flowchart for the Ecommerce example](../_includes/query_agent_tutorial_ecommerce_flowchart.png#gh-light-mode-only "Weaviate Query Agent flowchart for the Ecommerce example")
![Weaviate Query Agent flowchart for the Ecommerce example](../_includes/query_agent_tutorial_ecommerce_flowchart.png#gh-dark-mode-only "Weaviate Query Agent flowchart for the Ecommerce example")

> 📚 You can read and learn more about this service in our ["Introducing the Weaviate Query Agent"](https://weaviate.io/blog/query-agent) blog.

To get started, we've prepared two open datasets, available on Hugging Face. The first step will be walking through how to populate your Weaviate Cloud collections.

- [**E-commerce:**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-ecommerce) A dataset that lists clothing items, prices, brands, reviews, etc.
- [**Brands:**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-brands) A dataset that lists clothing brands and information about them such as their parent brand, child brands, average customer rating, etc.

> 💡 New to the Query Agent? Start with the [**Get Started**](./query-agent-get-started.md) recipe — it walks through Ask Mode, Search Mode and Suggest Queries at a higher level before diving into this use-case-focused tutorial.

## 1. Setting up Weaviate & importing data

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

In the following code blocks, we are pulling our demo datasets from Hugging Face and writing them to new collections in our Weaviate Serverless cluster.

> ❗️ The `QueryAgent` uses the descriptions of collections and properties to decide which ones to use when solving queries, and to access more information about properties. You can experiment with changing these descriptions, providing more detail, and more. It's good practice to provide property descriptions too. For example, below we make sure that the `QueryAgent` knows that prices are all in USD, which is information that would otherwise be unavailable.

![Ecommerce and Brands collection example data](../_includes/query_agent_tutorial_ecommerce_dataset.png#gh-light-mode-only "Ecommerce and Brands collection example data")
![Ecommerce and Brands collection example data](../_includes/query_agent_tutorial_ecommerce_dataset.png#gh-dark-mode-only "Ecommerce and Brands collection example data")


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

Let's start with a simple agent. Here, we're creating an `agent` that has access to our `Brands` & `ECommerce` datasets, and frame it as a helpful shopping assistant via the system prompt.

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

## 3. Run the Query Agent

When we run the agent, it will first make a few decisions, depending on the query:

1. The agent will decide which collection or collections to look up an answer in.
2. The agent will also decide whether to perform a regular ***search query***, what ***filters*** to use, whether to do an ***aggregation query***, or all of them together!
3. It will then provide a response, accessible via `response.final_answer`, `response.sources`, or by calling `response.display()` for a rich formatted view.

### Ask a question
**Let's start with a simple question: "I like the vintage clothes, can you list me some options that are less than &#36;200?"**

We can then also inspect how the agent responded, what kind of searches it performed on which collections, whether it has identified if the final answer is missing information or not, as well as the final answer 👇

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START AskVintage"
  endMarker="# END AskVintage"
  language="py"
/>

</TabItem>
</Tabs>

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
│ QueryResultWithCollectionNormalized(                                                                            │
│     query='vintage clothes',                                                                                    │
│     filters=IntegerPropertyFilter(                                                                              │
│         property_name='price',                                                                                  │
│         operator=&lt;ComparisonOperator.LESS_THAN: '&lt;'&gt;,                                                           │
│         value=200.0                                                                                             │
│     ),                                                                                                          │
│     collection='ECommerce'                                                                                      │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

### Ask a follow-up question

Customers rarely ask one question and stop — they have a conversation. To give the agent the prior turns, pass a list of `ChatMessage` objects to `.ask()` instead of a single string. The agent will then use the full message history as context.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START FollowUp"
  endMarker="# END FollowUp"
  language="py"
/>

</TabItem>
</Tabs>

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

Now let's try a question that should require an aggregation. Let's see which brand lists the most shoes.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START AskAggregation"
  endMarker="# END AskAggregation"
  language="py"
/>

</TabItem>
</Tabs>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭──────────────────────────────────────────────── 📝 Final Answer ────────────────────────────────────────────────╮
│                                                                                                                 │
│ The brand that lists the most shoes is Loom &amp; Aura with a total of 118 shoe listings.                           │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

<pre style={{whiteSpace: 'pre', overflowX: 'auto', lineHeight: 'normal', fontFamily: 'Menlo,\'DejaVu Sans Mono\',consolas,\'Courier New\',monospace'}}>╭──────────────────────────────────────────── 📊 Aggregations Run 1/1 ────────────────────────────────────────────╮
│                                                                                                                 │
│ AggregationResultWithCollectionNormalized(                                                                      │
│     groupby_property='brand',                                                                                   │
│     aggregation=IntegerPropertyAggregation(property_name='collection', metrics=&lt;NumericMetrics.COUNT: 'COUNT'&gt;), │
│     filters=None,                                                                                               │
│     collection='ECommerce'                                                                                      │
│ )                                                                                                               │
│                                                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯</pre>

### Search across multiple collections

In some cases, we need to combine the results of searches across multiple collections. From the result above, we can see that "Loom & Aura" lists the most shoes.

Let's imagine a scenario where the user would now want to find out more about this company, _as well_ as the items that they sell.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START AskMultiCollection"
  endMarker="# END AskMultiCollection"
  language="py"
/>

</TabItem>
</Tabs>

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

You can see in `response.display()` that the agent issued two searches against the `Brands` collection (to find the parent/child relationships) plus one aggregation against the `ECommerce` collection (to compute the average price) — all from a single natural-language call.

## 4. Wrap the agent as a reusable assistant

So far we've been calling `agent.ask()` ad hoc and rebuilding the conversation list ourselves. To plug this into a real app, we want a small wrapper that:
- Keeps a running conversation history across calls.
- Returns just the final answer to the caller.
- Lets us reset between sessions.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START AssistantClass"
  endMarker="# END AssistantClass"
  language="py"
/>

</TabItem>
</Tabs>

We can now drive a multi-turn session with a single object:

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START DriveAssistant"
  endMarker="# END DriveAssistant"
  language="py"
/>

</TabItem>
</Tabs>

From here, the `ECommerceAssistant` is a self-contained component you can drop into a web app, Slack bot, CLI, or any flow where a customer needs to talk to your catalog in natural language. Because all of the search and aggregation work is delegated to the Query Agent, your application code stays small.

### Extending the assistant

A few directions you can take this from here:
- **Switch to Search Mode for product grids.** When you want to render a list of products rather than a written answer, call `agent.search(...)` and pass `response.search_results.objects` to your UI. See the [Search Mode](../guides/search_mode.md) page.
- **Tune the assistant's voice with a richer system prompt.** Add brand-voice guidelines, response formatting (markdown, JSON), or language requirements. See [Customizing the System Prompt](../reference/system_prompt.md).
- **Restrict to a single user's data.** If your catalog is multi-tenant, set `tenant` on a `QueryAgentCollectionConfig`. To enforce a hard filter (e.g. `region = "EU"`) regardless of what the LLM decides, use `additional_filters`. See [Additional Filters](../reference/additional_filters.md) and [Collection Configuration](../reference/advanced_collections.md).

## Further resources

- [**Build a Streaming Chat UI with Streamlit**](./query-agent-streamlit-chat.md) — A direct continuation of this recipe: wrap the same `ECommerce + Brands` agent in a Streamlit app with token-by-token streaming, live progress updates, and persisted multi-turn history.
- [**Ask Mode**](../guides/ask_mode.md) — Streaming, system prompts, result evaluation.
- [**Multi-turn Conversations**](../reference/multi_turn_conversations.md) — More detail on the conversation pattern used above.
- [**Search Mode**](../guides/search_mode.md) — Use Search Mode if you want raw results instead of a written answer (for example to render a product grid).

Close the client when you're done:

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
