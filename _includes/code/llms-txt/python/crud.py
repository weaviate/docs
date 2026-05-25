"""llms.txt snippet: object CRUD. Section "Python / TypeScript > CRUD"."""
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)
client.collections.delete("Movie__CrudPy")
client.collections.create(
    "Movie__CrudPy",
    vector_config=Configure.Vectors.text2vec_weaviate(),
)

# START llms_crud
movies = client.collections.use("Movie__CrudPy")

# Create — insert one object, returns its UUID
uuid = movies.data.insert({"title": "Inception", "genre": "Science Fiction"})

# Read — fetch the object by its UUID
obj = movies.query.fetch_object_by_id(uuid)
print(obj.properties)

# Update — merge new property values into the object
movies.data.update(uuid=uuid, properties={"genre": "Sci-Fi Thriller"})

# Delete — remove the object by its UUID
movies.data.delete_by_id(uuid)
# END llms_crud

assert movies.query.fetch_object_by_id(uuid) is None
client.collections.delete("Movie__CrudPy")
client.close()
