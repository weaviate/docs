// How-to: Search -> Query profiling - TypeScript examples
import assert from 'assert';

import weaviate from 'weaviate-client';

const client = await weaviate.connectToLocal();

// Setup: create a small Article collection so the snippets below have data
await client.collections.delete('Article');
await client.collections.create({
  name: 'Article',
  properties: [
    { name: 'title', dataType: 'text' as const },
  ],
  vectorizers: weaviate.configure.vectors.selfProvided(),
});

const setupCol = client.collections.use('Article');
for (let i = 0; i < 5; i++) {
  await setupCol.data.insert({
    properties: { title: `machine learning article ${i}` },
    vectors: Array(8).fill(0).map((_, j) => (i + j) * 0.01),
  });
}

// Wait for ASYNC_INDEXING to build the HNSW graph; without this the first
// nearVector call returns zero results and the server skips populating
// queryProfile.
await new Promise((resolve) => setTimeout(resolve, 3000));

// START ProfileNearVector
const collection = client.collections.use('Article');

const nvResponse = await collection.query.nearVector([0.1, 0.2, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0], {
  limit: 5,
  // highlight-start
  returnMetadata: ['queryProfile', 'distance'],
  // highlight-end
});

if (nvResponse.queryProfile) {
  for (const shard of nvResponse.queryProfile.shards) {
    console.log(`Shard: ${shard.name} (node: ${shard.node})`);
    for (const [searchType, profile] of Object.entries(shard.searches)) {
      console.log(`  [${searchType}]`);
      for (const [key, value] of Object.entries(profile.details)) {
        console.log(`    ${key}: ${value}`);
      }
    }
  }
}
// END ProfileNearVector

assert.ok(nvResponse.queryProfile, 'queryProfile should be returned for nearVector');
assert.ok(Array.isArray(nvResponse.queryProfile.shards) && nvResponse.queryProfile.shards.length > 0,
  'queryProfile should contain at least one shard');

// START ProfileBM25
const bm25Response = await collection.query.bm25('machine learning', {
  // highlight-start
  returnMetadata: ['queryProfile', 'score'],
  // highlight-end
});

if (bm25Response.queryProfile) {
  for (const shard of bm25Response.queryProfile.shards) {
    console.log(`Shard: ${shard.name} (node: ${shard.node})`);
    for (const [searchType, profile] of Object.entries(shard.searches)) {
      console.log(`  [${searchType}]`);
      for (const [key, value] of Object.entries(profile.details)) {
        console.log(`    ${key}: ${value}`);
      }
    }
  }
}
// END ProfileBM25

assert.ok(bm25Response.queryProfile, 'queryProfile should be returned for bm25');

// START ProfileHybrid
const hybridResponse = await collection.query.hybrid('machine learning', {
  // highlight-start
  returnMetadata: ['queryProfile'],
  // highlight-end
  vector: [0.1, 0.2, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0],
  limit: 5,
});

if (hybridResponse.queryProfile) {
  for (const shard of hybridResponse.queryProfile.shards) {
    console.log(`Shard: ${shard.name} (node: ${shard.node})`);
    for (const [searchType, profile] of Object.entries(shard.searches)) {
      console.log(`  [${searchType}]`);
      for (const [key, value] of Object.entries(profile.details)) {
        console.log(`    ${key}: ${value}`);
      }
    }
  }
}
// END ProfileHybrid

assert.ok(hybridResponse.queryProfile, 'queryProfile should be returned for hybrid');

// START ProfileMetadataList
// You can also request profiling alongside other metadata fields.
const listResponse = await collection.query.nearVector([0.1, 0.2, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0], {
  limit: 5,
  returnMetadata: ['queryProfile', 'distance'],
});
// END ProfileMetadataList

assert.ok(listResponse.queryProfile);

// Cleanup
await client.collections.delete('Article');
await client.close();
