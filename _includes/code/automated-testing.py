import weaviate
import os
import weaviate_datasets as wd
from weaviate.classes.init import Auth

# Get credentials from environment variables
wcd_url = os.environ["WEAVIATE_HOST"]
wcd_api_key = os.environ["WEAVIATE_API_KEY"]
openai_api = os.environ["OPENAI_APIKEY"]

headers = {"X-OpenAI-Api-Key": openai_api}

# Instantiate the v4 Weaviate client using the cloud helper.
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=wcd_url,
    auth_credentials=Auth.api_key(wcd_api_key),
    headers=headers,
)

# Instantiate the v4 Weaviate client using the local helper.
# client = weaviate.connect_to_local(
#     headers=headers,
# )

client.collections.delete("JeopardyQuestion")
client.collections.delete("JeopardyCategory")

dataset = wd.JeopardyQuestions10k()  # Instantiate dataset
dataset.upload_dataset(client)  # Pass the Weaviate client instance


client.collections.delete("Article")
client.collections.delete("Publication")
client.collections.delete("Author")
client.collections.delete("Category")

dataset = wd.NewsArticles()  # Instantiate dataset
dataset.upload_dataset(client)  # Pass the Weaviate client instance

client.collections.delete("WineReviewNV")

dataset = wd.WineReviewsNV()  # Instantiate dataset
dataset.upload_dataset(client)  # Pass the Weaviate client instance

client.collections.delete("WineReviewsMT")

dataset = wd.WineReviewsMT()  # Instantiate dataset
dataset.upload_dataset(client)  # Pass the Weaviate client instance

client.collections.delete("WineReviews")

dataset = wd.WineReviews()  # Instantiate dataset
dataset.upload_dataset(client)  # Pass the Weaviate client instance

client.close()
