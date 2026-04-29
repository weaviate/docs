---
title: Search Mode
description: "Use the query agent to agentically search your database without generating an answer. Retrieving results only."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started', 'query agent']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/\_includes/query_agent.py';
import TSCode from '!!raw-loader!/docs/agents/\_includes/query_agent.mts';

# Search Mode

<CloudOnlyBadge />


Full breakdown of search mode, step by step:

* Basic usage (similar to quick start)
* Arguments/Configurable options, such as:
    * user query input/Conversational inputs, brief explanation and link to the reference page
    * collection names and configuration, brief explanation and link to reference page
    * Extra filters, brief explanation and link to the reference page
    * diversity ranking
* Streaming:
    * What different result payloads there are
* Accessing results: weaviate objects, pagination, usage

