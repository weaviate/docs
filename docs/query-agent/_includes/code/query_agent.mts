import 'dotenv/config'
import weaviate from 'weaviate-client';
import { ChatMessage } from 'weaviate-agents';
const { loadClientInternally, populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/query-agent/_includes/code/util.mjs'));
const client = await loadClientInternally();
// Recreate ECommerce so it always has the `name_description_brand_vector` named
// vector this snippet targets (a stale collection on the shared instance may
// lack it, causing WEAVIATE_NAMED_VECTOR_ERROR).
await populateWeaviate(client, true);


// START InstantiateQueryAgent
import { QueryAgent } from 'weaviate-agents';

// Instantiate a new agent object
const queryAgent = new QueryAgent(
    client, // Your Weaviate client object
    {
        collections: ['ECommerce', 'FinancialContracts', 'Weather'],

    }
);
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
        targetVector: [
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
    targetVector: ["name_description_brand_vector"]
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
            name: "ECommerce",
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
})

// Access the search results
for (const obj of basicSearchResponse.searchResults.objects) {
    console.log(`Product: ${obj.properties['name']} - ${obj.properties['price']}`)
}
// END BasicSearchQuery

// START DiversityRanking
// Diversity ranking needs a vectorizer it can resolve. Scope the call to a
// single collection with a target vector so the agent knows what to use.
const diversitySearchResponse = await qa.search("summer shoes", {
    limit: 10,
    diversityWeight: 0.5,
    collections: [{
        name: "ECommerce",
        targetVector: ["name_description_brand_vector"],
    }],
})

// Access the search results
for (const obj of diversitySearchResponse.searchResults.objects) {
    console.log(`Product: ${obj.properties['name']} - ${obj.properties['price']}`)
}
// END DiversityRanking

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
    for (const search of searchResponse.searches) {
        console.log("Search performed:", search)
    }
}
// Access the search results (QueryReturn object)
for (const obj of searchResponse.searchResults.objects) {
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
    {
        role: "assistant",
        content: basicResponse.finalAnswer
    },
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
    {
        role: "user",
        content: "Hi!"
    },
    {
        role: "assistant",
        content: "Hello! How can I assist you today?"
    },
    {
        role: "user",
        content: "I have some questions about the weather data. You can assume the temperature is in Fahrenheit and the wind speed is in mph.",
    },
    {
        role: "assistant",
        content: "I can help with that. What specific information are you looking for?",
    },
]

// Add the user's query
conversation.push(
    {
        role: "user",
        content: "What's the average wind speed, the max wind speed, and the min wind speed",
    }
)

// Get the response
const response = await qaWithConfig.ask(conversation)
console.log(response.finalAnswer)

// Continue the conversation
conversation.push({ role: "assistant", content: response.finalAnswer })
conversation.push({ role: "user", content: "and for the temperature?" })

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
    for (const agg of basicResponse.aggregations) {
        console.log(`- ${JSON.stringify(agg)}\n`);
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

// START SuggestQueries
const suggestResponse = await qa.suggestQueries({
    collections: ["FinancialContracts"],
    numQueries: 3,
    instructions: "High-level themes and open-ended exploration",
});

for (const suggestedQuery of suggestResponse.queries) {
    console.log(suggestedQuery.query);
}
// END SuggestQueries

await client.close()
