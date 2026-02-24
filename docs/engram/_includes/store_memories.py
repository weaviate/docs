import os
import uuid
from engram import EngramClient, PreExtractedContent

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://dev-engram.labs.weaviate.io"
)

# StoreString
run = client.memories.add(
    "The user prefers dark mode and works primarily in Python. They are building a RAG application.",
    user_id="user-uuid",
    group="default",
)

print(run.run_id)
print(run.status)
# END StoreString

assert run.run_id is not None
status = client.runs.wait(run.run_id)
assert status.status == "completed"

results = client.memories.search(query="Python RAG dark mode", user_id="user-uuid", group="default")
assert len(results) >= 1
assert any("Python" in m.content or "dark mode" in m.content or "RAG" in m.content for m in results)

# StorePreExtracted
run = client.memories.add(
    PreExtractedContent(
        content="User prefers dark mode",
    ),
    user_id="user-uuid",
    group="default",
)

print(run.run_id)
print(run.status)
# END StorePreExtracted

assert run.run_id is not None
status = client.runs.wait(run.run_id)
assert status.status == "completed"

results = client.memories.search(query="dark mode preference", user_id="user-uuid", group="default")
assert len(results) >= 1
assert any("dark mode" in m.content for m in results)

# StoreConversation
run = client.memories.add(
    [
        {"role": "user", "content": "I just moved to Berlin and I am looking for a good coffee shop."},
        {"role": "assistant", "content": "Welcome to Berlin! Here are some popular coffee shops in the city..."},
        {"role": "user", "content": "I prefer specialty coffee, not chains."},
    ],
    user_id="user-uuid",
    conversation_id=str(uuid.uuid4()),
    group="default",
)

print(run.run_id)
print(run.status)
# END StoreConversation

assert run.run_id is not None
status = client.runs.wait(run.run_id)
assert status.status == "completed"

results = client.memories.search(query="Berlin coffee specialty", user_id="user-uuid", group="default")
assert len(results) >= 1
assert any("Berlin" in m.content or "coffee" in m.content for m in results)

# Cleanup
_all = client.memories.search(query="user", user_id="user-uuid", group="default")
for _m in _all:
    client.memories.delete(_m.id, topic=_m.topic, user_id="user-uuid")

client.close()
