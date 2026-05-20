// llms.txt snippet: generative search (DIY RAG). Section "Python / TypeScript > Generative search".
import weaviate, { vectors, configure } from 'weaviate-client';

// Local Ollama generation is CPU-bound, so allow a generous query timeout
const client = await weaviate.connectToLocal({ timeout: { query: 180, insert: 180 } });
await client.collections.delete('Movie');

// START llms_generative_config
await client.collections.create({
  name: 'Movie',
  vectorizers: vectors.text2VecOllama({ apiEndpoint: 'http://ollama:11434', model: 'nomic-embed-text' }),
  generative: configure.generative.ollama({ apiEndpoint: 'http://ollama:11434', model: 'llama3.2' }),
});
// END llms_generative_config

const movies = client.collections.use('Movie');
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
await client.collections.delete('Movie');
await client.close();
