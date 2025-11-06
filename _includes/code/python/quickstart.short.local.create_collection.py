# START CreateCollection
import weaviate
from weaviate.classes.config import Configure

# Step 1.1: Connect to your local Weaviate instance
client = weaviate.connect_to_local()

# END CreateCollection

# NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
client.collections.delete("Movie")

# START CreateCollection
# Step 1.2: Create a collection
# highlight-start
movies = client.collections.create(
    name="Movie",
    vector_config=Configure.Vectors.text2vec_ollama(  # Configure the Ollama embedding integration
        api_endpoint="http://ollama:11434",  # If using Docker you might need: http://host.docker.internal:11434
        model="nomic-embed-text",  # The model to use
    ),
)
# highlight-end
# START CreateCollection

# END CreateCollection
# fmt: off
# START CreateCollection
# Step 1.3: Import three objects
data_objects = [
    {"title": "The Matrix", "description": "A computer hacker learns about the true nature of reality and his role in the war against its controllers.", "genre": "Science Fiction"},
    {"title": "Spirited Away", "description": "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.", "genre": "Animation"},
    {"title": "The Lord of the Rings: The Fellowship of the Ring", "description": "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.", "genre": "Fantasy"},
]
# END CreateCollection
# fmt: on
# START CreateCollection

movies = client.collections.use("Movie")
with movies.batch.fixed_size(batch_size=200) as batch:
    for obj in data_objects:
        batch.add_object(properties=obj)

print(f"Imported & vectorized {len(movies)} objects into the Movie collection")

client.close()  # Free up resources
# END CreateCollection
