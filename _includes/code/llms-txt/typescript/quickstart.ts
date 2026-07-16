// llms.txt snippet: quickstart (Weaviate Cloud). Section "Quickstart > Cloud".

// START llms_quickstart
import weaviate, { vectors } from 'weaviate-client';

const dataObjects = [
  {
    title: 'The Matrix',
    description: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
    genre: 'Science Fiction',
  },
  {
    title: 'Spirited Away',
    description: 'A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.',
    genre: 'Animation',
  },
  {
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    description: 'A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.',
    genre: 'Fantasy',
  },
];

const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL!, {
  authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
});

// Create (or reuse) a collection
if (!(await client.collections.exists('Movie__QuickstartTs'))) {
  await client.collections.create({
    name: 'Movie__QuickstartTs',
    vectorizers: vectors.text2VecWeaviate(),
  });
}

const movies = client.collections.use('Movie__QuickstartTs');

// Import objects
await movies.data.insertMany(dataObjects);

console.log(`Imported & vectorized ${dataObjects.length} objects into the Movie collection`);

// Query
const res = await movies.query.hybrid('science fiction movie about a virtual world', { limit: 1 });
console.log(res.objects[0].properties);
// END llms_quickstart

await client.collections.delete('Movie__QuickstartTs');
await client.close();
