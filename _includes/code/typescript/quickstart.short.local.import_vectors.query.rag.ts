// START RAG
import weaviate, { WeaviateClient, generativeParameters } from 'weaviate-client';

// Step 2.1: Connect to your local Weaviate instance
const client: WeaviateClient = await weaviate.connectToLocal();

// Step 2.2: Use this collection
const movies = client.collections.get('Movie');

// Step 2.3: Perform RAG with on NearVector results
// highlight-start
const response = await movies.generate.nearVector(
  [0.11, 0.21, 0.31, 0.41, 0.51, 0.61, 0.71, 0.81],
  {
    groupedTask: 'Write a tweet with emojis about this movie.',
    config: generativeParameters.ollama({
      apiEndpoint: 'http://ollama:11434',  // If using Docker you might need: http://host.docker.internal:11434
      model: 'llama3.2',                   // The model to use
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