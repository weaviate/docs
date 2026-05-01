---
title: Ask Mode
description: "Use the query agent to search data and get an answer from the LLM."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'query agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/code/ask_mode.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/code/ask_mode.mts';

<CloudOnlyBadge />


<!-- * Basic usage (similar to quick start)
* Arguments/Configurable options, such as:
    * user query input/Conversational inputs, brief explanation and link to the reference page
    * collection names and configuration, brief explanation and link to reference page
    * Extra filters, brief explanation and link to the reference page
    * `result_evaluation` i.e. disabling or enabling the evaluate node, what it does and what costs it incurs
* Streaming:
    * What different result payloads there are
    * How text is streamed from final answer node
    * Example code which parses results / strings to write the answer as strings come through
* Accessing results of the response, e.g. final answer, usage, sources, and a breakdown of each one -->


# Ask Mode

Ask mode, called by the `.ask()` method, transforms your query into actionable searches or aggregations, and then provides a final answer to the question.

For example, you could ask:

> "How many orders related to books were placed last week?"

And the agents will filter for `orders`, perform semantic search for `books` and sort or filter for timestamps from the last week. Then, the agent will provide a response, answering this question exactly based on the data retrieved.

## Usage

Like all features of the Query Agent, it requires instantiation of the `QueryAgent` class, which is connected to your Weaviate `client`. [See here for more details on instantiating the main class.](../reference/queryagent_class.md) 

Note, locally running Weaviate instances do not support the Query Agent.


<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicAskMode"
            endMarker="# END BasicAskMode"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicAskMode"
            endMarker="// END BasicAskMode"
            language="ts"
        />
    </TabItem>
</Tabs>

:::note Async
In Python, the Query Agent supports both synchronous and asynchronous usage. The Python examples on this page use the synchronous client, but can be easily replaced with the async equivalents — see the [async section](#async) for details. In JavaScript/TypeScript, all calls are asynchronous by default and use `await`.
:::

### Arguments

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">


The `.ask()` method accepts several arguments:

    - **`query`**: The user query you want the agent to answer. This can be a simple string (`"What is the highest-grossing product?"`) or a list of chat messages (for conversational context). To learn more about conversational inputs, see [the page on multi-turn conversations](../reference/multi_turn_conversations.md).
    - **`collections`**: The name(s) of the collections to search. You can pass one or many collection names as a list of strings (e.g., `["ECommerce", "BookSales"]`), or provide collection configuration objects for more control. Learn more in the [collection configuration guide](../reference/advanced_collections.md).
    - **`result_evaluation`**: Controls whether the agent will ask an LLM to "evaluate" (i.e., rewrite or rephrase) the result based on all retrieved context. Accepts either:
        - `"none"` (default): faster and cheaper; where the final answer is the last LLM call and no further analysis is completed.
        - `"llm"`: higher cost/latency - enables a final step where an LLM subsets the sources retrieved to only those used in the answer, as well as enabling the optional fields `is_partial_answer` and `missing_information`. See [the response class](#response) for more details.
</TabItem>
<TabItem value="ts_agents" label="JavaScript/TypeScript">

The `.ask()` method accepts several arguments:

    - **`query`**: The user query you want the agent to answer. This can be a simple string (`"What is the highest-grossing product?"`) or a list of chat messages (for conversational context). To learn more about conversational inputs, see [the page on multi-turn conversations](../reference/multi_turn_conversations.md).
    - **`collections`**: The name(s) of the collections to search. You can pass one or many collection names as a list of strings (e.g., `["ECommerce", "BookSales"]`), or provide collection configuration objects for more control. Learn more in the [collection configuration guide](../reference/advanced_collections.md).
    - **`resultEvaluation`** : Controls whether the agent will ask an LLM to "evaluate" (i.e., rewrite or rephrase) the result based on all retrieved context. Accepts either:
        - `"none"`: faster and cheaper; default setting where the final answer is the last LLM call.
        - `"llm"`: higher cost/latency - enables a final step where an LLM subsets the sources retrieved to only those used in the answer, as well as enabling the optional fields `is_partial_answer` and `missing_information`. See [the response class](#response) for more details.
</TabItem>
</Tabs>

For more advanced searches, you can also specify _additional filters_ within the collection configuration. See the [reference for filters](../reference/additional_filters.md) for more information.

These arguments allow you to customize agent behavior, data access, and the type of answer you receive. 

## Response
<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START ImportAskResponse"
            endMarker="# END ImportAskResponse"
            language="py"
        />

The `AskModeResponse` class has the following attributes:
| Field | Description |
| --- | --- |
| `searches` | A list of `QueryResultWithCollectionNormalized`. Each contains full details on the searches carried out during the run. This gives explicit information on the search query, filters, UUID values and sorts that were used, as well as the collection searched on. |
| `aggregations` | A list of `AggregationResultWithCollectionNormalized`. Each contains full details on the aggregations carried out during the run. This gives explicit information on the group-by property, filters, and aggregation metrics that were used, as well as the collection aggregated on. |
| `usage` | A `ModelUnitUsage` instance providing detail on the model units that were used during the run. The `model_units` are effectively token usage measurements normalized by cost. |
| `total_time` | Total time taken (seconds). |
| `is_partial_answer` | A boolean or null value indicating whether the answer is incomplete or not. Only available if `result_evaluation` is `"llm"`. |
| `missing_information` | A list of strings detailing what information is missing from the answer that makes it incomplete. Only available if `result_evaluation` is `"llm"`. |
| `final_answer` | A string comprising the LLM's final answer to the user query. |
| `sources` | A list of `Source` objects, which have an `object_id` property correlating to the UUID of the Weaviate object that was retrieved during the run. If `result_evaluation` is `"llm"`, these are subset to only those that are relevant to the `final_answer`. |
</TabItem>

<TabItem value="ts_agents" label="JavaScript/TypeScript">
    <FilteredTextBlock
        text={TSCode}
        startMarker="// START ImportAskResponse"
        endMarker="// END ImportAskResponse"
        language="ts"
    />

    The `AskModeResponse` class has the following attributes:

| Field | Description |
| --- | --- |
| `searches` | A list of `Search` objects. Each contains full details on the searches carried out during the run. This gives explicit information on the search query, filters, UUID values and sorts that were used, as well as the collection searched on. |
| `aggregations` | A list of `Aggregation` objects. Each contains full details on the aggregations carried out during the run. This gives explicit information on the group-by property, filters, and aggregation metrics that were used, as well as the collection aggregated on. |
| `usage` | A `ModelUnitUsage` object providing detail on the model units that were used during the run. The `modelUnits` are effectively token usage measurements normalized by cost. |
| `totalTime` | Total time taken (seconds). |
| `isPartialAnswer` | A boolean or null value indicating whether the answer is incomplete or not. Only available if `resultEvaluation` is `"llm"`. |
| `missingInformation` | A list of strings detailing what information is missing from the answer that makes it incomplete. Only available if `resultEvaluation` is `"llm"`. |
| `finalAnswer` | A string comprising the LLM's final answer to the user query. |
| `sources` | A list of `Source` objects, which have an `objectId` property correlating to the UUID of the Weaviate object that was retrieved during the run. If `resultEvaluation` is `"llm"`, these are subset to only those that are relevant to the `finalAnswer`. |

</TabItem>
    
</Tabs>


## Streaming

While `.ask()` returns a single object, you can choose to stream updates and tokens from the workflow of ask mode instead. 

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START StreamingAskMode"
            endMarker="# END StreamingAskMode"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START StreamingAskMode"
            endMarker="// END StreamingAskMode"
            language="ts"
        />
    </TabItem>
</Tabs>

Since the Query Agent is a multi-layered agentic system, there are different types of streaming payloads you will receive. Each one always has a field that identifies which payload it is.

### Streamed Responses

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

**`ProgressMessage`** — an update on what part of the system has most recently been completed. A class with four fields:

| Field | Description |
| --- | --- |
| `output_type` | Always `progress_message`. |
| `stage` | One of `query_analysis`, `search`, `aggregation`, or `final_answer`. Identifies the stage at which the agentic service is running. |
| `message` | A human-readable message describing what the agent is doing. For example, during `query_analysis` this is `"Analyzing query..."`. |
| `details` | A dictionary providing additional context about each stage.<br/><br/>During the `search` and `aggregation` stages, this typically includes a `"queries"` key — a list of dictionaries, each with:<br/>• `query` — the specific search term used.<br/>• `collection` — the collection the search was run against.<br/><br/>This lets you see exactly which queries were issued, and against which collections, at each stage. |

**`StreamedTokens`** — incremental chunks of the final answer as it is generated, letting you render the response token-by-token rather than waiting for it to complete. Each instance has two fields: `output_type` (always `"streamed_tokens"`) and `delta` (the newly generated tokens to append to what you have received so far).

**`AskModeResponse`** — the full response model, [as defined above](#response), with `output_type` always `final_state`. This is always the final result in the stream and indicates the system has completed.

</TabItem>
<TabItem value="ts_agents" label="JavaScript/TypeScript">

**`ProgressMessage`** — an update on what part of the system has most recently been completed. A class with four fields:

| Field | Description |
| --- | --- |
| `outputType` | Always `progressMessage`. |
| `stage` | One of `query_analysis`, `search`, `aggregation`, or `final_answer`. Identifies the stage at which the agentic service is running. |
| `message` | A human-readable message describing what the agent is doing. For example, during `query_analysis` this is `"Analyzing query..."`. |
| `details` | An object providing additional context about each stage.<br/><br/>During the `search` and `aggregation` stages, this typically includes a `"queries"` key — a list of objects, each with:<br/>• `query` — the specific search term used.<br/>• `collection` — the collection the search was run against.<br/><br/>This lets you see exactly which queries were issued, and against which collections, at each stage. |

**`StreamedTokens`** — incremental chunks of the final answer as it is generated, letting you render the response token-by-token rather than waiting for it to complete. Each instance has two fields: `outputType` (always `"streamedTokens"`) and `delta` (the newly generated tokens to append to what you have received so far).

**`AskModeResponse`** — the full response model, [as defined above](#response), with `outputType` always `finalState`. This is always the final result in the stream and indicates the system has completed.

</TabItem>
</Tabs>

### Streaming Example

You can handle each streamed payload differently depending on their class, or their output-type property. For example, you may want to display the progress message differently than building the tokens for the final answer.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START StreamingExample"
            endMarker="# END StreamingExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START StreamingExample"
            endMarker="// END StreamingExample"
            language="ts"
        />
    </TabItem>
</Tabs>

## Async

In JavaScript/TypeScript, the `QueryAgent` is asynchronous by default — the examples in the previous sections already use `await` and `for await ... of`, so no separate async setup is needed.

In Python, ask mode can also be called asynchronously, which requires the `AsyncQueryAgent` class together with an async Weaviate client. 

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START AsyncInstantiation"
            endMarker="# END AsyncInstantiation"
            language="py"
        />
    </TabItem>
</Tabs>

The `.ask()` method must be awaited:
<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START AsyncAsk"
            endMarker="# END AsyncAsk"
            language="py"
        />
    </TabItem>
</Tabs>

And the `.ask_stream()` method must be used in an `async for` loop:
<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START AsyncStreaming"
            endMarker="# END AsyncStreaming"
            language="py"
        />
    </TabItem>
</Tabs>