import sys
sys.path.insert(0, "docs/query-agent/_includes/code")
import asyncio
from weaviate.classes.config import Configure, Property, DataType
import os

from util import populate_weaviate

# START BasicAskMode
from weaviate.agents.query import QueryAgent
from weaviate.classes.init import Auth
import weaviate

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.getenv("WEAVIATE_API_KEY")),
)

qa = QueryAgent(
    client=client, 
    collections=["Weather"]
)
# END BasicAskMode

populate_weaviate(client, False)

# START BasicAskMode

res = qa.ask(
    query = "What was the average temperature in the first week of May 2025?",
    result_evaluation = "none"
)

# END BasicAskMode

# START StreamingAskMode
for output in qa.ask_stream("What was the average temperature in the first week of May 2025?"):
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

for output in qa.ask_stream("What was the average temperature in the first week of May 2025?"):
    print_stream_output(output)

# END StreamingExample

# -- Async examples below require await inside a function, for simplicity of code snippets we can wrap them in strings
# then define a function that runs this below (so tests run the same)
"""
# START AsyncInstantiation        
from weaviate.agents.query import AsyncQueryAgent

async_client = weaviate.use_async_with_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)
await async_client.connect()

async_qa = AsyncQueryAgent(
    client=async_client, collections=["Weather"]
)
# END AsyncInstantiation
"""
"""
# START AsyncAsk
await async_qa.ask(
    query = "What was the average temperature in the first week of May 2025?",
)
# END AsyncAsk
"""
"""
# START AsyncStreaming
async for output in async_qa.ask_stream("What was the average temperature in the first week of May 2025?"):
    pass # Do something with the output
# END AsyncStreaming
"""


# --- Below for testing:
async def _async_run_for_testing():
    from weaviate.agents.query import AsyncQueryAgent

    async_client = weaviate.use_async_with_weaviate_cloud(
        cluster_url=os.environ.get("WEAVIATE_URL"),
        auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
    )
    await async_client.connect()

    async_qa = AsyncQueryAgent(
        client=async_client, collections=["Weather"]
    )
    await async_qa.ask(
        query = "What was the average temperature in the first week of May 2025?",
    )
    async for output in async_qa.ask_stream("What was the average temperature in the first week of May 2025?"):
        pass # Do something with the output
    await async_client.close()
asyncio.run(_async_run_for_testing())
client.close()