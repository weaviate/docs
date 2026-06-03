import 'dotenv/config'
const { loadClientInternally, populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/query-agent/_includes/code/util.mjs'));
import weaviate from 'weaviate-client';

const client = await loadClientInternally();
await populateWeaviate(client, false);

// START FirstExample
import { QueryAgent } from 'weaviate-agents';

const qa = new QueryAgent(
    client, // your Weaviate cloud client
    {
        collections: ['FinancialContracts'],
    }
);

const res = await qa.ask("Find all contracts signed in 2025");

res.display();
// END FirstExample

await client.close();