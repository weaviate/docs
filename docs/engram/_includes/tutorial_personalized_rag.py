import os
import uuid
import asyncio
from engram import EngramClient, AsyncEngramClient, RetrievalConfig, PreExtractedContent

# START SetupClients
engram = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://api.engram.weaviate.io"
)
# END SetupClients

_test_suffix = uuid.uuid4().hex[:8]


# START PopulateKB
def populate_knowledge_base(weaviate_client):
    """Create a Weaviate collection and insert sample product documentation."""
    collection = weaviate_client.collections.create(
        name="ProductDocs",
        description="Product documentation for the Acme platform",
    )

    docs = [
        "Acme API supports REST and GraphQL endpoints for data access.",
        "The Acme dashboard provides real-time analytics and custom reports.",
        "Acme's Python SDK supports async operations with asyncio.",
        "Acme pricing: Free tier up to 1K requests/day, Pro at $49/month for 100K requests/day.",
        "Acme supports SSO with SAML and OIDC for enterprise customers.",
    ]

    with collection.batch.dynamic() as batch:
        for doc in docs:
            batch.add_object(properties={"content": doc})

    return collection


# END PopulateKB

# START StoreUserContext
# Store preferences for Alice (Python developer)
run_a = engram.memories.add(
    "I'm a Python developer. I prefer concise code examples. I'm building a FastAPI microservice.",
    user_id=f"tutorial-rag-alice-{_test_suffix}",
    group="default",
)
status_a = engram.runs.wait(run_a.run_id)
print(f"Alice: {status_a.status}, {len(status_a.memories_created)} memories")

# Store preferences for Bob (JavaScript developer)
run_b = engram.memories.add(
    "I'm a JavaScript developer. I prefer detailed explanations with context. I'm building a React dashboard.",
    user_id=f"tutorial-rag-bob-{_test_suffix}",
    group="default",
)
status_b = engram.runs.wait(run_b.run_id)
print(f"Bob: {status_b.status}, {len(status_b.memories_created)} memories")
# END StoreUserContext

assert status_a.status == "completed"
assert status_b.status == "completed"


# START DualSearch
def dual_search(query, user_id, kb_results=None):
    """Search both a knowledge base and Engram user memory."""
    # Search Engram for user-specific memories
    user_memories = engram.memories.search(
        query=query,
        user_id=user_id,
        group="default",
        retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
    )

    return {
        "knowledge_base": kb_results or [],
        "user_memories": user_memories,
    }


# END DualSearch

# Verify dual search works
alice_results = dual_search("programming language", f"tutorial-rag-alice-{_test_suffix}")
assert len(alice_results["user_memories"]) >= 1


# START BuildPromptAnthropic
def build_prompt_anthropic(query, kb_docs, user_memories):
    """Build a personalized prompt combining KB docs and user memory."""
    import anthropic

    kb_context = "\n".join(f"- {doc}" for doc in kb_docs)
    memory_context = "\n".join(f"- {m.content}" for m in user_memories)

    system_prompt = f"""You are a helpful product assistant.

Product documentation:
{kb_context}

What you know about this user:
{memory_context}

Tailor your response to the user's background and preferences."""

    response = anthropic.Anthropic().messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": query}],
    )
    return response.content[0].text


# END BuildPromptAnthropic


# START BuildPromptOpenAI
def build_prompt_openai(query, kb_docs, user_memories):
    """Build a personalized prompt combining KB docs and user memory."""
    from openai import OpenAI

    kb_context = "\n".join(f"- {doc}" for doc in kb_docs)
    memory_context = "\n".join(f"- {m.content}" for m in user_memories)

    system_prompt = f"""You are a helpful product assistant.

Product documentation:
{kb_context}

What you know about this user:
{memory_context}

Tailor your response to the user's background and preferences."""

    response = OpenAI().chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ],
    )
    return response.choices[0].message.content


# END BuildPromptOpenAI

# START TwoUserDemo
query = "How do I access the API?"

# Alice's personalized search
alice_memories = engram.memories.search(
    query=query,
    user_id=f"tutorial-rag-alice-{_test_suffix}",
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
)
print("Alice's context:")
for m in alice_memories:
    print(f"  - {m.content}")

# Bob's personalized search
bob_memories = engram.memories.search(
    query=query,
    user_id=f"tutorial-rag-bob-{_test_suffix}",
    group="default",
    retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
)
print("\nBob's context:")
for m in bob_memories:
    print(f"  - {m.content}")
# END TwoUserDemo

assert len(alice_memories) >= 1
assert len(bob_memories) >= 1

# START UserIsolation
# Alice searches for Bob's topics — should get no relevant results
alice_cross_search = engram.memories.search(
    query="React dashboard JavaScript",
    user_id=f"tutorial-rag-alice-{_test_suffix}",
    group="default",
)
print(f"Alice searching for Bob's topics: {len(alice_cross_search)} results")

# Bob searches for Alice's topics — should get no relevant results
bob_cross_search = engram.memories.search(
    query="FastAPI Python microservice",
    user_id=f"tutorial-rag-bob-{_test_suffix}",
    group="default",
)
print(f"Bob searching for Alice's topics: {len(bob_cross_search)} results")
# END UserIsolation

# START AsyncSetup
async_client = AsyncEngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://api.engram.weaviate.io"
)
# END AsyncSetup

# START ConcurrentUsers
async def search_for_user(async_engram, user_id, query):
    """Search memories for a single user."""
    results = await async_engram.memories.search(
        query=query,
        user_id=user_id,
        group="default",
        retrieval_config=RetrievalConfig(retrieval_type="hybrid", limit=5),
    )
    return user_id, results


async def handle_concurrent_users():
    """Handle multiple users concurrently."""
    tasks = [
        search_for_user(async_client, f"tutorial-rag-alice-{_test_suffix}", "programming preferences"),
        search_for_user(async_client, f"tutorial-rag-bob-{_test_suffix}", "programming preferences"),
    ]
    results = await asyncio.gather(*tasks)

    for uid, memories in results:
        print(f"\n{uid}:")
        for m in memories:
            print(f"  - {m.content}")

    await async_client.aclose()
    return results


concurrent_results = asyncio.run(handle_concurrent_users())
# END ConcurrentUsers

assert len(concurrent_results) == 2

# START UserDataManagement
# Retrieve a specific memory by ID
alice_memories = engram.memories.search(
    query="Python developer",
    user_id=f"tutorial-rag-alice-{_test_suffix}",
    group="default",
)

if alice_memories:
    memory = engram.memories.get(
        alice_memories[0].id,
        user_id=f"tutorial-rag-alice-{_test_suffix}",
        group="default",
    )
    print(f"Retrieved: {memory.content}")

# Delete all of a user's memories (e.g. GDPR right-to-deletion)
for m in alice_memories:
    engram.memories.delete(m.id, user_id=f"tutorial-rag-alice-{_test_suffix}", group="default")
    print(f"Deleted: {m.id}")

# Verify deletion
remaining = engram.memories.search(
    query="Python developer",
    user_id=f"tutorial-rag-alice-{_test_suffix}",
    group="default",
)
print(f"Remaining memories for Alice: {len(remaining)}")
# END UserDataManagement

# Cleanup: delete Bob's memories
for _m in bob_memories:
    engram.memories.delete(_m.id, user_id=f"tutorial-rag-bob-{_test_suffix}", group="default")

engram.close()
