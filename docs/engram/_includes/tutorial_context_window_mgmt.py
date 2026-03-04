import os
import time
import uuid
from engram import EngramClient, RetrievalConfig

# START Setup
client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://api.engram.weaviate.io"
)
user_id = f"tutorial-context-{uuid.uuid4().hex[:8]}"
# END Setup


# START NaiveChatAnthropic
def naive_chat_anthropic():
    """Naive approach: send full conversation history every time."""
    import anthropic

    anthropic_client = anthropic.Anthropic()
    messages = []

    while True:
        user_input = input("You: ")
        if user_input.lower() == "quit":
            break

        messages.append({"role": "user", "content": user_input})

        # Every call sends the ENTIRE conversation history
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=1024,
            system="You are a helpful assistant.",
            messages=messages,  # This list grows with every turn
        )
        assistant_message = response.content[0].text
        messages.append({"role": "assistant", "content": assistant_message})
        print(f"Assistant: {assistant_message}")
        print(f"Messages in context: {len(messages)}\n")


# END NaiveChatAnthropic


# START NaiveChatOpenAI
def naive_chat_openai():
    """Naive approach: send full conversation history every time."""
    from openai import OpenAI

    openai_client = OpenAI()
    messages = [{"role": "system", "content": "You are a helpful assistant."}]

    while True:
        user_input = input("You: ")
        if user_input.lower() == "quit":
            break

        messages.append({"role": "user", "content": user_input})

        # Every call sends the ENTIRE conversation history
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=messages,  # This list grows with every turn
        )
        assistant_message = response.choices[0].message.content
        messages.append({"role": "assistant", "content": assistant_message})
        print(f"Assistant: {assistant_message}")
        print(f"Messages in context: {len(messages)}\n")


# END NaiveChatOpenAI


# START TokenCount
def count_tokens(text):
    """Approximate token count (1 token ~ 4 characters)."""
    return len(text) // 4


# Simulate a 50-turn conversation
total_tokens = 0
for i in range(50):
    user_msg = f"Turn {i}: I'd like to discuss my Python project and get advice on architecture."
    assistant_msg = f"Turn {i}: Here are some suggestions for your Python project architecture and best practices to follow."
    total_tokens += count_tokens(user_msg) + count_tokens(assistant_msg)

print(f"50-turn conversation: ~{total_tokens:,} tokens per request")
print(f"At $3/1M input tokens: ~${total_tokens * 3 / 1_000_000:.4f} per request")
# END TokenCount

# START StoreMemories
conversation = [
    {"role": "user", "content": "I'm a software engineer working on a Python web app."},
    {
        "role": "assistant",
        "content": "That sounds interesting! What framework are you using?",
    },
    {
        "role": "user",
        "content": "I'm using FastAPI with PostgreSQL. I prefer async patterns.",
    },
    {
        "role": "assistant",
        "content": "Great choices! FastAPI's async support works well with PostgreSQL.",
    },
    {
        "role": "user",
        "content": "I also use Redis for caching and Celery for background tasks.",
    },
    {
        "role": "assistant",
        "content": "That's a solid stack. Redis and Celery pair nicely with FastAPI.",
    },
]

run = client.memories.add(
    conversation,
    user_id=user_id,
    group="default",
)

status = client.runs.wait(run.run_id)
print(f"Run status: {status.status}")
print(f"Memories created: {len(status.memories_created)}")
# END StoreMemories

assert status.status == "completed"

time.sleep(5)  # Allow tenant indexing to complete


# START MemoryAugmentedChatAnthropic
def memory_augmented_chat_anthropic():
    """Memory-augmented approach: use Engram instead of full history."""
    import anthropic

    engram = EngramClient(
        api_key=os.environ["ENGRAM_API_KEY"],
    )
    anthropic_client = anthropic.Anthropic()
    user_id = "user-123"
    recent_messages = []  # Keep only last few exchanges

    while True:
        user_input = input("You: ")
        if user_input.lower() == "quit":
            break

        # Search Engram for relevant memories
        results = engram.memories.search(
            query=user_input,
            user_id=user_id,
            group="default",
            retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
        )
        memory_context = "\n".join(f"- {m.content}" for m in results)

        system_prompt = f"""You are a helpful assistant.

Relevant context from previous conversations:
{memory_context}"""

        recent_messages.append({"role": "user", "content": user_input})

        # Send only recent messages + memory context (not full history)
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=1024,
            system=system_prompt,
            messages=recent_messages[-6:],  # Last 3 exchanges only
        )
        assistant_message = response.content[0].text
        recent_messages.append({"role": "assistant", "content": assistant_message})
        print(f"Assistant: {assistant_message}")
        print(f"Messages in context: {min(len(recent_messages), 6)}\n")

        # Store the exchange as a memory
        run = engram.memories.add(
            [recent_messages[-2], recent_messages[-1]],
            user_id=user_id,
            group="default",
        )
        engram.runs.wait(run.run_id)

    engram.close()


# END MemoryAugmentedChatAnthropic


# START MemoryAugmentedChatOpenAI
def memory_augmented_chat_openai():
    """Memory-augmented approach: use Engram instead of full history."""
    from openai import OpenAI

    engram = EngramClient(
        api_key=os.environ["ENGRAM_API_KEY"],
    )
    openai_client = OpenAI()
    user_id = "user-123"
    recent_messages = []

    while True:
        user_input = input("You: ")
        if user_input.lower() == "quit":
            break

        # Search Engram for relevant memories
        results = engram.memories.search(
            query=user_input,
            user_id=user_id,
            group="default",
            retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
        )
        memory_context = "\n".join(f"- {m.content}" for m in results)

        system_prompt = f"""You are a helpful assistant.

Relevant context from previous conversations:
{memory_context}"""

        recent_messages.append({"role": "user", "content": user_input})

        # Send only recent messages + memory context (not full history)
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                *recent_messages[-6:],  # Last 3 exchanges only
            ],
        )
        assistant_message = response.choices[0].message.content
        recent_messages.append({"role": "assistant", "content": assistant_message})
        print(f"Assistant: {assistant_message}")
        print(f"Messages in context: {min(len(recent_messages), 6)}\n")

        # Store the exchange as a memory
        run = engram.memories.add(
            [recent_messages[-2], recent_messages[-1]],
            user_id=user_id,
            group="default",
        )
        engram.runs.wait(run.run_id)

    engram.close()


# END MemoryAugmentedChatOpenAI

# START SideBySide
avg_user_tokens = 25
avg_assistant_tokens = 100
avg_memory_tokens = 50  # ~5 retrieved memories at ~10 tokens each
recent_window = 6  # Keep last 3 exchanges (6 messages)

print(f"{'Turn':<6} {'Naive (tokens)':<18} {'Memory (tokens)':<18} {'Savings'}")
print("-" * 58)

for turn in [1, 5, 10, 20, 50]:
    # Naive: token count grows linearly with conversation length
    naive_tokens = turn * (avg_user_tokens + avg_assistant_tokens)

    # Memory-augmented: fixed recent window + memory search results
    recent_count = min(turn, recent_window // 2)
    memory_tokens = (
        recent_count * (avg_user_tokens + avg_assistant_tokens) + avg_memory_tokens
    )

    savings = (1 - memory_tokens / naive_tokens) * 100 if naive_tokens > 0 else 0
    print(f"{turn:<6} {naive_tokens:<18,} {memory_tokens:<18,} {savings:.0f}%")
# END SideBySide

from engram.errors import APIError

# Warm up tenant — retry until search succeeds (tenant may still be initializing)
for _retry in range(5):
    try:
        client.memories.search(query="test", user_id=user_id, group="default")
        break
    except APIError:
        time.sleep(3)

# START TopicFiltering
results = client.memories.search(
    query="What tech stack does the user prefer?",
    user_id=user_id,
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
)

for memory in results:
    print(f"- {memory.content} (topic: {memory.topic})")
# END TopicFiltering

assert len(results) >= 1

# Cleanup
for _m in results:
    client.memories.delete(_m.id, user_id=user_id, group="default")

client.close()
