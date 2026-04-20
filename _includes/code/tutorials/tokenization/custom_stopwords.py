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
        stopword_presets={
            "fr": ["le", "la", "les", "un", "une", "des", "du", "de", "et"],
        },
    ),
    properties=[
        Property(
            name="name_en",
            data_type=DataType.TEXT,
            tokenization=Tokenization.WORD,
            text_analyzer=Configure.text_analyzer(stopword_preset="en"),
        ),
        Property(
            name="name_fr",
            data_type=DataType.TEXT,
            tokenization=Tokenization.WORD,
            text_analyzer=Configure.text_analyzer(stopword_preset="fr"),
        ),
    ],
    vector_config=Configure.Vectors.self_provided(),
)
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

# Test: French search finds the matching document
fr_response = products.query.bm25(
    query="la tasse bleue et le bol",
    query_properties=["name_fr"],
    return_metadata=MetadataQuery(score=True),
)
assert len(fr_response.objects) == 1
assert fr_response.objects[0].properties["name_fr"] == "La Tasse Bleue et le Bol"
assert fr_response.objects[0].metadata.score > 0

# Test: English search returns no results (French words aren't in English data)
en_response = products.query.bm25(
    query="la tasse bleue et le bol",
    query_properties=["name_en"],
)
assert len(en_response.objects) == 0

# Test: Searching French property for English content returns no results
en_on_fr = products.query.bm25(
    query="blue cup bowl",
    query_properties=["name_fr"],
)
assert len(en_on_fr.objects) == 0

# Test: Verify stopwords are filtered — "la" alone shouldn't score on French property
# (it's a stopword so it's excluded from BM25 scoring)
la_response = products.query.bm25(
    query="la",
    query_properties=["name_fr"],
)
assert len(la_response.objects) == 0  # "la" is a French stopword, filtered from query

client.collections.delete("StopwordsDemo")
client.close()

# CustomStopwordsResults
"""
French property search:
  La Tasse Bleue et le Bol (score: 0.95)

English property search:
  (no results — "tasse", "bleue", "bol" are not in the English data)
"""
# END CustomStopwordsResults
