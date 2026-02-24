import os
from engram import EngramClient

client = EngramClient(api_key=os.environ["ENGRAM_API_KEY"])

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

client.close()
