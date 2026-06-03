import os
import time
from engram import EngramClient, HybridRetrieval
from engram.errors import APIError

# START Connect
client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"]
)
# END Connect


def _cleanup_alice():
    """Remove any prior memories for the test user so reruns stay idempotent."""
    try:
        existing = client.memories.search(
            query="user",
            user_id="alice",
            group="default",
            retrieval_config=HybridRetrieval(limit=100),
        )
        for m in existing:
            try:
                client.memories.delete(m.id, user_id="alice", group="default")
            except APIError:
                pass
    except APIError:
        pass


_cleanup_alice()

# START AddMemory
run = client.memories.add(
    "The user prefers dark mode and uses VS Code as their primary editor.",
    user_id="alice",  # any unique string per user (e.g. a username)
)

print(run.run_id)
print(run.status)
# END AddMemory

assert run.run_id is not None

# START CheckRun
status = client.runs.wait(run.run_id)

print(status.status)
# END CheckRun

assert status.status == "completed"
assert status.committed_operations is not None
assert len(status.memories_created) >= 1

# Warm up tenant — retry until search succeeds (tenant may still be initializing)
for _retry in range(5):
    try:
        client.memories.search(query="test", user_id="alice", group="default")
        break
    except APIError:
        time.sleep(3)

# START SearchMemory
results = client.memories.search(
    query="What editor does the user prefer?",
    user_id="alice",
)

for memory in results:
    print(memory.content)
# END SearchMemory

assert len(results) >= 1
assert any(
    "VS Code" in m.content or "editor" in m.content or "dark mode" in m.content
    for m in results
)

_cleanup_alice()

client.close()
