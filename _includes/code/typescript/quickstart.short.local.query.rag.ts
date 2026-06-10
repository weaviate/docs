// START RAG
import weaviate, { WeaviateClient, generativeParameters } from 'weaviate-client';

// Step 2.1: Connect to your local Weaviate instance
const client: WeaviateClient = await weaviate.connectToLocal();

// Step 2.2: Use this collection
const movies = client.collections.get('Movie');

// Step 2.3: Perform RAG with on NearText results
// highlight-start
const response = await movies.generate.nearText(
  'sci-fi',
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
