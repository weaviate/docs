// llms.txt snippet: Query Agent (Cloud only). Section "Python / TypeScript > Query Agent".
import weaviate, { vectors } from 'weaviate-client';

const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL!, {
  authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
});

// Seed the collections the Query Agent reads from
for (const name of ['Movies', 'Reviews']) {
  await client.collections.delete(name);
  await client.collections.create({ name, vectorizers: vectors.text2VecWeaviate() });
}
await client.collections.use('Movies').data.insertMany([
  { title: 'The Matrix', price: 12 },
  { title: 'Blade Runner', price: 9 },
]);
await client.collections.use('Reviews').data.insertMany([
  { text: 'The Matrix is a great sci-fi film, five stars' },
]);

// START llms_query_agent
import { QueryAgent } from 'weaviate-agents';

const qa = new QueryAgent(client, { collections: ['Movies', 'Reviews'] });
const response = await qa.ask('Recommend sci-fi movies with good reviews under $15');
console.log(response.finalAnswer);
// END llms_query_agent

if (!response.finalAnswer) throw new Error('no final answer');
await client.collections.delete('Movies');
await client.collections.delete('Reviews');
await client.close();
