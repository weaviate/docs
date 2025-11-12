// START NearText
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

// Step 2.3: Perform a vector search with NearVector
// highlight-start
// END NearText

// START NearText
const response = await movies.query.nearVector(
  [0.11, 0.21, 0.31, 0.41, 0.51, 0.61, 0.71, 0.81],
  {
    limit: 2,
  }
);
// END NearText

// START NearText
// highlight-end

for (const obj of response.objects) {
  console.log(JSON.stringify(obj.properties, null, 2)); // Inspect the results
}

await client.close(); // Free up resources
// END NearText
