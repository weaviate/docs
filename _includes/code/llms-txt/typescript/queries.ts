// llms.txt snippet: queries (nearText, bm25). Section "Python / TypeScript > Queries".
import weaviate, { vectors } from 'weaviate-client';

const client = await weaviate.connectToLocal();
await client.collections.delete('Movie');
await client.collections.create({
  name: 'Movie',
  vectorizers: vectors.text2VecOllama({ apiEndpoint: 'http://ollama:11434', model: 'nomic-embed-text' }),
});
const col = client.collections.use('Movie');
await col.data.insertMany([
  { title: 'The animals of the savannah' },
  { title: 'A bowl of ramen and other street food' },
]);

// START llms_queries
// Vector search
const vectorRes = await col.query.nearText('animals in movies', { limit: 3, returnMetadata: ['distance'] });
// Keyword search
const keywordRes = await col.query.bm25('food', { limit: 3, returnMetadata: ['score'] });
// END llms_queries

if (keywordRes.objects.length < 1) throw new Error('no bm25 results');
await client.collections.delete('Movie');
await client.close();
