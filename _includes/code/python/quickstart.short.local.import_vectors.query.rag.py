# START RAG
import weaviate
from weaviate.classes.generate import GenerativeConfig

# Step 2.1: Connect to your local Weaviate instance
with weaviate.connect_to_local() as client:

    # Step 2.2: Use this collection
    movies = client.collections.use("Movie")

    # Step 2.3: Perform RAG with on NearVector results
    # highlight-start
    response = movies.generate.near_vector(
        near_vector=[0.11, 0.21, 0.31, 0.41, 0.51, 0.61, 0.71, 0.81],
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
