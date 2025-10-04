import time

time.sleep(
    5
)  # Allow Weaviate data import to finish TODO[g-despot]: Implement a better solution to wait for data import to finish
# RAG
import weaviate
from weaviate.classes.generate import GenerativeConfig

client = weaviate.connect_to_local()

questions = client.collections.use("Question")

# highlight-start
response = questions.generate.near_text(
    query="biology",
    limit=2,
    grouped_task="Write a tweet with emojis about these facts.",
    generative_provider=GenerativeConfig.ollama(  # Configure the Ollama generative integration
        api_endpoint="http://ollama:11434",  # If using Docker you might need: http://host.docker.internal:11434
        model="llama3.2",  # The model to use
    ),
)
# highlight-end

print(response.generative.text)  # Inspect the generated text

client.close()  # Free up resources
# END RAG
