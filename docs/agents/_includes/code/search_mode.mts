import 'dotenv/config'
const { loadClientInternally, populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/agents/_includes/code/util.mjs'));
// START BasicSearchMode
import weaviate from 'weaviate-client';
import { QueryAgent } from 'weaviate-agents';

// END BasicSearchMode

// START ImportSearchResponse
import { SearchModeResponse } from 'weaviate-agents';
// END ImportSearchResponse

// START BasicSearchMode
const client = await weaviate.connectToWeaviateCloud(
    process.env.WEAVIATE_URL as string, {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY as string),
});

// Instantiate a new query agent object
let qa = new QueryAgent(client, {
    collections: ['ECommerce', 'FinancialContracts', 'Weather'],
});
// END BasicSearchMode

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

await populateWeaviate(client);

// START BasicSearchMode
const searchResponse = await qa.search("Find me some vintage shoes under $70", {
    limit: 10,
});

// Access the matching Weaviate objects
for (const obj of searchResponse.searchResults.objects) {
    console.log(`Product: ${obj.properties['name']} - $${obj.properties['price']}`);
}
// END BasicSearchMode

// START DiversityRanking
const diversitySearchResponse = await qa.search("summer shoes", {
    limit: 10,
    diversityWeight: 0.5,
});

for (const obj of diversitySearchResponse.searchResults.objects) {
    console.log(`Product: ${obj.properties['name']} - $${obj.properties['price']}`);
}
// END DiversityRanking

// START SearchPagination
// Search with pagination
const responsePage1 = await qa.search(
    "Find summer shoes and accessories between $50 and $100 that have the tag 'sale'", {
    limit: 3,
});

// Get the next page of results
const responsePage2 = await responsePage1.next({ limit: 3, offset: 3 });

// Continue paginating
const responsePage3 = await responsePage2.next({ limit: 3, offset: 6 });

const pages = [responsePage1, responsePage2, responsePage3];

pages.forEach((pageResponse, index) => {
    const pageNum = index + 1;
    console.log(`Page ${pageNum}:`);

    pageResponse.searchResults.objects.forEach(obj => {
        // Safely access properties in case they don't exist
        const name = obj.properties.name || "Unknown Product";
        const price = obj.properties.price || "Unknown Price";
        console.log(`  ${name} - $${price}`);
    });
});
// END SearchPagination

await client.close();
