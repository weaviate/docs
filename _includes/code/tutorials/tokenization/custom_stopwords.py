# CustomStopwordsCreate
import weaviate
from weaviate.classes.config import Property, DataType, Tokenization, Configure

# END CustomStopwordsCreate

client = weaviate.connect_to_local()

# CustomStopwordsCreate
# Instantiate your client (not shown). e.g.:
# client = weaviate.connect_to_weaviate_cloud(...) or
# client = weaviate.connect_to_local()

# END CustomStopwordsCreate

client.collections.delete("StopwordsDemo")

# CustomStopwordsCreate
client.collections.create(
    name="StopwordsDemo",
    inverted_index_config=Configure.inverted_index(
        stopwords_presets={
            "fr": ["le", "la", "les", "un", "une", "des", "du", "de", "et"],
        },
    ),
    properties=[
        Property(
            name="name_en",
            data_type=DataType.TEXT,
            tokenization=Tokenization.WORD,
            text_analyzer={"stopwordPreset": "en"},
        ),
        Property(
            name="name_fr",
            data_type=DataType.TEXT,
            tokenization=Tokenization.WORD,
            text_analyzer={"stopwordPreset": "fr"},
        ),
    ],
    vector_config=Configure.Vectors.self_provided(),
)

client.close()
# END CustomStopwordsCreate

# CustomStopwordsAddObjects
products = client.collections.get("StopwordsDemo")

products.data.insert_many([
    {
        "name_en": "The Blue Cup and the Bowl",
        "name_fr": "La Tasse Bleue et le Bol",
    },
    {
        "name_en": "A Red Plate with the Saucer",
        "name_fr": "Une Assiette Rouge avec la Soucoupe",
    },
])
# END CustomStopwordsAddObjects

# CustomStopwordsSearch
from weaviate.classes.query import MetadataQuery

# Search the French property — "la" and "et" are French stopwords
response = products.query.bm25(
    query="la tasse bleue et le bol",
    query_properties=["name_fr"],
    return_metadata=MetadataQuery(score=True),
)

print("French property search:")
for o in response.objects:
    print(f"  {o.properties['name_fr']} (score: {o.metadata.score})")

# Same words on the English property — "la", "et", "le" are NOT English stopwords
response = products.query.bm25(
    query="la tasse bleue et le bol",
    query_properties=["name_en"],
    return_metadata=MetadataQuery(score=True),
)

print("\nEnglish property search:")
for o in response.objects:
    print(f"  {o.properties['name_en']} (score: {o.metadata.score})")
# END CustomStopwordsSearch

# CustomStopwordsResults
"""
French property search:
  La Tasse Bleue et le Bol (score: 3.89)

English property search:
  (no results — "tasse", "bleue", "bol" are not in the English data)
"""
# END CustomStopwordsResults
