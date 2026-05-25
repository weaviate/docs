// llms.txt snippet: multi-tenancy. Section "Python / TypeScript > Multi-tenancy".
import weaviate, { vectors, configure } from 'weaviate-client';

const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL!, {
  authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
});
await client.collections.delete('Docs__MtTs');

// START llms_multi_tenancy
await client.collections.create({
  name: 'Docs__MtTs',
  vectorizers: vectors.text2VecWeaviate(),
  multiTenancy: configure.multiTenancy({ enabled: true }),
});
const col = client.collections.use('Docs__MtTs');
await col.tenants.create([{ name: 'tenantA' }, { name: 'tenantB' }]);
const tenantCol = col.withTenant('tenantA');
await tenantCol.data.insert({ title: 'Hello' });
const res = await tenantCol.query.hybrid('hello', { limit: 3 });
// END llms_multi_tenancy

if (res.objects.length !== 1) throw new Error('expected 1 tenant object');
await client.collections.delete('Docs__MtTs');
await client.close();
