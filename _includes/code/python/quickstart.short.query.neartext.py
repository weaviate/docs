# NearText
import weaviate
from weaviate.classes.init import Auth
import os, json

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,                                    # Replace with your Weaviate Cloud URL
    auth_credentials=Auth.api_key(weaviate_api_key),             # Replace with your Weaviate Cloud key
)

movies = client.collections.use("Movie")

# highlight-start
response = movies.query.near_text(
    query="sci-fi",
    limit=2
)
# highlight-end

for obj in response.objects:
    print(json.dumps(obj.properties, indent=2))

client.close()  # Free up resources
# END NearText
