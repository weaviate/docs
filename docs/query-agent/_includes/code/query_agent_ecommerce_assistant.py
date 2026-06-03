import sys

sys.path.insert(0, "docs/query-agent/_includes/code")
import os
from util import populate_recipe_ecommerce, populate_brands

# START Connect
import weaviate
from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)
# END Connect

# Provision the demo collections + data for the test run. The doc shows the
# equivalent create/import code below, which is what a reader following along
# would run themselves.
populate_recipe_ecommerce(client)
populate_brands(client, overwrite_existing=False)

# -- Shown in the docs but not executed in the test (data is provisioned above).
"""
# START CreateCollections
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "Brands",
    description="A dataset that lists information about clothing brands, their parent companies, average rating and more.",
    vector_config=Configure.Vectors.text2vec_weaviate()
)

client.collections.create(
    "ECommerce",
    description="A dataset that lists clothing items, their brands, prices, and more.",
    vector_config=Configure.Vectors.text2vec_weaviate(),
    properties=[
        Property(name="collection", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT),
        Property(name="tags", data_type=DataType.TEXT_ARRAY),
        Property(name="subcategory", data_type=DataType.TEXT),
        Property(name="name", data_type=DataType.TEXT),
        Property(name="description", data_type=DataType.TEXT),
        Property(name="brand", data_type=DataType.TEXT),
        Property(name="product_id", data_type=DataType.UUID),
        Property(name="colors", data_type=DataType.TEXT_ARRAY),
        Property(name="reviews", data_type=DataType.TEXT_ARRAY),
        Property(name="image_url", data_type=DataType.TEXT),
        Property(name="price", data_type=DataType.NUMBER, description="price of item in USD"),
    ]
)
# END CreateCollections
"""

"""
# START ImportData
from datasets import load_dataset

brands_dataset = load_dataset("weaviate/agents", "query-agent-brands", split="train", streaming=True)
ecommerce_dataset = load_dataset("weaviate/agents", "query-agent-ecommerce", split="train", streaming=True)

brands_collection = client.collections.use("Brands")
ecommerce_collection = client.collections.use("ECommerce")

with brands_collection.batch.dynamic() as batch:
    for item in brands_dataset:
        batch.add_object(properties=item["properties"])

with ecommerce_collection.batch.dynamic() as batch:
    for item in ecommerce_dataset:
        batch.add_object(properties=item["properties"])
# END ImportData
"""

# START InstantiateAgent
from weaviate.agents.query import QueryAgent

agent = QueryAgent(
    client=client,
    collections=["ECommerce", "Brands"],
    system_prompt=(
        "You are a friendly e-commerce shopping assistant. "
        "Help the user find products from the catalog, compare options, and answer questions about brands. "
        "Recommend specific items with their names, brands and prices, and explain why they match the user's request."
    ),
)
# END InstantiateAgent

# START AskVintage
response = agent.ask("I like the vintage clothes, can you list me some options that are less than $200?")
response.display()
# END AskVintage

# START FollowUp
from weaviate.agents.classes import ChatMessage

conversation = [
    ChatMessage(role="user", content="I like the vintage clothes, can you list me some options that are less than $200?"),
    ChatMessage(role="assistant", content=response.final_answer),
    ChatMessage(role="user", content="What about some nice shoes, same budget as before?"),
]

new_response = agent.ask(conversation)
new_response.display()
# END FollowUp

# START AskAggregation
response = agent.ask("What is the name of the brand that lists the most shoes?")
response.display()
# END AskAggregation

# START AskMultiCollection
response = agent.ask(
    "Does the brand 'Loom & Aura' have a parent brand or child brands and what countries do they operate from? "
    "Also, what's the average price of a item from 'Loom & Aura'?"
)
response.display()
# END AskMultiCollection

# START AssistantClass
from weaviate.agents.classes import ChatMessage

class ECommerceAssistant:
    def __init__(self, agent: QueryAgent):
        self.agent = agent
        self.history: list[ChatMessage] = []

    def chat(self, user_message: str) -> str:
        self.history.append(ChatMessage(role="user", content=user_message))
        response = self.agent.ask(self.history)
        self.history.append(ChatMessage(role="assistant", content=response.final_answer))
        return response.final_answer

    def reset(self):
        self.history = []
# END AssistantClass

# START DriveAssistant
assistant = ECommerceAssistant(agent)

print(assistant.chat("I like the vintage clothes, can you list me some options that are less than $200?"))
print(assistant.chat("What about some nice shoes, same budget as before?"))
print(assistant.chat("Tell me more about the brand that makes the first pair you mentioned."))
# END DriveAssistant

# START Close
client.close()
# END Close
