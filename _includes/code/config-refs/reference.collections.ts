// Reference: Collection definition - TypeScript examples
//
// The examples on docs/weaviate/config-refs/collections.mdx. They mirror the
// Python examples in reference.collections.py one-for-one.

import assert from 'assert';
import weaviate, { WeaviateClient } from 'weaviate-client';
import { configure, dataType, tokenization, vectorDistances, vectors } from 'weaviate-client';

const openaiKey = process.env.OPENAI_API_KEY as string;

const client: WeaviateClient = await weaviate.connectToLocal({
  headers: {
    'X-OpenAI-Api-Key': openaiKey, // Replace with your inference API key
  },
});

// ==================================================
// ===== FULL COLLECTION DEFINITION =====
// ==================================================

// Clean slate
await client.collections.delete('Article');

/*
// START ReferenceFullDefinition
import { configure, dataType, vectorDistances, vectors } from 'weaviate-client';

// END ReferenceFullDefinition
*/

// START ReferenceFullDefinition
await client.collections.create({
  name: 'Article',
  description: 'A collection of articles',
  properties: [
    { name: 'title', dataType: dataType.TEXT },
    { name: 'body', dataType: dataType.TEXT },
  ],
  vectorizers: vectors.text2VecOpenAI({
    name: 'default',
    sourceProperties: ['title', 'body'],
    vectorIndexConfig: configure.vectorIndex.hnsw({
      efConstruction: 300,
      distanceMetric: vectorDistances.COSINE,
      filterStrategy: 'sweeping',
    }),
  }),
  multiTenancy: configure.multiTenancy({ enabled: false }),
  sharding: configure.sharding({
    virtualPerPhysical: 128,
    desiredCount: 1,
    desiredVirtualCount: 128,
  }),
  replication: configure.replication({
    factor: 1,
    deletionStrategy: 'TimeBasedResolution',
  }),
})
// END ReferenceFullDefinition

// Test
let config = await client.collections.use('Article').config.get();
assert.equal(config.description, 'A collection of articles');
assert.equal(config.properties.length, 2);

// ==========================================
// ===== PROPERTY OPTIONS =====
// ==========================================

// Clean slate
await client.collections.delete('Article');

/*
// START ReferencePropertyOptions
import { dataType, tokenization, vectors } from 'weaviate-client';

// END ReferencePropertyOptions
*/

// START ReferencePropertyOptions
await client.collections.create({
  name: 'Article',
  vectorizers: vectors.text2VecOpenAI(),
  // highlight-start
  properties: [
    {
      name: 'title',
      dataType: dataType.TEXT,
      description: 'The article headline',
      tokenization: tokenization.WORD,  // How the text is split for the inverted index
    },
    {
      name: 'description',
      dataType: dataType.TEXT,
      skipVectorization: true,  // Exclude this property from the vector
      indexSearchable: false,  // Exclude it from keyword search
    },
    {
      name: 'rating',
      dataType: dataType.NUMBER,
      indexRangeFilters: true,  // Index for range-based filtering
    },
  ],
  // highlight-end
})
// END ReferencePropertyOptions

// Test
config = await client.collections.use('Article').config.get();
assert.equal(config.properties.length, 3);

await client.collections.delete('Article');
client.close();
