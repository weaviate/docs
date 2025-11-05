// NearText
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';

// Best practice: store your credentials in environment variables
const weaviateUrl = process.env.WEAVIATE_URL!;
const weaviateApiKey = process.env.WEAVIATE_API_KEY!;

// Step 2.1: Connect to your Weaviate Cloud instance
const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateUrl,
  {
    authCredentials: new ApiKey(weaviateApiKey),
  }
);

// Step 2.2: Use this collection
const movies = client.collections.get('Movie');

// Step 2.3: Perform a semantic search with NearText
// highlight-start
// END NearText

// NearText
const response = await movies.query.nearText(
  'sci-fi',
  {
    limit: 2,
  }
);
// END NearText

// NearText
// highlight-end

for (const obj of response.objects) {
  console.log(JSON.stringify(obj.properties, null, 2)); // Inspect the results
}

await client.close(); // Free up resources
// END NearText
