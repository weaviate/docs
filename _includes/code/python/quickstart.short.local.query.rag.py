import time
# START RAG
import weaviate
from weaviate.classes.generate import GenerativeConfig

# Step 2.1: Connect to your local Weaviate instance
with weaviate.connect_to_local() as client:
    # END RAG
    time.sleep(0.2)
    # START RAG

    # Step 2.2: Use this collection
    movies = client.collections.use("Movie")

    # Step 2.3: Perform RAG with on NearText results
    # highlight-start
    response = movies.generate.near_text(
        query="sci-fi",
        limit=1,
        grouped_task="Write a tweet with emojis about this movie.",
        generative_provider=GenerativeConfig.ollama(  # Configure the Ollama generative integration
            api_endpoint="http://ollama:11434",  # If using Docker you might need: http://host.docker.internal:11434
            model="llama3.2",  # The model to use
        ),
    )
    # highlight-end

    print(response.generative.text)  # Inspect the results
    # END RAG
