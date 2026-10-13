import os
import time
import uuid
from engram import EngramClient
from engram.errors import APIError

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"]
)

test_user_id = f"test-{uuid.uuid4().hex[:8]}"

# START InputString
client.memories.add("The user prefers dark mode and uses VS Code.", user_id=test_user_id)
# END InputString

# START InputConversation
client.memories.add(
    [
        {"role": "user", "content": "I just moved to Berlin."},
        {"role": "assistant", "content": "Welcome to Berlin!"},
        {"role": "user", "content": "I prefer specialty coffee."},
    ],
    user_id=test_user_id,
)
# END InputConversation

# START InputPreExtracted
from engram import PreExtractedInput, PreExtractedItem

client.memories.add(
    PreExtractedInput(items=[
        PreExtractedItem(content="User prefers dark mode", topic="UserKnowledge"),
        PreExtractedItem(content="User works in Python", topic="UserKnowledge"),
    ]),
    user_id=test_user_id,
)
# END InputPreExtracted

# START InputMultipleStrings
from engram import StringInput

client.memories.add(
    StringInput(content=[
        "The user prefers dark mode.",
        "The user is based in Berlin.",
    ]),
    user_id=test_user_id,
)
# END InputMultipleStrings

# START InputTimestamps
from datetime import datetime, timezone

from engram import ConversationInput, MessageInput, StringInput

# A string input that happened in the past
client.memories.add(
    StringInput(
        content=["The user booked a flight to Lisbon."],
        created_at="2026-05-01T09:00:00Z",
        updated_at=datetime(2026, 5, 2, 9, 0, tzinfo=timezone.utc),
    ),
    user_id=test_user_id,
)

# A conversation with its own timestamps and metadata
client.memories.add(
    ConversationInput(
        messages=[
            MessageInput(role="user", content="I moved to Lisbon last week."),
            MessageInput(role="assistant", content="How are you finding it?"),
        ],
        created_at="2026-05-01T09:00:00Z",
        metadata={"channel": "support", "locale": "en-GB"},
    ),
    user_id=test_user_id,
)
# END InputTimestamps

# Confirm the inputs were processed and stored (memories are eventually consistent).
results = []
for _retry in range(10):
    try:
        results = client.memories.search(query="user preferences", user_id=test_user_id)
        if len(results) >= 1:
            break
    except APIError:
        pass
    time.sleep(3)

assert len(results) >= 1

# Cleanup
for _m in client.memories.search(query="user", user_id=test_user_id):
    client.memories.delete(_m.id, user_id=test_user_id)

client.close()
