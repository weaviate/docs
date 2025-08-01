// How-to: Manage-data -> Classes - TypeScript examples
// run with: node --loader=ts-node/esm FILENAME.ts
import assert from 'assert';

// ================================
// ===== INSTANTIATION-COMMON =====
// ================================
import weaviate, { WeaviateClient, vectorIndex } from 'weaviate-client';
import { reranker, vectors, generative, dataType, tokenization, reconfigure, vectorDistances } from 'weaviate-client';

const weaviateURL = process.env.WEAVIATE_URL as string
const weaviateKey = process.env.WEAVIATE_API_KEY as string
const openaiKey = process.env.OPENAI_API_KEY as string

const client: WeaviateClient = await weaviate.connectToLocal({headers: {
     'X-OpenAI-Api-Key': openaiKey as string,  // Replace with your inference API key
   }
 }
)

const collectionName = 'Article'
let result


/*
// START UpdateCollection // START UpdateReranker // START UpdateGenerative
import { reconfigure } from 'weaviate-client';

// END UpdateCollection // END UpdateReranker // END UpdateGenerative
*/

// START UpdateCollection // START ReadOneCollection
let articles = client.collections.use('Article')
// END UpdateCollection // END ReadOneCollection

// ================================
// ===== CREATE A CLASS =====
// ================================

// Clean slate
try {
  await client.collections.delete(collectionName)

} catch (e) {
  // ignore error if class doesn't exist
}
{
// START BasicCreateCollection
const newCollection = await client.collections.create({
  name: 'Article'
})

// The returned value is the full collection definition, showing all defaults
console.log(JSON.stringify(newCollection, null, 2));
// END BasicCreateCollection

// Test
// (client.collections.use('ArticleNV').config.get()).vectorizer.body.vectorizer
result = client.collections.use(collectionName).config.get()

console.assert('replication' in result);
}
// ====================================
// ===== CREATE A CLASS WITH PROPERTIES
// ====================================

// Clean slate
try {
  await client.collections.delete(collectionName)
} catch (e) {
  // ignore error if class doesn't exist
}

/*
// START CreateCollectionWithProperties
import { dataType } from 'weaviate-client';

// END CreateCollectionWithProperties
*/

// START CreateCollectionWithProperties
await client.collections.create({
  name: 'Article',
  properties: [
    {
      name: 'title',
      dataType: dataType.TEXT,
    },
    {
      name: 'body',
      dataType: dataType.TEXT,
    },
  ],
})
// END CreateCollectionWithProperties

// ================================
// ===== READ A CLASS =====
// ================================

articles = client.collections.use('Article')
// START ReadOneCollection
// highlight-start
const collectionConfig = await articles.config.get()
// highlight-end
console.log(collectionConfig)
// END ReadOneCollection

// ==================================================
// ===== CREATE A COLLECTION WITH NAMED VECTORS =====
// ==================================================

/*
// START BasicNamedVectors
import { vectors, dataType } from 'weaviate-client';

// END BasicNamedVectors
*/

// START BasicNamedVectors
await client.collections.create({
  name: 'ArticleNV',

  // highlight-start
  vectorizers: [
    // Set a named vector with the "text2vec-cohere" vectorizer
    vectors.text2VecCohere({
      name: 'title',
      sourceProperties: ['title'],                      // (Optional) Set the source property(ies)
      vectorIndexConfig: configure.vectorIndex.hnsw()   // (Optional) Set the vector index configuration
    }),
    // Set a named vector with the "text2vec-openai" vectorizer
    vectors.text2VecOpenAI({
      name: 'title_country',
      sourceProperties: ['title','country'],            // (Optional) Set the source property(ies)
      vectorIndexConfig: configure.vectorIndex.hnsw()   // (Optional) Set the vector index configuration
    }),
    // Set a named vector for your own uploaded vectors
    vectors.selfProvided({
      name: 'custom_vector',
      vectorIndexConfig: configure.vectorIndex.hnsw()   // (Optional) Set the vector index configuration
    })
  ],
  // highlight-end

  properties: [
    { name: 'title', dataType: dataType.TEXT },
    { name: 'country', dataType: dataType.TEXT },
  ],
})
// END BasicNamedVectors

// Test
result = client.collections.use(collectionName).config.get()

// TODO - fix this test
// assert.equal(
//   result.vectorizer.title.properties,
//   'title'
// );
// assert.equal(
//   result.vectorizer.body.properties,
//   'body'
// );

// Delete the class to recreate it
await client.collections.delete('ArticleNV')

// ===============================================
// ===== CREATE A COLLECTION WITH VECTORIZER =====
// ===============================================

/*
// START Vectorizer
import { vectors, dataType } from 'weaviate-client';

// END Vectorizer
*/

// START Vectorizer
await client.collections.create({
  name: 'Article',
  // highlight-start
  vectorizers: vectors.text2VecOpenAI(),
  // highlight-end
  properties: [
    { name: 'title', dataType: dataType.TEXT },
    { name: 'body', dataType: dataType.TEXT },
  ],
})
// END Vectorizer

// Test
result = client.collections.use(collectionName).config.get()

assert.equal(result.vectorizer.default.vectorizer.name, 'text2vec-openai');
assert.equal(result.properties.length, 2);

// Delete the class to recreate it
await client.collections.delete('Article')

// ===========================
// ===== SetVectorIndexType =====
// ===========================

/*
// START SetVectorIndexType
import { vectors, dataType, configure } from 'weaviate-client';

// END SetVectorIndexType
*/

// START SetVectorIndexType
await client.collections.create({
  name: 'Article',
  vectorizers: vectors.text2VecOpenAI({
    // highlight-start
    vectorIndexConfig: configure.vectorIndex.hnsw(),  // Use HNSW
    // vectorIndexConfig: configure.vectorIndex.flat(),  // Use Flat
    // vectorIndexConfig: configure.vectorIndex.dynamic(),  // Use Dynamic
    // highlight-end
  }),
  properties: [
    { name: 'title', dataType: dataType.TEXT },
    { name: 'body', dataType: dataType.TEXT },
  ],
})
// END SetVectorIndexType

// Test
result = client.collections.use(collectionName).config.get()

assert.equal(result.vectorizer.default.vectorizer.name, 'text2vec-openai');
assert.equal(result.vectorIndexType, 'hnsw');
assert.equal(result.properties.length, 2);

// Delete the class to recreate it
await client.collections.delete(collectionName)

// ===========================
// ===== SetVectorIndexParams =====
// ===========================

/*
// START SetVectorIndexParams
import { configure, vectors } from 'weaviate-client';

// END SetVectorIndexParams
*/

// START SetVectorIndexParams
await client.collections.create({
  name: 'Article',
  // Additional configuration not shown
  vectorizers: vectors.text2VecCohere({
    // highlight-start
    vectorIndexConfig: configure.vectorIndex.flat({
      quantizer: configure.vectorIndex.quantizer.bq({
        rescoreLimit: 200,
        cache: true
      }),
      vectorCacheMaxObjects: 100000
    })
    // highlight-end
  })
})
// END SetVectorIndexParams

// Test
result = client.collections.use(collectionName).config.get()

assert.equal(result.vectorizer.default.vectorizer.name, 'text2vec-openai');
assert.equal(result.vectorIndexType, 'flat');
assert.equal(result.properties.length, 2);

// Delete the class to recreate it
await client.collections.delete(collectionName)

// ===========================
// ===== MODULE SETTINGS =====
// ===========================

/*
// START ModuleSettings
import { vectors } from 'weaviate-client';

// END ModuleSettings
*/


// START ModuleSettings
await client.collections.create({
  name: 'Article',
  // highlight-start
  vectorizers: vectors.text2VecCohere({
    model: 'embed-multilingual-v2.0',
  }),
  // highlight-end
})
// END ModuleSettings

// Test
result = client.collections.use(collectionName).config.get()

assert.equal(result.vectorizer.default.vectorizer.name, 'text2vec-cohere');
assert.equal(
  result.vectorizer.default.vectorizer.config.model,
  'embed-multilingual-v2.0'
);

// Delete the class to recreate it
await client.collections.delete(collectionName)

// ====================================
// ===== MODULE SETTINGS PROPERTY =====
// ====================================

/*
// START PropModuleSettings
import { vectors, dataType, tokenization } from 'weaviate-client';

// END PropModuleSettings
*/
{
// START PropModuleSettings
const newCollection = await client.collections.create({
  name: 'Article',
  vectorizers: vectors.text2VecHuggingFace(),
  properties: [
    {
      name: 'title',
      dataType: dataType.TEXT,
      // highlight-start
      vectorizePropertyName: true,
      tokenization: tokenization.LOWERCASE // or 'lowercase'
      // highlight-end
    },
    {
      name: 'body',
      dataType: dataType.TEXT,
      // highlight-start
      skipVectorization: true,
      tokenization: tokenization.WHITESPACE // or 'whitespace'
      // highlight-end
    },
  ],
})
// END PropModuleSettings

// Test vectorizeCollectionName
result = client.collections.use(collectionName).config.get()

assert.equal(result.vectorizer.default.vectorizer.name, 'text2vec-cohere');
assert.equal(
  result.vectorizer.default.vectorizer.config.vectorizeCollectionName,
  'true'
);

// Delete the class to recreate it
await client.collections.delete(collectionName)
}

// ====================================
// ===== MODULE SETTINGS PROPERTY =====
// ====================================

// START AddNamedVectors
await articles.config.addVector(
    vectors.text2VecCohere({
        name: "body_vector",
        sourceProperties: ["body"],
    })
)
// END AddNamedVectors

// Test
const testCollection = client.collections.use("Article")
const testConfig = await testCollection.config.get()

assert.equal(testConfig.vectorizers["body_vector"].vectorizer.name, "text2vec-cohere")
for (const p of testConfig.properties) {
    if (p.name == "title") {
        assert.equal(p.tokenization, "lowercase")
    }
    else if (p.name == "body") {
        assert.equal(p.tokenization, "whitespace")
    }
    
}


// ===========================
// ===== DISTANCE METRIC =====
// ===========================

/*
// START DistanceMetric
import { configure, vectors, vectorDistances } from 'weaviate-client';

// END DistanceMetric
*/

// START DistanceMetric
await client.collections.create({
  name: 'Article',
  vectorizers: vectors.text2VecOllama({
    // highlight-start
    vectorIndexConfig: configure.vectorIndex.hnsw({
      distanceMetric: vectorDistances.COSINE // or 'cosine'
    })
    // highlight-end
  })
})
// END DistanceMetric

// Test
result = client.collections.use(collectionName).config.get()

assert.equal(result.vectorizer.default.indexConfig.distance, 'cosine');

// Delete the class to recreate it
await client.collections.delete(collectionName)

// ===================================================================
// ===== CREATE A COLLECTION WITH CUSTOM INVERTED INDEX SETTINGS =====
// ===================================================================

/*
// START SetInvertedIndexParams
import { dataType } from 'weaviate-client';

// END SetInvertedIndexParams
*/

// START SetInvertedIndexParams
await client.collections.create({
  name: 'Article',
  properties: [
    {
      name: 'title',
      dataType: dataType.TEXT,
      // highlight-start
      indexFilterable: true,
      indexSearchable: true,
      // highlight-end
    },
    {
      name: 'chunk',
      dataType: dataType.TEXT,
      // highlight-start
      indexFilterable: true,
      indexSearchable: true,
      // highlight-end
    },
    {
      name: 'chunk_no',
      dataType: dataType.INT,
      // highlight-start
      indexRangeFilters: true,
      // highlight-end
    },
  ],
  // highlight-start
  invertedIndex: {
    bm25: {
      b: 0.7,
      k1: 1.25
    },
    indexNullState: true,
    indexPropertyLength: true,
    indexTimestamps: true
  }
  // highlight-end
})
// END SetInvertedIndexParams

// Test
assert.equal(result.vectorizer, 'text2vec-huggingface');
assert.equal(
  result.properties[0].moduleConfig['text2vec-huggingface'][
    'vectorizePropertyName'
  ],
  false
);

// Delete the class to recreate it
await client.collections.delete(collectionName)


// ===============================================
// ===== CREATE A COLLECTION WITH A RERANKER MODULE =====
// ===============================================
/*
// START SetReranker
import { vectors, reranker } from 'weaviate-client';

// END SetReranker
/*
// START SetReranker
await client.collections.create({
  name: 'Article',
  vectorizers: vectors.text2VecOpenAI(),
  // highlight-start
  reranker: reranker.cohere(),
  // highlight-end
})
// END SetReranker

// Test
Object.keys(result['moduleConfig']).includes('reranker-cohere');

// Delete the class to recreate it
await client.collections.delete(collectionName)


// ===============================================
// ===== CREATE A COLLECTION WITH A GENERATIVE MODULE =====
// ===============================================

/*
// START SetGenerative
import { vectors, generative } from 'weaviate-client';

// END SetGenerative
*/

// START SetGenerative
await client.collections.create({
  name: 'Article',
  vectorizers: vectors.text2VecOpenAI(),
  // highlight-start
  generative: generative.openAI({
    model: "gpt-4o"  // set your generative model (optional parameter)
  }),
  // highlight-end
})
// END SetGenerative

// Test
Object.keys(result['moduleConfig']).includes('generative-openai');

// Delete the class to recreate it
await client.collections.delete(collectionName)

// =======================
// ===== REPLICATION =====
// =======================

/*
// START ReplicationSettings
import { configure } from 'weaviate-client';

// END ReplicationSettings
*/

// START ReplicationSettings
await client.collections.create({
  name: 'Article',
  // highlight-start
  replication: configure.replication({
    factor: 3
  }),
  // highlight-end
})
// END ReplicationSettings

// Test
assert.equal(result.replicationConfig.factor, 3);


// =======================
// ===== Async Repair ====
// =======================

/*
// START AsyncRepair
import { configure } from 'weaviate-client';

// END AsyncRepair
*/

// START AsyncRepair
await client.collections.create({
 name: 'Article',
 // highlight-start
 replication: configure.replication({
   factor: 3,
   asyncEnabled: true,
 }),
 // highlight-end
})
// END AsyncRepair

// Test
// TODO NEEDS TEST assert.equal(result.replicationConfig.factor, 3);

// =======================
// ===== All replication settings
// =======================

/*
// START AllReplicationSettings
import { configure } from 'weaviate-client';

// END AllReplicationSettings
*/

// START AllReplicationSettings
await client.collections.create({
  name: 'Article',
  // highlight-start
  replication: configure.replication({
    factor: 3,
    asyncEnabled: true,
    deletionStrategy: 'TimeBasedResolution'  // Available from Weaviate v1.28.0
  }),
  // highlight-end
 })
 // END AllReplicationSettings

 // Test
 // TODO NEEDS TEST assert.equal(result.replicationConfig.factor, 3);

// ====================
// ===== SHARDING =====
// ====================

/*
// START ShardingSettings
import { configure } from 'weaviate-client';

// END ShardingSettings
*/

// START ShardingSettings
await client.collections.create({
  name: 'Article',
  // highlight-start
  sharding: configure.sharding({
    virtualPerPhysical: 128,
    desiredCount: 1,
    desiredVirtualCount: 128,
  })
  // highlight-end
})
// END ShardingSettings

// Test
assert.equal(result.shardingConfig.virtual_per_physical, 128);
assert.equal(result.shardingConfig.desired_count, 1);
assert.equal(result.shardingConfig.actual_count, 1);
assert.equal(result.shardingConfig.desired_virtual_count, 128);
assert.equal(result.shardingConfig.actual_virtual_count, 128);

// =========================
// ===== MULTI-TENANCY =====
// =========================

// START Multi-tenancy
await client.collections.create({
  name: 'Article',
  // highlight-start
  multiTenancy: { enabled: true }
  // multiTenancy: configure.multiTenancy({ enabled: true }) // alternatively use helper function
  // highlight-end
})
// END Multi-tenancy

// ==========================
// ===== ADD A PROPERTY =====
// ==========================

// // START AddProp
// const prop = {
//   name: 'body',
//   dataType: ['text'],
// };

// const resultProp = await client.schema
//   .propertyCreator()
//   .withClassName('Article')
//   .withProperty(prop)
//   .do();

// // The returned value is full property definition
// console.log(JSON.stringify(resultProp, null, 2));
// // END AddProp

// // Test
// assert.equal(resultProp.name, 'body');

// ================================
// ===== READ A CLASS =====
// ================================

// START ReadAllCollections
const allCollections = await client.collections.listAll()
console.log(JSON.stringify(allCollections, null, 2));
// END ReadAllCollections

// ================================
// ===== UPDATE A COLLECTION =====
// ================================

articles = client.collections.use('Article')


// START UpdateCollection

// highlight-start
await articles.config.update({
  invertedIndex: reconfigure.invertedIndex({
    bm25k1: 1.5 // Change the k1 parameter from 1.2
  }),
    vectorizers: reconfigure.vectors.update({
      vectorIndexConfig: reconfigure.vectorIndex.hnsw({
        quantizer: reconfigure.vectorIndex.quantizer.pq(),
        ef: 4,
        filterStrategy: 'acorn',  // Available from Weaviate v1.27.0
      }),

  })
})
// highlight-end
// END UpdateCollection

// ===============================================
// ===== UPDATE A COLLECTION'S RERANKER MODULE =====
// ===============================================

client.collections.delete("Article")


await client.collections.create({
    name: "Article",
    vectorizers: vectors.text2VecOpenAI(),
    // highlight-start
    reranker: configure.reranker.voyageAI()
    // highlight-end
})

// START UpdateReranker
const collection = client.collections.use('Article')

await collection.config.update({
    // highlight-start
    reranker: reconfigure.reranker.cohere()  // Update the reranker module
    // highlight-end
})
// END UpdateReranker

// Test
let config = await collection.config.get()
assert.equal(config.reranker?.name,"reranker-cohere")

// Delete the collection to recreate it
client.collections.delete("Article")

// ==========================================
// ===== MULTI-VECTOR EMBEDDINGS MUVERA
// ==========================================

// Clean slate
await client.collections.delete("DemoCollection")

// START MultiValueVectorMuvera
import { configure } from 'weaviate-client';

await client.collections.create({
    name: "DemoCollection",
    vectorizers: [
        // Example 1 - Use a model integration
        configure.multiVectors.text2VecJinaAI({
            name: "jina_colbert",
            sourceProperties: ["text"],
            // highlight-start
            encoding: configure.vectorIndex.multiVector.encoding.muvera({
                // Optional parameters for tuning MUVERA
                ksim: 4,
                dprojections: 16,
                repetitions: 20,
        }),
            // highlight-end
}),
        // Example 2 - User-provided multi-vector representations
        configure.multiVectors.selfProvided({
            name: "custom_multi_vector",
            encoding: configure.vectorIndex.multiVector.encoding.muvera(),
}),
    ],
    // Additional parameters not shown
})
// END MultiValueVectorMuvera


// ===============================================
// ===== UPDATE A COLLECTION'S GENERATIVE MODULE =====
// ===============================================

client.collections.delete("Article")

client.collections.create({
    name: "Article",
    vectorizers: configure.vectors.text2VecOpenAI(),
    // highlight-start
    generative: configure.generative.openAI()
    // highlight-end
})

// START UpdateGenerative
const collection = client.collections.use("Article")

await collection.config.update({
    // highlight-start
    generative: weaviate.reconfigure.generative.cohere()  // Update the generative module
    // highlight-end
})
// END UpdateGenerative

// Test
let config = await collection.config.get()
assert.equal(config.generative?.name, "generative-cohere")

// Delete the collection to recreate it
client.collections.delete('Article')

// ======================================================
// ===== MULTI-VECTOR EMBEDDINGS (ColBERT, ColPali)
// ======================================================

// Clean slate
client.collections.delete("DemoCollection")

// START MultiValueVectorCollection
await client.collections.create({
    name: "DemoCollection",
    vectorizers: [
        // Example 1 - Use a model integration
        // The factory function will automatically enable multi-vector support for the HNSW index
        // highlight-start
        configure.multiVectors.text2VecJinaAI({
            name: "jina_colbert",
            sourceProperties: ["text"],
        }),
        // highlight-end
        // Example 2 - User-provided multi-vector representations
        // Must explicitly enable multi-vector support for the HNSW index
        // highlight-start
        configure.multiVectors.selfProvided({
            // highlight-end
            name: "custom_multi_vector",
        }),
    ],
    properties: [{ name: "text", dataType: dataType.TEXT }],
    // Additional parameters not shown
})
// END MultiValueVectorCollection
