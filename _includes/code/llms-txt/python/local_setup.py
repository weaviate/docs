"""llms.txt snippet: local setup with text2vec-ollama. Section "Quickstart > Local"."""

# Test setup (not part of the docs snippet): a prior crashed or concurrent run
# may leave the "Movie" collection behind, which would make the create below
# fail with 422 "class name Movie already exists". Ensure a clean slate first.
import weaviate as _setup_weaviate

_setup_client = _setup_weaviate.connect_to_local()
if _setup_client.collections.exists("Movie"):
    _setup_client.collections.delete("Movie")
_setup_client.close()

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
