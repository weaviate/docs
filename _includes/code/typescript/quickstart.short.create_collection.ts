// START CreateCollection
import weaviate, { WeaviateClient, ApiKey, vectors } from 'weaviate-client';

// Best practice: store your credentials in environment variables
const weaviateUrl = process.env.WEAVIATE_URL!;
const weaviateApiKey = process.env.WEAVIATE_API_KEY!;

// Step 1.1: Connect to your Weaviate Cloud instance
const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateUrl,
  {
    authCredentials: new ApiKey(weaviateApiKey),
  }
);

// END CreateCollection

// NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
await client.collections.delete('Movie');

// START CreateCollection
// Step 1.2: Create a collection
// highlight-start
const movies = await client.collections.create({
  name: 'Movie',
  vectorizers: vectors.text2VecWeaviate(),
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
