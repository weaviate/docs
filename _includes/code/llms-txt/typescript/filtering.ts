// llms.txt snippet: filtering. Section "Python / TypeScript > Filtering".
import weaviate, { vectors, dataType, Filters } from 'weaviate-client';

const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL!, {
  authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
});
await client.collections.delete('Restaurant__FilteringTs');

// START llms_filtering_create_minimal
import { vectors } from 'weaviate-client';

// Minimal: auto-schema sets filterable + searchable defaults on every property
await client.collections.create({
  name: 'Restaurant__FilteringTs',
  vectorizers: vectors.text2VecWeaviate(),
});
// END llms_filtering_create_minimal

await client.collections.delete('Restaurant__FilteringTs');

// START llms_filtering_create_full
import { vectors, dataType } from 'weaviate-client';

// Full control: all options set explicitly
await client.collections.create({
  name: 'Restaurant__FilteringTs',
  vectorizers: vectors.text2VecWeaviate(),
  properties: [
    { name: 'name', dataType: dataType.TEXT, tokenization: 'word',
      indexFilterable: true, indexSearchable: true },
    { name: 'cuisine', dataType: dataType.TEXT, tokenization: 'field',
      indexFilterable: true, indexSearchable: true },
    { name: 'url', dataType: dataType.TEXT, tokenization: 'field',
      skipVectorization: true, indexSearchable: false },
    { name: 'price', dataType: dataType.NUMBER, indexRangeFilters: true },
  ],
});
// END llms_filtering_create_full

const col = client.collections.use('Restaurant__FilteringTs');
await col.data.insertMany([
  { name: 'Ramen House', cuisine: 'Japanese', url: 'https://a.example', price: 15 },
  { name: 'Sushi Bar', cuisine: 'Japanese', url: 'https://b.example', price: 25 },
  { name: 'Pasta Place', cuisine: 'Italian', url: 'https://c.example', price: 40 },
]);

// START llms_filtering_query
import { Filters } from 'weaviate-client';

// Single condition
const cheapRamen = await col.query.hybrid('ramen', {
  filters: col.filter.byProperty('price').lessThan(20), limit: 3,
});

// Combine with Filters.and / Filters.or
const japaneseUnder30 = await col.query.fetchObjects({
  filters: Filters.and(
    col.filter.byProperty('cuisine').equal('Japanese'),
    col.filter.byProperty('price').lessThan(30),
  ),
  limit: 5,
});
// END llms_filtering_query

if (japaneseUnder30.objects.length !== 2) throw new Error(`expected 2, got ${japaneseUnder30.objects.length}`);
await client.collections.delete('Restaurant__FilteringTs');
await client.close();
