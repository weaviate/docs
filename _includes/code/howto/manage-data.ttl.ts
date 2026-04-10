// How-to: Manage-data -> TTL - TypeScript examples
// Requires OBJECTS_TTL_DELETE_SCHEDULE set to a frequent interval (e.g. "*/10 * * * * *")
// and OBJECTS_TTL_ALLOW_SECONDS=true on the Weaviate instance.
import assert from 'assert';
import weaviate from 'weaviate-client';
import { configure, dataType } from 'weaviate-client';

const client = await weaviate.connectToLocal();

async function waitForCount(collection: any, expectedCount: number, timeout = 70000, pollInterval = 5000): Promise<number> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const result = await collection.aggregate.overAll();
    if (result.totalCount === expectedCount) return result.totalCount;
    await new Promise(r => setTimeout(r, pollInterval));
  }
  const result = await collection.aggregate.overAll();
  return result.totalCount;
}

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

// Verify creation time TTL config
let collection = client.collections.use('CollectionWithTTL');
let config = await collection.config.get();
assert.equal(config.objectTTL.enabled, true);
assert.equal(config.objectTTL.deleteOn, '_creationTimeUnix');
assert.equal(config.objectTTL.defaultTTLSeconds, 3600);
assert.equal(config.objectTTL.filterExpiredObjects, true);

// Add an object and verify it exists
await collection.data.insert({ referenceDate: new Date().toISOString() });
let agg = await collection.aggregate.overAll();
assert.equal(agg.totalCount, 1);

// Verify deletion: recreate with minimum TTL (60s), insert, and wait for expiry
await client.collections.delete('CollectionWithTTL');
await client.collections.create({
  name: 'CollectionWithTTL',
  properties: [{ name: 'referenceDate', dataType: dataType.DATE }],
  objectTTL: configure.objectTTL.deleteByCreationTime({ defaultTTLSeconds: 60 }),
});
collection = client.collections.use('CollectionWithTTL');
await collection.data.insert({ referenceDate: new Date().toISOString() });
agg = await collection.aggregate.overAll();
assert.equal(agg.totalCount, 1);
let count = await waitForCount(collection, 0);
assert.equal(count, 0, `Expected 0 objects after creation time TTL, got ${count}`);

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

// Verify update time TTL config
collection = client.collections.use('CollectionWithTTL');
config = await collection.config.get();
assert.equal(config.objectTTL.enabled, true);
assert.equal(config.objectTTL.deleteOn, '_lastUpdateTimeUnix');
assert.equal(config.objectTTL.defaultTTLSeconds, 864000);
assert.equal(config.objectTTL.filterExpiredObjects, true);

// Add an object and verify it exists
await collection.data.insert({ referenceDate: new Date().toISOString() });
agg = await collection.aggregate.overAll();
assert.equal(agg.totalCount, 1);

// Verify deletion: recreate with minimum TTL (60s), insert, and wait for expiry
await client.collections.delete('CollectionWithTTL');
await client.collections.create({
  name: 'CollectionWithTTL',
  properties: [{ name: 'referenceDate', dataType: dataType.DATE }],
  objectTTL: configure.objectTTL.deleteByUpdateTime({ defaultTTLSeconds: 60, filterExpiredObjects: true }),
});
collection = client.collections.use('CollectionWithTTL');
await collection.data.insert({ referenceDate: new Date().toISOString() });
agg = await collection.aggregate.overAll();
assert.equal(agg.totalCount, 1);
count = await waitForCount(collection, 0);
assert.equal(count, 0, `Expected 0 objects after update time TTL, got ${count}`);

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

// Verify date property TTL config
collection = client.collections.use('CollectionWithTTL');
config = await collection.config.get();
assert.equal(config.objectTTL.enabled, true);
assert.equal(config.objectTTL.deleteOn, 'referenceDate');
assert.equal(config.objectTTL.defaultTTLSeconds, 300);

// Add an object with a future date and verify it exists
const futureDate = new Date(Date.now() + 3600000).toISOString();  // 1 hour from now
await collection.data.insert({ referenceDate: futureDate });
agg = await collection.aggregate.overAll();
assert.equal(agg.totalCount, 1);

// Verify deletion: recreate with ttl_offset=0, insert object expiring in 60s, and wait
await client.collections.delete('CollectionWithTTL');
await client.collections.create({
  name: 'CollectionWithTTL',
  properties: [{ name: 'expiresAt', dataType: dataType.DATE }],
  objectTTL: configure.objectTTL.deleteByDateProperty({
    property: 'expiresAt',
    defaultTTLSeconds: 0,
    filterExpiredObjects: true,
  }),
});
collection = client.collections.use('CollectionWithTTL');
const expires = new Date(Date.now() + 60000).toISOString();  // 60 seconds from now
await collection.data.insert({ expiresAt: expires });
agg = await collection.aggregate.overAll();
assert.equal(agg.totalCount, 1);
count = await waitForCount(collection, 0);
assert.equal(count, 0, `Expected 0 objects after date property TTL, got ${count}`);

// Clean up
await client.collections.delete('CollectionWithTTL');

client.close();
