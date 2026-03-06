import os
import uuid
from engram import EngramClient, RetrievalConfig

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"]
)

test_user_id = f"test-{uuid.uuid4().hex[:8]}"

# Setup: store a memory so we have data to search
run = client.memories.add(
    "The user prefers dark mode and works primarily in Python. They are building a RAG application.",
    user_id=test_user_id,
    group="default",
)
status = client.runs.wait(run.run_id)
assert status.status == "completed"
assert len(status.memories_created) >= 1

# START BasicSearch
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id=test_user_id,
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
)

for memory in results:
    print(memory.content)
# END BasicSearch

assert len(results) >= 1

# START VectorSearch
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id=test_user_id,
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="vector", limit=10),
)
# END VectorSearch

assert len(results) >= 1

# START BM25Search
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id=test_user_id,
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="bm25", limit=10),
)
# END BM25Search

assert len(results) >= 1

# START HybridSearch
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id=test_user_id,
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=10),
)
# END HybridSearch

assert len(results) >= 1

# Discover actual topic name from existing results
topic = results[0].topic

# START TopicFilter
results = client.memories.search(
    query="user preferences",
    topics=[topic],
    user_id=test_user_id,
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=10),
)

for memory in results:
    print(memory.content)
# END TopicFilter

assert len(results) >= 1
assert all(m.topic == topic for m in results)

# Cleanup
_all = client.memories.search(query="user", user_id=test_user_id, group="default")
for _m in _all:
    client.memories.delete(_m.id, user_id=test_user_id, group="default")

client.close()
