import weaviate
import random
import time
from weaviate.classes.config import Property, DataType, Configure
from weaviate.classes.query import Diversity
from weaviate.collections.classes.data import DataObject

client = weaviate.connect_to_local()

# Setup: create collection with clustered vectors to demonstrate MMR diversity
client.collections.delete("MMRDemo")
col = client.collections.create(
    name="MMRDemo",
    properties=[Property(name="question", data_type=DataType.TEXT)],
    vector_config=Configure.Vectors.self_provided(),
)

random.seed(42)
base_vec = [random.uniform(-1, 1) for _ in range(128)]
for i in range(30):
    if i < 10:
        vec = [v + random.uniform(-0.05, 0.05) for v in base_vec]
    elif i < 20:
        vec = [-v + random.uniform(-0.05, 0.05) for v in base_vec]
    else:
        vec = [random.uniform(-1, 1) for _ in range(128)]
    col.data.insert(properties={"question": f"Question {i}"}, vector=vec)

time.sleep(2)

# START MMRNearVectorExample
from weaviate.classes.query import Diversity

collection = client.collections.get("MMRDemo")

# Retrieve 20 candidates, then rerank to select 5 diverse results
response = collection.query.near_vector(
    near_vector=base_vec,
    limit=20,
    selection=Diversity.MMR(
        limit=5,
        balance=0.5,
    ),
)

for o in response.objects:
    print(o.properties["question"])
# END MMRNearVectorExample

# Test
assert response.objects[0].collection == "MMRDemo"
assert len(response.objects) == 5
assert "question" in response.objects[0].properties.keys()

# Verify MMR produces different ordering than standard search
standard_response = collection.query.near_vector(
    near_vector=base_vec,
    limit=5,
)
standard_questions = [o.properties["question"] for o in standard_response.objects]
mmr_questions = [o.properties["question"] for o in response.objects]
# First result should be the same (most relevant), but sets should differ
assert standard_questions[0] == mmr_questions[0], "First result should be the most relevant in both"
assert set(standard_questions) != set(mmr_questions), "MMR should select different items than standard search"

# START MMRNearVector
from weaviate.classes.query import Diversity

collection = client.collections.get("MMRDemo")

# Get a vector to use as query
sample = collection.query.fetch_objects(limit=1, include_vector=True)
query_vector = sample.objects[0].vector["default"]

response = collection.query.near_vector(
    near_vector=query_vector,
    limit=20,
    selection=Diversity.MMR(
        limit=5,
        balance=0.5,
    ),
)

for o in response.objects:
    print(o.properties["question"])
# END MMRNearVector

# Test
assert len(response.objects) == 5
assert "question" in response.objects[0].properties.keys()

# START MMRBalanceExamples
from weaviate.classes.query import Diversity

collection = client.collections.get("MMRDemo")

# Pure diversity — maximize difference between results
response_diverse = collection.query.near_vector(
    near_vector=base_vec,
    limit=20,
    selection=Diversity.MMR(limit=5, balance=0.0),
)

# Balanced — equal weight on relevance and diversity
response_balanced = collection.query.near_vector(
    near_vector=base_vec,
    limit=20,
    selection=Diversity.MMR(limit=5, balance=0.5),
)

# Pure relevance — equivalent to standard vector search
response_relevant = collection.query.near_vector(
    near_vector=base_vec,
    limit=20,
    selection=Diversity.MMR(limit=5, balance=1.0),
)
# END MMRBalanceExamples

# Test
assert len(response_diverse.objects) == 5
assert len(response_balanced.objects) == 5
assert len(response_relevant.objects) == 5

# Different balance values should produce different result orderings
diverse_questions = [o.properties["question"] for o in response_diverse.objects]
relevant_questions = [o.properties["question"] for o in response_relevant.objects]
assert diverse_questions != relevant_questions, "Pure diversity and pure relevance should differ"

# Cleanup
client.collections.delete("MMRDemo")
client.close()
