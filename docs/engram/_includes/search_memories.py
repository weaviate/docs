import os
import uuid
from engram import EngramClient, VectorRetrieval, BM25Retrieval, HybridRetrieval
from engram.errors import APIError

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"]
)

test_user_id = f"test-{uuid.uuid4().hex[:8]}"

# Setup: store a memory so we have data to search
run = client.memories.add(
    "The user prefers dark mode and works primarily in Python. They are building a RAG application.",
    user_id=test_user_id,
)
status = client.runs.wait(run.run_id)
assert status.status == "completed"
assert len(status.memories_created) >= 1

# START BasicSearch
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id=test_user_id,
)

for memory in results:
    print(memory.content)
# END BasicSearch

assert len(results) >= 1

# START VectorSearch
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id=test_user_id,
    retrieval_config=VectorRetrieval(limit=10),
)
# END VectorSearch

assert len(results) >= 1

# START BM25Search
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id=test_user_id,
    retrieval_config=BM25Retrieval(limit=10),
)
# END BM25Search

assert len(results) >= 1

# START HybridSearch
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id=test_user_id,
    retrieval_config=HybridRetrieval(limit=10),
)
# END HybridSearch

assert len(results) >= 1

# START TopicFilter
results = client.memories.search(
    query="user preferences",
    topics=["UserKnowledge"],
    user_id=test_user_id,
    retrieval_config=HybridRetrieval(limit=10),
)

for memory in results:
    print(memory.content)
# END TopicFilter

assert len(results) >= 1
assert all(m.topic == "UserKnowledge" for m in results)

# --- Differential checks: confirm retrieval_type and topics filter are actually applied ---

# BM25 ranks by lexical term overlap. A query whose terms appear nowhere in any
# stored memory should return 0 results. If the server silently ignored
# retrieval_type and fell back to vector/hybrid, this would still return hits.
bm25_no_overlap = client.memories.search(
    query="submarine periscope rotation",  # no terms in common with the seed
    user_id=test_user_id,
    retrieval_config=BM25Retrieval(limit=10),
)
assert len(bm25_no_overlap) == 0, (
    f"BM25 with no lexical overlap should return 0 results, got {len(bm25_no_overlap)}"
)

# A topics filter for a topic that doesn't exist in this group must restrict
# results to 0. If the topics parameter were silently dropped, this would still
# return the seed memory.
try:
    nonexistent_topic_results = client.memories.search(
        query="user preferences",
        topics=["DefinitelyNotARealTopicXYZ"],
        user_id=test_user_id,
        retrieval_config=HybridRetrieval(limit=10),
    )
    assert len(nonexistent_topic_results) == 0, (
        f"topics filter must restrict — non-existent topic should return 0, "
        f"got {len(nonexistent_topic_results)}"
    )
except APIError as e:
    # Some configurations reject unknown topics with 4xx — that's still enforcement
    assert 400 <= e.status_code < 500, (
        f"non-existent topic should return 0 results or a 4xx, got status {e.status_code}"
    )

# Cleanup
_all = client.memories.search(query="user", user_id=test_user_id)
for _m in _all:
    client.memories.delete(_m.id, user_id=test_user_id)

client.close()
