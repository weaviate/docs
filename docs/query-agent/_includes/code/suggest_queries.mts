import 'dotenv/config'
const { populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/query-agent/_includes/code/util.mjs'));

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

// START SuggestQueriesWithConversation
import { ChatMessage } from 'weaviate-agents';

// Build a conversation history
const suggestConversation: ChatMessage[] = [
    {
        role: 'user',
        content: 'What are some popular machine learning frameworks?',
    },
    {
        role: 'assistant',
        content: 'Some popular ML frameworks include TensorFlow, PyTorch, and JAX.',
    },
];

// Suggest follow-up queries based on the conversation context
const suggestWithConvoResponse = await qa.suggestQueries({
    conversation: suggestConversation,
    numQueries: 3,
});

for (const suggestedQuery of suggestWithConvoResponse.queries) {
    console.log(suggestedQuery.query);
}
// END SuggestQueriesWithConversation

await client.close();
