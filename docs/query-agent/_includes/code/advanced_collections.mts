const { loadClientInternally, populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/query-agent/_includes/code/util.mjs'));
const client = await loadClientInternally();
await populateWeaviate(client, false);

// START SimpleConfig
import { QueryAgent } from 'weaviate-agents';

const qaSimple = new QueryAgent(client, {
    collections: ['ECommerce', 'FinancialContracts'],
});
// END SimpleConfig

// START AdvancedConfig
const qa = new QueryAgent(client, {
    collections: [
        // Provide an object to specify further collection configuration
        {
            name: 'ECommerce',
            targetVector: [
                'name_description_brand_vector'
            ],
            viewProperties: [
                'name',
                'description',
                'category',
                'brand',
            ],
        },
        {
            name: 'FinancialContracts'
        },
    ],
});
// END AdvancedConfig

// START RuntimeConfigAsk
const response = await qa.ask(
    "Recommend some shoes below $60.", {
    collections: [
        {
            name: 'ECommerce',
            targetVector: [
                'name_description_brand_vector'
            ],
        }
    ],
});
// END RuntimeConfigAsk

await client.close()
