"""llms.txt snippet: object CRUD. Section "Python / TypeScript > CRUD"."""
import weaviate
from weaviate.classes.config import Configure

client = weaviate.connect_to_local()
client.collections.delete("Movie")
client.collections.create(
    "Movie",
    vector_config=Configure.Vectors.text2vec_ollama(api_endpoint="http://ollama:11434", model="nomic-embed-text"),
)

# START llms_crud
movies = client.collections.use("Movie")

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
client.collections.delete("Movie")
client.close()
