from weaviate.classes.config import Configure, Property, DataType


def populate_weaviate(client, overwrite_existing=False):

    if overwrite_existing:
        client.collections.delete("Ecommerce")
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
                    vector_index_config=Configure.VectorIndex.hnsw(),
                ),
                Configure.Vectors.text2vec_weaviate(
                    name="name_description_brand_vector",
                    source_properties=[
                        "name",
                        "description",
                        "brand",
                    ],
                    vector_index_config=Configure.VectorIndex.hnsw(),
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

    if not client.collections.exists("FinancialContracts"):
        client.collections.create(
            "FinancialContracts",
            description="A dataset of financial contracts between individuals and/or companies, as well as information on the type of contract and who has authored them.",
            vector_config=Configure.Vectors.text2vec_weaviate(),
        )

    from datasets import load_dataset

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

    ecommerce_collection = client.collections.get("ECommerce")
    weather_collection = client.collections.get("Weather")
    financial_collection = client.collections.get("FinancialContracts")

    with ecommerce_collection.batch.fixed_size(batch_size=200) as batch:
        for item in ecommerce_dataset:
            batch.add_object(properties=item["properties"])

    with weather_collection.batch.fixed_size(batch_size=200) as batch:
        for item in weather_dataset:
            batch.add_object(properties=item["properties"], vector=item["vector"])

    with financial_collection.batch.fixed_size(batch_size=200) as batch:
        for item in financial_dataset:
            batch.add_object(properties=item["properties"], vector=item["vector"])

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

populate_weaviate(client)  # Populate the Weaviate instance with data

# START InstantiateQueryAgent

# Instantiate a new agent object
qa = QueryAgent(
    client=client, collections=["ECommerce", "FinancialContracts", "Weather"]
)
# END InstantiateQueryAgent

# START QueryAgentCollectionConfiguration
from weaviate.agents.query import QueryAgent
from weaviate.agents.classes import QueryAgentCollectionConfig

qa = QueryAgent(
    client=client,
    collections=[
        QueryAgentCollectionConfig(
            name="ECommerce",  # The name of the collection to query
            target_vector=["name_description_brand_vector"],  # Target vector name(s) for collections with named vectors
            view_properties=["description"],  # Optional list of property names the agent can view
            # Optional tenant name for collections with multi-tenancy enabled
            # tenant="tenantA"
        ),
        QueryAgentCollectionConfig(name="FinancialContracts"),
        QueryAgentCollectionConfig(name="Weather"),
    ],
)
# END QueryAgentCollectionConfiguration

# START QueryAgentRunBasicCollectionSelection
response = qa.run(
    "What kinds of contracts are listed? What's the most common type of contract?",
    collections=["FinancialContracts"],
)

response.display()
# END QueryAgentRunBasicCollectionSelection

# START QueryAgentRunCollectionConfig
from weaviate_agents.classes import QueryAgentCollectionConfig

response = qa.run(
    "I like vintage clothes and nice shoes. Recommend some of each below $60.",
    collections=[
        # Use QueryAgentCollectionConfig class to provide further collection configuration
        QueryAgentCollectionConfig(
            name="ECommerce",  # The name of the collection to query
            target_vector=["name_description_brand_vector"], # Optional target vector name(s) for collections with named vectors
            view_properties=["name", "description", "category", "brand"], # Optional list of property names the agent can view
        ),
        QueryAgentCollectionConfig(
            name="FinancialContracts",  # The name of the collection to query
            # Optional tenant name for collections with multi-tenancy enabled
            # tenant="tenantA"
        ),
    ],
)

response.display()
# END QueryAgentRunCollectionConfig

# START BasicQuery
# Perform a query
response = qa.run(
    "I like vintage clothes and nice shoes. Recommend some of each below $60."
)

# Print the response
response.display()
# END BasicQuery

# START FollowUpQuery
# Perform a follow-up query to 'I like vintage clothes and nice shoes. Recommend some of each below $60.'
following_response = qa.run(
    "I like the vintage clothes options, can you do the same again but above $200?",
    context=response,
)

# Print the response
response.display()
# END FollowUpQuery

query = "What are the top 5 products sold in the last 30 days?"

# START StreamResponse
from weaviate.agents.classes import ProgressMessage, StreamedTokens

for output in qa.stream(
    query,
    # Setting this to false will skip ProgressMessages, and only stream
    # the StreamedTokens / the final QueryAgentResponse
    include_progress=True,      # Default is True
    include_final_state=True    # Default is True
):
    if isinstance(output, ProgressMessage):
        # The message is a human-readable string, structured info available in output.details
        print(output.message)
    elif isinstance(output, StreamedTokens):
        # The delta is a string containing the next chunk of the final answer
        print(output.delta, end='', flush=True)
    else:
        # This is the final response, as returned by QueryAgent.run()
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
    response = await async_query_agent.run(
        "I like vintage clothes and nice shoes. Recommend some of each below $60."
    )
    return ("Vintage Clothes", response)

async def query_financial_data(async_query_agent: AsyncQueryAgent):
    response = await async_query_agent.run(
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
                    target_vector=["name_description_brand_vector"], # Optional target vector name(s) for collections with named vectors
                    view_properties=["name", "description", "category", "brand"], # Optional list of property names the agent can view
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
            query_vintage_clothes(async_qa),
            query_financial_data(async_qa)
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
    async for output in async_query_agent.stream(
        "What are the top 5 products sold in the last 30 days?",
        # Setting this to false will skip ProgressMessages, and only stream
        # the StreamedTokens / the final QueryAgentResponse
        include_progress=True  # Default is True
    ):
        if isinstance(output, ProgressMessage):
            # The message is a human-readable string, structured info available in output.details
            print(output.message)
        elif isinstance(output, StreamedTokens):
            # The delta is a string containing the next chunk of the final answer
            print(output.delta, end='', flush=True)
        else:
            # This is the final response, as returned by QueryAgent.run()
            output.display()

async def run_streaming_query():
    try:
        await async_client.connect()
        async_qa = AsyncQueryAgent(
            async_client,
            collections=[
                QueryAgentCollectionConfig(
                    name="ECommerce",  # The name of the collection to query
                    target_vector=["name_description_brand_vector"], # Optional target vector name(s) for collections with named vectors
                    view_properties=["name", "description", "category", "brand"], # Optional list of property names the agent can view
                ),
                QueryAgentCollectionConfig(
                    name="FinancialContracts",  # The name of the collection to query
                    # Optional tenant name for collections with multi-tenancy enabled
                    # tenant="tenantA"
                ),
            ]
        )
        await stream_query(async_qa)

    finally:
        await async_client.close()

asyncio.run(run_streaming_query())
# END StreamAsyncResponse
