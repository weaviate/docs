import 'dotenv/config'
import weaviate from 'weaviate-client';
const { loadClientInternally, populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/query-agent/_includes/code/util.mjs'));
const client = await loadClientInternally();
await populateWeaviate(client, false);

const weatherCollection = client.collections.use('Weather');
const financialCollection = client.collections.use('FinancialContracts');
const ecommerceCollection = client.collections.use('ECommerce');

// START OverviewInInit
import { QueryAgent } from 'weaviate-agents';

const qa = new QueryAgent(client, {
    collections: [
        {
            name: 'Weather',
            additionalFilters: weatherCollection.filter.byProperty('temperature').greaterThan(10),
        },
    ],
});
// END OverviewInInit

// START OverviewInRuntime
const runtimeConfig = {
    name: 'Weather',
    additionalFilters: weatherCollection.filter.byProperty('humidity').equal(39),
};

const response = await qa.ask("Provide a summary of the weather patterns", {
    collections: [runtimeConfig],
});
// END OverviewInRuntime

// START FilterExampleBad
const badResponse = await qa.ask(
    `What type of contracts have been signed and who were the authors? 
    IMPORTANT: Only look at contracts from 2025.`,
    {
        collections: ['FinancialContracts'],
    }
);
// END FilterExampleBad


// START FilterExampleGood
import { Filters } from 'weaviate-client';
const goodResponse = await qa.ask(
    `What products were sold last month?`,
    {
        collections: [
            {
                name: 'FinancialContracts',
                additionalFilters: Filters.and(
                    financialCollection.filter.byProperty('date').greaterThan(new Date(2025, 0, 1)),
                    financialCollection.filter.byProperty('date').lessThan(new Date(2026, 0, 1)),
                ),
            },
        ],
    }
);
// END FilterExampleGood

// START BasicFilter
const basicFilterConfig = {
    name: 'ECommerce',
    additionalFilters: ecommerceCollection.filter.byProperty('category').equal('Tops'),
};
// END BasicFilter


// START NestedFilter
const nestedFilterConfig = {
    name: 'ECommerce',
    additionalFilters: Filters.or(
        ecommerceCollection.filter.byProperty('category').equal('Shoes'),
        Filters.and(
            ecommerceCollection.filter.byProperty('price').greaterThan(50),
            ecommerceCollection.filter.byProperty('price').lessThan(100),
        ),
    ),
};
// END NestedFilter

await client.close();
