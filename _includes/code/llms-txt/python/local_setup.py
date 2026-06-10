"""llms.txt snippet: local setup with text2vec-ollama. Section "Quickstart > Local"."""

# START llms_local_setup
import weaviate
from weaviate.classes.config import Configure

client = weaviate.connect_to_local()
client.collections.create(
    "Movie",
    vector_config=Configure.Vectors.text2vec_ollama(
        api_endpoint="http://ollama:11434",  # or http://host.docker.internal:11434
        model="nomic-embed-text",
    ),
)
# END llms_local_setup

assert client.collections.exists("Movie")
client.collections.delete("Movie")
client.close()
