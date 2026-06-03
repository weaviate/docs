import 'dotenv/config'
const { populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/agents/_includes/code/util.mjs'));
// START WeaviateSetup
import weaviate from 'weaviate-client';
import { QueryAgent } from 'weaviate-agents';

const headers = {
    // END WeaviateSetup
    'X-OpenAI-API-Key': process.env.OPENAI_API_KEY as string,
    // START WeaviateSetup
    // Provide your required API key(s), e.g. Cohere, OpenAI, etc. for the configured vectorizer(s)
    'X-INFERENCE-PROVIDER-API-KEY': process.env.YOUR_INFERENCE_PROVIDER_KEY as string,
};

const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL as string, {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY as string),
    headers,
});
// END WeaviateSetup


// START InstantiateQueryAgent
const qa = new QueryAgent(client);
// END InstantiateQueryAgent


// START InstantiateWithCollections
const qaWithCollections = new QueryAgent(client, {
    collections: ['FinancialContracts', 'Weather'],
});
// END InstantiateWithCollections

await populateWeaviate(client, false);

// START InstantiateWithoutCollections
const qaWithoutCollections = new QueryAgent(client);

await qaWithoutCollections.ask(
    "What type of contracts have been signed and who were the authors?", {
    collections: ['FinancialContracts', 'Weather'],
});
// END InstantiateWithoutCollections

await client.close();
