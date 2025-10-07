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
      apiEndpoint: 'http://host.docker.internal:11434',   // Allow Weaviate from within a Docker container to contact your Ollama instance
      model: 'llama3.2',                                  // The model to use
    }),
  },
  {
    limit: 2,
  }
);
// highlight-end

console.log(result.generated);

client.close(); // Close the client connection
// END RAG
