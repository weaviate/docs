---
title: Limitations & troubleshooting
description: "Diagnose common issues and understand the limitations of the Query Agent."
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'troubleshooting']
---

Things to check when the Query Agent isn't behaving as expected, plus the soft usage limits and typical execution timings to keep in mind.

## Troubleshooting

### The Query Agent is not available

- **Agents are not enabled for your organization.** Agents is an organization-level page in the [Weaviate Cloud console](/go/console?utm_content=agents), under `Agents` in the sidebar. If `Enable Agents` is off, switch it on — it is set once for the whole organization.
- **The instance is not a Weaviate Cloud instance.** The Query Agent runs as a Weaviate Cloud service. A locally running Weaviate instance does not support it. See [Installation](../installation.md).
- **The client package is missing or out of date.** Install `weaviate-agents` alongside the Weaviate client, and check you are on a version that has the feature you are using. See the [Python](../clients/python.md) and [JavaScript/TypeScript](../clients/typescript.md) client pages.

### You run out of free requests

The free allowance is 1,000 Query Agent requests per organization per month, and it resets monthly. The `Agents` page in the console shows the allowance, how much of it you have used, and the reset date — check there first when requests start failing.

Requests are not all equal: an `Ask` query consumes 4 requests, while `Search` and `Suggest Queries` consume 1 each. An agent used mostly through `Ask` reaches the limit about four times faster than the request count suggests. See [Usage limits](#usage-limits) below.

### The answer is wrong or the agent searched the wrong collection

- The agent routes queries using each collection's `description` and its property descriptions. Vague or missing descriptions are the most common cause of a query landing on the wrong collection. See [Custom collection descriptions](#custom-collection-descriptions) below.
- The agent can only see what its credentials can see. It derives access from the Weaviate client object you pass it, further narrowed by the collection names you give it. A collection missing from an answer is often a permissions or `collections` argument problem, not a search problem.
- The response object reports the searches the agent actually ran, including the generated queries and filters. Inspect `searches` on the response to see what the agent did before you change the prompt.

### A request times out or takes too long

A single run makes several model calls and several Weaviate queries, so ~10 seconds is normal and complex queries take longer. For long-running queries, use [streaming responses](../guides/ask_mode.md#streaming), which send progress updates and heartbeats that keep the connection alive. See [Execution times](#execution-times) below.

### Where to see errors

The clients raise an exception carrying the reason for the failure, so log or print the full exception rather than only its type. For usage problems, the `Agents` page in the console is the place to look. If a failure is not explained by anything above, [contact support](https://support.weaviate.io).

## Usage limits

import UsageLimits from "/\_includes/agents/query-agent-usage-limits.mdx";

<UsageLimits />

## Custom collection descriptions

import CollectionDescriptions from "/\_includes/agents/query-agent-collection-descriptions.mdx";

<CollectionDescriptions />

## Execution times

import ExecutionTimes from "/\_includes/agents/query-agent-execution-times.mdx";

<ExecutionTimes />

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
