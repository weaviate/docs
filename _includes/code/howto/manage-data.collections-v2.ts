// How-to: Manage-data -> Classes - TypeScript examples
// run with: node --loader=ts-node/esm FILENAME.ts
import assert from 'assert';

// ================================
// ===== INSTANTIATION-COMMON =====
// ================================
import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'http',
  host: 'anon-endpoint.weaviate.network',
  headers: {
    'X-OpenAI-Api-Key': process.env['OPENAI_API_KEY'],
  },
});

// START BasicCreateCollection  // START ReadOneCollection
const className = 'Article';

// END BasicCreateCollection  // END ReadOneCollection

// ================================
// ===== CREATE A CLASS =====
// ================================

// Clean slate
try {
  await client.schema.classDeleter().withClassName(className).do();
} catch (e) {
  // ignore error if class doesn't exist
}

// START BasicCreateCollection
const emptyClassDefinition = {
  class: className,
};

// Add the class to the schema
let result = await client.schema
  .classCreator()
  .withClass(emptyClassDefinition)
  .do();
// END BasicCreateCollection

// Test
console.assert('invertedIndexConfig' in result);

// ====================================
// ===== CREATE A CLASS WITH PROPERTIES
// ====================================

// Clean slate
try {
  await client.schema.classDeleter().withClassName(className).do();
} catch (e) {
  // ignore error if class doesn't exist
}

// START CreateCollectionWithProperties
const classWithProps = {
  class: 'Article',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
    {
      name: 'body',
      dataType: ['text'],
    },
  ],
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(classWithProps).do();
// END CreateCollectionWithProperties

// ================================
// ===== READ A COLLECTION =====
// ================================

// START ReadOneCollection
let classDefinition = await client.schema
  .classGetter()
  .withClassName(className)
  .do();

console.log(JSON.stringify(classDefinition, null, 2));
// END ReadOneCollection

// ==================================================
// ===== CREATE A COLLECTION WITH NAMED VECTORS =====
// ==================================================

// START BasicNamedVectors
const classWithNamedVectors = {
  class: 'ArticleNV',
  // highlight-start
  vectorConfig: {
    // Set a named vector with the "text2vec-cohere" vectorizer
    title: {
      vectorizer: {
        'text2vec-cohere': {
          properties: ['title'], // (Optional) Set the source property(ies)
        },
      },
      vectorIndexType: 'hnsw',  // (Optional) Set the vector index type
      vectorIndexConfig: {}     // (Optional) Set the vector index configuration
    },
    // Set a named vector with the "text2vec-openai" vectorizer
    title_country: {
      vectorizer: {
        'text2vec-openai': {
          properties: ['title','country'],  // (Optional) Set the source property(ies)
        },
      },
      vectorIndexType: 'hnsw',  // (Optional) Set the vector index type
      vectorIndexConfig: {}     // (Optional) Set the vector index configuration
    },
    // Set a named vector for your own uploaded vectors
    custom_vector: {
      vectorizer: {
        'none': {}
      },
      vectorIndexType: 'hnsw',  // (Optional) Set the vector index type
      vectorIndexConfig: {}     // (Optional) Set the vector index configuration
    },
  },
  // highlight-end
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
    {
      name: 'country',
      dataType: ['text'],
    },
  ],
};

// Add the class to the schema
result = await client.schema
  .classCreator()
  .withClass(classWithNamedVectors)
  .do();
// END BasicNamedVectors

// Test
assert.equal(
  result['vectorConfig']['title']['vectorizer']['text2vec-cohere'][
    'properties'
  ][0],
  'title'
);
assert.equal(
  result['vectorConfig']['body']['vectorizer']['text2vec-openai'][
    'properties'
  ][0],
  'body'
);

// Delete the class to recreate it
await client.schema.classDeleter().withClassName('ArticleNV').do();

// ===============================================
// ===== CREATE A COLLECTION WITH VECTORIZER =====
// ===============================================

// START Vectorizer
const classWithVectorizer = {
  class: 'Article',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
  ],
  // highlight-start
  vectorizer: 'text2vec-openai', // this could be any vectorizer
  // highlight-end
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(classWithVectorizer).do();
// END Vectorizer

// Test
assert.equal(result['vectorizer'], 'text2vec-openai');
assert.equal(result['properties'].length, 1); // no 'body' from the previous example

// Delete the class to recreate it
await client.schema.classDeleter().withClassName(className).do();

// ===========================
// ===== SetVectorIndexType =====
// ===========================

// START SetVectorIndexType
const classWithIndexType = {
  class: 'Article',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
  ],
  vectorizer: 'text2vec-openai', // this could be any vectorizer
  // highlight-start
  vectorIndexType: 'flat', // or 'hnsw', or 'dynamic'
  vectorIndexConfig: {
    bq: {
      enabled: true, // Enable BQ compression. Default: False
      rescoreLimit: 200, // The minimum number of candidates to fetch before rescoring. Default: -1 (No limit)
      cache: true, // Enable use of vector cache. Default: False
    },
    vectorCacheMaxObjects: 100000, // Cache size if `cache` enabled. Default: 1000000000000
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(classWithIndexType).do();
// END SetVectorIndexType

// Test
assert.equal(result['vectorizer'], 'text2vec-openai');
assert.equal(result['vectorIndexType'], 'flat');
assert.equal(result['properties'].length, 1); // no 'body' from the previous example

// Delete the class to recreate it
await client.schema.classDeleter().withClassName(className).do();


// ===========================
// ===== SetVectorIndexParams =====
// ===========================

// START SetVectorIndexParams
const classWithIndexParams = {
  class: 'Article',
  // Additional configuration not shown
  vectorIndexType: 'flat', // or `hnsw`
  // highlight-start
  vectorIndexConfig: {
    bq: {
      enabled: true, // Enable BQ compression. Default: False
      rescoreLimit: 200, // The minimum number of candidates to fetch before rescoring. Default: -1 (No limit)
      cache: true, // Enable use of vector cache. Default: False
    },
    vectorCacheMaxObjects: 100000, // Cache size if `cache` enabled. Default: 1000000000000
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(classWithIndexType).do();
// END SetVectorIndexParams

// Test
assert.equal(result['vectorizer'], 'text2vec-openai');
assert.equal(result['vectorIndexType'], 'flat');
assert.equal(result['properties'].length, 1); // no 'body' from the previous example

// Delete the class to recreate it
await client.schema.classDeleter().withClassName(className).do();


// ===========================
// ===== MODULE SETTINGS =====
// ===========================

// START ModuleSettings
const classWithModuleSettings = {
  class: 'Article',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
  ],
  vectorizer: 'text2vec-cohere', // this could be any vectorizer
  // highlight-start
  moduleConfig: {
    'text2vec-cohere': {
      // this must match the vectorizer used
      vectorizeClassName: true,
      model: 'embed-multilingual-v2.0',
    },
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema
  .classCreator()
  .withClass(classWithModuleSettings)
  .do();
// END ModuleSettings

// Test
assert.equal(result.vectorizer, 'text2vec-cohere');
assert.equal(
  result.moduleConfig['text2vec-cohere']['model'],
  'embed-multilingual-v2.0'
);

// Delete the class to recreate it
await client.schema.classDeleter().withClassName(className).do();

// ====================================
// ===== MODULE SETTINGS PROPERTY =====
// ====================================

// START PropModuleSettings
const classWithPropModuleSettings = {
  class: 'Article',
  vectorizer: 'text2vec-huggingface', // this could be any vectorizer
  properties: [
    {
      name: 'title',
      dataType: ['text'],
      // highlight-start
      moduleConfig: {
        'text2vec-huggingface': {
          // this must match the vectorizer used
          vectorizePropertyName: true,
          tokenization: 'lowercase', // Use "lowercase" tokenization
        },
      },
      // highlight-end
    },
    {
      name: 'body',
      dataType: ['text'],
      // highlight-start
      moduleConfig: {
        'text2vec-huggingface': {
          // this must match the vectorizer used
          skip: true, // Don't vectorize this property
          tokenization: 'whitespace', // Use "whitespace" tokenization
        },
      },
      // highlight-end
    },
  ],
};

// Add the class to the schema
result = await client.schema
  .classCreator()
  .withClass(classWithPropModuleSettings)
  .do();
// END PropModuleSettings

// Test
assert.equal(result.vectorizer, 'text2vec-huggingface');
assert.equal(
  result.properties[0].moduleConfig['text2vec-huggingface'][
    'vectorizePropertyName'
  ],
  false
);

// Delete the class to recreate it
await client.schema.classDeleter().withClassName(className).do();

// ===========================
// ===== DISTANCE METRIC =====
// ===========================

// START DistanceMetric
const classWithDistance = {
  class: 'Article',
  // highlight-start
  vectorIndexConfig: {
    distance: 'cosine',
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(classWithDistance).do();
// END DistanceMetric

// Test
assert.equal(result.vectorIndexConfig.distance, 'cosine');

// Delete the class to recreate it
await client.schema.classDeleter().withClassName(className).do();

// ====================================
// ===== CUSTOM INVERTED INDEX SETTINGS =====
// ====================================

// START SetInvertedIndexParams
const classWithInvIndexSettings = {
  class: 'Article',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
      // highlight-start
      indexFilterable: true,
      indexSearchable: true,
      // highlight-end
    },
    {
      name: 'chunk',
      dataType: ['text'],
      // highlight-start
      indexFilterable: true,
      indexSearchable: true,
      // highlight-end
    },
    {
      name: 'chunk_no',
      dataType: ['int'],
      // highlight-start
      indexRangeFilters: true,
      // highlight-end
    },
  ],
  // highlight-start
  invertedIndexConfig: {
    bm25: {
        b: 0.7,
        k1: 1.25
    },
    indexTimestamps: true,
    indexNullState: true,
    indexPropertyLength: true
  }
  // highlight-end
};

// Add the class to the schema
result = await client.schema
  .classCreator()
  .withClass(classWithPropModuleSettings)
  .do();
// END SetInvertedIndexParams

// Test
assert.equal(
  result.properties[0].invertedIndexConfig.bm25.b,
  0.7
);
assert.equal(
  result.properties[0].invertedIndexConfig.bm25.k1,
  1.25
);

// Delete the class to recreate it
await client.schema.classDeleter().withClassName(className).do();

// ===============================================
// ===== CREATE A COLLECTION WITH A RERANKER MODULE =====
// ===============================================

// START SetReranker
const classWithReranker = {
  class: 'Article',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
  ],
  vectorizer: 'text2vec-openai', // this could be any vectorizer
  // highlight-start
  moduleConfig: {
    'reranker-cohere': {}, // set your reranker module
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(classWithReranker).do();
// END SetReranker

// Test
Object.keys(result['moduleConfig']).includes('reranker-cohere');

// Delete the class to recreate it
await client.schema.classDeleter().withClassName(className).do();


// ===============================================
// ===== UPDATE THE COLLECTION WITH THE RERANKER MODULE =====
// ===============================================

const initCollectionWithReranker = {
  class: 'Article',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
  ],
  vectorizer: 'text2vec-openai', // this could be any vectorizer
  // highlight-start
  moduleConfig: {
    'reranker-cohere': {}, // set your reranker module
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(initCollectionWithReranker).do();

// START UpdateReranker
// Collection definition updates are not available in the v2 API.
// Consider upgrading to the v3 API, or deleting and recreating the collection.
// END UpdateReranker


// ===============================================
// ===== CREATE A COLLECTION WITH A GENERATIVE MODULE =====
// ===============================================

// START SetGenerative
const classWithGenerative = {
  class: 'Article',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
  ],
  vectorizer: 'text2vec-openai', // this could be any vectorizer
  // highlight-start
  moduleConfig: {
    'generative-openai': {
      model: 'gpt-4o'  // set your generative model (optional parameter)
    },
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(classWithGenerative).do();
// END SetGenerative

// Test
Object.keys(result['moduleConfig']).includes('generative-openai');

// Delete the class to recreate it
await client.schema.classDeleter().withClassName(className).do();

// ===============================================
// ===== UPDATE THE COLLECTION WITH THE GENERATIVE MODULE =====
// ===============================================

const initCollectionWithGenerative = {
  class: 'Article',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
  ],
  vectorizer: 'text2vec-openai', // this could be any vectorizer
  // highlight-start
  moduleConfig: {
    'generative-openai': {}, // set your generative module
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(initCollectionWithGenerative).do();

// START UpdateGenerative
// Collection definition updates are not available in the v2 API.
// Consider upgrading to the v3 API, or deleting and recreating the collection.
// END UpdateGenerative

// =======================
// ===== REPLICATION =====
// =======================

// START ReplicationSettings
const classWithReplication = {
  class: 'Article',
  // highlight-start
  replicationConfig: {
    factor: 3,
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema
  .classCreator()
  .withClass(classWithReplication)
  .do();
// END ReplicationSettings

// Test
assert.equal(result.replicationConfig.factor, 3);


// =======================
// ===== AsyncRepair =====
// =======================

// START AsyncRepair
const classWithReplication = {
 class: 'Article',
 // highlight-start
 replicationConfig: {
   factor: 3,
   asyncEnabled: true,
 },
 // highlight-end
};

// Add the class to the schema
result = await client.schema
 .classCreator()
 .withClass(classWithReplication)
 .do();
// END AsyncRepair

// TODO NEEDS TEST


// =======================
// ===== All replication settings =====
// =======================

// START AllReplicationSettings
const classWithAllReplicationSettings = {
  class: 'Article',
  // highlight-start
  replicationConfig: {
    factor: 3,
    asyncEnabled: true,
    deletionStrategy: 'TimeBasedResolution'
  },
  // highlight-end
 };

 // Add the class to the schema
 result = await client.schema
  .classCreator()
  .withClass(classWithAllReplicationSettings)
  .do();
 // END AllReplicationSettings


// ====================
// ===== SHARDING =====
// ====================

// START ShardingSettings
const classWithSharding = {
  class: 'Article',
  // highlight-start
  vectorIndexConfig: {
    distance: 'cosine',
  },
  shardingConfig: {
    virtualPerPhysical: 128,
    desiredCount: 1,
    desiredVirtualCount: 128,
  },
  // highlight-end
};

// Add the class to the schema
result = await client.schema.classCreator().withClass(classWithSharding).do();
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
await client.schema
  .classCreator()
  .withClass({
    class: 'Article',
    // highlight-start
    multiTenancyConfig: { enabled: true },
    // highlight-end
  })
  .do();
// END Multi-tenancy

// ==========================
// ===== ADD A PROPERTY =====
// ==========================

// START AddProp
const prop = {
  name: 'body',
  dataType: ['text'],
};

const resultProp = await client.schema
  .propertyCreator()
  .withClassName('Article')
  .withProperty(prop)
  .do();
// END AddProp

// Test
assert.equal(resultProp.name, 'body');

// ================================
// ===== READ A CLASS =====
// ================================

// START ReadAllCollections
let allCollections = await client.schema.getter().do();

console.log(JSON.stringify(allCollections, null, 2));
// END ReadAllCollections

// ================================
// ===== UPDATE A CLASS =====
// ================================

// Clean slate
try {
  await client.schema.classDeleter().withClassName(className).do();
} catch (e) {
  // ignore error if class doesn't exist
}

// START UpdateCollection
// Collection definition updates are not available in the v2 API.
// Consider upgrading to the v3 API, or deleting and recreating the collection.
// END UpdateCollection
