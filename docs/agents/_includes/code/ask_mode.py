from weaviate.classes.config import Configure, Property, DataType


def populate_weaviate(client, overwrite_existing=False):

    if overwrite_existing:
        client.collections.delete("ECommerce")
        client.collections.delete("Weather")
        client.collections.delete("FinancialContracts")

    if not client.collections.exists("ECommerce"):
        client.collections.create(
            "ECommerce",
            description="A dataset that lists clothing items, their brands, prices, and more.",
            vector_config=[
                Configure.Vectors.text2vec_weaviate(
                    name="description_vector",
                    source_properties=[
                        "description",
                    ],
                ),
                Configure.Vectors.text2vec_weaviate(
                    name="name_description_brand_vector",
                    source_properties=[
                        "name",
                        "description",
                        "brand",
                    ],
                ),
            ],
            properties=[
                Property(name="collection", data_type=DataType.TEXT),
                Property(
                    name="category",
                    data_type=DataType.TEXT,
                    description="The category to which the clothing item belongs",
                ),
                Property(
                    name="tags",
                    data_type=DataType.TEXT_ARRAY,
                    description="The tags that are assocciated with the clothing item",
                ),
                Property(name="subcategory", data_type=DataType.TEXT),
                Property(name="name", data_type=DataType.TEXT),
                Property(
                    name="description",
                    data_type=DataType.TEXT,
                    description="A detailed description of the clothing item",
                ),
                Property(
                    name="brand",
                    data_type=DataType.TEXT,
                    description="The brand of the clothing item",
                ),
                Property(name="product_id", data_type=DataType.UUID),
                Property(
                    name="colors",
                    data_type=DataType.TEXT_ARRAY,
                    description="The colors on the clothing item",
                ),
                Property(name="reviews", data_type=DataType.TEXT_ARRAY),
                Property(name="image_url", data_type=DataType.TEXT),
                Property(
                    name="price",
                    data_type=DataType.NUMBER,
                    description="The price of the clothing item in USD",
                ),
            ],
        )
        overwrite_existing = True

    if not client.collections.exists("Weather"):
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
                Property(
                    name="temperature",
                    data_type=DataType.NUMBER,
                    description="temperature value in Celsius",
                ),
            ],
        )
        overwrite_existing = True

    if not client.collections.exists("FinancialContracts"):
        client.collections.create(
            "FinancialContracts",
            description="A dataset of financial contracts between individuals and/or companies, as well as information on the type of contract and who has authored them.",
            vector_config=Configure.Vectors.text2vec_weaviate(),
        )
        overwrite_existing = True

    from datasets import load_dataset

    if not overwrite_existing:
        print("Data already exists in Weaviate, skipping import.")
        return

    ecommerce_dataset = load_dataset(
        "weaviate/agents", "query-agent-ecommerce", split="train", streaming=True
    )
    weather_dataset = load_dataset(
        "weaviate/agents", "query-agent-weather", split="train", streaming=True
    )
    financial_dataset = load_dataset(
        "weaviate/agents",
        "query-agent-financial-contracts",
        split="train",
        streaming=True,
    )

    ecommerce_collection = client.collections.use("ECommerce")
    weather_collection = client.collections.use("Weather")
    financial_collection = client.collections.use("FinancialContracts")

    print("\nImport `query-agent-ecommerce` dataset into Weaviate")
    with ecommerce_collection.batch.fixed_size(batch_size=200) as batch:
        for item in ecommerce_dataset:
            batch.add_object(properties=item["properties"])
            if batch.number_errors > 0:
                print("Batch import stopped due to excessive errors.")
                break

    failed_objects = ecommerce_collection.batch.failed_objects
    if failed_objects:
        print(f"Number of failed imports: {len(failed_objects)}")
        print(f"First failed object: {failed_objects[0]}")

    print("\nImport `query-agent-weather` dataset into Weaviate")
    with weather_collection.batch.fixed_size(batch_size=200) as batch:
        for item in weather_dataset:
            batch.add_object(properties=item["properties"], vector=item["vector"])
            if batch.number_errors > 0:
                print("Batch import stopped due to excessive errors.")
                break

    failed_objects = weather_collection.batch.failed_objects
    if failed_objects:
        print(f"Number of failed imports: {len(failed_objects)}")
        print(f"First failed object: {failed_objects[0]}")

    print("\nImport `query-agent-financial-contracts` dataset into Weaviate")
    with financial_collection.batch.fixed_size(batch_size=200) as batch:
        for item in financial_dataset:
            batch.add_object(properties=item["properties"], vector=item["vector"])
            if batch.number_errors > 0:
                print("Batch import stopped due to excessive errors.")
                break

    failed_objects = financial_collection.batch.failed_objects
    if failed_objects:
        print(f"Number of failed imports: {len(failed_objects)}")
        print(f"First failed object: {failed_objects[0]}")

    print("\nData import complete!")
    print(f"Size of the ECommerce dataset: {len(ecommerce_collection)}")
    print(f"Size of the Weather dataset: {len(weather_collection)}")
    print(f"Size of the Financial dataset: {len(financial_collection)}")

    client.close()  # Free up resources


# START BasicAskMode
from weaviate_agents.query import QueryAgent
from weaviate.classes.init import Auth
import weaviate

client = weaviate.connect_to_weaviate_cloud(
    cluster_url="<your-weaviate-cloud-url>",
    auth_credentials=Auth.api_key("<your-weaviate-cloud-api-key>"),
)

qa = QueryAgent(
    client=client, 
    collections=["<your-collection-name>"],
    system_prompt = (
        "You are a helpful assistant. "
        "Write your response in short, 5 word sentnces. "
        "Emphasize key insights."
    )
)

# END BasicAskMode
import os

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)

qa = QueryAgent(
    client=client, collections=["ECommerce"]
)

# START BasicAskMode

res = qa.ask(
    query = "What is the most expensive blue t-shirt?",
    result_evaluation = "none"
)

# END BasicAskMode

# START ImportAskResponse
from weaviate.agents.classes import AskModeResponse
# END ImportAskResponse

# START StreamingAskMode
for output in qa.ask_stream("What is the most expensive blue t-shirt?"):
    pass # Do something with the output
# END StreamingAskMode

# START StreamingExample
from weaviate.agents.classes import ProgressMessage, StreamedTokens, AskModeResponse

def print_stream_output(output):
    if isinstance(output, ProgressMessage):
        print(output.message)
    elif isinstance(output, StreamedTokens):
        print(output.delta, end='', flush=True)
    elif isinstance(output, AskModeResponse):
        output.display()

for output in qa.ask_stream("What is the most expensive blue t-shirt?"):
    print_stream_output(output)

# END StreamingExample

# START AsyncInstantiation
from weaviate.agents.query import AsyncQueryAgent

async_client = weaviate.use_async_with_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)
await async_client.connect()

async_qa = AsyncQueryAgent(
    client=async_client, collections=["ECommerce"]
)
# END AsyncInstantiation

# START AsyncAsk
await async_qa.ask(
    query = "What is the most expensive blue t-shirt?",
)
# END AsyncAsk

# START AsyncStreaming
async for output in async_qa.ask_stream("What is the most expensive blue t-shirt?"):
    pass # Do something with the output
# END AsyncStreaming