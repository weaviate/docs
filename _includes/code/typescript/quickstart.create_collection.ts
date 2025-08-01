// CreateCollection
import weaviate, { WeaviateClient, vectors, generative } from 'weaviate-client';

// Best practice: store your credentials in environment variables
const weaviateUrl = process.env.WEAVIATE_URL as string;
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateUrl, // Replace with your Weaviate Cloud URL
  {
    authCredentials: new weaviate.ApiKey(weaviateApiKey), // Replace with your Weaviate Cloud API key
  }
);

// END CreateCollection
// Delete this collection if it already exists
await client.collections.delete('Question');

// CreateCollection
// highlight-start
await client.collections.create({
  name: 'Question',
  vectorizers: vectors.text2VecWeaviate(),
  generative: generative.cohere(),
});
// highlight-end

client.close(); // Close the client connection
// END CreateCollection
