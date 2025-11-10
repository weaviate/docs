# START QueryAgent
import os
import weaviate
from weaviate.agents.query import QueryAgent

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

# Step 2.1: Connect to your Weaviate Cloud instance
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=weaviate_api_key,
)

# Step 2.2: Instantiate a new agent object
qa = QueryAgent(client=client, collections=["Movie"])

# Step 2.3: Perform a query using Search Mode
response = qa.search("Find a cool sci-fi movie.", limit=1)

# Print the response
for obj in response.search_results.objects:
    print(f"Movie: {obj.properties['title']} - {obj.properties['description']}")

client.close()  # Free up resources
# END QueryAgent
