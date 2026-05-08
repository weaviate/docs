import sys
sys.path.insert(0, "docs/agents/_includes/code")
from util import load_client_internally, populate_weaviate
client = load_client_internally()
populate_weaviate(client, False)

# START OverviewInInit
from weaviate.agents.query import QueryAgent
from weaviate.agents.classes import QueryAgentCollectionConfig
from weaviate.classes.query import Filter

qa = QueryAgent(
    client=client,
    collections=[
        QueryAgentCollectionConfig(
            name="Weather",
            additional_filters=Filter.by_property("temperature").greater_than(10)
        ),
    ],
    # END OverviewInInit
    timeout=120,
    # START OverviewInInit
)
# END OverviewInInit

# START OverviewInRuntime
runtime_config = QueryAgentCollectionConfig(
    name="Weather",
    additional_filters=Filter.by_property("humidity").equal(39)
)

response = qa.ask(
    query="Provide a summary of the weather patterns", 
    collections=[runtime_config]
)
# END OverviewInRuntime

# START FilterExampleBad
response = qa.ask(
    query=(
        "What type of contracts have been signed and who were the authors?"
        "IMPORTANT: Only look at contracts from 2025."
    ),
    collections=["FinancialContracts"]
)
# END FilterExampleBad


# START FilterExampleGood
from datetime import datetime, timezone

start_date = datetime(2025, 1, 1, tzinfo=timezone.utc)
end_date = datetime(2026, 1, 1, tzinfo=timezone.utc)

response = qa.ask(
    query="What type of contracts have been signed and who were the authors?",
    collections=[
        QueryAgentCollectionConfig(
            name="FinancialContracts",
            additional_filters=(
                Filter.all_of(
                    [
                        Filter.by_property("date").greater_than(start_date),
                        Filter.by_property("date").less_than(end_date)
                    ]
                )
            )
        )
    ]
)
# END FilterExampleGood

# START BasicFilter
QueryAgentCollectionConfig(
    name="ECommerce",
    additional_filters=Filter.by_property("category").equal("Tops")
)
# END BasicFilter


# START NestedFilter
QueryAgentCollectionConfig(
    name="ECommerce",
    additional_filters=Filter.any_of(
        [
            Filter.by_property("category").equal("Shoes"),
            Filter.all_of(
                [
                    Filter.by_property("price").greater_than(50),
                    Filter.by_property("price").less_than(100)
                ]
            )
        ]
    )
)
# END NestedFilter

client.close()