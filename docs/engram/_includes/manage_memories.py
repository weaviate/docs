import os
from engram import EngramClient

client = EngramClient(api_key=os.environ["ENGRAM_API_KEY"])

# Setup: store a memory so we can get and delete it
run = client.memories.add(
    "The user prefers dark mode",
    user_id="user-uuid",
    group="default",
)
status = client.runs.wait(run.run_id)
assert status.status == "completed"

results = client.memories.search(
    query="dark mode",
    user_id="user-uuid",
    group="default",
)
assert len(results) >= 1
memory_id = results[0].id
topic = results[0].topic

# GetMemory
memory = client.memories.get(
    memory_id,
    topic=topic,
    user_id="user-uuid",
    group="default",
)

print(memory.content)
print(memory.topic)
# END GetMemory

assert memory.id == memory_id

# DeleteMemory
client.memories.delete(
    memory_id,
    topic=topic,
    user_id="user-uuid",
    group="default",
)
# END DeleteMemory

client.close()
