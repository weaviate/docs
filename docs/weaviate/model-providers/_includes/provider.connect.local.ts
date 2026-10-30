// START-ANY
import weaviate from '@weaviate/node'

const client = await weaviate.connectToLocal()

// Work with Weaviate

client.close()
// END-ANY

