// # START-ANY
import weaviate, { WeaviateClient } from "weaviate-client"

let client: WeaviateClient
let response
// # END-ANY

const weaviateURL = process.env.WEAVIATE_URL as string
  const weaviateKey = process.env.WEAVIATE_API_KEY as string
  const openaiKey = process.env.OPENAI_API_KEY as string

  // Connect to your Weaviate instance  
  client = await weaviate.connectToWeaviateCloud(weaviateURL, {
    authCredentials: new weaviate.ApiKey(weaviateKey),
    headers: {
      'X-OpenAI-Api-Key': openaiKey,  // Replace with your inference API key
    }
  })

// # START-ANY

// Instantiate your client (not shown). e.g.:
// const requestHeaders = {'X-OpenAI-Api-Key': process.env.OPENAI_APIKEY as string,}
// client = weaviate.connectToWeaviateCloud(..., headers: requestHeaders) or
// client = weaviate.connectToLocal(..., headers: requestHeaders)

// # END-ANY

// SinglePromptGeneration // GroupedTaskGeneration
// Get the collection 
const movies = client.collections.use("Movie")
// END GroupedTaskGeneration // END SinglePromptGeneration

// SinglePromptGeneration

// Perform query
response = await movies.generate.nearText("dystopian future", {
    // highlight-start
    singlePrompt: "Translate this into French: {title}" },
    // highlight-end
    { limit: 5 }
)

// Inspect the response
for (let item of response.objects) {
    console.log(`${item.properties.title} - ${item.generated}`)
}
// END SinglePromptGeneration


// GroupedTaskGeneration

// Perform query
response = await movies.generate.nearText("dystopian future", {
    // highlight-start
    groupedTask: "What do these movies have in common?",
    // highlight-end
    groupedProperties: ['title', 'overview']},
  { limit: 5 }
)

// Inspect the response
for (let item of response.objects) {
  console.log('Title: ', item.properties.title) // Print the title
}

// highlight-start
console.log(response.generated) // Print the generated text (the commonalities between them)
// highlight-end

client.close()
// END GroupedTaskGeneration
