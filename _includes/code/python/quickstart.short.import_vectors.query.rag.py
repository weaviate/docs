# RAG
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.generate import GenerativeConfig


# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]
openai_api_key = os.environ["OPENAI_APIKEY"]

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,  # Replace with your Weaviate Cloud URL
    auth_credentials=Auth.api_key(
        weaviate_api_key
    ),  # Replace with your Weaviate Cloud key
    # highlight-start
    headers={"X-OpenAI-Api-Key": openai_api_key},  # Replace with your OpenAI API key
    # highlight-end
)

questions = client.collections.use("Question")

# highlight-start
response = questions.generate.near_vector(
    near_vector=[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    limit=1,
    grouped_task="Write a tweet with emojis about this movie.",
    generative_provider=GenerativeConfig.openai(),  # Configure the OpenAI generative integration for RAG
)
# highlight-end

print(response.generative.text)  # Inspect the generated text

client.close()  # Free up resources
# END RAG
