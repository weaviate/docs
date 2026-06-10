// Tutorial: Tokenization -> Tokenize endpoint - TypeScript examples
import assert from 'assert';

// TokenizeEndpointFreeform
import weaviate from 'weaviate-client';

const client = await weaviate.connectToLocal();

// Ad-hoc tokenization with custom config
let result = await client.tokenize.text('The organic café crème blend', 'word', {
  analyzerConfig: {
    asciiFold: true,
    stopwordPreset: 'en',
  },
});

console.log(`indexed: ${JSON.stringify(result.indexed)}`);
console.log(`query:   ${JSON.stringify(result.query)}`);
// END TokenizeEndpointFreeform

// Test: accent folding converts café->cafe, crème->creme
assert.ok(result.indexed.includes('cafe'), `Expected 'cafe' in indexed: ${result.indexed}`);
assert.ok(result.indexed.includes('creme'), `Expected 'creme' in indexed: ${result.indexed}`);
// Test: stopword "the" is in indexed but not in query
assert.ok(result.indexed.includes('the'), `Expected 'the' in indexed: ${result.indexed}`);
assert.ok(!result.query.includes('the'), `Expected 'the' removed from query: ${result.query}`);
// Test: non-stopwords are in both
assert.ok(result.indexed.includes('organic') && result.query.includes('organic'));

// TokenizeEndpointFreeformResult
/*
indexed: ['the', 'organic', 'cafe', 'creme', 'blend']
query:   ['organic', 'cafe', 'creme', 'blend']
*/
// END TokenizeEndpointFreeformResult

// TokenizeEndpointCustomPreset
// Define a named "fr" preset and reference it from analyzerConfig.
// stopwordPresets is mutually exclusive with stopwords - pass at most one.
result = await client.tokenize.text('La Tasse Bleue et le Bol', 'word', {
  analyzerConfig: { stopwordPreset: 'fr' },
  stopwordPresets: {
    fr: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et'],
  },
});

console.log(`indexed: ${JSON.stringify(result.indexed)}`);
console.log(`query:   ${JSON.stringify(result.query)}`);
// END TokenizeEndpointCustomPreset

// Test: French stopwords are indexed but removed from query
assert.ok(result.indexed.includes('la') && result.indexed.includes('et') && result.indexed.includes('le'));
assert.ok(!result.query.includes('la') && !result.query.includes('et') && !result.query.includes('le'));
assert.ok(result.query.includes('tasse') && result.query.includes('bleue') && result.query.includes('bol'));

// TokenizeEndpointCustomPresetResult
/*
indexed: ['la', 'tasse', 'bleue', 'et', 'le', 'bol']
query:   ['tasse', 'bleue', 'bol']
*/
// END TokenizeEndpointCustomPresetResult

// Setup: create a collection that defines a custom French stopword preset
// and references it from the property's textAnalyzer.
await client.collections.delete('TokenizeDemo');
await client.collections.create({
  name: 'TokenizeDemo',
  invertedIndex: {
    stopwordPresets: {
      fr: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et'],
    },
  },
  properties: [
    {
      name: 'name_fr',
      dataType: 'text' as const,
      tokenization: 'word' as const,
      textAnalyzer: { stopwordPreset: 'fr' },
    },
  ],
  vectorizers: weaviate.configure.vectors.selfProvided(),
});

// TokenizeEndpointProperty
// Tokenize using an existing property's configuration
const propResult = await client.tokenize.forProperty('TokenizeDemo', 'name_fr', 'La Tasse Bleue et le Bol');

console.log(`indexed: ${JSON.stringify(propResult.indexed)}`);
console.log(`query:   ${JSON.stringify(propResult.query)}`);
// END TokenizeEndpointProperty

// Test: all 6 words are indexed (stopwords are still stored)
assert.ok(propResult.indexed.includes('la') && propResult.indexed.includes('et') && propResult.indexed.includes('le'));
assert.ok(propResult.indexed.includes('tasse') && propResult.indexed.includes('bleue') && propResult.indexed.includes('bol'));
assert.equal(propResult.indexed.length, 6);
// Test: French stopwords are removed from query tokens
assert.ok(!propResult.query.includes('la') && !propResult.query.includes('et') && !propResult.query.includes('le'));
assert.ok(propResult.query.includes('tasse') && propResult.query.includes('bleue') && propResult.query.includes('bol'));
assert.equal(propResult.query.length, 3);

await client.collections.delete('TokenizeDemo');
await client.close();

// TokenizeEndpointPropertyResult
/*
indexed: ['la', 'tasse', 'bleue', 'et', 'le', 'bol']
query:   ['tasse', 'bleue', 'bol']
*/
// END TokenizeEndpointPropertyResult
