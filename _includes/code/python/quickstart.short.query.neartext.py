# NearText
import weaviate
from weaviate.classes.init import Auth
import os, json

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

# Step 2.1: Connect to your Weaviate Cloud instance
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=Auth.api_key(weaviate_api_key),
)

# Step 2.2: Use this collection
movies = client.collections.use("Movie")

# Step 2.3: Perform a semantic search with NearText
# highlight-start
# END NearText
# fmt: off
# NearText
response = movies.query.near_text(
    query="sci-fi",
    limit=2
)
# END NearText
# fmt: on
# NearText
# highlight-end

for obj in response.objects:
    print(json.dumps(obj.properties, indent=2))  # Inspect the results

client.close()  # Free up resources
# END NearText
