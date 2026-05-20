// llms.txt snippet: aggregations. Section "Python / TypeScript > Aggregations".
import weaviate, { vectors, dataType } from 'weaviate-client';

const client = await weaviate.connectToLocal();
await client.collections.delete('Movie');
await client.collections.create({
  name: 'Movie',
  vectorizers: vectors.text2VecOllama({ apiEndpoint: 'http://ollama:11434', model: 'nomic-embed-text' }),
  properties: [
    { name: 'title', dataType: dataType.TEXT },
    { name: 'genre', dataType: dataType.TEXT },
    { name: 'rating', dataType: dataType.NUMBER },
  ],
});
const movies = client.collections.use('Movie');
await movies.data.insertMany([
  { title: 'The Matrix', genre: 'Science Fiction', rating: 8.7 },
  { title: 'Spirited Away', genre: 'Animation', rating: 8.6 },
  { title: 'Blade Runner', genre: 'Science Fiction', rating: 8.1 },
]);

// START llms_aggregations
// Total object count
const total = (await movies.aggregate.overAll()).totalCount;

// Numeric metric over a property (mean rating)
const ratingAgg = await movies.aggregate.overAll({
  returnMetrics: movies.metrics.aggregate('rating').number(['mean']),
});

// Group object counts by a property
const byGenre = await movies.aggregate.groupBy.overAll({ groupBy: { property: 'genre' } });
// END llms_aggregations

if (total !== 3) throw new Error(`expected 3 objects, got ${total}`);
if (byGenre.length !== 2) throw new Error('expected 2 genre groups');
await client.collections.delete('Movie');
await client.close();
