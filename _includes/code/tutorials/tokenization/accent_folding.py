# AccentFoldingCreateCollection
import weaviate
from weaviate.classes.config import Property, DataType, Tokenization, Configure

# END AccentFoldingCreateCollection

client = weaviate.connect_to_local()

# AccentFoldingCreateCollection
# Instantiate your client (not shown). e.g.:
# client = weaviate.connect_to_weaviate_cloud(...) or
# client = weaviate.connect_to_local()

# END AccentFoldingCreateCollection

client.collections.delete("AccentFoldingDemo")

# AccentFoldingCreateCollection
client.collections.create(
    name="AccentFoldingDemo",
    properties=[
        Property(
            name="text_default",
            data_type=DataType.TEXT,
            tokenization=Tokenization.WORD,
        ),
        Property(
            name="text_folded",
            data_type=DataType.TEXT,
            tokenization=Tokenization.WORD,
            text_analyzer=Configure.text_analyzer(ascii_fold=True),
        ),
        Property(
            name="text_folded_keep_e",
            data_type=DataType.TEXT,
            tokenization=Tokenization.WORD,
            text_analyzer=Configure.text_analyzer(
                ascii_fold=True, ascii_fold_ignore=["é"]
            ),
        ),
    ],
    vector_config=Configure.Vectors.self_provided(),
)
# END AccentFoldingCreateCollection

# AccentFoldingAddObjects
products = client.collections.get("AccentFoldingDemo")

test_strings = [
    "Café Crème Bio",
    "Łódź Ceramics",
    "São Paulo Sandals",
    "Müller Bräu",
]

for text in test_strings:
    products.data.insert(
        properties={
            "text_default": text,
            "text_folded": text,
            "text_folded_keep_e": text,
        }
    )
# END AccentFoldingAddObjects

# AccentFoldingFilter
from weaviate.classes.query import Filter

queries = ["cafe", "Café", "lodz", "sao paulo", "muller"]
properties = ["text_default", "text_folded", "text_folded_keep_e"]

for query in queries:
    print(f'\nQuery: "{query}"')
    for prop in properties:
        response = products.query.fetch_objects(
            filters=Filter.by_property(prop).equal(query),
        )
        matches = [o.properties[prop] for o in response.objects]
        print(f"  {prop}: {matches if matches else 'no match'}")
# END AccentFoldingFilter

# Test: "cafe" matches folded but not default or keep_e
r = products.query.fetch_objects(filters=Filter.by_property("text_folded").equal("cafe"))
assert len(r.objects) == 1 and r.objects[0].properties["text_folded"] == "Café Crème Bio"
r = products.query.fetch_objects(filters=Filter.by_property("text_default").equal("cafe"))
assert len(r.objects) == 0
r = products.query.fetch_objects(filters=Filter.by_property("text_folded_keep_e").equal("cafe"))
assert len(r.objects) == 0  # é is preserved, so "cafe" != "café"

# Test: "Café" matches all three (exact match works everywhere)
for prop in ["text_default", "text_folded", "text_folded_keep_e"]:
    r = products.query.fetch_objects(filters=Filter.by_property(prop).equal("Café"))
    assert len(r.objects) == 1, f"Expected Café to match on {prop}"

# Test: "lodz" matches folded and keep_e but not default
r = products.query.fetch_objects(filters=Filter.by_property("text_folded").equal("lodz"))
assert len(r.objects) == 1 and "Łódź" in r.objects[0].properties["text_folded"]
r = products.query.fetch_objects(filters=Filter.by_property("text_default").equal("lodz"))
assert len(r.objects) == 0
r = products.query.fetch_objects(filters=Filter.by_property("text_folded_keep_e").equal("lodz"))
assert len(r.objects) == 1  # ł/ó/ź are folded, only é is preserved

# Test: "muller" matches folded but not default
r = products.query.fetch_objects(filters=Filter.by_property("text_folded").equal("muller"))
assert len(r.objects) == 1 and "Müller" in r.objects[0].properties["text_folded"]
r = products.query.fetch_objects(filters=Filter.by_property("text_default").equal("muller"))
assert len(r.objects) == 0

client.collections.delete("AccentFoldingDemo")
client.close()

# AccentFoldingResults
"""
Query: "cafe"
  text_default: no match
  text_folded: ['Café Crème Bio']
  text_folded_keep_e: no match

Query: "Café"
  text_default: ['Café Crème Bio']
  text_folded: ['Café Crème Bio']
  text_folded_keep_e: ['Café Crème Bio']

Query: "lodz"
  text_default: no match
  text_folded: ['Łódź Ceramics']
  text_folded_keep_e: ['Łódź Ceramics']

Query: "sao paulo"
  text_default: no match
  text_folded: ['São Paulo Sandals']
  text_folded_keep_e: ['São Paulo Sandals']

Query: "muller"
  text_default: no match
  text_folded: ['Müller Bräu']
  text_folded_keep_e: ['Müller Bräu']
"""
# END AccentFoldingResults
