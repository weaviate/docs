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


# START InstantiateQueryAgent
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.agents.query import QueryAgent

# END InstantiateQueryAgent

# START InstantiateQueryAgent

headers = {
    # END InstantiateQueryAgent
    "X-Cohere-API-Key": os.environ.get("COHERE_API_KEY"),
    "X-OpenAI-API-Key": os.environ.get("OPENAI_API_KEY"),
    # START InstantiateQueryAgent
    # Provide your required API key(s), e.g. Cohere, OpenAI, etc. for the configured vectorizer(s)
    "X-INFERENCE-PROVIDER-API-KEY": os.environ.get("YOUR_INFERENCE_PROVIDER_KEY", ""),
}

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
    headers=headers,
)
# END InstantiateQueryAgent

populate_weaviate(
    client, overwrite_existing=False
)  # Populate the Weaviate instance with data

# START InstantiateQueryAgent

# Instantiate a new agent object
qa = QueryAgent(
    client=client, collections=["ECommerce", "FinancialContracts", "Weather"]
)
# END InstantiateQueryAgent

# START SystemPromptExample
from weaviate.agents.query import QueryAgent

# Define a custom system prompt to guide the agent's behavior
system_prompt = """You are a helpful assistant that can answer questions about the products and users in the database.
When you write your response use standard markdown formatting for lists, tables, and other structures.
Emphasize key insights and provide actionable recommendations when relevant."""

qa = QueryAgent(
    client=client,
    collections=["ECommerce", "FinancialContracts", "Weather"],
    system_prompt=system_prompt,
)

response = qa.ask("What are the most expensive items in the store?")
response.display()
# END SystemPromptExample

# START QueryAgentCollectionConfiguration
from weaviate.agents.query import QueryAgent
from weaviate.agents.classes import QueryAgentCollectionConfig

qa = QueryAgent(
    client=client,
    collections=[
        QueryAgentCollectionConfig(
            name="ECommerce",  # The name of the collection to query
            target_vector=[
                "name_description_brand_vector"
            ],  # Target vector name(s) for collections with named vectors
            view_properties=[
                "name",
                "description",
                "price",
            ],  # Optional list of property names the agent can view
            # Optional tenant name for collections with multi-tenancy enabled
            # tenant="tenantA"
        ),
        QueryAgentCollectionConfig(name="FinancialContracts"),
        QueryAgentCollectionConfig(name="Weather"),
    ],
)
# END QueryAgentCollectionConfiguration

# START UserDefinedFilters
from weaviate.agents.query import QueryAgent
from weaviate.agents.classes import QueryAgentCollectionConfig
from weaviate.classes.query import Filter

# Apply persistent filters that will always be combined with agent-generated filters
qa = QueryAgent(
    client=client,
    collections=[
        QueryAgentCollectionConfig(
            name="ECommerce",
            # This filter ensures only items above $50 are considered
            additional_filters=Filter.by_property("price").greater_than(50),
            target_vector=[
                "name_description_brand_vector"
            ],  # Required target vector name(s) for collections with named vectors
        ),
    ],
)

# The agent will automatically combine these filters with any it generates
response = qa.ask("Find me some affordable clothing items")
response.display()

# You can also apply filters dynamically at runtime
runtime_config = QueryAgentCollectionConfig(
    name="ECommerce",
    additional_filters=Filter.by_property("category").equal("Footwear"),
)

response = qa.ask("What products are available?", collections=[runtime_config])
response.display()
# END UserDefinedFilters

# Reset qa to original configuration for following examples
qa = QueryAgent(
    client=client,
    collections=[
        QueryAgentCollectionConfig(
            name="ECommerce",
            target_vector=["name_description_brand_vector"],
            view_properties=["name", "description", "price"],
        ),
        QueryAgentCollectionConfig(name="FinancialContracts"),
        QueryAgentCollectionConfig(name="Weather"),
    ],
)

# START QueryAgentAskBasicCollectionSelection
response = qa.ask(
    "What kinds of contracts are listed? What's the most common type of contract?",
    collections=["FinancialContracts"],
)

response.display()
# END QueryAgentAskBasicCollectionSelection

# START QueryAgentAskCollectionConfig
from weaviate.agents.classes import QueryAgentCollectionConfig

response = qa.ask(
    "I like vintage clothes and nice shoes. Recommend some of each below $60.",
    collections=[
        # Use QueryAgentCollectionConfig class to provide further collection configuration
        QueryAgentCollectionConfig(
            name="ECommerce",  # The name of the collection to query
            target_vector=[
                "name_description_brand_vector"
            ],  # Required target vector name(s) for collections with named vectors
            view_properties=[
                "name",
                "description",
                "category",
                "brand",
            ],  # Optional list of property names the agent can view
        ),
        QueryAgentCollectionConfig(
            name="FinancialContracts",  # The name of the collection to query
            # Optional tenant name for collections with multi-tenancy enabled
            # tenant="tenantA"
        ),
    ],
)

response.display()
# END QueryAgentAskCollectionConfig

# START BasicAskQuery
# Perform a query using Ask Mode (with answer generation)
response = qa.ask(
    "I like vintage clothes and nice shoes. Recommend some of each below $60."
)

# Print the response
response.display()
# END BasicAskQuery

# START BasicSearchQuery
# Perform a search using Search Mode (retrieval only, no answer generation)
search_response = qa.search("Find me some vintage shoes under $70", limit=10)

# Access the search results
for obj in search_response.search_results.objects:
    print(f"Product: {obj.properties['name']} - ${obj.properties['price']}")
# END BasicSearchQuery

# START SearchModeResponseStructure
# SearchModeResponse structure for Python
search_response = qa.search("winter boots for under $100", limit=5)

# Access different parts of the response
print(f"Original query: {search_response.original_query}")
print(f"Total time: {search_response.total_time}")

# Access usage statistics
print(f"Usage statistics: {search_response.usage}")

# Access the searches performed (if any)
if search_response.searches:
    for search in search_response.searches:
        print(f"Search performed: {search}")

# Access the search results (QueryReturn object)
for obj in search_response.search_results.objects:
    print(f"Properties: {obj.properties}")
    print(f"Metadata: {obj.metadata}")
# END SearchModeResponseStructure

# START SearchPagination
# Search with pagination
response_page_1 = qa.search(
    "Find summer shoes and accessories between $50 and $100 that have the tag 'sale'",
    limit=3,
)

# Get the next page of results
response_page_2 = response_page_1.next(limit=3, offset=3)

# Continue paginating
response_page_3 = response_page_2.next(limit=3, offset=3)

# Access results from each page
for page_num, page_response in enumerate(
    [response_page_1, response_page_2, response_page_3], 1
):
    print(f"Page {page_num}:")
    for obj in page_response.search_results.objects:
        # Safely access properties in case they don't exist
        name = obj.properties.get("name", "Unknown Product")
        price = obj.properties.get("price", "Unknown Price")
        print(f"  {name} - ${price}")
    print()
# END SearchPagination

# START FollowUpQuery
# Perform a follow-up query and include the answer from the previous query
from weaviate.agents.classes import ChatMessage

conversation = [
    ChatMessage(role="assistant", content=response.final_answer),
    ChatMessage(
        role="user",
        content="I like the vintage clothes options, can you do the same again but above $200?",
    ),
]

following_response = qa.ask(conversation)

# Print the response
following_response.display()
# END FollowUpQuery

# START ConversationalQuery
from weaviate.agents.classes import ChatMessage

# Create a conversation with multiple turns
conversation = [
    ChatMessage(role="user", content="Hi!"),
    ChatMessage(role="assistant", content="Hello! How can I assist you today?"),
    ChatMessage(
        role="user",
        content="I have some questions about the weather data. You can assume the temperature is in Fahrenheit and the wind speed is in mph.",
    ),
    ChatMessage(
        role="assistant",
        content="I can help with that. What specific information are you looking for?",
    ),
]

# Add the user's query
conversation.append(
    ChatMessage(
        role="user",
        content="What's the average wind speed, the max wind speed, and the min wind speed",
    )
)

# Get the response
response = qa.ask(conversation)
print(response.final_answer)

# Continue the conversation
conversation.append(ChatMessage(role="assistant", content=response.final_answer))
conversation.append(ChatMessage(role="user", content="and for the temperature?"))

response = qa.ask(conversation)
print(response.final_answer)
# END ConversationalQuery

query = "What are the top 5 products sold in the last 30 days?"

# START StreamResponse
from weaviate.agents.classes import ProgressMessage, StreamedTokens

for output in qa.ask_stream(
    query,
    # Setting this to false will skip ProgressMessages, and only stream
    # the StreamedTokens / the final QueryAgentResponse
    include_progress=True,  # Default is True
    include_final_state=True,  # Default is True
):
    if isinstance(output, ProgressMessage):
        # The message is a human-readable string, structured info available in output.details
        print(output.message)
    elif isinstance(output, StreamedTokens):
        # The delta is a string containing the next chunk of the final answer
        print(output.delta, end="", flush=True)
    else:
        # This is the final response, as returned by QueryAgent.ask()
        output.display()
# END StreamResponse

# START InspectResponseExample
print("\n=== Query Agent Response ===")
print(f"Original Query: {response.original_query}\n")

print("🔍 Final Answer Found:")
print(f"{response.final_answer}\n")

print("🔍 Searches Executed:")
for collection_searches in response.searches:
    for result in collection_searches:
        print(f"- {result}\n")

if len(response.aggregations) > 0:
    print("📊 Aggregation Results:")
    for collection_aggs in response.aggregations:
        for agg in collection_aggs:
            print(f"- {agg}\n")

if response.missing_information:
    if response.is_partial_answer:
        print("⚠️ Answer is Partial - Missing Information:")
    else:
        print("⚠️ Missing Information:")
    for missing in response.missing_information:
        print(f"- {missing}")
# END InspectResponseExample

assert response.final_answer != "" and response.final_answer is not None

client.close()

# START UsageAsyncQueryAgent
import asyncio
import os
import weaviate
from weaviate.agents.query import AsyncQueryAgent


async_client = weaviate.use_async_with_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=os.environ.get("WEAVIATE_API_KEY"),
    headers=headers,
)


async def query_vintage_clothes(async_query_agent: AsyncQueryAgent):
    response = await async_query_agent.ask(
        "I like vintage clothes and nice shoes. Recommend some of each below $60."
    )
    return ("Vintage Clothes", response)


async def query_financial_data(async_query_agent: AsyncQueryAgent):
    response = await async_query_agent.ask(
        "What kinds of contracts are listed? What's the most common type of contract?",
    )
    return ("Financial Contracts", response)


async def run_concurrent_queries():
    try:
        await async_client.connect()

        async_qa = AsyncQueryAgent(
            async_client,
            collections=[
                QueryAgentCollectionConfig(
                    name="ECommerce",  # The name of the collection to query
                    target_vector=[
                        "name_description_brand_vector"
                    ],  # Optional target vector name(s) for collections with named vectors
                    view_properties=[
                        "name",
                        "description",
                        "category",
                        "brand",
                    ],  # Optional list of property names the agent can view
                ),
                QueryAgentCollectionConfig(
                    name="FinancialContracts",  # The name of the collection to query
                    # Optional tenant name for collections with multi-tenancy enabled
                    # tenant="tenantA"
                ),
            ],
        )

        # Wait for both to complete
        vintage_response, financial_response = await asyncio.gather(
            query_vintage_clothes(async_qa), query_financial_data(async_qa)
        )

        # Display results
        print(f"=== {vintage_response[0]} ===")
        vintage_response[1].display()

        print(f"=== {financial_response[0]} ===")
        financial_response[1].display()

    finally:
        await async_client.close()


asyncio.run(run_concurrent_queries())
# END UsageAsyncQueryAgent


# START StreamAsyncResponse
async def stream_query(async_query_agent: AsyncQueryAgent):
    async for output in async_query_agent.ask_stream(
        "What are the top 5 products sold in the last 30 days?",
        # Setting this to false will skip ProgressMessages, and only stream
        # the StreamedTokens / the final QueryAgentResponse
        include_progress=True,  # Default is True
    ):
        if isinstance(output, ProgressMessage):
            # The message is a human-readable string, structured info available in output.details
            print(output.message)
        elif isinstance(output, StreamedTokens):
            # The delta is a string containing the next chunk of the final answer
            print(output.delta, end="", flush=True)
        else:
            # This is the final response, as returned by QueryAgent.ask()
            output.display()


async def run_streaming_query():
    try:
        await async_client.connect()
        async_qa = AsyncQueryAgent(
            async_client,
            collections=[
                QueryAgentCollectionConfig(
                    name="ECommerce",  # The name of the collection to query
                    target_vector=[
                        "name_description_brand_vector"
                    ],  # Optional target vector name(s) for collections with named vectors
                    view_properties=[
                        "name",
                        "description",
                        "category",
                        "brand",
                    ],  # Optional list of property names the agent can view
                ),
                QueryAgentCollectionConfig(
                    name="FinancialContracts",  # The name of the collection to query
                    # Optional tenant name for collections with multi-tenancy enabled
                    # tenant="tenantA"
                ),
            ],
        )
        await stream_query(async_qa)

    finally:
        await async_client.close()


asyncio.run(run_streaming_query())
# END StreamAsyncResponse
