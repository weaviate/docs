# START MMRNearText
import weaviate
from weaviate.classes.query import Diversity

client = weaviate.connect_to_local()

collection = client.collections.get("JeopardyQuestion")

# Retrieve 20 candidates, then rerank to select 5 diverse results
response = collection.query.near_text(
    query="animals in movies",
    limit=20,
    selection=Diversity.MMR(
        limit=5,
        balance=0.5,
    ),
)

for o in response.objects:
    print(o.properties["question"])
# END MMRNearText

# Test
assert response.objects[0].collection == "JeopardyQuestion"
assert len(response.objects) == 5
assert "question" in response.objects[0].properties.keys()

# Verify MMR produces different ordering than standard search
standard_response = collection.query.near_text(
    query="animals in movies",
    limit=5,
)
standard_questions = [o.properties["question"] for o in standard_response.objects]
mmr_questions = [o.properties["question"] for o in response.objects]
# First result should be the same (most relevant), but sets should differ
assert standard_questions[0] == mmr_questions[0], "First result should be the most relevant in both"
assert set(standard_questions) != set(mmr_questions), "MMR should select different items than standard search"

# START MMRNearVector
from weaviate.classes.query import Diversity

collection = client.collections.get("JeopardyQuestion")

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

collection = client.collections.get("JeopardyQuestion")

# Pure diversity — maximize difference between results
response_diverse = collection.query.near_text(
    query="animals in movies",
    limit=20,
    selection=Diversity.MMR(limit=5, balance=0.0),
)

# Balanced — equal weight on relevance and diversity
response_balanced = collection.query.near_text(
    query="animals in movies",
    limit=20,
    selection=Diversity.MMR(limit=5, balance=0.5),
)

# Pure relevance — equivalent to standard vector search
response_relevant = collection.query.near_text(
    query="animals in movies",
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
balanced_questions = [o.properties["question"] for o in response_balanced.objects]
relevant_questions = [o.properties["question"] for o in response_relevant.objects]
assert diverse_questions != relevant_questions, "Pure diversity and pure relevance should differ"

client.close()
