// CompleteScript // Imports
import weaviate, { WeaviateClient} from 'weaviate-client';
import 'dotenv/config';
// END CompleteScript // END Imports

// CompleteScript
async function main() {
  // define a collection name
  const collectionName = 'RollingStones'
// END CompleteScript
  
// CompleteScript // CreateClient  
  // connect to your Weaviate instance on WCD
  const weaviateURL = process.env.WEAVIATE_URL as string
  const weaviateKey = process.env.WEAVIATE_API_KEY as string
  const openaiKey = process.env.OPENAI_API_KEY as string
  
  const client: WeaviateClient = await weaviate.connectToWeaviateCloud(weaviateURL, {
    authCredentials: new weaviate.ApiKey(weaviateKey),
    headers: {
      'X-OpenAI-Api-Key': openaiKey,  
    }
  })
// END CompleteScript // END CreateClient

// CompleteScript // CreateCollection
  // create a new collection
  await client.collections.create({
    name: collectionName,
    vectorizers: weaviate.configure.vectors.text2VecOpenAI(),
  })
// END CompleteScript // END CreateCollection

// CompleteScript
  const response = await fetch('https://raw.githubusercontent.com/weaviate/weaviate-io/tsdocs/content-fixes/_includes/clients/songs.json')
// END CompleteScript

// CompleteScript  // BatchInsert
  // define a collection to interact with 
  const myCollection = client.collections.use(collectionName)

  // bulk insert data to your collection
  await myCollection.data.insertMany(await response.json())
// END CompleteScript  // END BatchInsert

// CompleteScript  // RunAQuery
  // run a nearText search; limit 2 results; show distance metrics
  const queryResponse = await myCollection.query.nearText('songs about cowboys',{
    limit: 2,
    returnMetadata: ['distance']
  })

  console.log('Here are songs about cowboys: ', queryResponse.objects)
// END CompleteScript  // END RunAQuery

// CompleteScript  // DeleteCollection
  // delete your collection
  await client.collections.delete(collectionName)

  console.log('Collection Exists:', await client.collections.exists(collectionName))
}
// END CompleteScript  // END DeleteCollection

// CompleteScript
main()
// END CompleteScript