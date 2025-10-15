// RAG
import weaviate, { WeaviateClient, generativeParameters } from 'weaviate-client';

const client: WeaviateClient = await weaviate.connectToLocal();

// highlight-start
const questions = client.collections.use('Question');

const result = await questions.generate.nearText(
  'biology',
  {
    groupedTask: 'Write a tweet with emojis about these facts.',
    config: generativeParameters.ollama({
      apiEndpoint: 'http://ollama:11434',  // If using Docker you might need: http://host.docker.internal:11434
      model: 'llama3.2',                   // The model to use
    }),
  },
  {
    limit: 2,
  }
);
// highlight-end

console.log(result.generative);

client.close(); // Close the client connection
// END RAG
