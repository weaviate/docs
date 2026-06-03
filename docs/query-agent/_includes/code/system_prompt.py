import sys
sys.path.insert(0, "docs/query-agent/_includes/code")
from util import load_client_internally

client = load_client_internally()

# START InstantiateWithSystemPrompt
from weaviate.agents.query import QueryAgent
from weaviate.agents.classes import QueryAgentCollectionConfig

# Define a custom system prompt to guide the agent's behavior
system_prompt = """
You are a helpful assistant that can answer questions about the products and users in the database.
When you write your response use standard markdown formatting for lists, tables, and other structures.
Emphasize key insights and provide actionable recommendations when relevant.
"""

qa = QueryAgent(
    client=client,
    collections=[
        QueryAgentCollectionConfig(
            name="ECommerce",
            target_vector=["name_description_brand_vector"],
        )
    ],
    system_prompt=system_prompt,
    # END InstantiateWithSystemPrompt
    timeout=120,
    # START InstantiateWithSystemPrompt
)
# END InstantiateWithSystemPrompt

# START AskWithSystemPrompt
response = qa.ask("What are the most expensive items in the store?")
# END AskWithSystemPrompt