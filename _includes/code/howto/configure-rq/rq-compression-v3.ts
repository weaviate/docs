// THIS FILE NEEDS TESTS

// ==============================
// =====  CONNECT =====
// ==============================

import assert from 'assert';
// START EnableRQ // START 1BitEnableRQ // START RQWithOptions // START Uncompressed
import weaviate, { configure } from 'weaviate-client';
// END EnableRQ // END 1BitEnableRQ // END RQWithOptions // END Uncompressed


const client = await weaviate.connectToLocal({
    headers: {
        "X-OpenAI-Api-Key": process.env.OPENAI_API_KEY as string, // Replace with your OpenAI API key
    }
})

await client.isReady()

// ==============================
// =====  EnableRQ =====
// ==============================

await client.collections.delete("MyCollection")

// START EnableRQ

await client.collections.create({
    name: "MyCollection",
    vectorizers: configure.vectors.text2VecOpenAI({
        // highlight-start
        quantizer: configure.vectorIndex.quantizer.rq()
        // highlight-end
    }),
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT }
    ]
})
// END EnableRQ

// ==============================
// =====  EnableRQ 1-BIT ========
// ==============================

await client.collections.delete("MyCollection")

// START 1BitEnableRQ

await client.collections.create({
    name: "MyCollection",
    vectorizers: configure.vectors.text2VecOpenAI({
        // highlight-start
        quantizer: configure.vectorIndex.quantizer.rq({
            bits: 1,
        })
        // highlight-end
    }),
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT }
    ]
})
// END 1BitEnableRQ

// ==============================
// =====  EnableRQ with Options =====
// ==============================

await client.collections.delete("MyCollection")

// START RQWithOptions

await client.collections.create({
    name: "MyCollection",
    vectorizers: configure.vectors.text2VecOpenAI({
        // highlight-start
        quantizer: configure.vectorIndex.quantizer.rq({
            bits: 8,  // Optional: Number of bits
            rescoreLimit: 20,  // Optional: Number of candidates to fetch before rescoring
        }),
        // highlight-end
    }),
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT }
    ],
})
// END RQWithOptions

// =========================
// =====  Uncompressed =====
// =========================

client.collections.delete("MyCollection")

// START Uncompressed

await client.collections.create({
    name: "MyCollection",
    vectorizers: configure.vectors.text2VecOpenAI({
        // highlight-start
        quantizer: configure.vectorIndex.quantizer.none()
        // highlight-end
    }),
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT },
    ],
})
// END Uncompressed

// ==============================
// =====  UPDATE SCHEMA =====
// ==============================

client.collections.delete("MyCollection")
client.collections.create({
    name: "MyCollection",
    vectorizers: configure.vectors.text2VecOpenAI({
        // highlight-start
        quantizer: configure.vectorIndex.quantizer.none(),
        // highlight-end
}),
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT },
    ],
})

// START UpdateSchema // START 1BitUpdateSchema
import { reconfigure } from 'weaviate-client';

const collection = client.collections.use("MyCollection")
// END UpdateSchema // END 1BitUpdateSchema
// START UpdateSchema

await collection.config.update({
    vectorizers: [ reconfigure.vectors.update({
        name: "default",
        vectorIndexConfig: reconfigure.vectorIndex.hnsw({
            quantizer: reconfigure.vectorIndex.quantizer.rq(),
        }),
    })]
})
// END UpdateSchema

// ================================
// =====  UPDATE SCHEMA 1-BIT =====
// ================================

client.collections.delete("MyCollection")
client.collections.create({
    name: "MyCollection",
    vectorizers: configure.vectors.text2VecOpenAI({
        // highlight-start
        quantizer: configure.vectorIndex.quantizer.none(),
        // highlight-end
    }),
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT },
    ],
})

// START 1BitUpdateSchema

await collection.config.update({
    vectorizers: [ reconfigure.vectors.update({
        name: "default",
        vectorIndexConfig: reconfigure.vectorIndex.hnsw({
            quantizer: reconfigure.vectorIndex.quantizer.rq({ bits: 1 }),
        }),
    })]
})
// END 1BitUpdateSchema

client.close()
