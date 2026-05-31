"""llms.txt snippet: named vectors. Section "Python / TypeScript > Named vectors"."""
import os
import time
import weaviate
from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)
client.collections.delete("Article__NvPy")

# START llms_named_vectors
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "Article__NvPy",
    vector_config=[
        Configure.Vectors.text2vec_weaviate(name="title", source_properties=["title"]),
        Configure.Vectors.text2vec_weaviate(name="body", source_properties=["body"]),
    ],
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="body", data_type=DataType.TEXT),
    ],
)
col = client.collections.use("Article__NvPy")
res = col.query.near_text("machine learning", target_vector="title", limit=3)
# END llms_named_vectors

col.data.insert({"title": "Deep learning advances", "body": "A study of neural networks."})
time.sleep(2)
res = col.query.near_text("machine learning", target_vector="title", limit=3)
assert len(res.objects) == 1
client.collections.delete("Article__NvPy")
client.close()
