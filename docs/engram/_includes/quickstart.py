import os
from engram import EngramClient

# Connect
client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://dev-engram.labs.weaviate.io"
)
# END Connect

# AddMemory
run = client.memories.add(
    "The user prefers dark mode and uses VS Code as their primary editor.",
    user_id="user-uuid",
    group="default",
)

print(run.run_id)
print(run.status)
# END AddMemory

assert run.run_id is not None

# CheckRun
status = client.runs.wait(run.run_id)

print(status.status)
# END CheckRun

assert status.status == "completed"
assert status.committed_operations is not None
assert len(status.memories_created) >= 1

# SearchMemory
results = client.memories.search(
    query="What editor does the user prefer?",
    user_id="user-uuid",
    group="default",
)

for memory in results:
    print(memory.content)
# END SearchMemory

assert len(results) >= 1
assert any("VS Code" in m.content or "editor" in m.content or "dark mode" in m.content for m in results)

# Cleanup
for _m in results:
    try:
        client.memories.delete(_m.id, topic=_m.topic, user_id="user-uuid")
    except Exception:
        pass

client.close()
