// llms.txt snippet: object CRUD. Section "Python / TypeScript > CRUD".
import weaviate, { vectors } from 'weaviate-client';

const client = await weaviate.connectToLocal();
await client.collections.delete('Movie');
await client.collections.create({
  name: 'Movie',
  vectorizers: vectors.text2VecOllama({ apiEndpoint: 'http://ollama:11434', model: 'nomic-embed-text' }),
});

// START llms_crud
const movies = client.collections.use('Movie');

// Create — insert one object, returns its UUID
const uuid = await movies.data.insert({ title: 'Inception', genre: 'Science Fiction' });

// Read — fetch the object by its UUID
const obj = await movies.query.fetchObjectById(uuid);
console.log(obj?.properties);

// Update — merge new property values into the object
await movies.data.update({ id: uuid, properties: { genre: 'Sci-Fi Thriller' } });

// Delete — remove the object by its UUID
await movies.data.deleteById(uuid);
// END llms_crud

if (await movies.query.fetchObjectById(uuid)) throw new Error('object not deleted');
await client.collections.delete('Movie');
await client.close();
