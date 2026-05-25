// Tutorial: Tokenization -> Custom and per-property stopwords (TypeScript)
import assert from 'assert';

// CustomStopwordsCreate
import weaviate from 'weaviate-client';

// Instantiate your client (not shown). e.g.:
// const client = await weaviate.connectToWeaviateCloud(...) or
// const client = await weaviate.connectToLocal();
// END CustomStopwordsCreate

const client = await weaviate.connectToLocal();

await client.collections.delete('StopwordsDemo').catch(() => {});

// CustomStopwordsCreate
await client.collections.create({
  name: 'StopwordsDemo',
  invertedIndex: {
    stopwordPresets: {
      fr: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et'],
    },
  },
  properties: [
    {
      name: 'name_en',
      dataType: 'text' as const,
      tokenization: 'word' as const,
      textAnalyzer: { stopwordPreset: 'en' },
    },
    {
      name: 'name_fr',
      dataType: 'text' as const,
      tokenization: 'word' as const,
      textAnalyzer: { stopwordPreset: 'fr' },
    },
  ],
  vectorizers: weaviate.configure.vectors.selfProvided(),
});
// END CustomStopwordsCreate

// CustomStopwordsAddObjects
const products = client.collections.use('StopwordsDemo');

await products.data.insertMany([
  {
    name_en: 'The Blue Cup and the Bowl',
    name_fr: 'La Tasse Bleue et le Bol',
  },
  {
    name_en: 'A Red Plate with the Saucer',
    name_fr: 'Une Assiette Rouge avec la Soucoupe',
  },
]);
// END CustomStopwordsAddObjects

// CustomStopwordsSearch
// Search the French property — "la" and "et" are French stopwords
let response = await products.query.bm25('la tasse bleue et le bol', {
  queryProperties: ['name_fr'],
  returnMetadata: ['score'],
});

console.log('French property search:');
for (const o of response.objects) {
  console.log(`  ${o.properties.name_fr} (score: ${o.metadata?.score})`);
}

// Same words on the English property — "la", "et", "le" are NOT English stopwords
response = await products.query.bm25('la tasse bleue et le bol', {
  queryProperties: ['name_en'],
  returnMetadata: ['score'],
});

console.log('\nEnglish property search:');
for (const o of response.objects) {
  console.log(`  ${o.properties.name_en} (score: ${o.metadata?.score})`);
}
// END CustomStopwordsSearch

// Test: French search finds the matching document
const frResponse = await products.query.bm25('la tasse bleue et le bol', {
  queryProperties: ['name_fr'],
  returnMetadata: ['score'],
});
assert.equal(frResponse.objects.length, 1);
assert.equal(frResponse.objects[0].properties.name_fr, 'La Tasse Bleue et le Bol');
assert.ok((frResponse.objects[0].metadata?.score ?? 0) > 0);

// Test: English search returns no results (French words aren't in English data)
const enResponse = await products.query.bm25('la tasse bleue et le bol', {
  queryProperties: ['name_en'],
});
assert.equal(enResponse.objects.length, 0);

// Test: Searching French property for English content returns no results
const enOnFr = await products.query.bm25('blue cup bowl', {
  queryProperties: ['name_fr'],
});
assert.equal(enOnFr.objects.length, 0);

// Test: "la" alone shouldn't score on French property — it's a stopword
const laResponse = await products.query.bm25('la', {
  queryProperties: ['name_fr'],
});
assert.equal(laResponse.objects.length, 0);

await client.collections.delete('StopwordsDemo');
await client.close();

// CustomStopwordsResults
/*
French property search:
  La Tasse Bleue et le Bol (score: 0.95)

English property search:
  (no results — "tasse", "bleue", "bol" are not in the English data)
*/
// END CustomStopwordsResults
