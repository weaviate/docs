// How-to: Manage-data -> TTL - TypeScript examples
import weaviate from 'weaviate-client';
import { configure, dataType } from 'weaviate-client';

const client = await weaviate.connectToLocal();

await client.collections.delete('CollectionWithTTL');

// START TTLByCreationTime
await client.collections.create({
  name: 'CollectionWithTTL',
  properties: [
    { name: 'referenceDate', dataType: dataType.DATE },
  ],
  objectTTL: configure.objectTTL.deleteByCreationTime({
    defaultTTLSeconds: 3600,  // 1 hour
    filterExpiredObjects: true,  // Optional: automatically filter out expired objects from queries
  }),
});
// END TTLByCreationTime

await client.collections.delete('CollectionWithTTL');

// START TTLByUpdateTime
await client.collections.create({
  name: 'CollectionWithTTL',
  properties: [
    { name: 'referenceDate', dataType: dataType.DATE },
  ],
  objectTTL: configure.objectTTL.deleteByUpdateTime({
    defaultTTLSeconds: 864000,  // 10 days
    filterExpiredObjects: true,  // Optional: automatically filter out expired objects from queries
  }),
});
// END TTLByUpdateTime

await client.collections.delete('CollectionWithTTL');

// START TTLByDateProperty
await client.collections.create({
  name: 'CollectionWithTTL',
  properties: [
    { name: 'referenceDate', dataType: dataType.DATE },
  ],
  objectTTL: configure.objectTTL.deleteByDateProperty({
    property: 'referenceDate',
    defaultTTLSeconds: 300,  // 5 minutes offset
  }),
});
// END TTLByDateProperty

client.close();
