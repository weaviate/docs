// START ConnectToWeaviate
import weaviate, { WeaviateClient} from 'weaviate-client'

// END ConnectToWeaviate
// START ColBERTCollectionConfig  // START UserEmbeddingCollectionConfig
import { generateUuid5, vectors, configure, dataType } from 'weaviate-client'

// END ColBERTCollectionConfig  // END UserEmbeddingCollectionConfig

// START ColBERTCheckEmbeddings // START ColBERTNearText // START ColBERTHybrid // START ColBERTVector // START UserEmbeddingHybrid // START ColBERTManualHybrid
let response;

// END ColBERTCheckEmbeddings // END ColBERTNearText // END ColBERTHybrid // END ColBERTVector // END UserEmbeddingHybrid // END ColBERTManualHybrid

// START ConnectToWeaviate
// Recommended: save sensitive data as environment variables
const jinaaiKey = process.env.JINA_AI_API_KEY as string

// Connect to Weaviate
const client: WeaviateClient = await weaviate.connectToLocal({
    headers: {
     'X-JinaAI-Api-Key': jinaaiKey,  // Replace with your inference API key
   }
 }
)
// END ConnectToWeaviate

// START ObtainColBERTEmbedding
async function getColbertEmbedding(sourceText: string) {
    // As shown in https://jina.ai/api-dashboard/embedding
    // For this example, this only retrieves one embedding at a time
    
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jinaaiKey}`,
    };

    const data = {
        "model": "jina-colbert-v2",
        "dimensions": 128,
        "input_type": "document",
        "embedding_type": "float",
        "input": [sourceText],
    };

    try {
        const response = await fetch("https://api.jina.ai/v1/multi-vector", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const embedding = responseData.data[0].embeddings;
        return embedding;
    } catch (error) {
        console.error("Error fetching embedding:", error);
        throw error;
    }
}
// END ObtainColBERTEmbedding

// START ColBERTCollectionConfig  // START UserEmbeddingCollectionConfig
const collectionName = "DemoCollection"

// END ColBERTCollectionConfig  // END UserEmbeddingCollectionConfig

// Clean slate - delete the collection if it already exists
await client.collections.delete(collectionName)

// START ColBERTCollectionConfig
await client.collections.create({
    name: collectionName,
    vectorizers: [
        // highlight-start
        // ColBERT vectorizer
        configure.multiVectors.text2VecJinaAI({
            name: "multi_vector",
            sourceProperties: ["text"],
            model: "jina-colbert-v2"
        })
        // highlight-end
    ],
    properties: [
        { name: "text", dataType: dataType.TEXT },
        { name: "docid", dataType: dataType.TEXT },
    ],
    // Additional parameters not shown
})
// END ColBERTCollectionConfig

// START ColBERTImport // START UserEmbeddingImport
// An example dataset
const documents = [
    {"id": "doc1", "text": "Weaviate is a vector database that is great for AI app builders."},
    {"id": "doc2", "text": "PyTorch is a deep learning framework that is great for AI model builders."},
    {"id": "doc3", "text": "For people building AI driven products, Weaviate is a good database for their tech stack."},
]

const collection = client.collections.use(collectionName)
// END ColBERTImport // END UserEmbeddingImport
// START ColBERTImport 

for (const document of documents) {
    const result = await collection.data.insert({
        uuid: generateUuid5(document.id),
        properties: {
          text: document.text,
          docid: document.id,
        },
    })
}

const fetchResponse = await collection.query.fetchObjects()


console.log(fetchResponse.objects.length)  // This should print `3``
// END ColBERTImport // END UserEmbeddingImport


// START ColBERTCheckEmbeddings
response = await collection.query.fetchObjects({ limit: 3, includeVector: true })

console.log(`Embedding data type: ${typeof response.objects[0].vectors['multi_vector']}`);
console.log(`Embedding first element type: ${typeof response.objects[0].vectors['multi_vector'][0]}`);

for (let i = 0; i < 3; i++) {
    // Inspect the shape of the fetched embeddings
    console.log(`This embedding's shape is (${response.objects[i].vectors['multi_vector'].length}, ${response.objects[i].vectors['multi_vector'][0].length})`);
}

// END ColBERTCheckEmbeddings

// START ColBERTNearText
response = await collection.query.nearText("A good database for AI app builders", {
    targetVector: "multi_vector",
})

for (const result of response.objects) {
    console.log(result.properties)
}
// END ColBERTNearText

// START ColBERTHybrid
response = await collection.query.hybrid("A good database for AI app builders", {
    targetVector: "multi_vector",
})

for (const result of response.objects) {
    console.log(result.properties)
}
// END ColBERTHybrid

// START ColBERTVector
response = await collection.query.nearVector( 
    await getColbertEmbedding("A good database for AI app builders"),  // Raw ColBERT embedding, in [[e11, e12, e13, ...], [e21, e22, e23, ...], ...] shape
    { targetVector: "multi_vector",
})

for (const result of response.objects) {
    console.log(result.properties)
}
// END ColBERTVector

// START ColBERTManualHybrid
response = await collection.query.hybrid("A good database for AI app builders", {
    vector: await getColbertEmbedding("A good database for AI app builders"),
    targetVector: "multi_vector",
})

for (const result of response.objects) {
    console.log(result.properties)
}
// END ColBERTManualHybrid

// Clean slate - delete the collection if it already exists
await client.collections.delete(collectionName)

// START UserEmbeddingCollectionConfig
await client.collections.create({
    name: collectionName,
    vectorizers: [
        // highlight-start
        // User-provided embeddings
        configure.multiVectors.selfProvided({
            name: "multi_vector",
        }),
        // highlight-end
    ],
    properties: [
        { name: "text", dataType: dataType.TEXT },
        { name: "docid", dataType: dataType.TEXT },
    ],
    // Additional parameters not shown
})
// END UserEmbeddingCollectionConfig

// START UserEmbeddingImport
for (const document of documents) {
    const result = await collection.data.insert({
        uuid: generateUuid5(document.id),
        properties: {
          text: document.text,
          docid: document.id,
        },
        vectors: {
            multi_vector: await getColbertEmbedding(document.text),
        }
    })
}

const userVectorFetchResponse = await collection.query.fetchObjects()


console.log(userVectorFetchResponse.objects.length)  // This should print `3``
// END UserEmbeddingImport


// START UserEmbeddingHybrid
response = await collection.query.hybrid("A good database for AI app builders", {
        vector: await getColbertEmbedding("A good database for AI app builders"),  // Or any other raw ColBERT embedding
        targetVector: "multi_vector",
    }
)

for (const result of response.objects) {
    console.log(result.properties)
}
// END UserEmbeddingHybrid

client.close()
