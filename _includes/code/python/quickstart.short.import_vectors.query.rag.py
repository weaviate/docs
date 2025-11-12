# START RAG
import os
import weaviate
from weaviate.classes.generate import GenerativeConfig

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]
anthropic_api_key = os.environ["ANTHROPIC_API_KEY"]

# Step 2.1: Connect to your Weaviate Cloud instance
with weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=weaviate_api_key,
    # highlight-start
    headers={"X-Anthropic-Api-Key": anthropic_api_key},
    # highlight-end
) as client:

    # Step 2.2: Use this collection
    movies = client.collections.use("Movie")

    # Step 2.3: Perform RAG with on NearVector results
    # highlight-start
    response = movies.generate.near_vector(
        near_vector=[0.11, 0.21, 0.31, 0.41, 0.51, 0.61, 0.71, 0.81],
        limit=1,
        grouped_task="Write a tweet with emojis about this movie.",
        generative_provider=GenerativeConfig.anthropic(
            model="claude-3-5-haiku-latest"
        ),  # Configure the Anthropic generative integration for RAG
    )
    # highlight-end

    print(response.generative.text)  # Inspect the results
    # END RAG
