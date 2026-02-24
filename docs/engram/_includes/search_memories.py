import os
from engram import EngramClient, RetrievalConfig

client = EngramClient(api_key=os.environ["ENGRAM_API_KEY"])

# BasicSearch
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id="user-uuid",
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
)

for memory in results:
    print(memory.content)
# END BasicSearch

# VectorSearch
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id="user-uuid",
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="vector", limit=10),
)
# END VectorSearch

# BM25Search
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id="user-uuid",
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="bm25", limit=10),
)
# END BM25Search

# HybridSearch
results = client.memories.search(
    query="What programming language does the user prefer?",
    user_id="user-uuid",
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=10),
)
# END HybridSearch

# TopicFilter
results = client.memories.search(
    query="user preferences",
    topics=["user_facts", "preferences"],
    user_id="user-uuid",
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=10),
)

for memory in results:
    print(memory.content)
# END TopicFilter

client.close()
