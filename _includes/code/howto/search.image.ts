// How-to: Search -> Image search - TypeScript examples
// Run with: node --loader=ts-node/esm search.image.ts

// This test requires the Dogs image collection to have been imported. Check out the https://github.com/weaviate/weaviate-examples repo
// and follow the steps at https://github.com/weaviate/weaviate-examples/tree/main/nearest-neighbor-dog-searchpython create-schema.py.
// For multi2vec-clip, change in `create-schema.py` the vectorizer and its moduleConfig from `img2vec-neural` to multi2vec-clip.


import assert from 'assert';
let result

// =================================================
// ===== Helper functions to convert to base64 =====
// =================================================

// START helper base64 functions
const imageURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deutsches_Museum_Portrait_4.jpg/500px-Deutsches_Museum_Portrait_4.jpg'

async function urlToBase64(imageUrl: string) {
  const response = await fetch(imageUrl);
  const content = await response.buffer();
  return content.toString('base64');
}

const base64 = await urlToBase64(imageURL)
console.log(base64)
// END helper base64 functions


// Helper function – get base64 representation from a local file
// This example is for NodeJS
const fileToBase64 = (file: string) => {
  return readFileSync(file, { encoding: 'base64' });
}
console.log(fileToBase64('./your-image-here.jpg'))

// ===========================================
// ===== Search by base64 representation =====
// ===========================================

import weaviate from 'weaviate-client';
import fetch from 'node-fetch';
import fs from 'fs';

const client = await weaviate.connectToWeaviateCloud(
  'WEAVIATE_URL',
  {
    authCredentials: new weaviate.ApiKey('WEAVIATE_API_KEY'),
    headers: {
      'X-OpenAI-Api-Key': 'OPENAI_API_KEY',  // Replace with your inference API key
    }
  }
)

const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Welchcorgipembroke.JPG/640px-Welchcorgipembroke.JPG'

// Fetch URL into `content` variable
const response = await fetch(imageUrl);
const content = await response.buffer();

{
  // START search with base64
  import { toBase64FromMedia } from 'weaviate-client';

  const myCollection = client.collections.use('Dog');
  const filePath = './images/search-image.jpg'
  // highlight-start
  const base64String = await toBase64FromMedia(file.path)
  // highlight-end

  // Perform query
  // highlight-start
  const result = await myCollection.query.nearImage(base64String, {
    returnProperties: ['breed'],
    limit: 1,
    // targetVector: 'vector_name' // required when using multiple named vectors
  })
    // highlight-end

  console.log(JSON.stringify(result.objects, null, 2));
  // END search with base64

  // Tests
  // assert.deepEqual(result.data['Get']['Dog'], [{ 'breed': 'Corgi' }]);
}

{
  // START search with Blob
  // Perform query
  const myCollection = client.collections.use('Dog');

  // highlight-start
  const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Welchcorgipembroke.JPG/640px-Welchcorgipembroke.JPG'
  const response = await fetch(url);
  const blob = await response.buffer();
  // highlight-end

  // highlight-start
  const result = await myCollection.query.nearImage(blob, {
    // highlight-end
    returnProperties: ['breed'],
    limit: 1,
    // targetVector: 'vector_name' // required when using multiple named vectors
  })

  console.log(JSON.stringify(result.objects, null, 2));
  // END search with Blob

  // Tests
  // assert.deepEqual(result.data['Get']['Dog'], [{ 'breed': 'Corgi' }]);
}

// ====================================
// ===== Search by image filename =====
// ====================================
fs.writeFileSync('image.jpg', content);
{
  // START ImageFileSearch
  const myCollection = client.collections.use('Dog');

  // Query based on the image content
  const result = await myCollection.query.nearImage('./images/search-image.jpg', {
    returnProperties: ['breed'],
    limit: 1,
    // targetVector: 'vector_name' // required when using multiple named vectors
  })

  console.log(JSON.stringify(result.objects, null, 2));
  // END ImageFileSearch
}

// Tests
assert.deepEqual(result.data['Get']['Dog'], [{ 'breed': 'Corgi' }]);


// ============================
// ===== Maximum distance =====
// ============================

// START Distance
result = await client.graphql
  .get()
  .withClassName('Dog')
  .withNearImage({
    image: base64String,
    // highlight-start
    distance: 0.2,
    // highlight-end
  })
  // highlight-start
  .withFields('breed _additional { distance }')
  // highlight-end
  .do();

console.log(JSON.stringify(result, null, 2));
// END Distance

// Tests
assert.equal(result.data['Get']['Dog'][0]['breed'], 'Corgi');

const displayRes = `
// START Expected base64 results
[{
  metadata: {},
  properties: { name: '000ada55d36b4bcb.jpg' },
  references: undefined,
  uuid: 'd2528234-1576-4033-b17f-081fe051bee0',
  vectors: {}
}]
// END Expected base64 results
`
