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
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.rq_test.go';
import TSCode from '!!raw-loader!/\_includes/code/howto/configure-rq/rq-compression-v3.ts';
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/rq-compression.java';

:::caution Technical preview

Rotational quantization (RQ) was added in **`v1.32`** as a **technical preview**.<br/><br/>
This means that the feature is still under development and may change in future releases, including potential breaking changes.
**We do not recommend using this feature in production environments at this time.**

:::

[**Rotational quantization (RQ)**](../../concepts/vector-quantization.md#rotational-quantization) is a fast untrained vector compression technique that offers 4x compression while retaining almost perfect recall (98-99% on most datasets).

:::note HNSW only
RQ is currently not supported for the flat index type.
:::

## Enable compression for new collection

RQ can be enabled at collection creation time through the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableRQ"
        endMarker="# END EnableRQ"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JS/TS Client v3">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START EnableRQ"
        endMarker="// END EnableRQ"
        language="ts"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START EnableRQ"
        endMarker="// END EnableRQ"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START EnableRQ"
      endMarker="// END EnableRQ"
      language="java"
    />
  </TabItem>
</Tabs>

## Enable compression for existing collection

RQ can also be enabled for an existing collection by updating the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START UpdateSchema"
        endMarker="# END UpdateSchema"
        language="py"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START UpdateSchema"
      endMarker="// END UpdateSchema"
      language="java"
    />
  </TabItem>
    <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START UpdateSchema"
        endMarker="// END UpdateSchema"
        language="go"
      />
  </TabItem>
</Tabs>

## RQ parameters

To tune RQ, use these quantization and vector index parameters:

import RQParameters from '/\_includes/configuration/rq-compression-parameters.mdx' ;

<RQParameters />

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START RQWithOptions"
        endMarker="# END RQWithOptions"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JS/TS Client v3">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START RQWithOptions"
        endMarker="// END RQWithOptions"
        language="ts"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START RQWithOptions"
        endMarker="// END RQWithOptions"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START RQWithOptions"
      endMarker="// END RQWithOptions"
      language="java"
    />
  </TabItem>
</Tabs>

<!--
:::note Maximum query performance

For maximum query performance with minimal recall impact, consider setting `rescoreLimit` to 0. This disables rescoring and can significantly boost QPS (queries per second) while only causing a very minor drop in recall.

:::
-->

## Additional considerations

### Multiple vector embeddings (named vectors)

import NamedVectorCompress from '/\_includes/named-vector-compress.mdx';

<NamedVectorCompress />

### Multi-vector embeddings (ColBERT, ColPali, etc.)

import MultiVectorCompress from '/\_includes/multi-vector-compress.mdx';

<MultiVectorCompress />

:::note Multi-vector performance
RQ supports multi-vector embeddings. Each token vector is rounded up to a multiple of 64 dimensions, which may result in less than 4x compression for very short vectors. This is a technical limitation that may be addressed in future versions.
:::

## Further resources

- [Starter guides: Compression](/docs/weaviate/starter-guides/managing-resources/compression.mdx)
- [Reference: Vector index](/weaviate/config-refs/indexing/vector-index.mdx)
- [Concepts: Vector quantization](/docs/weaviate/concepts/vector-quantization.md)
- [Concepts: Vector index](/weaviate/concepts/indexing/vector-index.md)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
