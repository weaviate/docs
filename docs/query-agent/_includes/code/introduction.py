import sys
sys.path.insert(0, "docs/query-agent/_includes/code")
from util import load_client_internally, populate_weaviate
client = load_client_internally()
populate_weaviate(client, False)

# START FirstExample
from weaviate.agents.query import QueryAgent

qa = QueryAgent(
    client=client, # your Weaviate cloud client
    collections=["FinancialContracts"]
)

res = qa.ask("Find all contracts signed in 2025")

res.display()

# END FirstExample

client.close()