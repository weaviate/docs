import 'dotenv/config'
const { populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/agents/_includes/code/util.mjs'));

// START SuggestQueries
import weaviate from 'weaviate-client';
import { QueryAgent } from 'weaviate-agents';

// END SuggestQueries

// START SuggestQueries
const client = await weaviate.connectToWeaviateCloud(
    process.env.WEAVIATE_URL as string, {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY as string),
});

let qa = new QueryAgent(client);

// END SuggestQueries

await populateWeaviate(client, false);

// START SuggestQueries
const response = await qa.suggestQueries({
    collections: ['FinancialContracts'],
    numQueries: 3,
    instructions: 'High-level themes and open-ended exploration',
});
// END SuggestQueries

// START IndividualCall
qa = new QueryAgent(client, {
    collections: ['FinancialContracts'],
});

await qa.suggestQueries();
// END IndividualCall

// START AccessResponse
for (const suggestedQuery of response.queries) {
    console.log(suggestedQuery.query);
}
// END AccessResponse

await client.close();
