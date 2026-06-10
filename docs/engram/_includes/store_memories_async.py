import asyncio
import uuid

from engram import PreExtractedInput, PreExtractedItem

# START Connect
import os
from engram import AsyncEngramClient

client = AsyncEngramClient(api_key=os.environ["ENGRAM_API_KEY"])
# END Connect

test_user_id = f"test-{uuid.uuid4().hex[:8]}"


async def main():
    # START StoreString
    run = await client.memories.add(
        "The user prefers dark mode and works primarily in Python. They are building a RAG application.",
        user_id=test_user_id,
    )

    print(run.run_id)
    print(run.status)
    # END StoreString

    status = await client.runs.wait(run.run_id)
    assert status.status == "completed"
    assert len(status.memories_created) >= 1

    # START StoreConversation
    run = await client.memories.add(
        [
            {"role": "user", "content": "I just moved to Berlin and I am looking for a good coffee shop."},
            {"role": "assistant", "content": "Welcome to Berlin! Here are some popular coffee shops in the city..."},
            {"role": "user", "content": "I prefer specialty coffee, not chains."},
        ],
        user_id=test_user_id,
    )
    # END StoreConversation

    status = await client.runs.wait(run.run_id)
    assert status.status == "completed"

    # START StorePreExtracted
    run = await client.memories.add(
        PreExtractedInput(items=[
            PreExtractedItem(content="User prefers dark mode", topic="UserKnowledge"),
            PreExtractedItem(content="User works in Python", topic="UserKnowledge"),
        ]),
        user_id=test_user_id,
    )
    # END StorePreExtracted

    status = await client.runs.wait(run.run_id)
    assert status.status == "completed"

    # Cleanup
    for _m in await client.memories.search(query="user", user_id=test_user_id):
        await client.memories.delete(_m.id, user_id=test_user_id)

    await client.aclose()


asyncio.run(main())
