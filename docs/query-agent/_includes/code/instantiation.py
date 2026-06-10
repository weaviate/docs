import sys
sys.path.insert(0, "docs/query-agent/_includes/code")
from util import  populate_weaviate

# START WeaviateSetup
import os
import weaviate
from weaviate.agents.query import QueryAgent
from weaviate.classes.init import Auth
headers = {
    # END WeaviateSetup
    "X-OpenAI-API-Key": os.environ.get("OPENAI_API_KEY"),
    # START WeaviateSetup
    # Provide your required API key(s), e.g. Cohere, OpenAI, etc. for the configured vectorizer(s)
    "X-INFERENCE-PROVIDER-API-KEY": os.environ.get("YOUR_INFERENCE_PROVIDER_KEY", ""),
}

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
    headers=headers,
)
# END WeaviateSetup


# START InstantiateQueryAgent
qa = QueryAgent(client=client)
# END InstantiateQueryAgent


# START InstantiateWithCollections
qa = QueryAgent(
    client=client,
    collections=["FinancialContracts", "Weather"]
)
# END InstantiateWithCollections

populate_weaviate(client, False)

# START InstantiateWithoutCollections
qa = QueryAgent(client=client)

qa.ask(
    "What type of contracts have been signed and who were the authors?", 
    collections=["FinancialContracts", "Weather"]
)
# END InstantiateWithoutCollections

client.close()