"""llms.txt snippet: generative search (DIY RAG). Section "Python / TypeScript > Generative search"."""
import os
import time
import weaviate
from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
    headers={"X-OpenAI-Api-Key": os.environ["OPENAI_API_KEY"]},
)
client.collections.delete("Movie__GenPy")

# START llms_generative_config
from weaviate.classes.config import Configure

# Attach a generative model to the collection
client.collections.create(
    "Movie__GenPy",
    vector_config=Configure.Vectors.text2vec_weaviate(),
    generative_config=Configure.Generative.openai(),
)
# END llms_generative_config

movies = client.collections.use("Movie__GenPy")
movies.data.insert_many([
    {"title": "The Matrix", "genre": "Science Fiction"},
    {"title": "Blade Runner", "genre": "Science Fiction"},
])
time.sleep(3)  # wait for vectorization/indexing before querying

# START llms_generative_query
# A single prompt applied per retrieved object
res = movies.generate.near_text(
    "science fiction",
    limit=2,
    single_prompt="Write a one-line tagline for {title}",
)
for obj in res.objects:
    print(obj.generative.text)

# One grouped prompt applied across all retrieved objects
res = movies.generate.near_text(
    "science fiction",
    limit=2,
    grouped_task="In one sentence, what common theme do these movies share?",
)
print(res.generative.text)
# END llms_generative_query

assert res.generative.text is not None
client.collections.delete("Movie__GenPy")
client.close()
