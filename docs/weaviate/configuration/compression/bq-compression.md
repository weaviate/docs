---
title: Binary Quantization (BQ)
sidebar_position: 6
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'bq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/configure.bq-compression.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/configure.bq-compression-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/configure.bq-compression.ts';
import TSCodeBQOptions from '!!raw-loader!/_includes/code/howto/configure.bq-compression.options.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/configure.bq-compression-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/configure.bq-compression.go';
import JavaCode from '!!raw-loader!/_includes/code/howto/java/src/test/java/io/weaviate/docs/bq-compression.java';

:::info Added in `v1.23`
BQ is available for the [`flat` index](/weaviate/concepts/indexing/vector-index.md#flat-index) type from `v1.23` onwards and for the [`hnsw` index](/weaviate/config-refs/indexing/vector-index.mdx#hnsw-index)  type from `v1.24`.
:::

Binary quantization (BQ) is a vector compression technique that can reduce the size of a vector.

To use BQ, enable it as shown below and add data to the collection.

<details>
  <summary>Additional information</summary>

- How to [set the index type](../../manage-collections/vector-config.mdx#set-vector-index-type)

</details>


## Simple BQ configuration

Each collection can be configured to use BQ compression. BQ can be enabled at collection creation time, before data is added to it.

This can be done by setting the `vector_index_config` of the collection to enable BQ compression.

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START EnableBQ"
        endMarker="# END EnableBQ"
        language="py"
      />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
      <FilteredTextBlock
        text={PyCodeV3}
        startMarker="# START EnableBQ"
        endMarker="# END EnableBQ"
        language="pyv3"
      />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// START EnableBQ"
        endMarker="// END EnableBQ"
        language="ts"
      />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
      <FilteredTextBlock
        text={TSCodeLegacy}
        startMarker="// START EnableBQ"
        endMarker="// END EnableBQ"
        language="tsv2"
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

:::info Added in `v1.31`
The ability to enable BQ compression after collection creation was added in Weaviate `v1.31`.
:::

BQ can also be enabled for an existing collection by updating the collection configuration with the appropriate vector index configuration.

## BQ with custom settings

The following parameters are available for BQ compression, under `vectorIndexConfig`:

import BQParameters from '/_includes/configuration/bq-compression-parameters.mdx' ;

<BQParameters />

For example:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
      <FilteredTextBlock
        text={PyCode}
        startMarker="# START BQWithOptions"
        endMarker="# END BQWithOptions"
        language="py"
      />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
      <FilteredTextBlock
        text={PyCodeV3}
        startMarker="# START BQWithOptions"
        endMarker="# END BQWithOptions"
        language="pyv3"
      />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
      <FilteredTextBlock
        text={TSCodeBQOptions}
        startMarker="// START BQWithOptions"
        endMarker="// END BQWithOptions"
        language="ts"
      />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
      <FilteredTextBlock
        text={TSCodeLegacy}
        startMarker="// START BQWithOptions"
        endMarker="// END BQWithOptions"
        language="tsv2"
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

## Multiple vector embeddings (named vectors)

import NamedVectorCompress from '/_includes/named-vector-compress.mdx';

<NamedVectorCompress />

## Multi-vector embeddings (ColBERT, ColPali, etc.)

import MultiVectorCompress from '/_includes/multi-vector-compress.mdx';

<MultiVectorCompress />

## Related pages
- [Configuration: Vector index](/weaviate/config-refs/indexing/vector-index.mdx)
- [Concepts: Vector index](/weaviate/concepts/indexing/vector-index.md)
- [Concepts: Vector quantization](/weaviate/concepts/vector-quantization.md)
- [Tutorial: Schema](/weaviate/starter-guides/managing-collections/index.mdx)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
