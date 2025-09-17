import 'dotenv/config'

interface DatasetItem {
    properties: any;
    vector?: number[];
  }

async function populateWeaviate(client: WeaviateClient, overwriteExisting: boolean = false): Promise<void> {
    if (overwriteExisting) {
        try {
            await client.collections.delete('ECommerce');
            await client.collections.delete('Weather');
            await client.collections.delete('FinancialContracts');
        } catch (error) {
            // Collections may not exist, continue
        }
    }

    // Create ECommerce collection
    if (!(await client.collections.exists('ECommerce'))) {
        await client.collections.create({
            name: 'ECommerce',
            description: 'A dataset that lists clothing items, their brands, prices, and more.',
            vectorizers: [
                vectors.text2VecWeaviate({
                    name: 'description_vector',
                    sourceProperties: ['description'],
                    vectorIndexConfig: configure.vectorIndex.hnsw()
                }),
                vectors.text2VecWeaviate({
                    name: 'name_description_brand_vector',
                    sourceProperties: ['name', 'description', 'brand'],
                    vectorIndexConfig: configure.vectorIndex.hnsw()
                })
            ],
            properties: [
                {
                    name: 'collection',
                    dataType: dataType.TEXT
                },
                {
                    name: 'category',
                    dataType: dataType.TEXT,
                    description: 'The category to which the clothing item belongs'
                },
                {
                    name: 'tags',
                    dataType: dataType.TEXT_ARRAY,
                    description: 'The tags that are associated with the clothing item'
                },
                {
                    name: 'subcategory',
                    dataType: dataType.TEXT
                },
                {
                    name: 'name',
                    dataType: dataType.TEXT
                },
                {
                    name: 'description',
                    dataType: dataType.TEXT,
                    description: 'A detailed description of the clothing item'
                },
                {
                    name: 'brand',
                    dataType: dataType.TEXT,
                    description: 'The brand of the clothing item'
                },
                {
                    name: 'product_id',
                    dataType: dataType.UUID
                },
                {
                    name: 'colors',
                    dataType: dataType.TEXT_ARRAY,
                    description: 'The colors on the clothing item'
                },
                {
                    name: 'reviews',
                    dataType: dataType.TEXT_ARRAY
                },
                {
                    name: 'image_url',
                    dataType: dataType.TEXT
                },
                {
                    name: 'price',
                    dataType: dataType.NUMBER,
                    description: 'The price of the clothing item in USD'
                }
            ]
        });
    }

    // Create Weather collection
    if (!(await client.collections.exists('Weather'))) {
        await client.collections.create({
            name: 'Weather',
            description: 'Daily weather information including temperature, wind speed, precipitation, pressure etc.',
            vectorizers: vectors.text2VecWeaviate(),
            properties: [
                {
                    name: 'date',
                    dataType: dataType.DATE
                },
                {
                    name: 'humidity',
                    dataType: dataType.NUMBER
                },
                {
                    name: 'precipitation',
                    dataType: dataType.NUMBER
                },
                {
                    name: 'wind_speed',
                    dataType: dataType.NUMBER
                },
                {
                    name: 'visibility',
                    dataType: dataType.NUMBER
                },
                {
                    name: 'pressure',
                    dataType: dataType.NUMBER
                },
                {
                    name: 'temperature',
                    dataType: dataType.NUMBER,
                    description: 'temperature value in Celsius'
                }
            ]
        });
    }

    // Create FinancialContracts collection
    if (!(await client.collections.exists('FinancialContracts'))) {
        await client.collections.create({
            name: 'FinancialContracts',
            description: 'A dataset of financial contracts between individuals and/or companies, as well as information on the type of contract and who has authored them.',
            vectorizers: vectors.text2VecWeaviate()
        });
    }

    // Load datasets from Hugging Face
    console.log('Loading datasets from Hugging Face...');

    // Helper function to load dataset from HF Datasets Viewer API
    async function loadHFDataset(repo: string, config: string, split: string = 'train'): Promise<DatasetItem[]> {
        const url = `https://datasets-server.huggingface.co/rows?dataset=${repo}&config=${config}&split=${split}&limit=1000`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch dataset: ${response.statusText}`);
            }

            const data = await response.json();
            return data.rows.map((row: any) => row.row);
        } catch (error) {
            console.error(`Error loading dataset ${repo}/${config}:`, error);
            return [];
        }
    }

    const ecommerceCollection = client.collections.use('ECommerce');
    const weatherCollection = client.collections.use('Weather');
    const financialCollection = client.collections.use('FinancialContracts');

    try {
        // Load datasets from Hugging Face
        const [ecommerceData, weatherData, financialData] = await Promise.all([
            loadHFDataset('weaviate/agents', 'query-agent-ecommerce', 'train'),
            loadHFDataset('weaviate/agents', 'query-agent-weather', 'train'),
            loadHFDataset('weaviate/agents', 'query-agent-financial-contracts', 'train')
        ]);

        console.log(`Loaded ${ecommerceData.length} ecommerce items`);
        console.log(`Loaded ${weatherData.length} weather items`);
        console.log(`Loaded ${financialData.length} financial items`);

        // Batch insert ecommerce data
        if (ecommerceData.length > 0) {
            await ecommerceCollection.data.insertMany(
                ecommerceData.map(item => ({ properties: item.properties || item }))
            );
        }

        // Batch insert weather data
        if (weatherData.length > 0) {
            await weatherCollection.data.insertMany(
                weatherData.map(item => ({
                    properties: item.properties || item,
                    vectors: item.vector ? { default: item.vector } : undefined
                }))
            );
        }

        // Batch insert financial data
        if (financialData.length > 0) {
            await financialCollection.data.insertMany(
                financialData.map(item => ({
                    properties: item.properties || item,
                    vectors: item.vector ? { default: item.vector } : undefined
                }))
            );
        }
    } catch (error) {
        console.error('Error loading or inserting data:', error);
    }

    // Get collection sizes
    const ecommerceCount = await ecommerceCollection.aggregate.overAll();
    const weatherCount = await weatherCollection.aggregate.overAll();
    const financialCount = await financialCollection.aggregate.overAll();

    console.log(`Size of the ECommerce dataset: ${ecommerceCount.totalCount}`);
    console.log(`Size of the Weather dataset: ${weatherCount.totalCount}`);
    console.log(`Size of the Financial dataset: ${financialCount.totalCount}`);
}


// START InstantiateQueryAgent
import weaviate, { WeaviateClient, vectors, dataType, configure } from 'weaviate-client';
import { QueryAgent, ChatMessage } from 'weaviate-agents';

// END InstantiateQueryAgent

async function main() {
// START InstantiateQueryAgent
const headers = {
    // END InstantiateQueryAgent
    'X-Cohere-API-Key': process.env.COHERE_API_KEY as string,
    'X-OpenAI-API-Key': process.env.OPENAI_API_KEY as string,
    // START InstantiateQueryAgent
    //  Provide your required API key(s), e.g. Cohere, OpenAI, etc. for the configured vectorizer(s)
    // "X-INFERENCE-PROVIDER-API-KEY": process.env.YOUR_INFERENCE_PROVIDER_KEY,
};

const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL as string, {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_ADMIN_KEY as string),
    headers
});
// END InstantiateQueryAgent

// Populate Weaviate with data
await populateWeaviate(client);

// START InstantiateQueryAgent
// Instantiate a new agent object
const queryAgent = new QueryAgent(
    client, {
    collections: ['ECommerce', 'FinancialContracts', 'Weather'],

});
// END InstantiateQueryAgent

// START SystemPromptExample
// Define a custom system prompt to guide the agent's behavior
const systemPrompt = `You are a helpful assistant that can answer questions about the products and 
                      users in the database. When you write your response use standard markdown 
                      formatting for lists, tables, and other structures. Emphasize key insights 
                      and provide actionable recommendations when relevant.`

const qaWithPrompt = new QueryAgent(
    client, {
    collections: [{
            name: 'ECommerce',
            targetVector: ['name_description_brand_vector'],
            viewProperties: ['description']
            // tenant: 'tenantA' // Optional for multi-tenancy
        }, "FinancialContracts", "Weather"],
    systemPrompt: systemPrompt
})

const responseWithPrompt = await qaWithPrompt.ask("What are the most expensive items in the store?")

responseWithPrompt.display()
// END SystemPromptExample

// START QueryAgentCollectionConfiguration
const qaWithConfig = new QueryAgent(client, {
    collections: [
        {
            name: 'ECommerce',
            targetVector: ['name_description_brand_vector'],
            viewProperties: ['description']
            // tenant: 'tenantA' // Optional for multi-tenancy
        },
        { name: 'FinancialContracts' },
        { name: 'Weather' }
    ]
});
// END QueryAgentCollectionConfiguration

// START UserDefinedFilters
// Apply persistent filters that will always be combined with agent-generated filters

const eCommerceCollection = client.collections.use("ECommerce")

const qaWithFilter = new QueryAgent(
    client, {
    collections: [{
            name: "ECommerce",
            // This filter ensures only items above $50 are considered
            additionalFilters: eCommerceCollection.filter.byProperty("price").greaterThan(50),
            targetVector:[
                "name_description_brand_vector"
            ],  // Required target vector name(s) for collections with named vectors
    }],
})

// The agent will automatically combine these filters with any it generates
const responseWithFilter = await qaWithFilter.ask("Find me some affordable clothing items")

responseWithFilter.display()

// You can also apply filters dynamically at runtime
const runtimeConfig = {
    name: "ECommerce",
    additionalFilters: eCommerceCollection.filter.byProperty("category").equal("Footwear"),
    targetVector:["name_description_brand_vector"]
}

const responseWithRuntimeFilter = await queryAgent.ask("What products are available?", {
    collections: [runtimeConfig]
})

responseWithRuntimeFilter.display()
// END UserDefinedFilters


// Reset qa to original configuration for following examples
const qa = new QueryAgent(
    client, {
    collections: [
        {
            name:"ECommerce",
            targetVector: ["name_description_brand_vector"],
            viewProperties: ["name", "description", "price"],
        },
        "FinancialContracts",
        "Weather",
    ],
})

// START QueryAgentAskBasicCollectionSelection
const contractResponse = await qa.ask(
    "What kinds of contracts are listed? What's the most common type of contract?", { 
    collections: ['FinancialContracts'] 
});

contractResponse.display();
// END QueryAgentAskBasicCollectionSelection

// START QueryAgentAskCollectionConfig
const clothingResponse = await qaWithConfig.ask(
    "I like vintage clothes and nice shoes. Recommend some of each below $60.", {
    collections: [
        {
            name: 'ECommerce',
            targetVector: ['name_description_brand_vector'],
            viewProperties: ['name', 'description', 'category', 'brand']
        },
        {
            name: 'FinancialContracts'
        }
    ]
});

clothingResponse.display();
// END QueryAgentAskCollectionConfig

// START BasicSearchQuery
// Perform a search using Search Mode (retrieval only, no answer generation)
const basicSearchResponse = await qa.search("Find me some vintage shoes under $70", {
    limit: 10
} )

// Access the search results
for (const obj of basicSearchResponse.searchResults.objects) {
    console.log(`Product: ${obj.properties['name']} - ${obj.properties['price']}`)
}
// END BasicSearchQuery


// START BasicAskQuery
// Perform a query
const basicQuery = "I like vintage clothes and nice shoes. Recommend some of each below $60."
const basicResponse = await qaWithConfig.ask(basicQuery);

basicResponse.display();
// END BasicAskQuery

// START SearchModeResponseStructure
// SearchModeResponse structure for TypeScript
const searchResponse = await qa.search("winter boots for under $100", {
    limit: 5 
})

// Access different parts of the response
console.log("Original query:", basicQuery)
console.log("Total time:", searchResponse.totalTime)

// Access usage statistics
console.log("Usage statistics:", searchResponse.usage)

// Access the searches performed (if any)
if (searchResponse.searches) {
    for (const search in searchResponse.searches) {
        console.log("Search performed:", search)
    }
}
// Access the search results (QueryReturn object)
for (const obj of searchResponse.searchResults.objects){
    console.log("Properties:", obj.properties)
    console.log("Metadata:", obj.metadata)
}
// END SearchModeResponseStructure

// START SearchPagination
// Search with pagination
const responsePage1 = await qa.search(
    "Find summer shoes and accessories between $50 and $100 that have the tag 'sale'", {
    limit: 3,
})

// Get the next page of results
const responsePage2 = await responsePage1.next({
    limit: 3, 
    offset: 3, 
})

// Continue paginating
const responsePage3 = await responsePage2.next({
    limit: 3, 
    offset: 6, 
})

const pages = [responsePage1, responsePage2, responsePage3];

pages.forEach((pageResponse, index) => {
    const pageNum = index + 1;
    console.log(`Page ${pageNum}:`);
    
    pageResponse.searchResults.objects.forEach(obj => {
        // Safely access properties in case they don't exist
        const name = obj.properties.name || "Unknown Product";
        const price = obj.properties.price || "Unknown Price";
        console.log(`${name} - $${price}`);
    });
});
// END SearchPagination


// START FollowUpQuery
// Perform a follow-up query and include the answer from the previous query

const basicConversation: ChatMessage[] = [
    {   role: "assistant", content: basicResponse.finalAnswer },
    {
        role: "user",
        content: "I like the vintage clothes options, can you do the same again but above $200?",
    },
]

const followingResponse = await qaWithConfig.ask(basicConversation)

// Print the response
followingResponse.display()
// END FollowUpQuery

// START ConversationalQuery
// Create a conversation with multiple turns
const conversation: ChatMessage[] = [
    {   role: "user", content: "Hi!"},
    {   role: "assistant", content: "Hello! How can I assist you today?"},
    {
        role: "user",
        content:  "I have some questions about the weather data. You can assume the temperature is in Fahrenheit and the wind speed is in mph.",
    },
    {
        role: "assistant",
        content:  "I can help with that. What specific information are you looking for?",
    },
]

// Add the user's query
conversation.push(
    {
        role: "user",
        content:  "What's the average wind speed, the max wind speed, and the min wind speed",
    }
)

// Get the response
const response = await qaWithConfig.ask(conversation)
console.log(response.finalAnswer)

// Continue the conversation
conversation.push({role: "assistant", content:  response.finalAnswer})
conversation.push({role: "user", content:  "and for the temperature?"})

const followUpResponse = await qaWithConfig.ask(conversation)
console.log(followUpResponse.finalAnswer)
// END ConversationalQuery

var query = "What is the weather like in San Francisco?";

// START StreamResponse
// Setting includeProgress to false will skip progressMessages, and only stream
// the streamedTokens / the final response.
for await (const event of qa.askStream(query, {
    includeProgress: true,      // Default: True
    includeFinalState: true,    // Default: True
})) {
    if (event.outputType === "progressMessage") {
        // The message is a human-readable string, structured info available in event.details
        console.log(event.message);
    } else if (event.outputType === "streamedTokens") {
        // The delta is a string containing the next chunk of the final answer
        process.stdout.write(event.delta);
    } else {
        // This is the final response, as returned by queryAgent.ask()
        event.display();
    }
}
// END StreamResponse

// START InspectResponseExample
console.log('\n=== Query Agent Response ===');
console.log(`Original Query: ${basicQuery}\n`); // Pre-defined by user

console.log('🔍 Final Answer Found:');
console.log(`${basicResponse.finalAnswer}\n`);

console.log('🔍 Searches Executed:');
for (const collectionSearches of basicResponse.searches) {
        console.log(`- ${collectionSearches.query}\n`);
}

if (basicResponse.aggregations) {
    console.log('📊 Aggregation Results:');
    for (const collectionAggs of basicResponse.aggregations) {
        for (const agg in collectionAggs) {
            console.log(`- ${agg}\n`);
        }
    }
}

if (basicResponse.missingInformation && basicResponse.missingInformation.length > 0) {
    if (basicResponse.isPartialAnswer) {
        console.log('⚠️ Answer is Partial - Missing Information:');
    } else {
        console.log('⚠️ Missing Information:');
    }
    for (const missing of basicResponse.missingInformation) {
        console.log(`- ${missing}`);
    }
}
// END InspectResponseExample

if (!basicResponse.finalAnswer || basicResponse.finalAnswer === '') {
    throw new Error('Final answer is empty or null');
}
await client.close()

}

void main();
