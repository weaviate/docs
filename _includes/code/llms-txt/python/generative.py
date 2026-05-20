"""llms.txt snippet: generative search (DIY RAG). Section "Python / TypeScript > Generative search"."""
import time
import weaviate
from weaviate.classes.config import Configure
from weaviate.classes.init import AdditionalConfig, Timeout

# Local Ollama generation is CPU-bound, so allow a generous query timeout
client = weaviate.connect_to_local(
    additional_config=AdditionalConfig(timeout=Timeout(query=180, insert=180)),
)
client.collections.delete("Movie")

# START llms_generative_config
from weaviate.classes.config import Configure

# Attach a generative model to the collection
client.collections.create(
    "Movie",
    vector_config=Configure.Vectors.text2vec_ollama(api_endpoint="http://ollama:11434", model="nomic-embed-text"),
    generative_config=Configure.Generative.ollama(api_endpoint="http://ollama:11434", model="llama3.2"),
)
# END llms_generative_config

movies = client.collections.use("Movie")
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
client.collections.delete("Movie")
client.close()
