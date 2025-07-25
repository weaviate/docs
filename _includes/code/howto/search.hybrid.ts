// Howto: hybrid search - TypeScript examples

import assert from 'assert';

// ================================
// ===== INSTANTIATION-COMMON =====
// ================================

import weaviate from 'weaviate-client';

const client = await weaviate.connectToWeaviateCloud(
  process.env.WEAVIATE_URL as string,
  {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY as string),
    headers: {
      'X-OpenAI-Api-Key': process.env.OPENAI_APIKEY as string,  // Replace with your inference API key
    }
  }
)

// searchHybridBasic  // searchHybridWithScore  // searchHybridWithAlpha  // searchHybridWithFusionType  // searchHybridWithProperties  // searchHybridWithVector // VectorSimilarity // searchHybridWithFilter  // START limit  // START autocut // searchHybridWithPropertyWeighting
const jeopardy = client.collections.use('JeopardyQuestion');
// END searchHybridBasic  // END searchHybridWithScore  // END searchHybridWithAlpha  // END searchHybridWithFusionType  // END searchHybridWithProperties  // END searchHybridWithVector  // END searchHybridWithFilter // END VectorSimilarity // END limit  // END autocut // END searchHybridWithPropertyWeighting



// ===============================================
// ===== QUERY WITH TARGET VECTOR & Hybrid =====
// ===============================================
{
  // NamedVectorHybrid
  const myNVCollection = client.collections.use('WineReviewNV');

  const result = await myNVCollection.query.hybrid('a sweet German white wine', {
    // highlight-start
    targetVector: 'title_country',
    // highlight-end
    limit: 2,
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END NamedVectorHybrid

  // Tests
  // assert.deepEqual(result.objects.length, 2);
}

// ==============================
// ===== Basic Hybrid Query =====
// ==============================
{
  // searchHybridBasic

  const result = await jeopardy.query.hybrid('food', {
    limit: 2,
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END searchHybridBasic
}
// Tests
// let questionKeys = new Set(Object.keys(result.objects[0].properties));
// assert.deepEqual(questionKeys, new Set(['question', 'answer']));
// assert.equal(result.objects.length, 3);


// ===================================
// ===== Hybrid Query with Score =====
// ===================================
{
  // searchHybridWithScore

  const result = await jeopardy.query.hybrid('food', {
    limit: 2,
    returnProperties: ['question', 'answer'],
    // highlight-start
    returnMetadata: ['score', 'explainScore']
    // highlight-end
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
    console.log(object.metadata?.score);
    console.log(object.metadata?.explainScore);
  }
  // END searchHybridWithScore

  // Tests
  // questionKeys = new Set(Object.keys(result.objects[0].properties));
  // assert.deepEqual(questionKeys, new Set(['question', 'answer']));
  // const additionalKeys = new Set(Object.keys(result.objects[0].metadata));
  // assert.deepEqual(additionalKeys, new Set(['score', 'explainScore']));
  // assert.equal(result.objects.length, 3);
}

// ===================================
// ===== Hybrid Query with Alpha =====
// ===================================
{
  // searchHybridWithAlpha

  const result = await jeopardy.query.hybrid('food', {
    // highlight-start
    alpha: 0.25,
    // highlight-end
    limit: 3
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END searchHybridWithAlpha

  // Tests
  // questionKeys = new Set(Object.keys(result.objects[0].properties));
  // assert.deepEqual(questionKeys, new Set(['question', 'answer']));
  // assert.equal(result.objects.length, 3);
}


// ============================================
// ===== Hybrid Query with Fusion Methods =====
// ============================================
{
  // searchHybridWithFusionType

  const result = await jeopardy.query.hybrid('food', {
    limit: 2,
    // highlight-start
    fusionType: 'RelativeScore', // can also be 'Ranked'
    // highlight-end
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END searchHybridWithFusionType

  // Tests
  // questionKeys = new Set(Object.keys(result.objects[0].properties));
  // assert.deepEqual(questionKeys, new Set(['question', 'answer']));
  // assert.equal(result.objects.length, 3);
}

// ========================================
// ===== Hybrid Query with Properties =====
// ========================================
{
  // searchHybridWithProperties

  const result = await jeopardy.query.hybrid('food', {
    // highlight-start
    queryProperties: ['question'],
    // highlight-end
    alpha: 0.25,
    limit: 3
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END searchHybridWithProperties

  // Test
  // questionKeys = new Set(Object.keys(result.objects[0].properties));
  // assert.deepEqual(questionKeys, new Set(['question', 'answer']));
  // assert.equal(result.objects.length, 3);
}

// ================================================
// ===== Hybrid Query with Property Weighting =====
// ================================================
{
  // searchHybridWithPropertyWeighting

  const result = await jeopardy.query.hybrid('food', {
    // highlight-start
    queryProperties: ['question^2', 'answer'],
    // highlight-end
    alpha: 0.25,
    limit: 3
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END searchHybridWithPropertyWeighting

  // Tests
  // questionKeys = new Set(Object.keys(result.objects[0].properties));
  // assert.deepEqual(questionKeys, new Set(['question', 'answer']));
  // assert.equal(result.objects.length, 3);
}
// ====================================
// ===== Hybrid Query with Vector =====
// ====================================
{
  // searchHybridWithVector
  let queryVector = Array(1536).fill(0.12345) // Query vector [0.12345, 0.12345, 0.12345...]

  const result = await jeopardy.query.hybrid('food', {
    // highlight-start
    vector: queryVector,
    // highlight-end
    alpha: 0.25,
    limit: 3
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END searchHybridWithVector

  // Tests
  // questionKeys = new Set(Object.keys(result.objects[0].properties));
  // assert.deepEqual(questionKeys, new Set(['question', 'answer']));
  // assert.equal(result.objects.length, 3);
}

// =========================================
// ===== Hybrid with vector similarity =====
// =========================================

{
  // VectorSimilarity

  const result = await jeopardy.query.hybrid('California', {
    maxVectorDistance: 0.4, // Maximum threshold for the vector search component
    vector: {
      query: 'large animal',
      moveAway: { force: 0.5, concepts: ['mammal', 'terrestrial'] }
    },
    alpha: 0.75,
    limit: 5,

  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END VectorSimilarity
}
// ====================================
// ===== Hybrid Query with Filter =====
// ====================================
{
  // searchHybridWithFilter

  const result = await jeopardy.query.hybrid('food', {
    // highlight-start
    filters: jeopardy.filter.byProperty('round').equal('Double Jeopardy!'),
    // highlight-end
    limit: 3,
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END searchHybridWithFilter

  // Tests
  // questionKeys = new Set(Object.keys(result.objects[0].properties));
  // assert.deepEqual(questionKeys, new Set(['question', 'answer', 'round']));
  // assert.equal(result.objects.length, 3);
  // result.objects.map((question) => {
  //   assert.deepEqual(question.properties.round, 'Double Jeopardy!');
  //   console.log(question)
  // })
  // for (const question of result.objects) {
  //   assert.deepEqual(question.round, 'Double Jeopardy!');
  // }
}

// ===================================
// ===== Hybrid Query with limit =====
// ===================================
{
  // START limit

  const result = await jeopardy.query.hybrid('safety', {
    // highlight-start
    limit: 3,
    offset: 1
    // highlight-end
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END limit

  // Tests
  // questionKeys = new Set(Object.keys(result.objects[0].properties));
  // assert.deepEqual(questionKeys, new Set(['question', 'answer']));
  // assert.deepEqual(Object.keys(result.objects[0].metadata), ['score']);
  // assert.equal(result.objects.length, 3);
  // assert(result.objects[0].properties['answer'].includes('OSHA'));
}

// =====================================
// ===== Hybrid Query with autocut =====
// =====================================
{
  // START autocut

  const result = await jeopardy.query.hybrid('safety', {
    fusionType: 'Ranked',
    // highlight-start
    autoLimit: 1
    // highlight-end
  })

  for (let object of result.objects) {
    console.log(JSON.stringify(object.properties, null, 2));
  }
  // END autocut

  // Tests
  // questionKeys = new Set(Object.keys(result.objects[0].properties));
  // assert.deepEqual(questionKeys, new Set(['question', 'answer']));
  // assert.deepEqual(Object.keys(result.objects[0].metadata), ['score']);
  // // assert.equal(result.objects[0].properties['answer'], 'Guards');
  // // TODO: too many results if autocut logic changes? assert.equal(result.objects.length, 1);
}

// =========================================
// ===== Hybrid with vector similarity threshold =====
// =========================================

// START VectorSimilarityThreshold
const jeopardy = client.collections.use("JeopardyQuestion")

const response = await jeopardy.query.hybrid("California", {
  alpha: 0.75,
  // highlight-start
  maxVectorDistance: 0.4,  // Maximum threshold for the vector search component
  // highlight-end
  limit: 5,
})
// END VectorSimilarityThreshold

assert.equal(response.objects.length <= 5, true)
assert.equal(response.objects.length > 0, true)

// =========================================
// ===== Hybrid with groupBy =====
// =========================================


// START HybridGroupBy
// Grouping parameters
  // highlight-start
const groupByProperties = {
  property: "round", // group by this property
  objectsPerGroup: 3, // maximum objects per group
  numberOfGroups: 2 // maximum number of groups
  // highlight-end
}

const jeopardy = client.collections.use('JeopardyQuestion');

const response = await jeopardy.query.hybrid('California', {
  alpha: 0.75,
    // highlight-start
  groupBy: groupByProperties
    // highlight-end
})


for (let groupName in response.groups) {
  console.log(groupName)
  // Uncomment to view group objects 
  // console.log(response.groups[groupName].objects)
}
// END HybridGroupBy

assert.equal(response.groups <= 2, true)
assert.equal(response.groups > 0, true)

for (let groupName in response.groups) {
  assert.equal(response.groups[groupName].numberOfObjects > 0, true)
  assert.equal(response.groups[groupName].numberOfObjects <= 3, true)
}

client.close()
