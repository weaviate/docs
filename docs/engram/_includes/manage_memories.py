import os
import uuid
from engram import EngramClient, APIError

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"]
)

test_user_id = f"test-{uuid.uuid4().hex[:8]}"

# Setup: store a memory so we can get and delete it
run = client.memories.add(
    "The user prefers dark mode",
    user_id=test_user_id,
    group="default",
)
status = client.runs.wait(run.run_id)
assert status.status == "completed"
assert status.committed_operations is not None
assert len(status.memories_created) >= 1

memory_id = status.memories_created[0].memory_id

# START GetMemory
memory = client.memories.get(
    memory_id,
    user_id=test_user_id,
    group="default",
)

print(memory.content)
print(memory.topic)
# END GetMemory

assert memory.id == memory_id
assert "dark mode" in memory.content

# START DeleteMemory
client.memories.delete(
    memory_id,
    user_id=test_user_id,
    group="default",
)
# END DeleteMemory

# Verify the memory was deleted
try:
    client.memories.get(memory_id, user_id=test_user_id, group="default")
    assert False, "Expected memory to be deleted"
except APIError:
    pass  # Memory no longer exists

# Cleanup
_all = client.memories.search(query="dark mode", user_id=test_user_id, group="default")
for _m in _all:
    client.memories.delete(_m.id, user_id=test_user_id, group="default")

client.close()
