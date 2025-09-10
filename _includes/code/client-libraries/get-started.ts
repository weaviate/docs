// START GetStarted
import weaviate, { WeaviateClient, vectors } from 'weaviate-client';

const client: WeaviateClient = await weaviate.connectToLocal();

// highlight-start
await client.collections.create({
    name: 'Question',
    vectorizers: vectors.text2VecOllama({              // Configure the Ollama embedding integration
        apiEndpoint: 'http://host.docker.internal:11434',   // Allow Weaviate from within a Docker container to contact your Ollama instance
        model: 'nomic-embed-text',                          // The model to use
    }),
});
// highlight-end

// Load data
async function getJsonData() {
    const file = await fetch(
        'https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json'
    );
    return file.json();
}

// highlight-start
// Note: The TS client does not have a `batch` method yet
// We use `insertMany` instead, which sends all of the data in one request
async function importQuestions() {
    const questions = client.collections.use('Question');
    const data = await getJsonData();
    const result = await questions.data.insertMany(data);
    console.log('Insertion response: ', result);
}

await importQuestions();
// highlight-end

// highlight-start
const questions = client.collections.use('Question');

const result = await questions.query.nearText('biology', {
    limit: 2,
});
// highlight-end

result.objects.forEach((item) => {
    console.log(JSON.stringify(item.properties, null, 2));
});

client.close(); // Close the client connection
// END GetStarted
