// START RAG
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

// Step 2.3: Perform RAG with on NearVector results
// highlight-start
const response = await movies.generate.nearVector(
  [0.11, 0.21, 0.31, 0.41, 0.51, 0.61, 0.71, 0.81],
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