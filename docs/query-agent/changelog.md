---
title: Changelog
description: "Important news, updates, and improvements to the Weaviate Query Agent."
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'changelog']
---

This page documents changes and notable updates to the Weaviate Query Agent. As the Query Agent is a managed service, improvements roll out automatically though sometimes you may need to upgrade the client to use new features.

## September 2026

### Faster responses for long conversations

The Query Agent now dynamically selects the optimal service tier based on conversation length, automatically upgrading requests to a faster priority tier where possible. Combined with recent model price reductions, this delivers quicker responses at a lower cost — especially for long multi-turn conversations. This happens automatically for all requests — see [multi-turn conversations](./reference/multi_turn_conversations.md) for how to make the most of conversational context.

## July 2026

### New `effort` parameter in Search Mode

Search Mode gained an optional `effort` parameter, letting you choose how much work the agent puts into each search. Higher effort levels widen retrieval for better recall and add an extra reranking pass for higher-quality results. Learn more in the [Search Mode guide](./guides/search_mode.md).

### Upgraded to the latest OpenAI models

The Query Agent was upgraded to OpenAI's latest Luna and Terra models, delivering improved results on our internal Search Mode benchmarks along with better query understanding across all modes.

### Ranking instructions in Search Mode

Search Mode now accepts a `ranking_instructions` argument, giving you direct control over how results are ranked — independent of the system prompt used for query writing. See the [Search Mode guide](./guides/search_mode.md) for details.

### Structured outputs in Ask Mode

Ask Mode now supports structured outputs: provide an `output_format` schema and receive the final answer as a validated, typed object instead of free text. See the [structured outputs reference](./reference/structured_outputs.md).

### Follow-up query suggestions

Suggest Queries mode can now take a conversation history and suggest follow-up queries that continue the user's current thread, rather than generic queries about the collection. See the [Suggest Queries guide](./guides/suggest_queries.md).
