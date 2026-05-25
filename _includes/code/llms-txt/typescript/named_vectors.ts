// llms.txt snippet: named vectors. Section "Python / TypeScript > Named vectors".
import weaviate, { vectors, dataType } from 'weaviate-client';

const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL!, {
  authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
});
await client.collections.delete('Article__NvTs');

// START llms_named_vectors
await client.collections.create({
  name: 'Article__NvTs',
  vectorizers: [
    vectors.text2VecWeaviate({ name: 'title', sourceProperties: ['title'] }),
    vectors.text2VecWeaviate({ name: 'body', sourceProperties: ['body'] }),
  ],
  properties: [
    { name: 'title', dataType: dataType.TEXT },
    { name: 'body', dataType: dataType.TEXT },
  ],
});
const col = client.collections.use('Article__NvTs');
const res = await col.query.nearText('machine learning', { targetVector: 'title', limit: 3 });
// END llms_named_vectors

await col.data.insert({ title: 'Deep learning advances', body: 'A study of neural networks.' });
await new Promise((r) => setTimeout(r, 2000));
const res2 = await col.query.nearText('machine learning', { targetVector: 'title', limit: 3 });
if (res2.objects.length !== 1) throw new Error('expected 1 article');
await client.collections.delete('Article__NvTs');
await client.close();
