---
title: Scalar Quantization (SQ)
sidebar_position: 27
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'sq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression-v4.py';
import PyCodeV3 from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression-v3.py';
import TSCode from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression-v3.ts';
import TSCodeSQOptions from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression.options-v3.ts';
import TSCodeLegacy from '!!raw-loader!/\_includes/code/howto/configure-sq/sq-compression-v2.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.sq_test.go';
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/sq-compression.java';

:::info Added in v1.26.0

:::

[Scalar quantization (SQ)](/weaviate/concepts/vector-quantization#scalar-quantization) is a vector compression technique that can reduce the size of a vector.

To use SQ, enable it in the collection definition, then add data to the collection.

## Enable compression for new collection

SQ can be enabled at collection creation time through the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableSQ"
        endMarker="# END EnableSQ"
        language="py"
      />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
      <FilteredTextBlock
        text={PyCodeV3}
        startMarker="# START EnableSQ"
        endMarker="# END EnableSQ"
        language="pyv3"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START EnableSQ"
        endMarker="// END EnableSQ"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START EnableSQ"
      endMarker="// END EnableSQ"
      language="java"
    />
  </TabItem>
</Tabs>

## Enable compression for existing collection

:::info Added in `v1.31`
The ability to enable SQ compression after collection creation was added in Weaviate `v1.31`.
:::

SQ can also be enabled for an existing collection by updating the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START UpdateSchema"
        endMarker="# END UpdateSchema"
        language="py"
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
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START UpdateSchema"
      endMarker="// END UpdateSchema"
      language="java"
    />
  </TabItem>
</Tabs>

## SQ parameters

To tune SQ, set these `vectorIndexConfig` parameters.

import SQParameters from '/\_includes/configuration/sq-compression-parameters.mdx' ;

<SQParameters />

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START SQWithOptions"
        endMarker="# END SQWithOptions"
        language="py"
      />
  </TabItem>
  <TabItem value="py3" label="Python Client v3">
      <FilteredTextBlock
        text={PyCodeV3}
        startMarker="# START SQWithOptions"
        endMarker="# END SQWithOptions"
        language="pyv3"
      />
  </TabItem>
  <TabItem value="go" label="Go">
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START SQWithOptions"
        endMarker="// END SQWithOptions"
        language="go"
      />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START SQWithOptions"
      endMarker="// END SQWithOptions"
      language="java"
    />
  </TabItem>
</Tabs>

## Additional considerations

### Multiple vector embeddings (named vectors)

import NamedVectorCompress from '/\_includes/named-vector-compress.mdx';

<NamedVectorCompress />

### Multi-vector embeddings (ColBERT, ColPali, etc.)

import MultiVectorCompress from '/\_includes/multi-vector-compress.mdx';

<MultiVectorCompress />

## Further resources

- [Starter guides: Compression](/docs/weaviate/starter-guides/managing-resources/compression.mdx)
- [Reference: Vector index](/weaviate/config-refs/indexing/vector-index.mdx)
- [Concepts: Vector quantization](/docs/weaviate/concepts/vector-quantization.md)
- [Concepts: Vector index](/weaviate/concepts/indexing/vector-index.md)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
