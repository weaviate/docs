// llms.txt snippet: queries (nearText, bm25). Section "Python / TypeScript > Queries".
import weaviate, { vectors } from 'weaviate-client';

const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL!, {
  authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
});
await client.collections.delete('Movie__QueriesTs');
await client.collections.create({
  name: 'Movie__QueriesTs',
  vectorizers: vectors.text2VecWeaviate(),
});
const col = client.collections.use('Movie__QueriesTs');
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
await client.collections.delete('Movie__QueriesTs');
await client.close();
