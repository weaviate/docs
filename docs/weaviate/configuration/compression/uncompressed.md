---
title: Uncompressed vector embeddings
sidebar_label: No quantization
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

import CompressionByDefault from '/\_includes/compression-by-default.mdx';

<CompressionByDefault/>

You can opt-out of using vector quantization to compress your vector data.

## Disable compression for new collection

When creating the collection, you can choose not to use quantization through the collection definition:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START Uncompressed"
        endMarker="# END Uncompressed"
        language="py"
      />
  </TabItem>

  <TabItem value="ts" label="JS/TS">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START Uncompressed"
        endMarker="// END Uncompressed"
        language="ts"
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
