// Code examples for updating collections with RQ-8 compression

// ==============================
// =====  CONNECT =====
// ==============================

// START ConnectCode // START UpdateSingleCollectionHNSW // START UpdateSingleCollectionDynamic // START UpdateLegacyCollection // START ListCollectionsByIndexType // START UpdateMultipleCollections // START CheckCompressionStatus
import weaviate, { reconfigure } from 'weaviate-client';
// END ConnectCode // END UpdateSingleCollectionHNSW // END UpdateSingleCollectionDynamic // END UpdateLegacyCollection // END ListCollectionsByIndexType // END UpdateMultipleCollections // END CheckCompressionStatus

// START ConnectCode
// Best practice: store your credentials in environment variables
const weaviateUrl = process.env.WEAVIATE_URL!
const weaviateApiKey = process.env.WEAVIATE_API_KEY!

const client = await weaviate.connectToWeaviateCloud(weaviateUrl, {
    authCredentials: new weaviate.ApiKey(weaviateApiKey),
})
// END ConnectCode

import { configure } from 'weaviate-client';

await client.collections.delete("MyUncompressedCollection")
await client.collections.create({
    name: "MyUncompressedCollection",
    vectorizers: configure.vectors.text2VecOpenAI({
        quantizer: configure.vectorIndex.quantizer.none(),
    }),
})

/*TODO[g-despot] TypeScript client v3.x doesn't support creating true legacy collections (pre-v1.24 without named vectors).
The client internally uses named vectors for all collections. The UpdateLegacyCollection snippet below is still valid
for actual legacy collections in clusters, it just can't be tested in this file.
await client.collections.delete("MyLegacyCollection")
await client.collections.create({
    name: "MyLegacyCollection",
    vectorizerConfig: configure.vectorizer.text2VecWeaviate(),
})
*///

// ==============================
// =====  UPDATE SINGLE COLLECTION (HNSW) =====
// ==============================

// START UpdateSingleCollectionHNSW

const collection = client.collections.get("MyUncompressedCollection")
await collection.config.update({
    vectorizers: [ reconfigure.vectors.update({
        name: "default",
        vectorIndexConfig: reconfigure.vectorIndex.hnsw({
            quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
        }),
    })]
})
// END UpdateSingleCollectionHNSW

/*TODO[g-despot] Can't test until cluster has async indexing.
await client.collections.delete("MyUncompressedCollection")
await client.collections.create({
    name: "MyUncompressedCollection",
    vectorizers: configure.vectors.text2VecOpenAI({
        vectorIndexConfig: configure.vectorIndex.dynamic(),
        quantizer: configure.vectorIndex.quantizer.none(),
    }),
})
// ==============================
// =====  UPDATE SINGLE COLLECTION (DYNAMIC) =====
// ==============================

// START UpdateSingleCollectionDynamic

// For dynamic indexes, only the HNSW portion can be updated after creation
// The flat index compression settings are immutable
const collectionDynamic = client.collections.get("MyUncompressedCollection")
await collectionDynamic.config.update({
    vectorizers: [ reconfigure.vectors.update({
        name: "default",
        vectorIndexConfig: reconfigure.vectorIndex.dynamic({
            hnsw: reconfigure.vectorIndex.hnsw({
                quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
            }),
        }),
    })]
})
// END UpdateSingleCollectionDynamic
*/
// ==============================
// =====  UPDATE LEGACY COLLECTION (pre-named vectors) =====
// ==============================

// START UpdateLegacyCollection

// For collections created before named vectors were introduced (pre-v1.24),
// use vectorIndexConfig directly instead of vectorizers
const legacyCollection = client.collections.get("MyLegacyCollection")
await legacyCollection.config.update({
    vectorIndexConfig: reconfigure.vectorIndex.hnsw({
        quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
    })
})
// END UpdateLegacyCollection

// ==============================
// =====  LIST COLLECTIONS BY INDEX TYPE =====
// ==============================

// START ListCollectionsByIndexType

// Group collections by their vector index type
const hnswCollections: Array<{collection: string, vector: string}> = []
const flatCollections: Array<{collection: string, vector: string}> = []
const dynamicCollections: Array<{collection: string, vector: string}> = []
const legacyCollections: string[] = []

const allCollections = await client.collections.listAll()

for (const collectionConfig of Object.values(allCollections)) {
    const collectionName = collectionConfig.name
    try {
        const coll = client.collections.get(collectionName)
        const config = await coll.config.get()

        // Check if this is a legacy collection (no named vectors)
        if (!config.vectorizers || Object.keys(config.vectorizers).length === 0) {
            legacyCollections.push(collectionName)
            continue
        }

        // For each named vector, determine its index type
        for (const [vectorName, vectorConfig] of Object.entries(config.vectorizers)) {
            const indexType = vectorConfig.indexType
            const entry = { collection: collectionName, vector: vectorName }

            if (indexType === 'hnsw') {
                hnswCollections.push(entry)
            } else if (indexType === 'flat') {
                flatCollections.push(entry)
            } else if (indexType === 'dynamic') {
                dynamicCollections.push(entry)
            }
        }
    } catch (error) {
        console.log(`Skipping collection ${collectionName}: ${error}`)
    }
}

console.log(`HNSW collections: ${hnswCollections.length}`)
console.log(`Flat collections: ${flatCollections.length}`)
console.log(`Dynamic collections: ${dynamicCollections.length}`)
console.log(`Legacy collections: ${legacyCollections.length}`)
// END ListCollectionsByIndexType

// ==============================
// =====  UPDATE MULTIPLE COLLECTIONS =====
// ==============================

// START UpdateMultipleCollections

// Process collections in batches to avoid cluster instability
const BATCH_SIZE = 100

// Only process the first batch (adjust slice for subsequent batches)
const batch = hnswCollections.slice(0, BATCH_SIZE)

for (const entry of batch) {
    const collectionName = entry.collection
    const vectorName = entry.vector

    const collection = client.collections.get(collectionName)
    console.log(`Enabling RQ-8 compression for ${collectionName} (vector: ${vectorName})`)
    // END UpdateMultipleCollections
    /*
    // START UpdateMultipleCollections
    await collection.config.update({
        vectorizers: [ reconfigure.vectors.update({
            name: vectorName,
            vectorIndexConfig: reconfigure.vectorIndex.hnsw({
                quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
            }),
        })]
    })
    // END UpdateMultipleCollections
    */
    // START UpdateMultipleCollections
}

console.log(`Processed ${batch.length} collections. Remaining: ${hnswCollections.length - BATCH_SIZE}`)
// END UpdateMultipleCollections

// ==============================
// =====  CHECK COMPRESSION STATUS =====
// ==============================

// START CheckCompressionStatus

const collectionToCheck = client.collections.get("MyUncompressedCollection")
const configToCheck = await collectionToCheck.config.get()

// Check if this is a legacy collection (no named vectors)
if (configToCheck.vectorizers && Object.keys(configToCheck.vectorizers).length > 0) {
    // Named vectors - iterate through vectorizers
    for (const [vectorName, vectorConfig] of Object.entries(configToCheck.vectorizers)) {
        console.log(`\nVector: ${vectorName}`)
        const quantizer = vectorConfig.indexConfig?.quantizer
        if (quantizer) {
            console.log(`  Quantizer type: ${quantizer.constructor.name}`)
            if ('bits' in quantizer) {
                console.log(`  Bits: ${quantizer.bits}`)
            }
        } else {
            console.log("  No compression enabled")
        }
    }
} else {
    // Legacy collection - check vectorIndexConfig directly
    console.log(`\nLegacy collection (no named vectors)`)
    const quantizer = configToCheck.vectorIndexConfig?.quantizer
    if (quantizer) {
        console.log(`  Quantizer type: ${quantizer.constructor.name}`)
        if ('bits' in quantizer) {
            console.log(`  Bits: ${quantizer.bits}`)
        }
    } else {
        console.log("  No compression enabled")
    }
}
// END CheckCompressionStatus

client.close()
