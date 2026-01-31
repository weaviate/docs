// Code examples for updating collections with RQ-8 compression

// ==============================
// =====  CONNECT =====
// ==============================

// START ConnectCode // START UpdateSingleCollection // START UpdateMultipleCollections // START CheckCompressionStatus
import weaviate, { reconfigure } from 'weaviate-client';
// END ConnectCode // END UpdateSingleCollection // END UpdateMultipleCollections // END CheckCompressionStatus

// START ConnectCode
const client = await weaviate.connectToWeaviateCloud('YOUR-WEAVIATE-CLOUD-URL', {
    authCredentials: new weaviate.ApiKey('YOUR-API-KEY'),
})
// END ConnectCode

// ==============================
// =====  UPDATE SINGLE COLLECTION =====
// ==============================

// START UpdateSingleCollection

const collection = client.collections.get("MyCollection")
await collection.config.update({
    vectorizers: [ reconfigure.vectors.update({
        name: "default",
        vectorIndexConfig: reconfigure.vectorIndex.hnsw({
            quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
        }),
    })]
})
// END UpdateSingleCollection

// ==============================
// =====  UPDATE MULTIPLE COLLECTIONS =====
// ==============================

// START UpdateMultipleCollections

// Get all collection names
const collections = await client.collections.listAll()

// Loop through collections
for (const collectionName of Object.keys(collections)) {
    const collection = client.collections.get(collectionName)
    const config = await collection.config.get()

    // vectorConfig is an object of named vectors, e.g. { default: VectorConfig }
    const vectorConfigs = config.vectorConfig

    // Check each named vector in the collection
    for (const [vectorName, vectorConfig] of Object.entries(vectorConfigs)) {
        // Check if this vector has ANY compression enabled
        const hasCompression = vectorConfig && vectorConfig.quantizer !== null && vectorConfig.quantizer !== undefined

        // Only enable RQ if there's NO compression at all
        if (!hasCompression) {
            console.log(`Enabling RQ-8 compression for ${collectionName} (vector: ${vectorName})`)
            await collection.config.update({
                vectorizers: [ reconfigure.vectors.update({
                    name: vectorName,
                    vectorIndexConfig: reconfigure.vectorIndex.hnsw({
                        quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
                    }),
                })]
            })
        } else {
            // Collection already has some compression (RQ, PQ, BQ, SQ, etc.)
            const quantizerType = vectorConfig.quantizer.type || String(vectorConfig.quantizer)
            console.log(`${collectionName} (vector: ${vectorName}) already has compression: ${quantizerType}`)
        }
    }
}
// END UpdateMultipleCollections

// ==============================
// =====  CHECK COMPRESSION STATUS =====
// ==============================

// START CheckCompressionStatus

const collectionToCheck = client.collections.get("MyCollection")
const configToCheck = await collectionToCheck.config.get()

// vectorConfig is an object of named vectors
for (const [vectorName, vectorConfig] of Object.entries(configToCheck.vectorConfig)) {
    console.log(`\nVector: ${vectorName}`)
    if (vectorConfig && vectorConfig.quantizer) {
        console.log(`  Quantizer type: ${vectorConfig.quantizer.type}`)
        if ('bits' in vectorConfig.quantizer) {
            console.log(`  Bits: ${vectorConfig.quantizer.bits}`)
        }
    } else {
        console.log("  No compression enabled")
    }
}
// END CheckCompressionStatus

client.close()
