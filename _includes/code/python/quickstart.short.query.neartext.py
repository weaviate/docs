# START NearText
import weaviate
import os, json

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

# Step 2.1: Connect to your Weaviate Cloud instance
with weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=weaviate_api_key,
) as client:

    # Step 2.2: Use this collection
    movies = client.collections.use("Movie")

    # Step 2.3: Perform a semantic search with NearText
    # highlight-start
    # END NearText
    # fmt: off
    # START NearText
    response = movies.query.near_text(
        query="sci-fi",
        limit=2
    )
    # END NearText
    # fmt: on
    # START NearText
    # highlight-end

    for obj in response.objects:
        print(json.dumps(obj.properties, indent=2))  # Inspect the results

    # END NearText
