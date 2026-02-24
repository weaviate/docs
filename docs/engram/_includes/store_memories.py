import os
from engram import EngramClient, PreExtractedContent

client = EngramClient(api_key=os.environ["ENGRAM_API_KEY"])

# StoreString
run = client.memories.add(
    "The user prefers dark mode and works primarily in Python. They are building a RAG application.",
    user_id="user-uuid",
    group="default",
)

print(run.run_id)
print(run.status)
# END StoreString

assert run.run_id is not None
status = client.runs.wait(run.run_id)
assert status.status == "completed"

# StorePreExtracted
run = client.memories.add(
    PreExtractedContent(
        content="User prefers dark mode",
        tags=["preference", "ui"],
    ),
    user_id="user-uuid",
    group="default",
)

print(run.run_id)
print(run.status)
# END StorePreExtracted

assert run.run_id is not None
status = client.runs.wait(run.run_id)
assert status.status == "completed"

# StoreConversation
run = client.memories.add(
    [
        {"role": "user", "content": "I just moved to Berlin and I am looking for a good coffee shop."},
        {"role": "assistant", "content": "Welcome to Berlin! Here are some popular coffee shops in the city..."},
        {"role": "user", "content": "I prefer specialty coffee, not chains."},
    ],
    user_id="user-uuid",
    conversation_id="conversation-uuid",
    group="default",
)

print(run.run_id)
print(run.status)
# END StoreConversation

assert run.run_id is not None
status = client.runs.wait(run.run_id)
assert status.status == "completed"

client.close()
