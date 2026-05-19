---
title: Ask Mode
description: "Use Ask Mode to retrieve data from Weaviate and get a generated answer."
image: og/docs/agents.jpg
tags: ['agents', 'query-agent', 'modes']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/code/ask_mode.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/code/ask_mode.mts';

<CloudOnlyBadge />

Ask Mode, called by the `ask` method, transforms your query into actionable searches or aggregations, and then provides a final answer to the question.

For example, you could ask:

> "How many orders related to books were placed last week?"

And the agents will filter for `orders`, perform semantic search for `books` and sort or filter for timestamps from the last week. Then, the agent will provide a response, answering this question exactly based on the data retrieved.

## Usage

Like all features of the Query Agent, it requires instantiation of the `QueryAgent` class, which is connected to your Weaviate `client`. Class instantiation - [see the page for more details](../reference/instantiation.md).

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

Make sure to include your API keys in your environment, and specify whichever collection you want to search over.

:::note Async
In Python, the Query Agent supports both synchronous and asynchronous usage. The Python examples on this page use the synchronous client, but can be easily replaced with the async equivalents — see the [async section](#async) for details. In JavaScript/TypeScript, all calls are asynchronous by default and use `await`.
:::

### Parameters

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">


The `.ask()` method accepts several arguments:

    - **`query`**: The user query you want the agent to answer. This can be a simple string (`"What is the highest-grossing product?"`) or a list of chat messages (for conversational context). Multi-turn conversations - [see the page for more details](../reference/multi_turn_conversations.md).
    - **`collections`**: The name(s) of the collections to search. You can pass one or many collection names as a list of strings (e.g., `["ECommerce", "BookSales"]`), or provide collection configuration objects for more control. If specified in the `ask` method, it will overwrite those defined in the instantiation of `QueryAgent`. Collection configuration - [see the page for more details](../reference/advanced_collections.md).
    - **`result_evaluation`**: Controls whether the agent will ask an LLM to "evaluate" (i.e., rewrite or rephrase) the result based on all retrieved context. Accepts either:
        - `"none"` (default): faster and cheaper; where the final answer is the last LLM call and no further analysis is completed.
        - `"llm"`: higher cost/latency - enables a final step where an LLM subsets the sources retrieved to only those used in the answer, as well as enabling the optional fields `is_partial_answer` and `missing_information`. See [the response class](#response) for more details.
</TabItem>
<TabItem value="ts_agents" label="JavaScript/TypeScript">

The `.ask()` method accepts several arguments:

    - **`query`**: The user query you want the agent to answer. This can be a simple string (`"What is the highest-grossing product?"`) or a list of chat messages (for conversational context). Multi-turn conversations - [see the page for more details](../reference/multi_turn_conversations.md).
    - **`collections`**: The name(s) of the collections to search. You can pass one or many collection names as a list of strings (e.g., `["ECommerce", "BookSales"]`), or provide collection configuration objects for more control. Collection configuration - [see the page for more details](../reference/advanced_collections.md). If specified in the `ask` method, it will overwrite those defined in the instantiation of `QueryAgent`.
    - **`resultEvaluation`** : Controls whether the agent will ask an LLM to "evaluate" (i.e., rewrite or rephrase) the result based on all retrieved context. Accepts either:
        - `"none"`: faster and cheaper; default setting where the final answer is the last LLM call.
        - `"llm"`: higher cost/latency - enables a final step where an LLM subsets the sources retrieved to only those used in the answer, as well as enabling the optional fields `is_partial_answer` and `missing_information`. See [the response class](#response) for more details.
</TabItem>
</Tabs>

For more advanced searches, you can also specify _additional filters_ within the collection configuration. Additional filters - [see the page for more details](../reference/additional_filters.md).

These arguments allow you to customize agent behavior, data access, and the type of answer you receive. 

## Response
The `AskModeResponse` class has the following properties:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
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

While regular Ask Mode returns a single object, you can choose to stream updates and tokens from the workflow of Ask Mode instead. 

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

Since the Query Agent is a multi-layered agentic system, there are different types of streaming payloads you will receive. Each one always has a field that identifies which payload it is, [see below](#responses).

### Request

In addition to the standard Ask Mode arguments ([above](#arguments)), the streaming method accepts two extra flags that control which payload types are emitted:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">

| Parameter | Type | Description |
| --- | --- | --- |
| `include_progress` | `bool` | Optional. If `True` (default), the agent will stream `ProgressMessage` updates as it processes the query. |
| `include_final_state` | `bool` | Optional. If `True` (default), the agent will emit a final `AskModeResponse` payload at the end of the stream. |

If both `include_progress` and `include_final_state` are set to `false`, the stream will only emit `StreamedTokens` payloads as the final answer is generated.
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">

| Parameter | Type | Description |
| --- | --- | --- |
| `includeProgress` | `boolean` | Optional. If `true` (default), the agent will stream `ProgressMessage` updates as it processes the query. |
| `includeFinalState` | `boolean` | Optional. If `true` (default), the agent will emit a final `AskModeResponse` payload at the end of the stream. |

If both `includeProgress` and `includeFinalState` are set to `false`, the stream will only emit `StreamedTokens` payloads as the final answer is generated.

    </TabItem>
</Tabs>

### Responses

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

### Example: Handling Different Streamed Responses

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

<!-- In JavaScript/TypeScript, the `QueryAgent` is asynchronous by default — the examples in the previous sections already are asynchronous, and no separate async setup is needed. -->


<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">

In Python, the above examples use the synchronous client, but Ask Mode can also be called asynchronously. This requires the `AsyncQueryAgent` class (instantiated the same way as its sync counterpart) together with an async Weaviate client. 

<FilteredTextBlock
    text={PyCode}
    startMarker="# START AsyncInstantiation"
    endMarker="# END AsyncInstantiation"
    language="py"
/>

The `.ask()` method must be awaited:
<FilteredTextBlock
    text={PyCode}
    startMarker="# START AsyncAsk"
    endMarker="# END AsyncAsk"
    language="py"
/>

And the `.ask_stream()` method must be used in an `async for` loop:
<FilteredTextBlock
    text={PyCode}
    startMarker="# START AsyncStreaming"
    endMarker="# END AsyncStreaming"
    language="py"
/>
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">

In JavaScript/TypeScript, the `QueryAgent` is asynchronous by default — the examples in the previous sections already are asynchronous,  and no separate async setup is needed.

</TabItem>
</Tabs>


## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
