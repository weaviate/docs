---
title: Modules
sidebar_position: 11
image: og/docs/configuration.jpg
# tags: ['configuration', 'modules']
---

Weaviate's functionality can be customized by using [modules](/weaviate/concepts/modules.md). This page explains how to enable and configure modules.

## Instance-level configuration

At the instance (i.e. Weaviate cluster) level, you can:

- Enable modules
- Configure the default vectorizer module
- Configure module-specific variables (e.g. API keys), where applicable

This can be done by setting the appropriate [environment variables](/deploy/configuration/env-vars/index.md) as shown below.

:::tip What about WCD?
Weaviate Cloud (WCD) instances come with modules pre-configured. See [this page](/cloud/manage-clusters/status#enabled-modules) for details.
:::

### Enable individual modules

You can enable modules by specifying the list of modules in the `ENABLE_MODULES` variable. For example, this code enables the `text2vec-transformers` module.

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-transformers'
```

To enable multiple modules, add them in a comma-separated list.

This example code enables the `'text2vec-huggingface`, `generative-cohere`, and `qna-openai` modules.

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-huggingface,generative-cohere,qna-openai'
```

### Enable all API-based modules

:::caution Experimental feature
Available starting in `v1.26.0`. This is an experimental feature. Use with caution.
:::

You can enable all API-based modules by setting the `ENABLE_API_BASED_MODULES` variable to `true`. This will enable all API-based [model integrations](../model-providers/index.md), such as those for Anthropic, Cohere, OpenAI and so on by enabling the relevant modules. These modules are lightweight, so enabling them all will not significantly increase resource usage.

```yaml
services:
  weaviate:
    environment:
      ENABLE_API_BASED_MODULES: 'true'
```

The list of API-based modules can be found on the [model provider integrations page](../model-providers/index.md#api-based). You can also inspect the [source code](https://github.com/weaviate/weaviate/blob/main/adapters/handlers/rest/configure_api.go) where the list is defined.

This can be combined with enabling individual modules. For example, the example below enables all API-based modules, Ollama modules and the `backup-s3` module.

```yaml
services:
  weaviate:
    environment:
      ENABLE_API_BASED_MODULES: 'true'
      ENABLE_MODULES: 'text2vec-ollama,generative-ollama,backup-s3'
```

Note that enabling multiple vectorizer (e.g. `text2vec`, `multi2vec`) modules will disable the [`Explore` functionality](../api/graphql/explore.md). If you need to use `Explore`, you should only enable one vectorizer module.

### Module-specific variables

You may need to specify additional environment variables to configure each module where applicable. For example, the `backup-s3` module requires the backup S3 bucket to be set via `BACKUP_S3_BUCKET`, and the `text2vec-contextionary` module requires the inference API location via `TRANSFORMERS_INFERENCE_API`.

Refer to the individual [module documentation](../modules/index.md) for more details.

## Vectorizer modules

The [vectorization integration](../model-providers/index.md) enable Weaviate to vectorize data at import, and to perform [`near<Media>`](../search/similarity.md) searches such as `nearText` or `nearImage`.

:::info List of available vectorizer integrations
Can be found [in this section](../model-providers/index.md).
:::

### Enable vectorizer modules

You can enable vectorizer modules by adding them to the `ENABLE_MODULES` environment variable. For example, this code enables the `text2vec-cohere`, `text2vec-huggingface`, and `text2vec-openai` vectorizer modules.

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-cohere,text2vec-huggingface,text2vec-openai'
```

### Default vectorizer module

You can specify a default vectorization module with the `DEFAULT_VECTORIZER_MODULE` variable as below.

If a default vectorizer module is not set, you must set a vectorizer in the schema before you can use `near<Media>` or vectorization at import time.

This code sets `text2vec-huggingface` as the default vectorizer. Thus, `text2vec-huggingface` module will be used unless another vectorizer is specified for that class.

``` yaml
services:
  weaviate:
    environment:
      DEFAULT_VECTORIZER_MODULE: text2vec-huggingface
```

## Generative model integrations

The [generative model integrations](../model-providers/index.md) enable [retrieval augmented generation](../search/generative.md) functions.

### Enable a generative module

You can enable generative modules by adding the desired module to the `ENABLE_MODULES` environment variable. For example, this code enables the `generative-cohere` module and the `text2vec-huggingface` vectorizer module.

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-huggingface,generative-cohere'
```

:::tip `generative` module selection unrelated to `text2vec` module selection
Your choice of the `text2vec` module does not restrict your choice of `generative` module, or vice versa.
:::

## Tenant offload modules

Tenants can be offloaded to cold storage to reduce memory and disk usage, and onloaded back when needed.

See the [dedicated page on tenant offloading](/deploy/configuration/tenant-offloading.md) for more information on how to configure Weaviate for tenant offloading. For information on how to offload and onload tenants, see [How-to: manage tenant states](../manage-collections/tenant-states.mdx).

## Custom modules

See [here](../modules/custom-modules.md) how you can create and use your own modules.

## Usage modules

The [usage module](../modules/usage-modules.md) collects and uploads usage analytics to GCS or S3. 

## Related pages
- [Concepts: Modules](../concepts/modules.md)
- [References: Modules](../modules/index.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
