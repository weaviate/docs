"""llms.txt snippet: multi-tenancy. Section "Python / TypeScript > Multi-tenancy"."""
import weaviate

client = weaviate.connect_to_local()
client.collections.delete("Docs")

# START llms_multi_tenancy
from weaviate.classes.config import Configure
from weaviate.classes.tenants import Tenant

client.collections.create(
    "Docs",
    vector_config=Configure.Vectors.text2vec_ollama(api_endpoint="http://ollama:11434", model="nomic-embed-text"),
    multi_tenancy_config=Configure.multi_tenancy(enabled=True),
)
col = client.collections.use("Docs")
col.tenants.create([Tenant(name="tenantA"), Tenant(name="tenantB")])
tenant_col = col.with_tenant("tenantA")
tenant_col.data.insert({"title": "Hello"})
res = tenant_col.query.hybrid("hello", limit=3)
# END llms_multi_tenancy

assert len(res.objects) == 1
assert len(col.tenants.get()) == 2
client.collections.delete("Docs")
client.close()
