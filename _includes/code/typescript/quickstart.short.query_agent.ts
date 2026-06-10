// START QueryAgent
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';
import { QueryAgent } from 'weaviate-agents';

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
// Instantiate a new agent object
const queryAgent = new QueryAgent(
  client, {
  collections: ['Movie'],

});

// Perform a search using Search Mode (retrieval only, no answer generation)
const basicSearchResponse = await queryAgent.search("Find a cool sci-fi movie.", {
  limit: 1
})

// Access the search results
for (const obj of basicSearchResponse.searchResults.objects) {
  console.log(`Movie: ${obj.properties['title']} - ${obj.properties['description']}`)
}

await client.close(); // Free up resources
// END QueryAgent
