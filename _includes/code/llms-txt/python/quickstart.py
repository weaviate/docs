"""llms.txt snippet: quickstart (Weaviate Cloud). Section "Quickstart > Cloud"."""
import os
import weaviate

# Reset the collection so the snippet runs from a clean state
with weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=os.environ["WEAVIATE_API_KEY"],
) as _reset:
    _reset.collections.delete("Movie")

# START llms_quickstart
import os
import weaviate
from weaviate.classes.config import Configure

data_objects = [
    {
        "title": "The Matrix",
        "description": "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
        "genre": "Science Fiction",
    },
    {
        "title": "Spirited Away",
        "description": "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
        "genre": "Animation",
    },
    {
        "title": "The Lord of the Rings: The Fellowship of the Ring",
        "description": "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
        "genre": "Fantasy",
    },
]

with weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=os.environ["WEAVIATE_API_KEY"],
) as client:
    # Create (or reuse) a collection
    if not client.collections.exists("Movie"):
        client.collections.create(
            name="Movie",
            vector_config=Configure.Vectors.text2vec_weaviate(),
        )

    movies = client.collections.use("Movie")

    # Import objects
    with movies.batch.fixed_size(batch_size=200) as batch:
        for obj in data_objects:
            batch.add_object(properties=obj)

    print(f"Imported & vectorized {len(data_objects)} objects into the Movie collection")

    # Query
    res = movies.query.hybrid(
        query="science fiction movie about a virtual world",
        limit=1,
    )
    print(res.objects[0].properties)
# END llms_quickstart
