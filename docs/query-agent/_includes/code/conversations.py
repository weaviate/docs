import sys
sys.path.insert(0, "docs/query-agent/_includes/code")
import os
from util import load_client_internally, populate_weaviate
client = load_client_internally()
populate_weaviate(client, False)

from weaviate.agents.query import QueryAgent

qa = QueryAgent(
    client=client,
    collections=["Weather"],
)

# START BasicConversation
from weaviate.agents.classes import ChatMessage

conversation = [
    ChatMessage(
        role="user",
        content=(
            "I have some questions about the weather data. "
            "You can assume the temperature is in Fahrenheit "
            "and the wind speed is in mph."
        )
    ),
    ChatMessage(
        role="assistant",
        content=(
            "I can help with that. "
            "What specific information are you looking for?"
        )
    ),
    ChatMessage(
        role="user",
        content=(
            "What's the average wind speed, the max wind speed, "
            "and the min wind speed?"
        )
    )
]

response = qa.ask(conversation)
# END BasicConversation

# START ExampleMessageHistory
message_history: list[ChatMessage] = []

def use_qa(query: str) -> str:
    message_history.append(
        ChatMessage(role="user", content=query)
    )
    response = qa.ask(message_history)
    message_history.append(
        ChatMessage(role="assistant", content=response.final_answer)
    )
    return response.final_answer

use_qa(
    "I have some questions about the weather data. "
    "You can assume the temperature is in Fahrenheit "
    "and the wind speed is in mph."
)

use_qa(
    "What's the average wind speed, the max wind speed, "
    "and the min wind speed?"
)
# END ExampleMessageHistory

client.close()