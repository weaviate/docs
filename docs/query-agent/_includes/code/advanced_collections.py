import sys
sys.path.insert(0, "docs/agents/_includes/code")
from util import load_client_internally, populate_weaviate

client = load_client_internally()
populate_weaviate(client, False)

from weaviate.agents.query import QueryAgent
from weaviate.agents.classes import QueryAgentCollectionConfig


# START SimpleConfig
from weaviate.agents.query import QueryAgent

qa = QueryAgent(
    client=client,
    collections=["ECommerce", "FinancialContracts"],
)
# END SimpleConfig

# START AdvancedConfig
from weaviate.agents.classes import QueryAgentCollectionConfig

qa = QueryAgent(
    client=client,
    collections=[
        # Use QueryAgentCollectionConfig class to provide further collection configuration
        QueryAgentCollectionConfig(
            name="ECommerce", 
            target_vector=[
                "name_description_brand_vector"
            ], 
            view_properties=[
                "name",
                "description",
                "category",
                "brand",
            ],  
        ),
        QueryAgentCollectionConfig(
            name="FinancialContracts"
        ),
    ],
)

# END AdvancedConfig


# START RuntimeConfigAsk
response = qa.ask(
    "Recommend some shoes below $60.",
    collections=[
        QueryAgentCollectionConfig(
            name="ECommerce",
            target_vector=[
                "name_description_brand_vector"
            ],
        ),
    ],
)
# END RuntimeConfigAsk

client.close()