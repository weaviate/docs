// llms.txt snippet: multi-tenancy. Section "Python / TypeScript > Multi-tenancy".
import weaviate, { vectors, configure } from 'weaviate-client';

const client = await weaviate.connectToLocal();
await client.collections.delete('Docs');

// START llms_multi_tenancy
await client.collections.create({
  name: 'Docs',
  vectorizers: vectors.text2VecOllama({ apiEndpoint: 'http://ollama:11434', model: 'nomic-embed-text' }),
  multiTenancy: configure.multiTenancy({ enabled: true }),
});
const col = client.collections.use('Docs');
await col.tenants.create([{ name: 'tenantA' }, { name: 'tenantB' }]);
const tenantCol = col.withTenant('tenantA');
await tenantCol.data.insert({ title: 'Hello' });
const res = await tenantCol.query.hybrid('hello', { limit: 3 });
// END llms_multi_tenancy

if (res.objects.length !== 1) throw new Error('expected 1 tenant object');
await client.collections.delete('Docs');
await client.close();
