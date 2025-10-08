// RAG
import weaviate, { WeaviateClient, generativeParameters } from 'weaviate-client';

// Best practice: store your credentials in environment variables
const weaviateUrl = process.env.WEAVIATE_URL as string;
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;
const openAiKey = process.env.OPENAI_API_KEY as string;

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateUrl, // Replace with your Weaviate Cloud URL
  {
    authCredentials: new weaviate.ApiKey(weaviateApiKey), // Replace with your Weaviate Cloud API key
    // highlight-start
    headers: {
      'X-OpenAI-Api-Key': openAiKey, // Replace with your OpenAI API key
    },
    // highlight-end
  }
);

// highlight-start
const questions = client.collections.use('Question');

const result = await questions.generate.nearText(
  'biology',
  {
    groupedTask: 'Write a tweet with emojis about these facts.',
    config: generativeParameters.openAI(),
  },
  {
    limit: 2,
  }
);
// highlight-end

console.log(result.generative);

client.close(); // Close the client connection
// END RAG
