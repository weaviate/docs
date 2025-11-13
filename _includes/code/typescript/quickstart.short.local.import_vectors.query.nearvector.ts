// START NearText
import weaviate, { WeaviateClient } from 'weaviate-client';

// Step 2.1: Connect to your local Weaviate instance
const client: WeaviateClient = await weaviate.connectToLocal();

// Step 2.2: Use this collection
const movies = client.collections.get('Movie');

// Step 2.3: Perform a vector search with NearVector
// highlight-start
const response = await movies.query.nearVector(
  [0.11, 0.21, 0.31, 0.41, 0.51, 0.61, 0.71, 0.81],
  {
    limit: 2,
  }
);
// highlight-end

for (const obj of response.objects) {
  console.log(JSON.stringify(obj.properties, null, 2)); // Inspect the results
}

await client.close(); // Free up resources
// END NearText
