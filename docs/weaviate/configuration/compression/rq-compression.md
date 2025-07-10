---
title: Rotational Quantization (RQ)
sidebar_position: 25
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'rq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure-rq/rq-compression-v4.py';

:::caution Technical preview

Rotational quantization (RQ) was added in **`v1.32`** as a **technical preview**.<br/><br/>
This means that the feature is still under development and may change in future releases, including potential breaking changes.
**We do not recommend using this feature in production environments at this time.**

:::

[**Rotational quantization (RQ)**](../../concepts/vector-quantization.md#rotational-quantization) is a fast untrained vector compression technique that offers 4x compression while retaining almost perfect recall (98-99% on most datasets).

Unlike scalar quantization (SQ), RQ does not require training and can be enabled immediately at index creation without any training phase. RQ works by performing a fast pseudorandom rotation of the input vector followed by scalar quantization of each entry to an 8-bit integer.

:::note HNSW only
RQ is currently only supported by the HNSW index.
:::

## Basic configuration

RQ can be enabled at collection creation time:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableRQ"
        endMarker="# END EnableRQ"
        language="py"
      />
  </TabItem>
</Tabs>

## Custom configuration

To tune RQ, use these quantization and vector index parameters:

| Parameter            | Type    | Default | Details                                                                                  |
| :------------------- | :------ | :------ | :--------------------------------------------------------------------------------------- |
| `rq`: `rescoreLimit` | integer | 20      | The number of candidates to fetch before rescoring. Set to 0 to disable rescoring.       |
| `rq`: `bits`         | integer | 8       | The number of bits used to quantize each data point. Currently only 8 bits is supported. |

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START RQWithOptions"
        endMarker="# END RQWithOptions"
        language="py"
      />
  </TabItem>
</Tabs>

:::tip Maximum query performance

For maximum query performance with minimal recall impact, consider setting `rescoreLimit` to 0. This disables rescoring and can significantly boost QPS (queries per second) while only causing a very minor drop in recall.

:::

## Multiple vector embeddings (named vectors)

import NamedVectorCompress from '/\_includes/named-vector-compress.mdx';

<NamedVectorCompress />

## Multi-vector embeddings (ColBERT, ColPali, etc.)

import MultiVectorCompress from '/\_includes/multi-vector-compress.mdx';

<MultiVectorCompress />

:::note Multi-vector performance
RQ supports multi-vector embeddings. Each token vector is rounded up to a multiple of 64 dimensions, which may result in less than 4x compression for very short vectors. This is a technical limitation that may be addressed in future versions.
:::

## Further resources

- [Concepts: Vector quantization](/docs/weaviate/concepts/vector-quantization.md)
- [Starter guides: Compression](/docs/weaviate/starter-guides/managing-resources/compression.mdx)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
