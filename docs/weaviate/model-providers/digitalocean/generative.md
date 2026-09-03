---
title: Generative AI
description: "Weaviate's integration with DigitalOcean's Serverless Inference API allows you to access their generative models' capabilities directly from Weaviate."
sidebar_position: 50
image: og/docs/model-provider-integrations.jpg
# tags: ['model providers', 'digitalocean', 'generative', 'rag']
---

# DigitalOcean Generative AI with Weaviate

import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import PyCode from '!!raw-loader!../_includes/provider.generative.py';

Weaviate's integration with [DigitalOcean's Serverless Inference](https://docs.digitalocean.com/products/inference/how-to/use-serverless-inference/) allows you to access their generative models' capabilities directly from Weaviate.

[Configure a Weaviate collection](#configure-collection) to use a generative AI model with DigitalOcean. Weaviate will perform retrieval augmented generation (RAG) using the specified model and your DigitalOcean API key.

More specifically, Weaviate will perform a search, retrieve the most relevant objects, and then pass them to the DigitalOcean generative model to generate outputs.

:::info Code examples are Python-only for now
Examples for the other client languages will follow.
:::

## Requirements

### Weaviate configuration

Your Weaviate instance must be configured with the DigitalOcean generative AI integration (`generative-digitalocean`) module.

:::info Added in `v1.37.15`, `v1.38.13`, and `v1.39.2`
The `generative-digitalocean` module is available from `v1.37.15` on the `v1.37` line, `v1.38.13` on the `v1.38` line, and `v1.39.2` on the `v1.39` line. Earlier patch releases on these lines do not include it.
:::

<details>
  <summary>For Weaviate Cloud (WCD) users</summary>

This integration is enabled by default on Weaviate Cloud (WCD) instances.

</details>

<details>
  <summary>For self-hosted users</summary>

- This is an [API-based module](../index.md#enable-all-api-based-modules), so a Weaviate instance of a supported version loads it without any extra configuration.
- Check the [cluster metadata](/deploy/configuration/status.md#cluster-metadata) to verify if the module is enabled.
- Follow the [how-to configure modules](../../configuration/modules.md) guide if API-based modules have been disabled on your instance.

</details>

### API credentials {#api-credentials}

You must provide a valid DigitalOcean API key to Weaviate for this integration. Generate one in the [DigitalOcean Cloud console](https://cloud.digitalocean.com/) and supply it via one of:

- Set the `DIGITALOCEAN_APIKEY` environment variable on the Weaviate server.
- Provide the `X-Digitalocean-Api-Key` header at request time, as shown below.

The same API key serves both this integration and the [DigitalOcean embedding integration](./embeddings.md).

<FilteredTextBlock
  text={PyConnect}
  startMarker="# START DigitalOceanInstantiation"
  endMarker="# END DigitalOceanInstantiation"
  language="py"
/>

## Configure collection

import MutableGenerativeConfig from '/_includes/mutable-generative-config.md';

<MutableGenerativeConfig />

[Configure a Weaviate index](../../manage-collections/generative-reranker-models.mdx#specify-a-generative-model-integration) as follows to use a DigitalOcean generative model:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START GenerativeDigitalOceanCustomModel"
  endMarker="# END GenerativeDigitalOceanCustomModel"
  language="pyindent"
/>

### Select a model

Set `model` to any model that DigitalOcean Serverless Inference serves for your account. See [Available models](#available-models) for where to find the current names, and [Generative parameters](#generative-parameters) for the other settings you can configure alongside it.

If you omit `model`, Weaviate uses the module default, `llama-4-maverick`. The examples on this page set the model explicitly so that a collection does not silently depend on that default.

You can also [override the model at query time](#select-a-model-at-runtime).

### Generative parameters

Configure the following generative parameters to customize the model behavior.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START FullGenerativeDigitalOcean"
  endMarker="# END FullGenerativeDigitalOcean"
  language="pyindent"
/>

The collection configuration accepts these keys, and no others:

- `baseURL`: The API root that Weaviate sends requests to. Defaults to `https://inference.do-ai.run`. Override only if you are proxying or running against a non-default endpoint. Provide an API root rather than a full endpoint path, because Weaviate appends `/v1/chat/completions` to it.
- `model`: The model to generate with. Defaults to `llama-4-maverick`.
- `temperature`: Sampling temperature. Must be between `0.0` and `2.0`.
- `topP`: Nucleus sampling cutoff. Must be between `0.0` and `1.0`.
- `maxTokens`: The maximum number of tokens to generate. Must be at least `1`.
- `frequencyPenalty`: Must be between `-2.0` and `2.0`.
- `presencePenalty`: Must be between `-2.0` and `2.0`.
- `stop`: A list of strings that stop generation when the model produces them.

Only `baseURL` and `model` have Weaviate-side defaults. Weaviate omits every other unset key from the request, so DigitalOcean's own default applies.

Weaviate checks the ranges above when you create or update the collection, and rejects a configuration that falls outside them.

:::caution Configuration keys are case-sensitive
Weaviate matches these keys exactly as spelled above. A key written with different casing, such as `baseUrl` instead of `baseURL`, is not recognized, and neither is a value of the wrong type, such as a number for `model`. In both cases Weaviate falls back to the default instead of reporting an error, so the setting is lost silently.
:::

This matters when you configure a collection through the REST API or another raw-JSON path, where you spell the keys yourself. The client libraries send the correct keys for you.

For further details on model parameters, see the [DigitalOcean chat completions documentation](https://docs.digitalocean.com/products/inference/how-to/use-chat-completions-api/).

## Select a model at runtime

Aside from setting the default model provider when creating the collection, you can also override it at query time.

<FilteredTextBlock
  text={PyCode}
  startMarker="# START RuntimeModelSelectionDigitalOcean"
  endMarker="# END RuntimeModelSelectionDigitalOcean"
  language="pyindent"
/>

Every parameter listed under [Generative parameters](#generative-parameters) is also available at query time. Each one that you set at query time takes precedence over the collection configuration, which in turn takes precedence over the module default.

:::note Ranges are not re-checked at query time
The range checks listed under [Generative parameters](#generative-parameters) apply when you create or update a collection. A query-time value is passed straight through to DigitalOcean, so an out-of-range value surfaces as an error from DigitalOcean rather than from Weaviate.
:::

## Header parameters

You can provide the API key as well as some optional parameters at runtime through additional headers in the request. The following headers are available:

- `X-Digitalocean-Api-Key`: The DigitalOcean API key.
- `X-Digitalocean-Baseurl`: The base URL to use (e.g. a proxy) instead of the default DigitalOcean URL.

`X-Digitalocean-Api-Key` takes precedence over the `DIGITALOCEAN_APIKEY` environment variable. The API key is never part of the collection configuration, so if neither the header nor the environment variable is set, the request fails with `api key: no api key found neither in request header: X-Digitalocean-Api-Key nor in environment variable under DIGITALOCEAN_APIKEY`.

`X-Digitalocean-Baseurl` takes precedence over a `baseURL` set at query time, which in turn takes precedence over the `baseURL` in the collection configuration. If none of them are set, Weaviate uses `https://inference.do-ai.run`.

Provide the headers as shown in the [API credentials examples](#api-credentials) above.

## Retrieval augmented generation

After configuring the generative AI integration, perform RAG operations, either with the [single prompt](#single-prompt) or [grouped task](#grouped-task) method.

:::note Text-only integration
This integration sends the retrieved objects to DigitalOcean as a single text prompt. It does not support image inputs, separate system prompts, streaming responses, or tool calling.
:::

### Single prompt

To generate text for each object in the search results, use the single prompt method.

The example below generates outputs for each of the `n` search results, where `n` is specified by the `limit` parameter.

When creating a single prompt query, use braces `{}` to interpolate the object properties you want Weaviate to pass on to the language model. For example, to pass on the object's `title` property, include `{title}` in the query. The property must exist and have a value on every retrieved object; otherwise, the query fails.

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

Weaviate forwards the configured model name to DigitalOcean as-is. The `generative-digitalocean` module keeps no list of model names and does not check the name, so a name that DigitalOcean does not serve is accepted when you create the collection and fails later, as an error from DigitalOcean at query time.

:::note Different from the embedding integration
The [DigitalOcean embedding integration](./embeddings.md) does check the model name against `GET /v1/models` when a server-side `DIGITALOCEAN_APIKEY` is set. The generative integration never checks it, so verify the name against the catalogue yourself.
:::

For the models available to your account, query `GET /v1/models` on the inference endpoint, or see the [DigitalOcean Serverless Inference docs](https://docs.digitalocean.com/products/inference/how-to/use-serverless-inference/) for the live list, as model availability can change.

## Further resources

### Other integrations

- [DigitalOcean embedding models + Weaviate](./embeddings.md)
- [Weaviate model providers overview](../index.md)

### Code examples

Once the integration is configured at the collection, the data management and search operations in Weaviate work identically to any other collection. See the following model-agnostic examples:

- The [How-to: Manage collections](../../manage-collections/index.mdx) and [How-to: Manage objects](../../manage-objects/index.mdx) guides show how to perform data operations (i.e. create, read, update, delete collections and objects within them).
- The [How-to: Query & Search](../../search/index.mdx) guides show how to perform search operations (i.e. vector, keyword, hybrid) as well as retrieval augmented generation.

### References

- [DigitalOcean Serverless Inference documentation](https://docs.digitalocean.com/products/inference/how-to/use-serverless-inference/)
- [DigitalOcean chat completions API](https://docs.digitalocean.com/products/inference/how-to/use-chat-completions-api/)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
