# Howto: Search -> Filters on nested object properties - Python examples.
#
# Preview feature: requires Weaviate v1.38+ with
# `WEAVIATE_PREVIEW_NESTED_FILTERING=on` set on the server. Released
# Weaviate versions reject `cars.make`-style nested paths at the filter
# parser. Not wired into pytest CI yet — promote at GA.

import weaviate
from weaviate.classes.config import Configure, Property, DataType, Tokenization
from weaviate.classes.query import Filter

client = weaviate.connect_to_local()

client.collections.delete("Document")

# Schema: Document.cars (object[]) -> tires (object[]).
# Mirrors the path patterns used by the worked examples below
# (cars.make, cars[0].make, cars.tires.width, ...).
client.collections.create(
    name="Document",
    vector_config=Configure.Vectors.self_provided(),
    properties=[
        Property(name="title", data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
        Property(
            name="cars",
            data_type=DataType.OBJECT_ARRAY,
            nested_properties=[
                Property(name="make",  data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
                Property(name="color", data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
                Property(
                    name="tires",
                    data_type=DataType.OBJECT_ARRAY,
                    nested_properties=[
                        Property(name="brand", data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
                        Property(name="width", data_type=DataType.INT),
                    ],
                ),
            ],
        ),
    ],
)

docs = client.collections.use("Document")
docs.data.insert_many([
    # Doc 1: two cars; (Toyota, red) + (Honda, blue)
    {"title": "doc1", "cars": [
        {"make": "Toyota", "color": "red",
         "tires": [{"brand": "Bridgestone", "width": 215},
                   {"brand": "Bridgestone", "width": 215}]},
        {"make": "Honda",  "color": "blue",
         "tires": [{"brand": "Pirelli", "width": 205},
                   {"brand": "Pirelli", "width": 205}]},
    ]},
    # Doc 2: one Toyota, no tires
    {"title": "doc2", "cars": [
        {"make": "Toyota", "color": "blue"},
    ]},
    # Doc 3: one Honda (red) with wide Michelin tires
    {"title": "doc3", "cars": [
        {"make": "Honda", "color": "red",
         "tires": [{"brand": "Michelin", "width": 250},
                   {"brand": "Michelin", "width": 250}]},
    ]},
])


# ==========================================
# ===== Existential match (any element) =====
# ==========================================

# START NestedExistential
# "any car has make = Toyota" — matches Doc 1 (first car) and Doc 2 (only car)
response = docs.query.fetch_objects(
    # highlight-start
    filters=Filter.by_property("cars.make").equal("Toyota"),
    # highlight-end
    return_properties=["title"],
)

for o in response.objects:
    print(o.properties)
# END NestedExistential

assert len(response.objects) == 2


# ==========================================
# ===== Positional match (cars[N]) =====
# ==========================================

# START NestedPositional
# "the FIRST car has make = Toyota" — Doc 3's first car is Honda, so it's excluded
response = docs.query.fetch_objects(
    # highlight-start
    filters=Filter.by_property("cars[0].make").equal("Toyota"),
    # highlight-end
    return_properties=["title"],
)
# END NestedPositional

assert len(response.objects) == 2


# ==========================================
# ===== Same-element AND across leaves =====
# ==========================================

# START NestedSameElementAnd
# "the SAME car is both Toyota AND red" — only Doc 1's first car qualifies.
# Without same-element correlation a doc with separate (Toyota, blue) and
# (Honda, red) cars would also match, which is wrong.
response = docs.query.fetch_objects(
    # highlight-start
    filters=(
        Filter.by_property("cars.make").equal("Toyota")
        & Filter.by_property("cars.color").equal("red")
    ),
    # highlight-end
    return_properties=["title"],
)
# END NestedSameElementAnd

assert len(response.objects) == 1


# ==========================================
# ===== Recursive path (object[] inside object[]) =====
# ==========================================

# START NestedRecursive
# "any tire on any car is wider than 200" — Doc 1 (215) and Doc 3 (250)
response = docs.query.fetch_objects(
    # highlight-start
    filters=Filter.by_property("cars.tires.width").greater_than(200),
    # highlight-end
    return_properties=["title"],
)
# END NestedRecursive

assert len(response.objects) == 2


# ==========================================
# ===== IsNull on an intermediate object =====
# ==========================================

# START NestedIsNull
# "the first car has no tires" — only the Toyota in Doc 2
response = docs.query.fetch_objects(
    # highlight-start
    filters=Filter.by_property("cars[0].tires").is_none(True),
    # highlight-end
    return_properties=["title"],
)
# END NestedIsNull

assert len(response.objects) == 1


client.collections.delete("Document")
client.close()
