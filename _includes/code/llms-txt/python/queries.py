"""llms.txt snippet: queries (near_text, bm25). Section "Python / TypeScript > Queries"."""
import weaviate
from weaviate.classes.config import Configure

client = weaviate.connect_to_local()

client.collections.delete("Movie")
client.collections.create(
    "Movie",
    vector_config=Configure.Vectors.text2vec_ollama(api_endpoint="http://ollama:11434", model="nomic-embed-text"),
)
col = client.collections.use("Movie")
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
client.collections.delete("Movie")
client.close()
