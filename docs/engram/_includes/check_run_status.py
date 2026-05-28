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

# Trigger a second run that refines the first memory, then exercise the
# `updated` and `deleted` branches of `committed_operations`. Structurally
# asserting all three lists exist catches a regression where the response
# drops `updated` or `deleted`.
refine_run = client.memories.add(
    "The user actually prefers light mode now",
    user_id=test_user_id,
    group="default",
)
refine_status = client.runs.wait(refine_run.run_id)
assert refine_status.status == "completed"
assert refine_status.committed_operations is not None
assert isinstance(refine_status.memories_created, list)
assert isinstance(refine_status.memories_updated, list)
assert isinstance(refine_status.memories_deleted, list)
print(
    f"Refinement run committed_operations: "
    f"created={len(refine_status.memories_created)}, "
    f"updated={len(refine_status.memories_updated)}, "
    f"deleted={len(refine_status.memories_deleted)}"
)

# Cleanup
_all = client.memories.search(query="dark mode", user_id=test_user_id, group="default")
for _m in _all:
    client.memories.delete(_m.id, user_id=test_user_id, group="default")

client.close()
