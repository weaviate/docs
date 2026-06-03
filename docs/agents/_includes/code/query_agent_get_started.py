import sys

sys.path.insert(0, "docs/agents/_includes/code")
import os
from util import populate_weaviate, populate_brands, populate_recipe_ecommerce

# START Connect
import weaviate
from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)
# END Connect

# Provision the demo collections + data for the test run. The doc shows the
# equivalent create/import code below (the CreateCollections / ImportData
# snippets), which is what a reader following along would run themselves.
populate_weaviate(client, overwrite_existing=False, include_ecommerce=False)
populate_recipe_ecommerce(client)
populate_brands(client, overwrite_existing=False)

# -- The two snippets below are shown in the docs but not executed in the test
# (the collections + data are provisioned once via the helpers above).
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

client.collections.create(
    "Weather",
    description="Daily weather information including temperature, wind speed, precipitation, pressure etc.",
    vector_config=Configure.Vectors.text2vec_weaviate(),
    properties=[
        Property(name="date", data_type=DataType.DATE),
        Property(name="humidity", data_type=DataType.NUMBER),
        Property(name="precipitation", data_type=DataType.NUMBER),
        Property(name="wind_speed", data_type=DataType.NUMBER),
        Property(name="visibility", data_type=DataType.NUMBER),
        Property(name="pressure", data_type=DataType.NUMBER),
        Property(name="temperature", data_type=DataType.NUMBER, description="temperature value in Celsius")
    ]
)

client.collections.create(
    "FinancialContracts",
    description="A dataset of financial contracts between individuals and/or companies, as well as information on the type of contract and who has authored them.",
    vector_config=Configure.Vectors.text2vec_weaviate(),
)
# END CreateCollections
"""

"""
# START ImportData
from datasets import load_dataset

brands_dataset = load_dataset("weaviate/agents", "query-agent-brands", split="train", streaming=True)
ecommerce_dataset = load_dataset("weaviate/agents", "query-agent-ecommerce", split="train", streaming=True)
weather_dataset = load_dataset("weaviate/agents", "query-agent-weather", split="train", streaming=True)
financial_dataset = load_dataset("weaviate/agents", "query-agent-financial-contracts", split="train", streaming=True)

brands_collection = client.collections.use("Brands")
ecommerce_collection = client.collections.use("ECommerce")
weather_collection = client.collections.use("Weather")
financial_collection = client.collections.use("FinancialContracts")

with brands_collection.batch.dynamic() as batch:
    for item in brands_dataset:
        batch.add_object(properties=item["properties"])

with ecommerce_collection.batch.dynamic() as batch:
    for item in ecommerce_dataset:
        batch.add_object(properties=item["properties"])

with weather_collection.batch.dynamic() as batch:
    for item in weather_dataset:
        batch.add_object(properties=item["properties"])

with financial_collection.batch.dynamic() as batch:
    for item in financial_dataset:
        batch.add_object(properties=item["properties"])
# END ImportData
"""

# START InstantiateAgent
from weaviate.agents.query import QueryAgent

agent = QueryAgent(
    client=client,
    collections=["ECommerce", "Brands", "Weather", "FinancialContracts"],
)
# END InstantiateAgent

# START AskWeather
response = agent.ask("What was the average temperature in the first week of May 2025?")
response.display()
# END AskWeather

# START AskAccessResponse
print(response.final_answer)
print(response.sources)
# END AskAccessResponse

# START AskClothing
response = agent.ask("I like vintage clothes and nice shoes. Recommend some of each below $60.")
print(response.final_answer)
# END AskClothing

# START SearchMode
search_response = agent.search(
    "Find me some vintage shoes under $70",
    limit=10,
)

for obj in search_response.search_results.objects:
    print(f"Product: {obj.properties['name']} - ${obj.properties['price']}")
# END SearchMode

# START SuggestQueries
suggestions = agent.suggest_queries(num_queries=3)
for q in suggestions.queries:
    print(q.query)
# END SuggestQueries

# START SuggestQueriesInstructions
suggestions = agent.suggest_queries(
    num_queries=3,
    instructions="Focus on questions a customer would ask about the clothing items.",
)
for q in suggestions.queries:
    print(q.query)
# END SuggestQueriesInstructions

# START Close
client.close()
# END Close
