# START NearText
import weaviate
import json

# Step 2.1: Connect to your local Weaviate instance
client = weaviate.connect_to_local()

# Step 2.2: Use this collection
movies = client.collections.use("Movie")

# Step 2.3: Perform a vector search with NearVector
# highlight-start
# END NearText
# fmt: off
# START NearText
response = movies.query.near_vector(
    near_vector=[0.11, 0.21, 0.31, 0.41, 0.51, 0.61, 0.71, 0.81], 
    limit=2
)
# END NearText
# fmt: on
# START NearText
# highlight-end

for obj in response.objects:
    print(json.dumps(obj.properties, indent=2))  # Inspect the results

client.close()  # Free up resources
# END NearText
