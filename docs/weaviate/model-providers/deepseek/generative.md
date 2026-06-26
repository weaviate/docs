---
title: Generative AI
description: "Weaviate's integration with DeepSeek's API allows you to access their generative models' capabilities directly from Weaviate."
sidebar_position: 50
image: og/docs/model-provider-integrations.jpg
# tags: ['model providers', 'deepseek', 'generative', 'rag']
---

# DeepSeek Generative AI with Weaviate

import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import PyCode from '!!raw-loader!../_includes/provider.generative.py';

Weaviate's integration with DeepSeek's API allows you to access their generative models' capabilities directly from Weaviate.

[Configure a Weaviate collection](#configure-collection) to use a generative AI model with DeepSeek. Weaviate will perform retrieval augmented generation (RAG) using the specified model and your DeepSeek API key.

More specifically, Weaviate will perform a search, retrieve the most relevant objects, and then pass them to the DeepSeek generative model to generate outputs.

:::info Code examples are Python-only for now
This page currently shows Python examples only. The typed builder syntax shown below (`Configure.Generative.deepseek()`) is the intended Python client API; client support is being implemented to match it. Other client languages will be added once the corresponding client support ships.
:::

## Requirements

### Weaviate configuration

Your Weaviate instance must be configured with the DeepSeek generative AI integration (`generative-deepseek`) module.

:::info Added in `v1.36.19`, `v1.37.10`, and `v1.38.2`
The `generative-deepseek` module was added as a coordinated backport across the `v1.36`, `v1.37`, and `v1.38` release lines. It is available from `v1.36.19` (on the `v1.36` line), `v1.37.10` (on the `v1.37` line), and `v1.38.2` (on the `v1.38` line). Earlier patch releases on these lines do not include the module.
:::

<details>
  <summary>For Weaviate Cloud (WCD) users</summary>

This integration is enabled by default on Weaviate Cloud (WCD) instances.

</details>

<details>
  <summary>For self-hosted users</summary>

- Check the [cluster metadata](/deploy/configuration/status.md#cluster-metadata) to verify if the module is enabled.
- Follow the [how-to configure modules](../../configuration/modules.md) guide to enable the module in Weaviate.
- To enable the module, include it in the `ENABLE_MODULES` environment variable available to Weaviate, e.g. `ENABLE_MODULES="generative-deepseek"` (add it to your existing comma-separated list if other modules are enabled).

</details>

### API credentials

You must provide a valid DeepSeek API key to Weaviate for this integration. Go to [DeepSeek](https://platform.deepseek.com/) to sign up and obtain an API key.

Provide the API key to Weaviate using one of the following methods:

- Set the `DEEPSEEK_APIKEY` environment variable that is available to Weaviate.
- Provide the API key at runtime, as shown in the examples below.

<FilteredTextBlock
  text={PyConnect}
  startMarker="# START DeepseekInstantiation"
  endMarker="# END DeepseekInstantiation"
  language="py"
/>

## Configure collection

import MutableGenerativeConfig from '/_includes/mutable-generative-config.md';

<MutableGenerativeConfig />

[Configure a Weaviate index](../../manage-collections/generative-reranker-models.mdx#specify-a-generative-model-integration) as follows to use a DeepSeek generative model:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START BasicGenerativeDeepseek"
  endMarker="# END BasicGenerativeDeepseek"
  language="pyindent"
/>

### Select a model

You can specify one of the [available models](#available-models) for Weaviate to use, as shown in the following configuration example:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START GenerativeDeepseekCustomModel"
  endMarker="# END GenerativeDeepseekCustomModel"
  language="pyindent"
/>

You can [specify](#generative-parameters) one of the [available models](#available-models) for Weaviate to use. The [default model](#available-models) is used if no model is specified.

### Generative parameters

Configure the following generative parameters to customize the model behavior.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START FullGenerativeDeepseek"
  endMarker="# END FullGenerativeDeepseek"
  language="pyindent"
/>

For further details on model parameters, see the [DeepSeek API documentation](https://api-docs.deepseek.com/).

## Select a model at runtime

Aside from setting the default model provider when creating the collection, you can also override it at query time.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START RuntimeModelSelectionDeepseek"
  endMarker="# END RuntimeModelSelectionDeepseek"
  language="pyindent"
/>

## Header parameters

You can provide the API key as well as some optional parameters at runtime through additional headers in the request. The following headers are available:

- `X-Deepseek-Api-Key`: The DeepSeek API key.
- `X-Deepseek-Baseurl`: The base URL to use (e.g. a proxy) instead of the default DeepSeek URL.

These headers are case-insensitive on the wire. Any additional headers provided at runtime will override the existing Weaviate configuration.

Provide the headers as shown in the [API credentials examples](#api-credentials) above.

## Retrieval augmented generation

After configuring the generative AI integration, perform RAG operations, either with the [single prompt](#single-prompt) or [grouped task](#grouped-task) method.

### Single prompt

To generate text for each object in the search results, use the single prompt method.

The example below generates outputs for each of the `n` search results, where `n` is specified by the `limit` parameter.

When creating a single prompt query, use braces `{}` to interpolate the object properties you want Weaviate to pass on to the language model. For example, to pass on the object's `title` property, include `{title}` in the query.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START SinglePromptExample"
  endMarker="# END SinglePromptExample"
  language="py"
/>

### Grouped task

To generate one text for the entire set of search results, use the grouped task method.

In other words, when you have `n` search results, the generative model generates one output for the entire group.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START GroupedTaskExample"
  endMarker="# END GroupedTaskExample"
  language="py"
/>

## References

### Available models

Weaviate forwards the configured model name to DeepSeek as-is; there is no allowlist on the Weaviate side, so any current DeepSeek model id is accepted. We recommend setting `model` explicitly to one of the current models:

* `deepseek-v4-flash` (recommended; verified with this integration)
* `deepseek-v4-pro`

The module's built-in default model is `deepseek-chat`.

:::caution Legacy model aliases scheduled for deprecation
According to [DeepSeek's pricing page](https://api-docs.deepseek.com/quick_start/pricing), `deepseek-chat` and `deepseek-reasoner` are legacy aliases scheduled for deprecation on **2026-07-24**, and they currently map to `deepseek-v4-flash` (in non-thinking and thinking modes, respectively). To avoid disruption, set `model` explicitly to a current `deepseek-v4-*` model id rather than relying on the default.
:::

:::note Reasoning output is not returned
The `generative-deepseek` module returns only the model's message content. If you use a reasoning/thinking model, the separate reasoning (chain-of-thought) output is not surfaced through the integration.
:::

For the full list of models and pricing, see the [DeepSeek pricing page](https://api-docs.deepseek.com/quick_start/pricing) and the [DeepSeek API documentation](https://api-docs.deepseek.com/).

## Further resources

### Code examples

Once the integration is configured at the collection, the data management and search operations in Weaviate work identically to any other collection. See the following model-agnostic examples:

- The [How-to: Manage collections](../../manage-collections/index.mdx) and [How-to: Manage objects](../../manage-objects/index.mdx) guides show how to perform data operations (i.e. create, read, update, delete collections and objects within them).
- The [How-to: Query & Search](../../search/index.mdx) guides show how to perform search operations (i.e. vector, keyword, hybrid) as well as retrieval augmented generation.

### References

- [DeepSeek API documentation](https://api-docs.deepseek.com/)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
