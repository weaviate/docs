"""llms.txt snippet: queries (near_text, bm25). Section "Python / TypeScript > Queries"."""
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)

client.collections.delete("Movie__QueriesPy")
client.collections.create(
    "Movie__QueriesPy",
    vector_config=Configure.Vectors.text2vec_weaviate(),
)
col = client.collections.use("Movie__QueriesPy")
col.data.insert_many([
    {"title": "The animals of the savannah"},
    {"title": "A bowl of ramen and other street food"},
])

# START llms_queries
from weaviate.classes.query import MetadataQuery
# Vector search
res = col.query.near_text("animals in movies", limit=3, return_metadata=MetadataQuery(distance=True))
# Keyword search
res = col.query.bm25("food", limit=3, return_metadata=MetadataQuery(score=True))
# END llms_queries

assert len(res.objects) >= 1
client.collections.delete("Movie__QueriesPy")
client.close()
