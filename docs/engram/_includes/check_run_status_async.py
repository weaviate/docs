import asyncio
import time
import uuid

# START Connect
import os
from engram import AsyncEngramClient

client = AsyncEngramClient(api_key=os.environ["ENGRAM_API_KEY"])
# END Connect

test_user_id = f"test-{uuid.uuid4().hex[:8]}"


async def main():
    # Setup: store a memory to get a run_id
    run = await client.memories.add(
        "The user prefers dark mode",
        user_id=test_user_id,
    )

    # START PollRun
    status = await client.runs.wait(run.run_id)

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
    refine_run = await client.memories.add(
        "The user actually prefers light mode now",
        user_id=test_user_id,
    )
    refine_status = await client.runs.wait(refine_run.run_id)
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
    _all = await client.memories.search(query="dark mode", user_id=test_user_id)
    for _m in _all:
        await client.memories.delete(_m.id, user_id=test_user_id)

    await client.aclose()


asyncio.run(main())
