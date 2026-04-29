---
title: Ask Mode
description: "Use the query agent to search data and get an answer from the LLM."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'query agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/\_includes/query_agent.py';
import TSCode from '!!raw-loader!/docs/agents/\_includes/query_agent.mts';

# Ask Mode

<CloudOnlyBadge />

Full breakdown of ask mode, step by step:

* Basic usage (similar to quick start)
* Arguments/Configurable options, such as:
    * user query input/Conversational inputs, brief explanation and link to the reference page
    * collection names and configuration, brief explanation and link to reference page
    * Extra filters, brief explanation and link to the reference page
    * `result_evaluation` i.e. disabling or enabling the evaluate node, what it does and what costs it ensues
* Streaming:
    * What different result payloads there are
    * How text is streamed from final answer node
    * Example code which parses results / strings to write the answer as strings come through
* Accessing results of the response, e.g. final answer, usage, sources, and a breakdown of each one

