import assert from 'assert';
import weaviate from 'weaviate-client';
// START-ANY
import { configure } from 'weaviate-client';

// END-ANY

const client = await weaviate.connectToLocal();

const collectionName = 'MyCollection';

// Prep
await client.collections.delete(collectionName);

// START EnableSQ
const collection = await client.collections.create({
  name: 'MyCollection',
  vectorizers: weaviate.configure.vectors.selfProvided({
    vectorIndexConfig: weaviate.configure.vectorIndex.hnsw({
      quantizer: weaviate.configure.vectorIndex.quantizer.sq(),
    })
  })
})
// END EnableSQ

let collectionConfig = await collection.config.get();

assert.equal(collectionConfig.vectorizers.default.indexConfig.quantizer.type, "sq")

// Clean-up
await client.collections.delete(collectionName);

client.close();


// IMPORT WITH OPTIONS
const client = await weaviate.connectToLocal();

const collectionName = 'MyCollection';

// Prep
await client.collections.delete(collectionName);

// START SQWithOptions
const collection = await client.collections.create({
  name: 'MyCollection',
  vectorizers: weaviate.configure.vectors.selfProvided({
    vectorIndexConfig: weaviate.configure.vectorIndex.hnsw({
      quantizer: weaviate.configure.vectorIndex.quantizer.sq({
        rescoreLimit: 200,    // The minimum number of candidates to fetch before rescoring
        trainingLimit: 50000, // The size of the training set used to determine the bucket boundaries
      }),
      vectorCacheMaxObjects: 100000 // Maximum number of objects in the vector cache
    })
  })
})
// END SQWithOptions

let collectionConfig = await collection.config.get();

assert.equal(collectionConfig.vectorizers.default.indexConfig.quantizer.type, "sq")

// Clean-up
await client.collections.delete(collectionName);

client.close();


// UPDATE SCHEMA
{
const client = await weaviate.connectToLocal();

const collectionName = 'MyCollection';

// Prep
await client.collections.delete(collectionName);
await client.collections.create({
  name: collectionName,
  vectorizers: weaviate.configure.vectors.selfProvided({
    vectorIndexConfig: weaviate.configure.vectorIndex.hnsw({
      quantizer: weaviate.configure.vectorIndex.quantizer.none(),
    })
  })
})

// START UpdateSchema
const collection = client.collections.use('MyCollection');

await collection.config.update({
  vectorizers: [
    weaviate.reconfigure.vectors.update({
      name: 'default',
      vectorIndexConfig: weaviate.reconfigure.vectorIndex.hnsw({
        quantizer: weaviate.reconfigure.vectorIndex.quantizer.sq({
          rescoreLimit: 20,
        }),
      }),
    }),
  ],
})
// END UpdateSchema

let collectionConfig = await collection.config.get();

assert.equal(collectionConfig.vectorizers.default.indexConfig.quantizer.type, "sq")

// Clean-up
await client.collections.delete(collectionName);

client.close();
}
