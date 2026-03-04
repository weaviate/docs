import os
import uuid
from engram import EngramClient, RetrievalConfig

# START Setup
client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://api.engram.weaviate.io"
)
user_id = f"tutorial-chat-{uuid.uuid4().hex[:8]}"
# END Setup


# START ChatFunctionAnthropic
def chat_anthropic(
    user_message, conversation_history, system_prompt="You are a helpful assistant."
):
    import anthropic

    conversation_history.append({"role": "user", "content": user_message})
    response = anthropic.Anthropic().messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        system=system_prompt,
        messages=conversation_history,
    )
    assistant_message = response.content[0].text
    conversation_history.append({"role": "assistant", "content": assistant_message})
    return assistant_message


# END ChatFunctionAnthropic

# Validate chat_anthropic builds conversation history correctly
_test_history = []
_test_response = chat_anthropic("Hello, my name is Alice.", _test_history)
assert (
    len(_test_history) == 2
), f"Expected 2 messages in history, got {len(_test_history)}"
assert _test_history[0]["role"] == "user"
assert _test_history[0]["content"] == "Hello, my name is Alice."
assert _test_history[1]["role"] == "assistant"
assert isinstance(_test_response, str) and len(_test_response) > 0

_test_response_2 = chat_anthropic("What is my name?", _test_history)
assert (
    len(_test_history) == 4
), f"Expected 4 messages in history, got {len(_test_history)}"
assert _test_history[2]["role"] == "user"
assert _test_history[3]["role"] == "assistant"
assert isinstance(_test_response_2, str) and len(_test_response_2) > 0


# START ChatFunctionOpenAI
def chat_openai(
    user_message, conversation_history, system_prompt="You are a helpful assistant."
):
    from openai import OpenAI

    conversation_history.append({"role": "user", "content": user_message})
    response = OpenAI().chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": system_prompt}] + conversation_history,
    )
    assistant_message = response.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": assistant_message})
    return assistant_message


# END ChatFunctionOpenAI

# Validate chat_openai builds conversation history correctly
_test_history_oai = []
_test_response_oai = chat_openai("Hello, my name is Bob.", _test_history_oai)
assert (
    len(_test_history_oai) == 2
), f"Expected 2 messages in history, got {len(_test_history_oai)}"
assert _test_history_oai[0]["role"] == "user"
assert _test_history_oai[0]["content"] == "Hello, my name is Bob."
assert _test_history_oai[1]["role"] == "assistant"
assert isinstance(_test_response_oai, str) and len(_test_response_oai) > 0

_test_response_oai_2 = chat_openai("What is my name?", _test_history_oai)
assert (
    len(_test_history_oai) == 4
), f"Expected 4 messages in history, got {len(_test_history_oai)}"
assert _test_history_oai[2]["role"] == "user"
assert _test_history_oai[3]["role"] == "assistant"
assert isinstance(_test_response_oai_2, str) and len(_test_response_oai_2) > 0

# START StoreConversation
conversation = [
    {
        "role": "user",
        "content": "I just moved to Berlin and I'm looking for a good coffee shop.",
    },
    {
        "role": "assistant",
        "content": "Welcome to Berlin! Here are some popular coffee shops in the city...",
    },
    {"role": "user", "content": "I prefer specialty coffee, not chains."},
]

run = client.memories.add(
    conversation,
    user_id=user_id,
    group="default",
)

status = client.runs.wait(run.run_id)
print(f"Run status: {status.status}")
print(f"Memories created: {len(status.memories_created)}")
# END StoreConversation

assert status.status == "completed"

import time

from engram.errors import APIError

# Warm up tenant — retry until search succeeds (tenant may still be initializing)
for _retry in range(5):
    try:
        client.memories.search(query="test", user_id=user_id, group="default")
        break
    except APIError:
        time.sleep(3)

# START SearchMemories
results = client.memories.search(
    query="What kind of coffee does the user like?",
    user_id=user_id,
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
)

memory_context = "\n".join(f"- {m.content}" for m in results)

system_prompt = f"""You are a helpful assistant with memory of past conversations.

Here is what you remember about this user:
{memory_context}

Use these memories to personalize your responses."""

print(system_prompt)
# END SearchMemories

assert len(results) >= 1
assert any(
    "Berlin" in m.content or "coffee" in m.content or "specialty" in m.content
    for m in results
)


# START FullLoopAnthropic
def memory_chat_loop_anthropic():
    """Complete chat loop with Engram memory and Anthropic."""
    import anthropic

    engram = EngramClient(
        api_key=os.environ["ENGRAM_API_KEY"],
    )
    anthropic_client = anthropic.Anthropic()
    user_id = "user-123"
    conversation_history = []

    print("Chat with memory (type 'quit' to exit)\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() == "quit":
            break

        # Retrieve relevant memories
        results = engram.memories.search(
            query=user_input,
            user_id=user_id,
            group="default",
            retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
        )
        memory_context = "\n".join(f"- {m.content}" for m in results)
        system_prompt = f"""You are a helpful assistant with memory of past conversations.

Here is what you remember about this user:
{memory_context}

Use these memories to personalize your responses."""

        # Get response from Claude
        conversation_history.append({"role": "user", "content": user_input})
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=1024,
            system=system_prompt,
            messages=conversation_history,
        )
        assistant_message = response.content[0].text
        conversation_history.append({"role": "assistant", "content": assistant_message})
        print(f"Assistant: {assistant_message}\n")

        # Store the conversation turn as a memory
        run = engram.memories.add(
            [conversation_history[-2], conversation_history[-1]],
            user_id=user_id,
            group="default",
        )
        engram.runs.wait(run.run_id)

    engram.close()


if __name__ == "__main__":
    memory_chat_loop_anthropic()
# END FullLoopAnthropic


# START FullLoopOpenAI
def memory_chat_loop_openai():
    """Complete chat loop with Engram memory and OpenAI."""
    from openai import OpenAI

    engram = EngramClient(
        api_key=os.environ["ENGRAM_API_KEY"],
    )
    openai_client = OpenAI()
    user_id = "user-123"
    conversation_history = []

    print("Chat with memory (type 'quit' to exit)\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() == "quit":
            break

        # Retrieve relevant memories
        results = engram.memories.search(
            query=user_input,
            user_id=user_id,
            group="default",
            retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
        )
        memory_context = "\n".join(f"- {m.content}" for m in results)
        system_prompt = f"""You are a helpful assistant with memory of past conversations.

Here is what you remember about this user:
{memory_context}

Use these memories to personalize your responses."""

        # Get response from OpenAI
        conversation_history.append({"role": "user", "content": user_input})
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": system_prompt}]
            + conversation_history,
        )
        assistant_message = response.choices[0].message.content
        conversation_history.append({"role": "assistant", "content": assistant_message})
        print(f"Assistant: {assistant_message}\n")

        # Store the conversation turn as a memory
        run = engram.memories.add(
            [conversation_history[-2], conversation_history[-1]],
            user_id=user_id,
            group="default",
        )
        engram.runs.wait(run.run_id)

    engram.close()


# END FullLoopOpenAI

# Validate memory_chat_loop_anthropic runs end-to-end
from unittest.mock import patch

# Seed a memory for user-123 so the tenant exists before the loop searches
_seed_run = client.memories.add(
    "Seed memory for testing.",
    user_id="user-123",
    group="default",
)
client.runs.wait(_seed_run.run_id)
time.sleep(3)

with patch("builtins.input", side_effect=["I love hiking in the mountains.", "quit"]):
    memory_chat_loop_anthropic()

# Verify the loop stored a memory
_loop_results = client.memories.search(
    query="hiking mountains",
    user_id="user-123",
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
)
assert (
    len(_loop_results) >= 1
), "memory_chat_loop_anthropic should have stored at least one memory"

# Clean up loop memories
for _m in _loop_results:
    client.memories.delete(_m.id, user_id="user-123", group="default")

# Validate memory_chat_loop_openai runs end-to-end
with patch(
    "builtins.input", side_effect=["I enjoy reading science fiction books.", "quit"]
):
    memory_chat_loop_openai()

_loop_results_oai = client.memories.search(
    query="science fiction books",
    user_id="user-123",
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
)
assert (
    len(_loop_results_oai) >= 1
), "memory_chat_loop_openai should have stored at least one memory"

# Clean up loop memories
for _m in _loop_results_oai:
    client.memories.delete(_m.id, user_id="user-123", group="default")

# Cleanup
for _m in results:
    client.memories.delete(_m.id, user_id=user_id, group="default")

client.close()
