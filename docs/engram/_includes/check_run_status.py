import os
from engram import EngramClient

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://dev-engram.labs.weaviate.io"
)

# Setup: store a memory to get a run_id
run = client.memories.add(
    "The user prefers dark mode",
    user_id="user-uuid",
    group="default",
)

# PollRun
status = client.runs.wait(run.run_id)

print(status.run_id)
print(status.status)
print(status.committed_operations)
# END PollRun

assert status.status == "completed"
assert status.committed_operations is not None
assert len(status.memories_created) >= 1

# Cleanup
_all = client.memories.search(query="dark mode", user_id="user-uuid", group="default")
for _m in _all:
    client.memories.delete(_m.id, topic=_m.topic, user_id="user-uuid")

client.close()
