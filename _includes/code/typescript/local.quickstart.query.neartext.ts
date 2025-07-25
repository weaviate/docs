// NearText
import weaviate, { WeaviateClient } from 'weaviate-client';

const client: WeaviateClient = await weaviate.connectToLocal();

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
// END NearText
