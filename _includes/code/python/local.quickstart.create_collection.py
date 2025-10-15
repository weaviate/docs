# CreateCollection
import weaviate
from weaviate.classes.config import Configure

client = weaviate.connect_to_local()

# END CreateCollection

# NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
client.collections.delete("Question")

# CreateCollection
# highlight-start
questions = client.collections.create(
    name="Question",
    vector_config=Configure.Vectors.text2vec_ollama(  # Configure the Ollama embedding integration
        api_endpoint="http://ollama:11434",  # If using Docker you might need: http://host.docker.internal:11434
        model="nomic-embed-text",  # The model to use
    ),
)
# highlight-end
# CreateCollection

client.close()  # Free up resources
# END CreateCollection
