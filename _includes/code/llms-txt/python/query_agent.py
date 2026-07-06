"""llms.txt snippet: Query Agent (Cloud only). Section "Python / TypeScript > Query Agent"."""
import os
import weaviate
from weaviate.classes.config import Configure

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=os.environ["WEAVIATE_API_KEY"],
)

# Seed the collections the Query Agent reads from
for name in ("Movies", "Reviews"):
    client.collections.delete(name)
    client.collections.create(name, vector_config=Configure.Vectors.text2vec_weaviate())
client.collections.use("Movies").data.insert_many([
    {"title": "The Matrix", "price": 12},
    {"title": "Blade Runner", "price": 9},
])
client.collections.use("Reviews").data.insert_many([
    {"text": "The Matrix is a great sci-fi film, five stars"},
])

# START llms_query_agent
from weaviate.agents.query import QueryAgent

qa = QueryAgent(client=client, collections=["Movies", "Reviews"])
response = qa.ask("Recommend sci-fi movies with good reviews under $15")
print(response.final_answer)

# Retrieval only (no generation)
search_response = qa.search("sci-fi movies", filtering="recall", limit=5)
# END llms_query_agent

assert response.final_answer
client.collections.delete("Movies")
client.collections.delete("Reviews")
client.close()
