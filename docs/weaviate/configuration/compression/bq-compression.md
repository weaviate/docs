---
title: Binary Quantization (BQ)
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'bq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure.bq-compression.py';
import TSCode from '!!raw-loader!/\_includes/code/howto/configure.bq-compression.ts';
import TSCodeBQOptions from '!!raw-loader!/\_includes/code/howto/configure.bq-compression.options.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.bq_test.go';
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/bq-compression.java';

import CompressionByDefault from '/\_includes/compression-by-default.mdx';

<CompressionByDefault/>

[**Binary quantization (BQ)**](/weaviate/concepts/vector-quantization#binary-quantization) is a vector compression technique that can reduce the size of a vector.

To use BQ, enable it as shown below and add data to the collection.

<details>
  <summary>Additional information</summary>

- How to [set the index type](../../manage-collections/vector-config.mdx#set-vector-index-type)

</details>

## Enable compression for new collection

BQ can be enabled at collection creation time through the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableBQ"
        endMarker="# END EnableBQ"
        language="py"
      />
  </TabItem>


  <TabItem value="js" label="JS/TS">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START EnableBQ"
        endMarker="// END EnableBQ"
        language="ts"
      />
  </TabItem>


  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START EnableBQ"
      endMarker="// END EnableBQ"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START EnableBQ"
      endMarker="// END EnableBQ"
      language="java"
    />
  </TabItem>
</Tabs>

## Enable compression for existing collection

:::info Added in `v1.31`
The ability to enable BQ compression after collection creation was added in Weaviate `v1.31`.
:::

BQ can also be enabled for an existing collection by updating the collection definition:

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
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

## BQ parameters

The following parameters are available for BQ compression, under `vectorIndexConfig`:

import BQParameters from '/\_includes/configuration/bq-compression-parameters.mdx' ;

<BQParameters />

For example:

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START BQWithOptions"
        endMarker="# END BQWithOptions"
        language="py"
      />
  </TabItem>


  <TabItem value="js" label="JS/TS">
      <FilteredTextBlock
        text={TSCodeBQOptions}
        startMarker="// START BQWithOptions"
        endMarker="// END BQWithOptions"
        language="ts"
      />
  </TabItem>


  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BQWithOptions"
      endMarker="// END BQWithOptions"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START BQWithOptions"
      endMarker="// END BQWithOptions"
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
