// Import
import weaviate, { WeaviateClient } from 'weaviate-client';

const client: WeaviateClient = await weaviate.connectToLocal();

// Load data
async function getJsonData() {
  const file = await fetch(
    'https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json'
  );
  return file.json();
}

async function importQuestions() {
  const questions = client.collections.use('Question');
  const data = await getJsonData();

  // highlight-start
  // `ingest` imports the list using server-side batching
  const result = await questions.data.ingest(
    data.map((properties) => ({ properties }))
  );
  // highlight-end

  if (result.hasErrors) {
    console.log(`Number of failed imports: ${Object.keys(result.errors).length}`);
    // `errors` is keyed by the position of the object in the input
    for (const [index, error] of Object.entries(result.errors)) {
      console.log(`Failed object at index ${index}: ${error.message}`);
    }
  }
}

await importQuestions();

client.close(); // Close the client connection
// END Import
