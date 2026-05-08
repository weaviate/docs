import 'dotenv/config'
const { loadClientInternally, populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/agents/_includes/code/util.mjs'));
const client = await loadClientInternally();
await populateWeaviate(client, false);

// START InstantiateWithSystemPrompt
import { QueryAgent } from 'weaviate-agents';

// Define a custom system prompt to guide the agent's behavior
const systemPrompt = `
You are a helpful assistant that can answer questions about the products and users in the database.
When you write your response use standard markdown formatting for lists, tables, and other structures.
Emphasize key insights and provide actionable recommendations when relevant.
`;

const qa = new QueryAgent(client, {
    systemPrompt: systemPrompt,
    collections: [
        {
            name: 'ECommerce',
            targetVector: [
                'name_description_brand_vector'
            ],
        },
    ],
});
// END InstantiateWithSystemPrompt

// START AskWithSystemPrompt
const response = await qa.ask("What are the most expensive items in the store?");
// END AskWithSystemPrompt

await client.close();
