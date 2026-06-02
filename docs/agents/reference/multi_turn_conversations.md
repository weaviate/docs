---
title: Multi-turn conversations
description: "Pass conversation history to the Query Agent for context-aware follow-up questions."
image: og/docs/agents.jpg
tags: ['agents', 'query-agent', 'configuration']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/code/conversations.py';
import TSCode from '!!raw-loader!/docs/agents/_includes/code/conversations.mts';

The Query Agent transforms a natural language query into actionable searches. You can either pass a single string for the query, or provide more context by including a full conversation with previous message turns.


<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicConversation"
            endMarker="# END BasicConversation"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicConversation"
            endMarker="// END BasicConversation"
            language="ts"
        />
    </TabItem>
</Tabs>

Each message in the conversation must have a `role`, being either `"user"` or `"assistant"`, and `content`, being the text of the message. 

The final message should be a user message, and it will be treated as the current user query to define the task.

### Example: Iterative message history

In a chat-style application, you typically want each new user message to build on top of everything said so far, rather than asking the agent in isolation. To do this, keep a running list of `ChatMessage` objects and append both the user's query and the agent's reply to it after every turn. Pass the full list back into `qa.ask()` on the next call so the agent has the complete context.

The example below wraps this pattern in a simple way.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START ExampleMessageHistory"
            endMarker="# END ExampleMessageHistory"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START ExampleMessageHistory"
            endMarker="// END ExampleMessageHistory"
            language="ts"
        />
    </TabItem>
</Tabs>

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
