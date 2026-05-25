"""llms.txt snippet: multi-tenancy. Section "Python / TypeScript > Multi-tenancy"."""
import os
import weaviate
from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)
client.collections.delete("Docs__MtPy")

# START llms_multi_tenancy
from weaviate.classes.config import Configure
from weaviate.classes.tenants import Tenant

client.collections.create(
    "Docs__MtPy",
    vector_config=Configure.Vectors.text2vec_weaviate(),
    multi_tenancy_config=Configure.multi_tenancy(enabled=True),
)
col = client.collections.use("Docs__MtPy")
col.tenants.create([Tenant(name="tenantA"), Tenant(name="tenantB")])
tenant_col = col.with_tenant("tenantA")
tenant_col.data.insert({"title": "Hello"})
res = tenant_col.query.hybrid("hello", limit=3)
# END llms_multi_tenancy

assert len(res.objects) == 1
assert len(col.tenants.get()) == 2
client.collections.delete("Docs__MtPy")
client.close()
