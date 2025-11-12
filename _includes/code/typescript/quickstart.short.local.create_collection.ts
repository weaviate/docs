// START CreateCollection
import weaviate, { WeaviateClient, vectors } from 'weaviate-client';

// Step 1.1: Connect to your local Weaviate instance
const client: WeaviateClient = await weaviate.connectToLocal();

// END CreateCollection

// NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
await client.collections.delete('Movie');

// START CreateCollection
// Step 1.2: Create a collection
// highlight-start
const movies = await client.collections.create({
  name: 'Movie',
  vectorizers: vectors.text2VecOllama({  // Configure the Ollama embedding integration
    apiEndpoint: 'http://ollama:11434',  // If using Docker you might need: http://host.docker.internal:11434
    model: 'nomic-embed-text',           // The model to use
  }),
});
// highlight-end

// END CreateCollection

// START CreateCollection
// Step 1.3: Import three objects
const dataObjects = [
  { title: 'The Matrix', description: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.', genre: 'Science Fiction' },
  { title: 'Spirited Away', description: 'A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.', genre: 'Animation' },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', description: 'A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.', genre: 'Fantasy' },
];

// END CreateCollection

// START CreateCollection
const movieCollection = client.collections.get('Movie');
const response = await movieCollection.data.insertMany(dataObjects);

console.log(`Imported & vectorized ${dataObjects.length} objects into the Movie collection`);

await client.close(); // Free up resources
// END CreateCollection
