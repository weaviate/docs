import sys
sys.path.insert(0, "docs/query-agent/_includes/code")
from util import populate_weaviate

# START InstantiateQueryAgent
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.agents.query import QueryAgent

headers = {
    # END InstantiateQueryAgent
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
    client, overwrite_existing=True
)  # Populate the Weaviate instance with data

# START InstantiateQueryAgent

# Instantiate a new query agent object
qa = QueryAgent(
    client=client, 
    collections=["ECommerce", "FinancialContracts", "Weather"]
)
# END InstantiateQueryAgent

from weaviate.agents.classes import QueryAgentCollectionConfig
qa = QueryAgent(
    client=client, 
    collections=[
        QueryAgentCollectionConfig(
            name="ECommerce",
            target_vector=[
                "name_description_brand_vector"
            ],
        ), 
        "FinancialContracts", 
        "Weather"
    ]
)

# START BasicSearchQuery
search_response = qa.search(
    "Find me some vintage shoes under $70",
    filtering="recall",
    limit=10
)
# END BasicSearchQuery

# START BasicSearchResponse
for obj in search_response.search_results.objects:
    print(f"Product: {obj.properties['name']} - ${obj.properties['price']}")
# END BasicSearchResponse

# START BasicAskQuery
ask_response = qa.ask(
    "I like vintage clothes and nice shoes. Recommend some of each below $60."
)
# END BasicAskQuery

# START BasicAskResponse
ask_response.sources # retrieved objects from initial search
ask_response.final_answer # final answer to the question
ask_response.display()
# END BasicAskResponse

client.close()