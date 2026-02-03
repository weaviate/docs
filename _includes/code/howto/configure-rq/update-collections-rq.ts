// Code examples for updating collections with RQ-8 compression

// ==============================
// =====  CONNECT =====
// ==============================

// START ConnectCode // START UpdateSingleCollectionHNSW // START UpdateSingleCollectionFlat // START UpdateSingleCollectionDynamic // START UpdateLegacyCollection // START ListCollectionsByIndexType // START UpdateMultipleCollections // START CheckCompressionStatus
import weaviate, { reconfigure } from 'weaviate-client';
// END ConnectCode // END UpdateSingleCollectionHNSW // END UpdateSingleCollectionFlat // END UpdateSingleCollectionDynamic // END UpdateLegacyCollection // END ListCollectionsByIndexType // END UpdateMultipleCollections // END CheckCompressionStatus

// START ConnectCode
const client = await weaviate.connectToWeaviateCloud('YOUR-WEAVIATE-CLOUD-URL', {
    authCredentials: new weaviate.ApiKey('YOUR-API-KEY'),
})
// END ConnectCode

// ==============================
// =====  UPDATE SINGLE COLLECTION (HNSW) =====
// ==============================

// START UpdateSingleCollectionHNSW

const collection = client.collections.get("MyCollection")
await collection.config.update({
    vectorizers: [ reconfigure.vectors.update({
        name: "default",
        vectorIndexConfig: reconfigure.vectorIndex.hnsw({
            quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
        }),
    })]
})
// END UpdateSingleCollectionHNSW

// ==============================
// =====  UPDATE SINGLE COLLECTION (FLAT) =====
// ==============================

// START UpdateSingleCollectionFlat

const collectionFlat = client.collections.get("MyCollection")
await collectionFlat.config.update({
    vectorizers: [ reconfigure.vectors.update({
        name: "default",
        vectorIndexConfig: reconfigure.vectorIndex.flat({
            quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
        }),
    })]
})
// END UpdateSingleCollectionFlat

// ==============================
// =====  UPDATE SINGLE COLLECTION (DYNAMIC) =====
// ==============================

// START UpdateSingleCollectionDynamic

const collectionDynamic = client.collections.get("MyCollection")
await collectionDynamic.config.update({
    vectorizers: [ reconfigure.vectors.update({
        name: "default",
        vectorIndexConfig: reconfigure.vectorIndex.dynamic({
            hnsw: reconfigure.vectorIndex.hnsw({
                quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
            }),
            flat: reconfigure.vectorIndex.flat({
                quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
            }),
        }),
    })]
})
// END UpdateSingleCollectionDynamic

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

for (const collectionName of Object.keys(allCollections)) {
    const coll = client.collections.get(collectionName)
    const config = await coll.config.get()

    // Check if this is a legacy collection (no named vectors)
    if (!config.vectorConfig || Object.keys(config.vectorConfig).length === 0) {
        legacyCollections.push(collectionName)
        continue
    }

    // For each named vector, determine its index type
    for (const [vectorName, vectorConfig] of Object.entries(config.vectorConfig)) {
        const indexType = vectorConfig.vectorIndexType
        const entry = { collection: collectionName, vector: vectorName }

        if (indexType === 'hnsw') {
            hnswCollections.push(entry)
        } else if (indexType === 'flat') {
            flatCollections.push(entry)
        } else if (indexType === 'dynamic') {
            dynamicCollections.push(entry)
        }
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

// Loop through HNSW collections identified above
for (const entry of hnswCollections) {
    const collectionName = entry.collection
    const vectorName = entry.vector

    const collection = client.collections.get(collectionName)
    console.log(`Enabling RQ-8 compression for ${collectionName} (vector: ${vectorName})`)
    await collection.config.update({
        vectorizers: [ reconfigure.vectors.update({
            name: vectorName,
            vectorIndexConfig: reconfigure.vectorIndex.hnsw({
                quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 8 }),
            }),
        })]
    })
}
// END UpdateMultipleCollections

// ==============================
// =====  CHECK COMPRESSION STATUS =====
// ==============================

// START CheckCompressionStatus

const collectionToCheck = client.collections.get("MyCollection")
const configToCheck = await collectionToCheck.config.get()

// Check if this is a legacy collection (no named vectors)
if (configToCheck.vectorConfig && Object.keys(configToCheck.vectorConfig).length > 0) {
    // Named vectors - iterate through vectorConfig
    for (const [vectorName, vectorConfig] of Object.entries(configToCheck.vectorConfig)) {
        console.log(`\nVector: ${vectorName}`)
        const quantizer = vectorConfig.vectorIndexConfig?.quantizer
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
