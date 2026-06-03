import sys
import asyncio
sys.path.insert(0, "docs/query-agent/_includes/code")
from util import populate_weaviate, load_client_internally


client = load_client_internally()
populate_weaviate(client, False)
client.close()

# START BasicSearchMode
import os
import weaviate
from weaviate.agents.query import QueryAgent
from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)

qa = QueryAgent(
    client=client,
    collections=["ECommerce"],
)
# END BasicSearchMode

from weaviate.agents.classes import QueryAgentCollectionConfig
qa = QueryAgent(
    client=client, 
    collections=[
        QueryAgentCollectionConfig(
            name="ECommerce",
            target_vector=[
                "name_description_brand_vector"
            ],
        )
    ]
)

# START BasicSearchMode
search_response = qa.search(
    query="Find me some vintage shoes under $70",
    limit=10,
)

# Access the matching Weaviate objects
for obj in search_response.search_results.objects:
    print(f"Product: {obj.properties['name']} - ${obj.properties['price']}")
# END BasicSearchMode

# START DiversityRanking
qa = QueryAgent(
    client=client, 
    collections=[
        QueryAgentCollectionConfig(
            name="ECommerce",
            target_vector=["name_description_brand_vector"],
        )
    ]
)

search_response = qa.search(
    "summer shoes",
    limit=10,
    diversity_weight=0.5,
)

for obj in search_response.search_results.objects:
    print(f"Product: {obj.properties['name']} - ${obj.properties['price']}")
# END DiversityRanking

# START SearchPagination
# Search with pagination
response_page_1 = qa.search(
    "Find summer shoes and accessories between $50 and $100 that have the tag 'sale'",
    limit=3,
)

# Get the next page of results
response_page_2 = response_page_1.next(limit=3, offset=3)

# Continue paginating
response_page_3 = response_page_2.next(limit=3, offset=6)

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

# START FilteringExample
search_response = qa.search(
    "Find me some vintage shoes under $70",
    filtering="precision",
    limit=10,
)

for obj in search_response.search_results.objects:
    print(f"Product: {obj.properties['name']} - ${obj.properties['price']}")
# END FilteringExample

# --- Async code examples in string as top-level await doesn't work, full code will be executed in 
# asyncio.run below

"""
# START AsyncInstantiation
from weaviate.agents.query import AsyncQueryAgent

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
# END AsyncInstantiation
"""
"""
# START AsyncSearch
await async_qa.search(
    query="Find me some vintage shoes under $70",
    limit=10,
)
# END AsyncSearch
"""

async def _async_run_for_testing():
    from weaviate.agents.query import AsyncQueryAgent

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

    await async_qa.search(
        query="Find me some vintage shoes under $70",
        limit=10,
    )
    await async_client.close()

asyncio.run(_async_run_for_testing())
client.close()