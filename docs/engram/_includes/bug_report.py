"""
Bug report: Engram API issues found during docs testing.
Run this script to reproduce the issues against the dev environment.

Requires: ENGRAM_API_KEY environment variable
"""

import os
from engram import EngramClient, APIError

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://dev-engram.labs.weaviate.io"
)

# --------------------------------------------------------------------------
# Setup: store a memory and wait for pipeline to complete
# --------------------------------------------------------------------------
run = client.memories.add(
    "The user prefers dark mode",
    user_id="user-uuid",
    group="default",
)
status = client.runs.wait(run.run_id)
assert status.status == "completed", f"Expected completed, got {status.status}"

# --------------------------------------------------------------------------
# BUG 1: committed_operations is always None for completed runs
#
# After a run completes, committed_operations is None even though memories
# were created. This makes memories_created always return an empty list.
#
# Root cause: pipeline_runs.sql UpdatePipelineRunStatus unconditionally
# overwrites committed_operations. The workflow updates status twice:
#   1. After commit step: status=running, committed_ops={created: [...]}
#   2. After completion:  status=completed, committed_ops=NULL
# The second update erases what was saved in step 1.
#
# File: internal/adapters/postgres/queries/pipeline_runs.sql:14
#   SET status = $2, error = $3, committed_operations = $4, updated_at = NOW()
# Fix: committed_operations = COALESCE($4, committed_operations)
# --------------------------------------------------------------------------
print("=== BUG 1: committed_operations is always None ===")
print(f"  status.status:                {status.status}")
print(f"  status.committed_operations:  {status.committed_operations}")
print(f"  status.memories_created:      {status.memories_created}")

assert status.committed_operations is None, "Bug may be fixed — committed_operations is no longer None!"
print("  CONFIRMED: committed_operations is None despite memories being created\n")

# --------------------------------------------------------------------------
# BUG 2: memories.get() returns 500 Internal Server Error
#
# Storing a memory and searching for it works fine, but calling
# memories.get() with the memory ID and topic from search results
# returns a 500 error.
# --------------------------------------------------------------------------
print("=== BUG 2: memories.get() returns 500 ===")

results = client.memories.search(query="dark mode", user_id="user-uuid", group="default")
assert len(results) >= 1, "Expected at least 1 search result"

memory_id = results[0].id
topic = results[0].topic
print(f"  Search returned memory: id={memory_id}, topic={topic}")

try:
    memory = client.memories.get(memory_id, topic=topic, user_id="user-uuid")
    print(f"  Bug may be fixed — get() returned: {memory.content}")
except APIError as e:
    print(f"  GET /v1/memories/{memory_id}?topic={topic}&user_id=user-uuid")
    print(f"  Response: {e.status_code} {e}")
    assert e.status_code == 500
    print("  CONFIRMED: memories.get() returns 500 Internal Server Error\n")

# --------------------------------------------------------------------------
# Cleanup
# --------------------------------------------------------------------------
_all = client.memories.search(query="dark mode", user_id="user-uuid", group="default")
for _m in _all:
    client.memories.delete(_m.id, topic=_m.topic, user_id="user-uuid")

client.close()
print("Done. Cleanup complete.")
