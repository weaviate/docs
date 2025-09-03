import weaviate, { WeaviateClient } from 'weaviate-client'

const openaiKey = process.env.OPENAI_API_KEY as string

// START ConnectToWeaviate
// Connect to local Weaviate instance
const client: WeaviateClient = await weaviate.connectToLocal()
// END ConnectToWeaviate

// Cleanup
const aliases = await client.alias.listAll()
const collections = ["Articles", "ArticlesV2", "Products_v1", "Products_v2"]

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
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT },
        { name: "content", dataType: weaviate.configure.dataType.TEXT },
    ],
})

console.log('Created collection "Articles"')
// Create an alias pointing to the collection
await client.alias.create({
    alias: "ArticlesAlias",
    collection: "Articles"
})

console.log('Created alias "ArticlesAlias"')
// END CreateAlias

// START ListAllAliases
// Get all aliases in the instance
const allAliases = await client.alias.listAll()

if (allAliases) {
    for (const [_, aliasInfo] of Object.entries(allAliases)) {
        console.log(`Alias: ${aliasInfo.alias} -> Collection: ${aliasInfo.collection}`);
    }
}
// END ListAllAliases

// START ListCollectionAliases
// Get all aliases pointing to a specific collection
const collectionAliases = await client.alias.listAll({ collection: "Articles" })

if (collectionAliases) {
    for (const [_, aliasInfo] of Object.entries(collectionAliases)) {
        console.log(`Alias pointing to Articles: ${aliasInfo.alias}`);
    }
}

// END ListCollectionAliases

// START GetAlias
// Get information about a specific alias
const aliasInfo = await client.alias.get("ArticlesAlias")

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
    alias: "ArticlesAlias",
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

// START DeleteAlias
// Delete an alias (the underlying collection remains)
await client.alias.delete("ArticlesAlias")
// END DeleteAlias

// START UseAlias
// Create an alias for easier access
await client.alias.create({
    alias: "ArticlesAlias",
    collection: "Articles"
})

// Use the alias just like a collection name
const articles = client.collections.use("ArticlesAlias")

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
// END UseAlias

// START Step1CreateOriginal
// Create original collection with data
await client.collections.create({
    name: "Products_v1",
    vectorizers: weaviate.configure.vectors.selfProvided()
})

const products_v1 = client.collections.use("Products_v1")

await products_v1.data.insertMany([
    { "name": "Product A", "price": 100 },
    { "name": "Product B", "price": 200 }
])
// END Step1CreateOriginal

// START Step2CreateAlias
// Create alias pointing to current collection
await client.alias.create({
    alias: "ProductsAlias",
    collection: "Products_v1"
})

// END Step2CreateAlias

// START MigrationUseAlias
// Your application always uses the alias name "Products"
const prods = client.collections.use("ProductsAlias");

// Insert data through the alias
await prods.data.insert({ name: "Product C", price: 300 });

// Query through the alias
const res = await prods.query.fetchObjects({ limit: 5 });
for (const obj of res.objects) {
    console.log(`Product: ${obj.properties.name}, Price: $${obj.properties.price}`);
}
// END MigrationUseAlias

// START Step3NewCollection
// Create new collection with updated schema
await client.collections.create({
    name: "Products_v2",
    vectorizers: weaviate.configure.vectors.selfProvided(),
    properties: [
        { name: "name", dataType: weaviate.configure.dataType.TEXT },
        { name: "price", dataType: weaviate.configure.dataType.NUMBER },
        { name: "category", dataType: weaviate.configure.dataType.TEXT },  // New field
    ],
})
// END Step3NewCollection

// START Step4MigrateData
// Migrate data to new collection
const products_v2 = client.collections.use("Products_v2")
const oldData = (await products_v1.query.fetchObjects()).objects

for (const obj of oldData) {
    await products_v2.data.insert({
        "name": obj.properties["name"],
        "price": obj.properties["price"],
        "category": "General",  // Default value for new field
    })
}
// END Step4MigrateData

// START Step5UpdateAlias
// Switch alias to new collection (instant switch!)
await client.alias.update({
    alias: "ProductsAlias",
    newTargetCollection: "Products_v2"
})

// All queries using "ProductsAlias" alias now use the new collection
const products = client.collections.use("ProductsAlias")
const result = await products.query.fetchObjects({ limit: 1 })
console.log(result.objects[0].properties)  // Will include the new "category" field
// END Step5UpdateAlias

// START Step6Cleanup
// Clean up old collection after verification
await client.collections.delete("Products_v1")
// END Step6Cleanup

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
