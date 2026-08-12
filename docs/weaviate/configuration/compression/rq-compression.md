---
title: Rotational Quantization (RQ)
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'rq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Rq8bit from '/_includes/feature-notes/rq-8bit.mdx';
import Rq4bit from '/_includes/feature-notes/rq-4bit.mdx';
import Rq1bit from '/_includes/feature-notes/rq-1bit.mdx';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure-rq/rq-compression-v4.py';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.rq_test.go';
import TSCode from '!!raw-loader!/\_includes/code/howto/configure-rq/rq-compression-v3.ts';
import JavaCode from '!!raw-loader!/\_includes/code/java-v6/src/test/java/ConfigureRQTest.java';
import CSharpCode from "!!raw-loader!/\_includes/code/csharp/ConfigureRQTest.cs";

import CompressionByDefault from '/\_includes/compression-by-default.mdx';

<CompressionByDefault/>

[**Rotational quantization (RQ)**](../../concepts/vector-quantization.md#rotational-quantization) is a fast vector compression technique that offers significant performance benefits. Three RQ variants are available in Weaviate:

- **8-bit RQ**: Up to 4x compression while retaining almost perfect recall (98-99% on most datasets). **Recommended** for most use cases.
- **4-bit RQ**: Up to 8x compression, roughly half the size of 8-bit RQ, and it depends on rescoring to reach comparable recall. Available for the `hnsw` index only.
- **1-bit RQ**: Close to 32x compression as dimensionality increases with moderate recall across various datasets.

## 8-bit RQ

<Rq8bit/>

[8-bit RQ](../../concepts/vector-quantization.md#8-bit-rq) provides up-to 4x compression while maintaining 98-99% recall in internal testing. It is generally recommended for most use cases as the default quantization techniques.

### Enable compression for new collection

RQ can be enabled at collection creation time through the collection definition:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableRQ"
        endMarker="# END EnableRQ"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
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
  <TabItem value="csharp" label="C#">
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

<Tabs className="code" groupId="languages">
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
  <TabItem value="csharp" label="C#">
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

## 4-bit RQ

<Rq4bit/>

[4-bit RQ](../../concepts/vector-quantization.md#4-bit-rq) stores each dimension in 4 bits instead of 8, so a compressed vector is about half the size of the 8-bit equivalent and roughly 8x smaller than the uncompressed vector. It sits between 8-bit RQ and 1-bit RQ: it trades some accuracy in the compressed distance calculation for a smaller index, and it makes up the difference by rescoring more candidates against the uncompressed vectors.

:::caution Raise `rescoreLimit` when you use 4-bit RQ

When `bits` is set to `4`, `rescoreLimit` defaults to `20`, the same default as 8-bit RQ. That window is too small for 4-bit RQ to reach the recall it is capable of, and Weaviate does not warn you about it.

Set `rescoreLimit` explicitly. Start at `50`, and raise it to at least the largest `limit` you expect to query with. Never set it to `0` with 4-bit RQ, because that turns rescoring off entirely and leaves the coarse compressed distances as the final ranking.

:::

### Enable compression for new collection

4-bit RQ can be enabled at collection creation time through the collection definition:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START 4BitEnableRQ"
        endMarker="# END 4BitEnableRQ"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START 4BitEnableRQ"
        endMarker="// END 4BitEnableRQ"
        language="ts"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START 4BitEnableRQ"
        endMarker="// END 4BitEnableRQ"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START 4BitEnableRQ"
      endMarker="// END 4BitEnableRQ"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START 4BitEnableRQ"
      endMarker="// END 4BitEnableRQ"
      language="csharp"
    />
  </TabItem>
</Tabs>

### Enable compression for existing collection

4-bit RQ can also be enabled for an existing collection that is not yet compressed, by updating the collection definition. Weaviate re-encodes the existing vectors in the background.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START 4BitUpdateSchema"
        endMarker="# END 4BitUpdateSchema"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JS/TS">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START 4BitUpdateSchema"
        endMarker="// END 4BitUpdateSchema"
        language="ts"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START 4BitUpdateSchema"
        endMarker="// END 4BitUpdateSchema"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START 4BitUpdateSchema"
      endMarker="// END 4BitUpdateSchema"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START 4BitUpdateSchema"
      endMarker="// END 4BitUpdateSchema"
      language="csharp"
    />
  </TabItem>
</Tabs>

### 4-bit RQ limitations

- **`hnsw` index only.** A `flat` index rejects `bits` set to `4` with `RQ bits must be either 1 or 8`. A `dynamic` index starts on its flat portion and switches to HNSW once the collection passes the threshold, so 4-bit RQ can only be configured on the `hnsw` portion of a dynamic index. The flat portion of that collection stays uncompressed or uses another quantizer, and the collection is only compressed with 4-bit RQ after it converts to HNSW.
- **`bits` cannot be changed later.** Once RQ is enabled, the number of bits is fixed. A request that changes it fails with `rq bits is immutable`. To move between bit widths, recreate the collection and reimport. Enabling RQ on an existing uncompressed `hnsw` collection is supported, and that is the point at which `bits` is fixed.
- **`rescoreLimit` stays mutable.** You can change it at any time without reindexing.
- **Supported distance metrics.** RQ supports `cosine`, `dot` and `l2-squared`. Other distance metrics are not supported.

## 1-bit RQ

<Rq1bit/>

[1-bit RQ](../../concepts/vector-quantization.md#1-bit-rq) is an quantization technique that provides close to 32x compression as dimensionality increases. 1-bit RQ serves as a more robust and accurate alternative to [BQ](./bq-compression.md) with only a slight performance trade-off. While more performant than PQ in terms of encoding time and distance calculations, 1-bit RQ typically offers slightly lower recall than well-tuned [PQ](./pq-compression.md).

### Enable compression for new collection

RQ can be enabled at collection creation time through the collection definition:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START 1BitEnableRQ"
        endMarker="# END 1BitEnableRQ"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
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
  <TabItem value="csharp" label="C#">
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

<Tabs className="code" groupId="languages">
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
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START 1BitUpdateSchema"
      endMarker="// END 1BitUpdateSchema"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
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

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START RQWithOptions"
        endMarker="# END RQWithOptions"
        language="py"
      />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
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
  <TabItem value="csharp" label="C#">
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
RQ supports multi-vector embeddings. Each token vector is rounded up to a multiple of 64 dimensions, which may result in less than the nominal compression ratio for very short vectors. This is a technical limitation that may be addressed in future versions.
:::

## Further resources

- [Starter guides: Compression](/docs/weaviate/starter-guides/managing-resources/compression.mdx)
- [Reference: Vector index](/weaviate/config-refs/indexing/vector-index.mdx)
- [Concepts: Vector quantization](/docs/weaviate/concepts/vector-quantization.md)
- [Concepts: Vector index](/weaviate/concepts/indexing/vector-index.md)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
