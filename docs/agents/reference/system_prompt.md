---
title: System Prompt
sidebar_position: 1
description: "Query Agent class instantiation details."
image: og/docs/agents.jpg
# tags: ['agents', 'getting started']
---


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/code/system_prompt.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/code/system_prompt.mts';

## Overview

You can provide a custom system prompt to guide the Query Agent's behavior, by passing it as part of the [instantiation](./instantiation.md).


<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START InstantiateWithSystemPrompt"
            endMarker="# END InstantiateWithSystemPrompt"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START InstantiateWithSystemPrompt"
            endMarker="// END InstantiateWithSystemPrompt"
            language="ts"
        />
    </TabItem>
</Tabs>

Then any run using the Query Agent will use this new set of instructions.

A custom system prompt is supported in **both ask mode and search mode.**

## How is it used?

The system prompt is used in two places:

1. During the query/aggregation writing - the system prompt is passed in addition to a general set of instructions to guide the construction of any queries.
2. During the writing of the final answer - the system prompt overrides a general prompt.

Therefore it is most useful to use the system prompt in one of two ways:
* Instructions specific for your data, so that the query writing agent has additional information to write queries more effectively.
* A guide for style and tone in writing the final answer, such as specific formatting instructions.

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
