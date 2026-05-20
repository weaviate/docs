// llms.txt snippet: named vectors. Section "Python / TypeScript > Named vectors".
import weaviate, { vectors, dataType } from 'weaviate-client';

const client = await weaviate.connectToLocal();
await client.collections.delete('Article');

// START llms_named_vectors
await client.collections.create({
  name: 'Article',
  vectorizers: [
    vectors.text2VecOllama({ name: 'title', sourceProperties: ['title'], apiEndpoint: 'http://ollama:11434', model: 'nomic-embed-text' }),
    vectors.text2VecOllama({ name: 'body', sourceProperties: ['body'], apiEndpoint: 'http://ollama:11434', model: 'nomic-embed-text' }),
  ],
  properties: [
    { name: 'title', dataType: dataType.TEXT },
    { name: 'body', dataType: dataType.TEXT },
  ],
});
const col = client.collections.use('Article');
const res = await col.query.nearText('machine learning', { targetVector: 'title', limit: 3 });
// END llms_named_vectors

await col.data.insert({ title: 'Deep learning advances', body: 'A study of neural networks.' });
await new Promise((r) => setTimeout(r, 2000));
const res2 = await col.query.nearText('machine learning', { targetVector: 'title', limit: 3 });
if (res2.objects.length !== 1) throw new Error('expected 1 article');
await client.collections.delete('Article');
await client.close();
