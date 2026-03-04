import os
import time
import uuid
from engram import EngramClient

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"]
)

test_user_id = f"test-{uuid.uuid4().hex[:8]}"

# Setup: store a memory to get a run_id
run = client.memories.add(
    "The user prefers dark mode",
    user_id=test_user_id,
    group="default",
)

# START PollRun
status = client.runs.wait(run.run_id)

print(status.run_id)
print(status.status)
print(status.committed_operations)
# END PollRun

assert status.status == "completed"
assert status.committed_operations is not None
assert len(status.memories_created) >= 1

time.sleep(2)  # Allow tenant indexing to complete

# Cleanup
_all = client.memories.search(query="dark mode", user_id=test_user_id, group="default")
for _m in _all:
    client.memories.delete(_m.id, user_id=test_user_id, group="default")

client.close()
