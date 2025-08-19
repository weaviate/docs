// THIS FILE NEEDS TESTS

// ==============================
// =====  CONNECT =====
// ==============================

import assert from 'assert';
import weaviate from 'weaviate-client';
import { configure } from 'weaviate-client';


const client = await weaviate.connectToLocal({
    headers: {
        "X-OpenAI-Api-Key": process.env.OPENAI_API_KEY as  string, // Replace with your OpenAI API key
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
    vectorizers : configure.vectors.text2VecOpenAI({
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
// =====  EnableRQ with Options =====
// ==============================

await client.collections.delete("MyCollection")

// START RQWithOptions

await client.collections.create({
    name: "MyCollection",
    vectorizers: configure.vectors.text2VecOpenAI({
        // highlight-start
        quantizer: configure.vectorIndex.quantizer.rq({
            bits: 8,  // Number of bits, only 8 is supported for now
        }),
        // highlight-end
    }),
    properties: [
        { name: "title", dataType: weaviate.configure.dataType.TEXT }
    ],
})
// END RQWithOptions

client.close()
