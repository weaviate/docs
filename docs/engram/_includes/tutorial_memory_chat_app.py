import os
from engram import EngramClient, RetrievalConfig

# Setup
client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://dev-engram.labs.weaviate.io"
)
user_id = "tutorial-chat-user"
# END Setup

# ChatFunctionAnthropic
def chat_anthropic(user_message, conversation_history, system_prompt="You are a helpful assistant."):
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

# ChatFunctionOpenAI
def chat_openai(user_message, conversation_history, system_prompt="You are a helpful assistant."):
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

# StoreConversation
conversation = [
    {"role": "user", "content": "I just moved to Berlin and I'm looking for a good coffee shop."},
    {"role": "assistant", "content": "Welcome to Berlin! Here are some popular coffee shops in the city..."},
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

# SearchMemories
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
assert any("Berlin" in m.content or "coffee" in m.content or "specialty" in m.content for m in results)


# FullLoopAnthropic
def memory_chat_loop_anthropic():
    """Complete chat loop with Engram memory and Anthropic."""
    import anthropic

    engram = EngramClient(
        api_key=os.environ["ENGRAM_API_KEY"],
        base_url=os.environ.get("ENGRAM_API_URL", "https://api.engram.weaviate.io"),
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

# FullLoopOpenAI
def memory_chat_loop_openai():
    """Complete chat loop with Engram memory and OpenAI."""
    from openai import OpenAI

    engram = EngramClient(
        api_key=os.environ["ENGRAM_API_KEY"],
        base_url=os.environ.get("ENGRAM_API_URL", "https://api.engram.weaviate.io"),
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
            messages=[{"role": "system", "content": system_prompt}] + conversation_history,
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

# Cleanup
for _m in results:
    client.memories.delete(_m.id, topic=_m.topic, user_id=user_id)

client.close()
