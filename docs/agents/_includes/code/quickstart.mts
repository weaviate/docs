import 'dotenv/config'
const { populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/agents/_includes/code/util.mjs'));
// START InstantiateQueryAgent
import weaviate from 'weaviate-client';
import { QueryAgent } from 'weaviate-agents';

// END InstantiateQueryAgent

// START InstantiateQueryAgent
const headers = {
    // END InstantiateQueryAgent
    'X-OpenAI-API-Key': process.env.OPENAI_API_KEY as string,
    // START InstantiateQueryAgent
    // Provide your required API key(s), e.g. Cohere, OpenAI, etc. for the configured vectorizer(s)
    'X-INFERENCE-PROVIDER-API-KEY': process.env.YOUR_INFERENCE_PROVIDER_KEY as string,
};

const client = await weaviate.connectToWeaviateCloud(
    process.env.WEAVIATE_URL as string,
    {
        authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY as string),
        headers,
    }
);
// END InstantiateQueryAgent

// Populate Weaviate with data
await populateWeaviate(client, true);

// START InstantiateQueryAgent

// Instantiate a new query agent object
let qa = new QueryAgent(client, {
    collections: ['ECommerce', 'FinancialContracts', 'Weather'],
});
// END InstantiateQueryAgent

qa = new QueryAgent(client, {
    collections: [
        {
            name: 'ECommerce',
            targetVector: [
                'name_description_brand_vector'
            ],
        },
        'FinancialContracts',
        'Weather',
    ],
});

// START BasicSearchQuery
const searchResponse = await qa.search(
    "Find me some vintage shoes under $70", {
    limit: 10,
});
// END BasicSearchQuery

// START BasicSearchResponse
for (const obj of searchResponse.searchResults.objects) {
    console.log(`Product: ${obj.properties['name']} - $${obj.properties['price']}`);
}
// END BasicSearchResponse

// START BasicAskQuery
const askResponse = await qa.ask(
    "I like vintage clothes and nice shoes. Recommend some of each below $60."
);
// END BasicAskQuery

// START BasicAskResponse
askResponse.sources; // retrieved objects from initial search
askResponse.finalAnswer; // final answer to the question
askResponse.display();
// END BasicAskResponse

await client.close();
