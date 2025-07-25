// Howto: Multiple target vectors search - TypeScript examples

// TODO: Needs tests

// ================================
// ===== INSTANTIATION-COMMON =====
// ================================

import weaviate from 'weaviate-client';

const client = await weaviate.connectToLocal({
  headers: { 'X-Openai-Api-Key': process.env.OPENAI_API_KEY || '' },
});

// ========================
// ===== Basic search =====
// ========================

// START-ANY
var jeopardy, result;

// END-ANY

// START MultiBasic
jeopardy = client.collections.use('JeopardyTiny');

result = await jeopardy.query.nearText('a wild animal', {
  limit: 2,
  // highlight-start
  targetVector: ['jeopardy_questions_vector', 'jeopardy_answers_vector'],
  // highlight-end
  returnMetadata: ['distance'],
});

result.objects.forEach((item) => {
  console.log(JSON.stringify(item.properties, null, 2));
  console.log(JSON.stringify(item.metadata?.distance, null, 2));
});
// END MultiBasic

// ========================
// ===== Specify query vectors =====
// ========================

var resp = await jeopardy.query.fetchObjects({
  limit: 2,
  includeVector: true,
});

var v1 = resp.objects[0].vectors.jeopardy_questions_vector;
var v2 = resp.objects[0].vectors.jeopardy_answers_vector;
var v3 = resp.objects[1].vectors.jeopardy_answers_vector;


// START MultiTargetNearVector
jeopardy = client.collections.use('JeopardyTiny');

result = await jeopardy.query.nearVector({
  // highlight-start
  'jeopardy_questions_vector': v1,
  'jeopardy_answers_vector': v2
  // highlight-end
}, {
  limit: 2,
  // highlight-start
  targetVector: ['jeopardy_questions_vector', 'jeopardy_answers_vector'],
  // highlight-end
  returnMetadata: ['distance'],
});

result.objects.forEach((item) => {
  console.log(JSON.stringify(item.properties, null, 2));
  console.log(JSON.stringify(item.metadata?.distance, null, 2));
});
// END MultiTargetNearVector

// ========================
// ===== Simple join strategy =====
// ========================

// START MultiTargetWithSimpleJoin
jeopardy = client.collections.use('JeopardyTiny');

result = await jeopardy.query.nearText('a wild animal', {
  limit: 2,
  // highlight-start
  targetVector: jeopardy.multiTargetVector.average(['jeopardy_questions_vector', 'jeopardy_answers_vector']),
  // highlight-end
  returnMetadata: ['distance'],
});

result.objects.forEach((item) => {
  console.log(JSON.stringify(item.properties, null, 2));
  console.log(JSON.stringify(item.metadata?.distance, null, 2));
});
// END MultiTargetWithSimpleJoin

// ========================
// ===== Set Manual Weights =====
// ========================

// START MultiTargetManualWeights
jeopardy = client.collections.use('JeopardyTiny');

result = await jeopardy.query.nearText('a wild animal', {
  limit: 2,
  // highlight-start
  targetVector: jeopardy.multiTargetVector.manualWeights({
    jeopardy_questions_vector: 10,
    jeopardy_answers_vector: 50,
  }),
  // highlight-end
  returnMetadata: ['distance'],
});

result.objects.forEach((item) => {
  console.log(JSON.stringify(item.properties, null, 2));
  console.log(JSON.stringify(item.metadata?.distance, null, 2));
});
// END MultiTargetManualWeights

// ========================
// ===== Relative Score =====
// ========================

// START MultiTargetRelativeScore
jeopardy = client.collections.use('JeopardyTiny');

result = await jeopardy.query.nearText('a wild animal', {
  limit: 2,
  // highlight-start
  targetVector: jeopardy.multiTargetVector.relativeScore({
    jeopardy_questions_vector: 10,
    jeopardy_answers_vector: 10,
  }),
  // highlight-end
  returnMetadata: ['distance'],
});

result.objects.forEach((item) => {
  console.log(JSON.stringify(item.properties, null, 2));
  console.log(JSON.stringify(item.metadata?.distance, null, 2));
});
// END MultiTargetRelativeScore


// START MultiTargetMultipleNearVectorsV1
jeopardy = client.collections.use('JeopardyTiny');

result = await jeopardy.query.nearVector({
  // highlight-start
  // Specify the query vectors for each target vector. where v1, v2.. are vectors
  'jeopardy_questions_vector': v1,
  'jeopardy_answers_vector': [v2, v3]
  // highlight-end
}, {
  limit: 2,
  // Specify the target vectors as a list
  targetVector: ['jeopardy_questions_vector', 'jeopardy_answers_vector'],
  returnMetadata: ['distance'],
});

result.objects.forEach((item) => {
  console.log(JSON.stringify(item.properties, null, 2));
  console.log(JSON.stringify(item.metadata?.distance, null, 2));
});
// END MultiTargetMultipleNearVectorsV1

// START MultiTargetMultipleNearVectorsV2
jeopardy = client.collections.use('JeopardyTiny');

result = await jeopardy.query.nearVector({
  // highlight-start
  'jeopardy_questions_vector': v1,
  'jeopardy_answers_vector': [v2, v3]
}, {
  limit: 2,
  // Specify the target vectors as a list
  targetVector: jeopardy.multiTargetVector.manualWeights({
    "jeopardy_questions_vector": 10,
    "jeopardy_answers_vector": [30, 30], // Matches the order of the vectors above
  }),
  // highlight-end
  returnMetadata: ['distance'],
});

result.objects.forEach((item) => {
  console.log(JSON.stringify(item.properties, null, 2));
  console.log(JSON.stringify(item.metadata?.distance, null, 2));
});
// END MultiTargetMultipleNearVectorsV2


client.close();
