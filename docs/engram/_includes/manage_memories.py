import os
from engram import EngramClient, APIError

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://dev-engram.labs.weaviate.io"
)

# Setup: store a memory so we can get and delete it
run = client.memories.add(
    "The user prefers dark mode",
    user_id="user-uuid",
    group="default",
)
status = client.runs.wait(run.run_id)
assert status.status == "completed"
assert status.committed_operations is not None
assert len(status.memories_created) >= 1

memory_id = status.memories_created[0].memory_id

# Discover the topic from search results
results = client.memories.search(
    query="dark mode",
    user_id="user-uuid",
    group="default",
)
assert len(results) >= 1
topic = results[0].topic

# GetMemory
memory = client.memories.get(
    memory_id,
    topic=topic,
    user_id="user-uuid",
)

print(memory.content)
print(memory.topic)
# END GetMemory

assert memory.id == memory_id
assert "dark mode" in memory.content

# DeleteMemory
client.memories.delete(
    memory_id,
    topic=topic,
    user_id="user-uuid",
)
# END DeleteMemory

# Verify the memory was deleted
try:
    client.memories.get(memory_id, topic=topic, user_id="user-uuid")
    assert False, "Expected memory to be deleted"
except APIError:
    pass  # Memory no longer exists

# Cleanup
_all = client.memories.search(query="dark mode", user_id="user-uuid", group="default")
for _m in _all:
    client.memories.delete(_m.id, topic=_m.topic, user_id="user-uuid")

client.close()
