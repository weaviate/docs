---
title: Rotational Quantization (RQ)
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'rq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure-rq/rq-compression-v4.py';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.rq_test.go';
import TSCode from '!!raw-loader!/\_includes/code/howto/configure-rq/rq-compression-v3.ts';
import Java6Code from '!!raw-loader!/\_includes/code/java-v6/src/test/java/ConfigureRQTest.java';
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/rq-compression.java';
import CSharpCode from "!!raw-loader!/\_includes/code/csharp/ConfigureRQTest.cs";

import CompressionByDefault from '/\_includes/compression-by-default.mdx';

<CompressionByDefault/>

[**Rotational quantization (RQ)**](../../concepts/vector-quantization.md#rotational-quantization) is a fast vector compression technique that offers significant performance benefits. Two RQ variants are available in Weaviate:

- **8-bit RQ**: Up to 4x compression while retaining almost perfect recall (98-99% on most datasets). **Recommended** for most use cases.
- **1-bit RQ**: Close to 32x compression as dimensionality increases with moderate recall across various datasets.

:::note HNSW only

RQ is currently not supported for the flat index type.

:::

## 8-bit RQ

:::info Added in `v1.32`

**8-bit Rotational quantization (RQ)** was added in **`v1.32`**.

:::

[8-bit RQ](../../concepts/vector-quantization.md#8-bit-rq) provides up-to 4x compression while maintaining 98-99% recall in internal testing. It is generally recommended for most use cases as the default quantization techniques.

### Enable compression for new collection

RQ can be enabled at collection creation time through the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableRQ"
        endMarker="# END EnableRQ"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JS/TS">
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
  <TabItem value="java6" label="Java v6 (Beta)">
    <FilteredTextBlock
      text={Java6Code}
      startMarker="// START EnableRQ"
      endMarker="// END EnableRQ"
      language="java"
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
  <TabItem value="csharp" label="C# (Beta)">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START EnableRQ"
      endMarker="// END EnableRQ"
      language="csharp"
    />
  </TabItem>
</Tabs>

### Enable compression for existing collection

RQ can also be enabled for an existing collection by updating the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START UpdateSchema"
        endMarker="# END UpdateSchema"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JS/TS">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START UpdateSchema"
        endMarker="// END UpdateSchema"
        language="ts"
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
    <TabItem value="java6" label="Java v6 (Beta)">
    <FilteredTextBlock
      text={Java6Code}
      startMarker="// START UpdateSchema"
      endMarker="// END UpdateSchema"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C# (Beta)">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START UpdateSchema"
      endMarker="// END UpdateSchema"
      language="csharp"
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

## 1-bit RQ

:::caution Preview

**1-bit Rotational quantization (RQ)** was added in **`v1.33`** as a **preview**.<br/>

This means that the feature is still under development and may change in future releases, including potential breaking changes.
**We do not recommend using this feature in production environments at this time.**

:::

[1-bit RQ](../../concepts/vector-quantization.md#1-bit-rq) is an quantization technique that provides close to 32x compression as dimensionality increases. 1-bit RQ serves as a more robust and accurate alternative to [BQ](./bq-compression.md) with only a slight performance trade-off. While more performant than PQ in terms of encoding time and distance calculations, 1-bit RQ typically offers slightly lower recall than well-tuned [PQ](./pq-compression.md).

### Enable compression for new collection

RQ can be enabled at collection creation time through the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START 1BitEnableRQ"
        endMarker="# END 1BitEnableRQ"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JS/TS">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START 1BitEnableRQ"
        endMarker="// END 1BitEnableRQ"
        language="ts"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START 1BitEnableRQ"
        endMarker="// END 1BitEnableRQ"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START 1BitEnableRQ"
      endMarker="// END 1BitEnableRQ"
      language="java"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6 (Beta)">
    <FilteredTextBlock
      text={Java6Code}
      startMarker="// START 1BitEnableRQ"
      endMarker="// END 1BitEnableRQ"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C# (Beta)">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START 1BitEnableRQ"
      endMarker="// END 1BitEnableRQ"
      language="csharp"
    />
  </TabItem>
</Tabs>

### Enable compression for existing collection

RQ can also be enabled for an existing collection by updating the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START 1BitUpdateSchema"
        endMarker="# END 1BitUpdateSchema"
        language="py"
      />
  </TabItem>
    <TabItem value="ts" label="JS/TS">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START 1BitUpdateSchema"
        endMarker="// END 1BitUpdateSchema"
        language="ts"
      />
  </TabItem>
      <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START 1BitUpdateSchema"
        endMarker="// END 1BitUpdateSchema"
        language="go"
      />
  </TabItem>
  <TabItem value="java6" label="Java v6 (Beta)">
    <FilteredTextBlock
      text={Java6Code}
      startMarker="// START 1BitUpdateSchema"
      endMarker="// END 1BitUpdateSchema"
      language="java"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START 1BitUpdateSchema"
      endMarker="// END 1BitUpdateSchema"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C# (Beta)">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START 1BitUpdateSchema"
      endMarker="// END 1BitUpdateSchema"
      language="csharp"
    />
  </TabItem>
</Tabs>

## RQ parameters

To tune RQ, use these quantization and vector index parameters:

import RQParameters from '/\_includes/configuration/rq-compression-parameters.mdx' ;

<RQParameters />

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START RQWithOptions"
        endMarker="# END RQWithOptions"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JS/TS">
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
  <TabItem value="java6" label="Java v6 (Beta)">
    <FilteredTextBlock
      text={Java6Code}
      startMarker="// START RQWithOptions"
      endMarker="// END RQWithOptions"
      language="java"
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
  <TabItem value="csharp" label="C# (Beta)">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START RQWithOptions"
      endMarker="// END RQWithOptions"
      language="csharp"
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
