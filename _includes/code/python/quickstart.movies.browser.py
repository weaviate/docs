# EndToEndExample
import asyncio
import os

import weaviate_grpc_web  # must be imported before weaviate, installs the grpc-web transport
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType
from weaviate.classes.query import MetadataQuery

# Step 1: Connect
# Set your credentials via the Connect button next to Run, or edit these values inline
wcd_host = (
    os.environ.get("WEAVIATE_URL", "localhost")
    .removeprefix("https://")
    .removeprefix("http://")
    .split("/")[0]
    .split(":")[0]
)
wcd_api_key = os.environ.get("WEAVIATE_API_KEY", "")
is_local = wcd_host == "localhost"

client = weaviate.use_async_with_custom(
    http_host=wcd_host,
    http_port=8080 if is_local else 443,
    http_secure=not is_local,
    grpc_host=wcd_host,
    grpc_port=8080 if is_local else 443,
    grpc_secure=not is_local,
    grpc_path_prefix="/grpc-web",
    auth_credentials=Auth.api_key(wcd_api_key) if wcd_api_key else None,
    skip_init_checks=True,
)
await client.connect()

# ready = await client.is_ready()
# print(f"Connected to Weaviate, ready: {ready}")

# Step 2: Create a collection (deleted first, so the example is safe to re-run)
await client.collections.delete("Movies")

movies = await client.collections.create(
    name="Movies",
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="description", data_type=DataType.TEXT),
        Property(name="year", data_type=DataType.INT),
    ],
    # highlight-start
    vector_config=Configure.Vectors.text2vec_weaviate(  # Weaviate Embeddings
        base_url="https://dev-embedding.labs.weaviate.io",
    ),
    # highlight-end
)
print(f"Created collection: {movies.name}")

# Step 3: Import data, vectorized server-side by Weaviate Embeddings
data = [
    {"title": "The Matrix", "description": "A hacker discovers reality is a simulation and joins a rebellion against the machines.", "year": 1999},
    {"title": "Inception", "description": "A thief who steals secrets through dream-sharing technology is given one final job, planting an idea.", "year": 2010},
    {"title": "Interstellar", "description": "Explorers travel through a wormhole in space to ensure humanity's survival.", "year": 2014},
    {"title": "The Godfather", "description": "The aging patriarch of a crime dynasty transfers control to his reluctant son.", "year": 1972},
    {"title": "Spirited Away", "description": "A young girl wanders into a world of spirits and must work in a bathhouse to free her parents.", "year": 2001},
    {"title": "Toy Story", "description": "A cowboy doll feels threatened when a new spaceman action figure becomes the favorite toy.", "year": 1995},
    {"title": "Jaws", "description": "A giant great white shark terrorizes a small beach community.", "year": 1975},
    {"title": "La La Land", "description": "A jazz pianist and an aspiring actress fall in love while chasing their dreams in Los Angeles.", "year": 2016},
    {"title": "Mad Max: Fury Road", "description": "In a post-apocalyptic wasteland, a drifter and a rebel warrior flee a tyrant in an armored war rig.", "year": 2015},
    {"title": "Finding Nemo", "description": "A timid clownfish crosses the ocean to rescue his son, who was captured by a diver.", "year": 2003},
]

result = await movies.data.insert_many(data)
if result.has_errors:
    print(f"Import errors: {result.errors}")
else:
    aggregate = await movies.aggregate.over_all(total_count=True)
    print(f"Imported {aggregate.total_count} movies")

# Step 4: Semantic search
# The vector index updates in the background after import, so retry briefly
response = None
for _ in range(15):
    # highlight-start
    response = await movies.query.near_text(
        query="a science fiction adventure in space",
        limit=3,
        return_metadata=MetadataQuery(distance=True),
    )
    # highlight-end
    if response.objects:
        break
    await asyncio.sleep(1)

for obj in response.objects:
    print(f"{obj.properties['title']} ({obj.properties['year']}) — distance {obj.metadata.distance:.3f}")

await client.close()  # Free up resources
# END EndToEndExample
