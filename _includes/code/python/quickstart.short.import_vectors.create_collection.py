# START CreateCollection
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType
import os

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

# Step 1.1: Connect to your Weaviate Cloud instance
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=Auth.api_key(weaviate_api_key),
)

# END CreateCollection

# NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
client.collections.delete("Movie")

# START CreateCollection
# Step 1.2: Create a collection
# highlight-start
movies = client.collections.create(
    name="Movie",
    vector_config=Configure.Vectors.self_provided(),  # No automatic vectorization since we're providing vectors
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="description", data_type=DataType.TEXT),
        Property(name="genre", data_type=DataType.TEXT),
    ],  # You can also use auto-schema, here we define the schema manually
)
# highlight-end
# START CreateCollection

# END CreateCollection
# fmt: off
# START CreateCollection
# Step 1.3: Import three objects
data_objects = [
    {"properties": {"title": "The Matrix", "description": "A computer hacker learns about the true nature of reality and his role in the war against its controllers.", "genre": "Science Fiction"},
     "vector": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]},
    {"properties": {"title": "Spirited Away", "description": "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.", "genre": "Animation"},
     "vector": [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]},
    {"properties": {"title": "The Lord of the Rings: The Fellowship of the Ring", "description": "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.", "genre": "Fantasy"},
     "vector": [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
]
# END CreateCollection
# fmt: on
# START CreateCollection

# Insert the objects with vectors
movies = client.collections.get("Movie")
with movies.batch.dynamic() as batch:
    for obj in data_objects:
        batch.add_object(properties=obj["properties"], vector=obj["vector"])

print(f"Imported {len(data_objects)} objects with vectors into the Movie collection")

client.close()  # Free up resources
# END CreateCollection
