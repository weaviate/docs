---
title: Scalar Quantization (SQ)
sidebar_position: 27
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'sq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/configure-sq/sq-compression-v4.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/configure-sq/sq-compression-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/configure-sq/sq-compression-v3.ts';
import TSCodeSQOptions from '!!raw-loader!/_includes/code/howto/configure-sq/sq-compression.options-v3.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/configure-sq/sq-compression-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/configure/compression.sq_test.go';
import JavaCode from '!!raw-loader!/_includes/code/howto/java/src/test/java/io/weaviate/docs/sq-compression.java';

:::info Added in v1.26.0

:::

[Scalar quantization (SQ)](/weaviate/concepts/vector-quantization#scalar-quantization) is a vector compression technique that can reduce the size of a vector.

To use SQ, enable it in the collection definition, then add data to the collection.

## Basic configuration

SQ can be enabled at collection creation time. To enable SQ, set `vector_index_config`.

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

:::info Added in `v1.31`
The ability to enable SQ compression after collection creation was added in Weaviate `v1.31`.
:::

SQ can also be enabled for an existing collection by updating the collection configuration with the appropriate vector index configuration.

## Custom configuration

To tune SQ, set these `vectorIndexConfig` parameters.

| Parameter | Type | Default | Details |
| :-- | :-- | :-- | :-- |
| `sq`: `enabled` | boolean | `false` | Uses SQ when `true`.  <br/><br/> The Python client v4 does not use the `enabled` parameter. To enable SQ with the v4 client, set a `quantizer` in the collection definition. |
| `sq`: `rescoreLimit` | integer | -1 | The minimum number of candidates to fetch before rescoring. |
| `sq`: `trainingLimit` | integer | 100000 | The size of the training set to determine scalar bucket boundaries. |
| `sq`: `cache` | boolean | `false` | Use the vector cache when true. |
| `vectorCacheMaxObjects` | integer | `1e12` | Maximum number of objects in the memory cache. By default, this limit is set to one trillion (`1e12`) objects when a new collection is created. For sizing recommendations, see [Vector cache considerations](/weaviate/concepts/indexing/vector-index.md#vector-cache-considerations). |


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

## Multiple vector embeddings (named vectors)

import NamedVectorCompress from '/_includes/named-vector-compress.mdx';

<NamedVectorCompress />

## Multi-vector embeddings (ColBERT, ColPali, etc.)

import MultiVectorCompress from '/_includes/multi-vector-compress.mdx';

<MultiVectorCompress />

## Related pages
- [Configuration: Vector index](/weaviate/config-refs/schema/vector-index.md)
- [Concepts: Vector index](/weaviate/concepts/indexing/vector-index.md)
- [Concepts: Vector quantization](/weaviate/concepts/vector-quantization.md)
- [Tutorial: Schema](/weaviate/starter-guides/managing-collections/index.mdx)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
