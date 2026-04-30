// Tutorial: Tokenization -> Accent folding (TypeScript)
import assert from 'assert';

// AccentFoldingCreateCollection
import weaviate from 'weaviate-client';

// Instantiate your client (not shown). e.g.:
// const client = await weaviate.connectToWeaviateCloud(...) or
// const client = await weaviate.connectToLocal();
// END AccentFoldingCreateCollection

const client = await weaviate.connectToLocal();

await client.collections.delete('AccentFoldingDemo').catch(() => {});

// AccentFoldingCreateCollection
await client.collections.create({
  name: 'AccentFoldingDemo',
  properties: [
    {
      name: 'text_default',
      dataType: 'text' as const,
      tokenization: 'word' as const,
    },
    {
      name: 'text_folded',
      dataType: 'text' as const,
      tokenization: 'word' as const,
      textAnalyzer: { asciiFold: true },
    },
    {
      name: 'text_folded_keep_e',
      dataType: 'text' as const,
      tokenization: 'word' as const,
      textAnalyzer: { asciiFold: { ignore: ['é'] } },
    },
  ],
  vectorizers: weaviate.configure.vectors.selfProvided(),
});
// END AccentFoldingCreateCollection

// AccentFoldingAddObjects
const products = client.collections.use('AccentFoldingDemo');

const testStrings = ['Café Crème Bio', 'Łódź Ceramics', 'São Paulo Sandals', 'Müller Bräu'];

for (const text of testStrings) {
  await products.data.insert({
    text_default: text,
    text_folded: text,
    text_folded_keep_e: text,
  });
}
// END AccentFoldingAddObjects

// AccentFoldingFilter
import { Filters } from 'weaviate-client';

const queries = ['cafe', 'Café', 'lodz', 'sao paulo', 'muller'];
const properties = ['text_default', 'text_folded', 'text_folded_keep_e'];

for (const query of queries) {
  console.log(`\nQuery: "${query}"`);
  for (const prop of properties) {
    const response = await products.query.fetchObjects({
      filters: products.filter.byProperty(prop).equal(query),
    });
    const matches = response.objects.map((o) => o.properties[prop] as string);
    console.log(`  ${prop}: ${matches.length ? JSON.stringify(matches) : 'no match'}`);
  }
}
// END AccentFoldingFilter

// Test: "cafe" matches folded but not default or keep_e
let r = await products.query.fetchObjects({
  filters: products.filter.byProperty('text_folded').equal('cafe'),
});
assert.equal(r.objects.length, 1);
assert.equal(r.objects[0].properties.text_folded, 'Café Crème Bio');

r = await products.query.fetchObjects({
  filters: products.filter.byProperty('text_default').equal('cafe'),
});
assert.equal(r.objects.length, 0);

r = await products.query.fetchObjects({
  filters: products.filter.byProperty('text_folded_keep_e').equal('cafe'),
});
assert.equal(r.objects.length, 0); // é is preserved, so "cafe" != "café"

// Test: "Café" matches all three (exact match works everywhere)
for (const prop of properties) {
  const rr = await products.query.fetchObjects({
    filters: products.filter.byProperty(prop).equal('Café'),
  });
  assert.equal(rr.objects.length, 1, `Expected Café to match on ${prop}`);
}

// Test: "lodz" matches folded and keep_e but not default
r = await products.query.fetchObjects({
  filters: products.filter.byProperty('text_folded').equal('lodz'),
});
assert.equal(r.objects.length, 1);
assert.ok(String(r.objects[0].properties.text_folded).includes('Łódź'));

r = await products.query.fetchObjects({
  filters: products.filter.byProperty('text_default').equal('lodz'),
});
assert.equal(r.objects.length, 0);

r = await products.query.fetchObjects({
  filters: products.filter.byProperty('text_folded_keep_e').equal('lodz'),
});
assert.equal(r.objects.length, 1); // ł/ó/ź are folded, only é is preserved

// Test: "muller" matches folded but not default
r = await products.query.fetchObjects({
  filters: products.filter.byProperty('text_folded').equal('muller'),
});
assert.equal(r.objects.length, 1);
assert.ok(String(r.objects[0].properties.text_folded).includes('Müller'));

r = await products.query.fetchObjects({
  filters: products.filter.byProperty('text_default').equal('muller'),
});
assert.equal(r.objects.length, 0);

await client.collections.delete('AccentFoldingDemo');
await client.close();

// silence "unused import" for the named-export line surfaced in the snippet
void Filters;

// AccentFoldingResults
/*
Query: "cafe"
  text_default: no match
  text_folded: ["Café Crème Bio"]
  text_folded_keep_e: no match

Query: "Café"
  text_default: ["Café Crème Bio"]
  text_folded: ["Café Crème Bio"]
  text_folded_keep_e: ["Café Crème Bio"]

Query: "lodz"
  text_default: no match
  text_folded: ["Łódź Ceramics"]
  text_folded_keep_e: ["Łódź Ceramics"]

Query: "sao paulo"
  text_default: no match
  text_folded: ["São Paulo Sandals"]
  text_folded_keep_e: ["São Paulo Sandals"]

Query: "muller"
  text_default: no match
  text_folded: ["Müller Bräu"]
  text_folded_keep_e: ["Müller Bräu"]
*/
// END AccentFoldingResults
