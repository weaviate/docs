// RAG
import weaviate, { WeaviateClient, ApiKey, generativeParameters } from 'weaviate-client';

// Best practice: store your credentials in environment variables
const weaviateUrl = process.env.WEAVIATE_URL!;
const weaviateApiKey = process.env.WEAVIATE_API_KEY!;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

// Step 2.1: Connect to your Weaviate Cloud instance
const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateUrl,
  {
    authCredentials: new ApiKey(weaviateApiKey),
    // highlight-start
    headers: { 'X-Anthropic-Api-Key': anthropicApiKey },
    // highlight-end
  }
);

// Step 2.2: Use this collection
const movies = client.collections.get('Movie');

// Step 2.3: Perform RAG with on NearText results
// highlight-start
const response = await movies.generate.nearText(
  'sci-fi',
  {
    groupedTask: 'Write a tweet with emojis about this movie.',
    config: generativeParameters.anthropic({
      model: "claude-3-5-haiku-latest",
    }),
  },
  {
    limit: 1,
  }
);
// highlight-end

console.log(response.generative); // Inspect the results

await client.close(); // Free up resources
// END RAG
