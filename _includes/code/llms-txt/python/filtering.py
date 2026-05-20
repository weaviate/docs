"""llms.txt snippet: filtering. Section "Python / TypeScript > Filtering"."""
import weaviate
from weaviate.classes.config import Configure

client = weaviate.connect_to_local()
client.collections.delete("Restaurant")

# START llms_filtering_create_minimal
# Minimal: auto-schema sets filterable + searchable defaults on every property
client.collections.create(
    "Restaurant",
    vector_config=Configure.Vectors.text2vec_ollama(api_endpoint="http://ollama:11434", model="nomic-embed-text"),
)
# END llms_filtering_create_minimal

assert client.collections.exists("Restaurant")
client.collections.delete("Restaurant")

# START llms_filtering_create_full
from weaviate.classes.config import Configure, Property, DataType, Tokenization

# Full control: every knob set explicitly
client.collections.create(
    "Restaurant",
    vector_config=Configure.Vectors.text2vec_ollama(api_endpoint="http://ollama:11434", model="nomic-embed-text"),
    properties=[
        Property(name="name", data_type=DataType.TEXT, tokenization=Tokenization.WORD,
                 index_filterable=True, index_searchable=True),
        Property(name="cuisine", data_type=DataType.TEXT, tokenization=Tokenization.FIELD,
                 index_filterable=True, index_searchable=True),
        Property(name="url", data_type=DataType.TEXT, tokenization=Tokenization.FIELD,
                 skip_vectorization=True, index_searchable=False),
        Property(name="price", data_type=DataType.NUMBER,
                 index_range_filters=True),
    ],
)
# END llms_filtering_create_full

col = client.collections.use("Restaurant")
col.data.insert_many([
    {"name": "Ramen House", "cuisine": "Japanese", "url": "https://a.example", "price": 15},
    {"name": "Sushi Bar", "cuisine": "Japanese", "url": "https://b.example", "price": 25},
    {"name": "Pasta Place", "cuisine": "Italian", "url": "https://c.example", "price": 40},
])

# START llms_filtering_query
from weaviate.classes.query import Filter

# Single condition
res = col.query.hybrid("ramen", filters=Filter.by_property("price").less_than(20), limit=3)

# Combine with & (AND), | (OR)
res = col.query.fetch_objects(
    filters=(
        Filter.by_property("cuisine").equal("Japanese") &
        Filter.by_property("price").less_than(30)
    ),
    limit=5,
)
# END llms_filtering_query

assert len(res.objects) == 2
client.collections.delete("Restaurant")
client.close()
