---
title: Product Quantization (PQ)
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'pq']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure.pq-compression.py';
import TSCodeAutoPQ from '!!raw-loader!/\_includes/code/howto/configure.pq-compression.autopq.ts';
import TSCodeManualPQ from '!!raw-loader!/\_includes/code/howto/configure.pq-compression.manual.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/configure/compression.pq_test.go';
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/pq-compression.java';

import CompressionByDefault from '/\_includes/compression-by-default.mdx';

<CompressionByDefault/>

import PQOverview from '/\_includes/configuration/pq-compression/overview-text.mdx' ;

<PQOverview />

import PQTradeoffs from '/\_includes/configuration/pq-compression/tradeoffs.mdx' ;

<PQTradeoffs />

To configure HNSW, see [Configuration: Vector index](/weaviate/config-refs/indexing/vector-index.mdx).

## Enable PQ compression

PQ is configured at a collection level. There are two ways to enable PQ compression:

- [Use AutoPQ to enable PQ compression](./pq-compression.md#configure-autopq).
- [Manually enable PQ compression](./pq-compression.md#manually-configure-pq).

## Configure AutoPQ

:::info Added in v1.23.0
:::

For new collections, use AutoPQ. AutoPQ automates triggering of the PQ training step based on the size of the collection.

### 1. Set the environment variable

AutoPQ requires asynchronous indexing.

- **Open-source Weaviate users**: To enable AutoPQ, set the environment variable `ASYNC_INDEXING=true` and restart your Weaviate instance.
- [**Weaviate Cloud (WCD)**](https://weaviate.io/go/console?utm_source=docs&utm_content=howto/) users: Enable async indexing through the WCD Console and restart your Weaviate instance.

### 2. Configure PQ

To configure PQ in a collection, use the [PQ parameters](./pq-compression.md#pq-parameters).

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
     <FilteredTextBlock
       text={PyCode}
       startMarker="# START CollectionWithAutoPQ"
       endMarker="# END CollectionWithAutoPQ"
       language="py"
     />
  </TabItem>


  <TabItem value="ts" label="JavaScript/TypeScript">
     <FilteredTextBlock
       text={TSCodeAutoPQ}
       startMarker="// START CollectionWithAutoPQ"
       endMarker="// END CollectionWithAutoPQ"
       language="ts"
     />
  </TabItem>


</Tabs>

### 3. Load your data

Load your data. You do not have to load an initial set of training data.

AutoPQ creates the PQ codebook when the object count reaches the training limit. By default, the training limit is 100,000 objects per shard.

## Manually configure PQ

You can manually enable PQ on an existing collection. After PQ is enabled, Weaviate trains the PQ codebook. Before you enable PQ, verify that the training set has 100,000 objects per shard.

To manually enable PQ, follow these steps:

- Phase One: Create a codebook

  - [Define a collection without PQ](./pq-compression.md#1-define-a-collection-without-pq)
  - [Load some training data](./pq-compression.md#2-load-training-data)
  - [Enable and train PQ](./pq-compression.md#3-enable-pq-and-create-the-codebook)

- Phase Two: Load the rest of your data

  - [Load the rest of your data](./pq-compression.md#4-load-the-rest-of-your-data)

:::tip How large should the training set be?
We suggest 10,000 to 100,000 objects per shard.
:::

Weaviate [logs a message](#check-the-system-logs) when PQ is enabled and another message when vector compression is complete. Do not import the rest of your data until the initial training step is complete.

Follow these steps to manually enable PQ.

### 1. Define a collection without PQ

[Create a collection](../../manage-collections/collection-operations.mdx#create-a-collection) without specifying a quantizer.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
     <FilteredTextBlock
       text={PyCode}
       startMarker="# START InitialSchema"
       endMarker="# END InitialSchema"
       language="py"
     />
  </TabItem>


  <TabItem value="ts" label="JavaScript/TypeScript">
     <FilteredTextBlock
       text={TSCodeManualPQ}
       startMarker="// START InitClassDef"
       endMarker="// END InitClassDef"
       language="ts"
     />
  </TabItem>


  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START InitialSchema"
      endMarker="// END InitialSchema"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START InitialSchema"
      endMarker="// END InitialSchema"
      language="java"
    />
  </TabItem>
</Tabs>

### 2. Load training data

[Add objects](/weaviate/manage-objects/import.mdx) that will be used to train PQ. Weaviate will use the greater of the training limit, or the collection size, to train PQ.

We recommend loading a representative sample such that the trained centroids are representative of the entire dataset.

From `v1.27.0`, Weaviate uses a sparse [Fisher-Yates algorithm](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle) to select the training set from the available objects when PQ is enabled manually. Nonetheless, it is still recommended to load a representative sample of the data so that the trained centroids are representative of the entire dataset.

### 3. Enable PQ and create the codebook

Update your collection definition to enable PQ. Once PQ is enabled, Weaviate trains the codebook using the training data.

import PQMakesCodebook from '/\_includes/configuration/pq-compression/makes-a-codebook.mdx' ;

<PQMakesCodebook />

To enable PQ, update your collection definition as shown below. For additional configuration options, see the [PQ parameter table](./pq-compression.md#pq-parameters).

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
     <FilteredTextBlock
       text={PyCode}
       startMarker="# START UpdateSchema"
       endMarker="# END UpdateSchema"
       language="py"
     />
  </TabItem>


  <TabItem value="ts" label="JavaScript/TypeScript">
     <FilteredTextBlock
       text={TSCodeManualPQ}
       startMarker="// START UpdateSchema"
       endMarker="// END UpdateSchema"
       language="ts"
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

### 4. Load the rest of your data

Once the [codebook has been trained](#3-enable-pq-and-create-the-codebook), you may continue to add data as per normal. Weaviate compresses the new data when it adds it to the database.

If you already have data in your Weaviate instance when you create the codebook, Weaviate automatically compresses the remaining objects (the ones after the initial training set).

## PQ parameters

You can configure PQ compression by setting the following parameters at the collection level.

import PQParameters from '/\_includes/configuration/pq-compression/parameters.mdx' ;

<PQParameters />

## Additional tools and considerations

### Change the codebook training limit

For most use cases, 100,000 objects is an optimal training size. There is little benefit to increasing `trainingLimit`. If you do increase `trainingLimit`, the training period will take longer. You could also have memory problems if you set a high `trainingLimit`.

If you have a small dataset and wish to enable compression, consider using [binary quantization (BQ)](./bq-compression.md). BQ is a simpler compression method that does not require training.

### Check the system logs

When compression is enabled, Weaviate logs diagnostic messages like these.

```bash
pq-conf-demo-1  | {"action":"compress","level":"info","msg":"switching to compressed vectors","time":"2023-11-13T21:10:52Z"}

pq-conf-demo-1  | {"action":"compress","level":"info","msg":"vector compression complete","time":"2023-11-13T21:10:53Z"}
```

If you use `docker-compose` to run Weaviate, you can get the logs on the system console.

```bash
docker compose logs -f --tail 10 weaviate
```

You can also view the log file directly. Check `docker` to get the file location.

```bash
docker inspect --format='{{.LogPath}}' <your-weaviate-container-id>
```

### Review the current `pq` configuration

To review the current `pq` configuration, you can retrieve it as shown below.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GetSchema"
      endMarker="# END GetSchema"
      language="py"
    />
  </TabItem>


  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCodeManualPQ}
      startMarker="// START ViewConfig"
      endMarker="// END ViewConfig"
      language="ts"
    />
  </TabItem>


  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GetSchema"
      endMarker="// END GetSchema"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START GetSchema"
      endMarker="// END GetSchema"
      language="java"
    />
  </TabItem>
</Tabs>

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
