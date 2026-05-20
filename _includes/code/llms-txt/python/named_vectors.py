"""llms.txt snippet: named vectors. Section "Python / TypeScript > Named vectors"."""
import time
import weaviate

client = weaviate.connect_to_local()
client.collections.delete("Article")

# START llms_named_vectors
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "Article",
    vector_config=[
        Configure.Vectors.text2vec_ollama(name="title", source_properties=["title"], api_endpoint="http://ollama:11434", model="nomic-embed-text"),
        Configure.Vectors.text2vec_ollama(name="body", source_properties=["body"], api_endpoint="http://ollama:11434", model="nomic-embed-text"),
    ],
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="body", data_type=DataType.TEXT),
    ],
)
col = client.collections.use("Article")
res = col.query.near_text("machine learning", target_vector="title", limit=3)
# END llms_named_vectors

col.data.insert({"title": "Deep learning advances", "body": "A study of neural networks."})
time.sleep(2)
res = col.query.near_text("machine learning", target_vector="title", limit=3)
assert len(res.objects) == 1
client.collections.delete("Article")
client.close()
