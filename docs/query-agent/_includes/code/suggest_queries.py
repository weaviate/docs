import sys
import asyncio

sys.path.insert(0, "docs/query-agent/_includes/code")
from util import load_client_internally, populate_weaviate
client = load_client_internally()
populate_weaviate(client, False)

# START SuggestQueries
from weaviate.agents.query import QueryAgent
qa = QueryAgent(client=client)

response = qa.suggest_queries(
    collections=["FinancialContracts"],
    num_queries=3,
    instructions="High-level themes and open-ended exploration",
)
# END SuggestQueries

# START IndividualCall
qa = QueryAgent(client=client, collections=["FinancialContracts"])

qa.suggest_queries()
# END IndividualCall


# START AccessResponse
for suggested_query in response.queries:
    print(suggested_query.query)
# END AccessResponse

# START SuggestQueriesWithConversation
from weaviate.agents.classes import ChatMessage

# Build a conversation history
conversation = [
    ChatMessage(role="user", content="What are some popular machine learning frameworks?"),
    ChatMessage(
        role="assistant",
        content="Some popular ML frameworks include TensorFlow, PyTorch, and JAX.",
    ),
]

# Suggest follow-up queries based on the conversation context
response = qa.suggest_queries(
    conversation=conversation,
    num_queries=3,
)

for suggested_query in response.queries:
    print(suggested_query.query)
# END SuggestQueriesWithConversation

"""
# START AsyncInstantiation
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.agents.query import AsyncQueryAgent

async_client = weaviate.use_async_with_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)
await async_client.connect()

async_qa = AsyncQueryAgent(client=async_client)
# END AsyncInstantiation
"""

"""
# START AsyncSuggest
await async_qa.suggest_queries(
    collections=["FinancialContracts"],
    num_queries=3,
    instructions="High-level themes and open-ended exploration",
)
# END AsyncSuggest
"""

async def _async_run_for_testing():
    import os
    import weaviate
    from weaviate.classes.init import Auth
    from weaviate.agents.query import AsyncQueryAgent
    from weaviate.agents.classes import QueryAgentCollectionConfig

    async_client = weaviate.use_async_with_weaviate_cloud(
        cluster_url=os.environ.get("WEAVIATE_URL"),
        auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
    )
    await async_client.connect()

    async_qa = AsyncQueryAgent(
        client=async_client, 
        collections=[
            QueryAgentCollectionConfig(
                name="ECommerce",
                target_vector=["name_description_brand_vector"],
            )
        ]
    )
    await async_qa.suggest_queries(
        collections=["FinancialContracts"],
        num_queries=3,
        instructions="High-level themes and open-ended exploration",
    )

    await async_client.close()

asyncio.run(_async_run_for_testing())
client.close()