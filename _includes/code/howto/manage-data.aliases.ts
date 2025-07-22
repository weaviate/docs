import weaviate, { WeaviateClient} from 'weaviate-client'

const openaiKey = process.env.OPENAI_API_KEY as string

// Connect to Weaviate
const client: WeaviateClient = await weaviate.connectToLocal({
    authCredentials: new weaviate.ApiKey('YOUR-WEAVIATE-API-KEY'),
    headers: {
     'X-OpenAI-Api-Key': openaiKey as string,  // Replace with your inference API key
   }
 }
)

// Cleanup
const aliases = await client.alias.listAll()
const collections = ["Articles", "ArticlesV2", "ProductsV1", "ProductsV2"]

if (aliases) {
    for (const item of aliases) {
        await client.alias.delete(item.alias)
    }
}

for (const collection of collections) {
    if (await client.collections.exists(collection)) {
        await client.collections.delete(collection)
    }
}


// START CreateAlias
// Create a collection first
await client.collections.create({
    name: "Articles",
    vectorizers: weaviate.configure.vectors.selfProvided(),
    properties:[
        { name: "title", dataType: weaviate.configure.dataType.TEXT },
        { name: "content", dataType: weaviate.configure.dataType.TEXT },
    ],
})

console.log('Created collection "Articles"')
// Create an alias pointing to the collection
await client.alias.create({ 
    alias: "ArticlesProd", 
    collection: "Articles"
})

console.log('Created alias "ArticlesProd"')
// END CreateAlias

// START ListAllAliases
// Get all aliases in the instance
const allAliases = await client.alias.listAll()

// Filter to show only aliases from this example
for (const [aliasName, aliasInfo] of Object.entries(allAliases)) {
    if (["Articles", "ArticlesV2"].includes(aliasInfo.collection)) {
        console.log(`Alias: ${aliasInfo.alias} -> Collection: ${aliasInfo.collection}`);
    }
}
// END ListAllAliases

// START ListCollectionAliases
// Get all aliases pointing to a specific collection
const collectionAliases = await client.alias.listAll({ collection: "Articles"})

for (const [aliasName, aliasInfo] of Object.entries(collectionAliases)) {
    console.log(`Alias pointing to Articles: ${aliasInfo.alias}`);
}

// END ListCollectionAliases

// START GetAlias
// Get information about a specific alias
const aliasInfo = await client.alias.get("ArticlesProd")

if (aliasInfo) {
    console.log(`Alias: ${aliasInfo.alias}`);
    console.log(`Target collection: ${aliasInfo.collection}`);
}
// END GetAlias

// START UpdateAlias
// Create a new collection for migration
await client.collections.create({
    name: "ArticlesV2",
    vectorizers: weaviate.configure.vectors.selfProvided(),
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT },
        { name: "content", dataType: weaviate.configure.dataType.TEXT },
        { name: "author", dataType: weaviate.configure.dataType.TEXT },  // New field
    ],
})

// Update the alias to point to the new collection
await client.alias.update({
    alias: "ArticlesProd", 
    newTargetCollection: "ArticlesV2"
})

console.log("Alias updated successfully")

// END UpdateAlias

await client.collections.delete("Articles")
// START UseAlias
// Ensure the Articles collection exists (it might have been deleted in previous examples)

await client.collections.create({
    name: "Articles",
    vectorizers: weaviate.configure.vectors.selfProvided(),
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT },
        { name: "content", dataType: weaviate.configure.dataType.TEXT },
    ],
})
// END UseAlias
// Delete alias if it exists from a previous run
await client.alias.delete("MyArticles")

// START DeleteAlias
// Delete an alias (the underlying collection remains)
await client.alias.delete("ArticlesProd")
// END DeleteAlias
// START UseAlias
// Create an alias for easier access
await client.alias.create({  
    alias: "MyArticles", 
    collection: "Articles"
})

// Use the alias just like a collection name
const articles = client.collections.use("MyArticles")

// Insert data using the alias
await articles.data.insert({
        "title": "Using Aliases in Weaviate",
        "content": "Aliases make collection management easier...",
})

// Query using the alias
const results = await articles.query.fetchObjects({ limit: 5 })

for (const obj of results.objects) {
    console.log(`Found: ${obj.properties['title']}`);
}

// Add a new property using the alias
await articles.config.addProperty(
    { name: "author", dataType: weaviate.configure.dataType.TEXT }
)
// END UseAlias

// START MigrationExample
// Step 1: Create original collection with data
await client.collections.create({
    name: "ProductsV1", 
    vectorizers: weaviate.configure.vectors.selfProvided()
})

const productsV1 = client.collections.use("ProductsV1")

await productsV1.data.insertMany([
    {"name": "Product A", "price": 100}, 
    {"name": "Product B", "price": 200}
])

// Step 2: Create alias pointing to current collection
await client.alias.create({alias:"Products", collection: "ProductsV1"})

// Step 3: Create new collection with updated schema
await client.collections.create({
    name: "ProductsV2",
    vectorizers: weaviate.configure.vectors.selfProvided(),
    properties: [
        { name: "name", dataType: weaviate.configure.dataType.TEXT },
        { name: "price", dataType: weaviate.configure.dataType.NUMBER },
        { name: "category", dataType: weaviate.configure.dataType.TEXT },  // New field
    ],
})

// Step 4: Migrate data to new collection
const productsV2 = client.collections.use("ProductsV2")

const oldData = (await productsV1.query.fetchObjects()).objects

for (const obj of oldData) {
    productsV2.data.insert({
            "name": obj.properties["name"],
            "price": obj.properties["price"],
            "category": "General",  // Default value for new field
    })
}
// Step 5: Switch alias to new collection (instant switch!)
await client.alias.update({ 
    alias: "Products", 
    newTargetCollection: "ProductsV2"
})

// All queries using "Products" alias now use the new collection
const products = client.collections.use("Products")

const result = await products.query.fetchObjects({ limit: 1 })

console.log(result.objects[0].properties)  // Will include the new "category" field

// Step 6: Clean up old collection after verification
await client.collections.delete("ProductsV1")
// END MigrationExample


// Cleanup
const cleanUpAliases = await client.alias.listAll()

if (cleanUpAliases) {
    for (const item of cleanUpAliases) {
        await client.alias.delete(item.alias)
    }
}

for (const collection of collections) {
    if (await client.collections.exists(collection)) {
        await client.collections.delete(collection)
    }
}
await client.close()
