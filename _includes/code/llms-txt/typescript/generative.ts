// llms.txt snippet: generative search. Section "Python / TypeScript > Generative search".
import weaviate, { vectors, configure } from 'weaviate-client';

const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL!, {
  authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
  headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY! },
});
await client.collections.delete('Movie__GenTs');

// START llms_generative_config
import { vectors, configure } from 'weaviate-client';

await client.collections.create({
  name: 'Movie__GenTs',
  vectorizers: vectors.text2VecWeaviate(),
  generative: configure.generative.openAI(),
});
// END llms_generative_config

const movies = client.collections.use('Movie__GenTs');
await movies.data.insertMany([
  { title: 'The Matrix', genre: 'Science Fiction' },
  { title: 'Blade Runner', genre: 'Science Fiction' },
]);
await new Promise((r) => setTimeout(r, 3000)); // wait for vectorization/indexing

// START llms_generative_query
// A single prompt applied per retrieved object
const singleRes = await movies.generate.nearText(
  'science fiction',
  { singlePrompt: 'Write a one-line tagline for {title}' },
  { limit: 2 },
);
for (const obj of singleRes.objects) console.log(obj.generative?.text);

// One grouped prompt applied across all retrieved objects
const groupedRes = await movies.generate.nearText(
  'science fiction',
  { groupedTask: 'In one sentence, what common theme do these movies share?' },
  { limit: 2 },
);
console.log(groupedRes.generative?.text);
// END llms_generative_query

if (!groupedRes.generative?.text) throw new Error('no grouped generation');
await client.collections.delete('Movie__GenTs');
await client.close();
