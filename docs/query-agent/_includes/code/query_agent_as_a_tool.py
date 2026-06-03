# Reference snippets for the "Using the Query Agent as a tool" recipe.
# These examples integrate external providers (Gemini, Vertex AI, Ollama,
# LangChain, LlamaIndex) and are NOT executed by the test suite. The file
# exists so the documentation has a single source of truth for each snippet.

# START DefineTool
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.agents.query import QueryAgent

weaviate_client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.getenv("WEAVIATE_API_KEY")),
)

agent = QueryAgent(
    client=weaviate_client,
    collections=["WeaviateBlogChunks"],
)

def ask_weaviate(query: str) -> str:
    """
    Look up information in the Weaviate knowledge base by asking a question.

    Use this tool whenever the user asks something that may be answered by
    content stored in the Weaviate database. The tool runs an agentic search
    and returns a natural-language answer composed from the underlying data.

    Args:
        query: The user's question, phrased in natural language.

    Returns:
        A natural-language answer composed from the relevant content
        in the database.
    """
    return agent.ask(query).final_answer
# END DefineTool

# START GeminiClient
from google import genai
from google.genai import types

client = genai.Client()
config = types.GenerateContentConfig(tools=[ask_weaviate])
# END GeminiClient

# START GeminiAsk
prompt = """
You are connected to a database that has Weaviate blog posts.
How do I deploy Weaviate with Docker?
"""

chat = client.chats.create(model="gemini-2.0-flash", config=config)
response = chat.send_message(prompt)
print(response.text)
# END GeminiAsk

# START VertexClient
from google import genai
from google.genai.types import GenerateContentConfig

client = genai.Client(
    vertexai=True,
    project=os.getenv("GCP_PROJECT_ID"),
    location=os.getenv("GOOGLE_CLOUD_REGION"),
)

MODEL_ID = "gemini-2.0-flash-001"  # any Model Garden model that supports function calling
# END VertexClient

# START VertexAsk
prompt = """
You are connected to a database that has Weaviate blog posts.
How do I deploy Weaviate with Docker?
"""

response = client.models.generate_content(
    model=MODEL_ID,
    contents=prompt,
    config=GenerateContentConfig(tools=[ask_weaviate], temperature=0),
)
print(response.text)
# END VertexAsk

# START OllamaSchema
import json
import ollama

query_agent_tool_schema = [{
    "type": "function",
    "function": {
        "name": "ask_weaviate",
        "description": "Send a question to the Weaviate knowledge base and get a natural-language answer.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The question to ask, in natural language.",
                },
            },
            "required": ["query"],
        },
    },
}]

tool_mapping = {"ask_weaviate": ask_weaviate}
# END OllamaSchema

# START OllamaLoop
def chat_with_weaviate(user_message: str, model_name: str = "llama3.1") -> str:
    messages = [{"role": "user", "content": user_message}]

    # First call: let the model decide whether to call a tool
    response = ollama.chat(
        model=model_name,
        messages=messages,
        tools=query_agent_tool_schema,
    )
    messages.append(response["message"])

    # If a tool was requested, execute it and append the result
    if response["message"].get("tool_calls"):
        for tool in response["message"]["tool_calls"]:
            function_name = tool["function"]["name"]
            args = tool["function"]["arguments"]
            if isinstance(args, str):
                args = json.loads(args)
            query = args.get("query", "")

            print(f"Querying Weaviate with: {query}")
            function_response = tool_mapping[function_name](query)

            messages.append({
                "role": "tool",
                "content": function_response,
                "name": function_name,
            })

        # Second call: let the model use the tool result to compose its answer
        final_response = ollama.chat(model=model_name, messages=messages)
        return final_response["message"]["content"]

    # No tool used — return the model's direct answer
    return response["message"]["content"]
# END OllamaLoop

# START OllamaAsk
response = chat_with_weaviate(
    user_message="How do I deploy Weaviate with Docker?",
    model_name="llama3.1",
)
print(response)
# END OllamaAsk

# START LangchainTool
from langchain.tools import tool
from langchain.chat_models import init_chat_model

@tool
def ask_weaviate_tool(query: str) -> str:
    """
    Look up information in the Weaviate knowledge base by asking a question.

    Use this whenever the user asks something that may be answered by
    content stored in the Weaviate database.

    Args:
        query: The user's question in natural language.

    Returns:
        A natural-language answer composed from the relevant content.
    """
    return ask_weaviate(query)
# END LangchainTool

# START LangchainBind
llm = init_chat_model("gpt-4o", model_provider="openai")
llm_with_tools = llm.bind_tools([ask_weaviate_tool])
# END LangchainBind

# START LangchainAsk
response = llm_with_tools.invoke("How do I run Weaviate with Docker?")
print(response.content)
# END LangchainAsk

# START LlamaWorkflow
from llama_index.llms.openai import OpenAI
from llama_index.core.agent.workflow import AgentWorkflow

llm = OpenAI(model="gpt-4o-mini")

workflow = AgentWorkflow.from_tools_or_functions(
    [ask_weaviate],
    llm=llm,
    system_prompt=(
        "You are an agent that can search a Weaviate database "
        "of blog content and answer questions about it."
    ),
)
# END LlamaWorkflow

# START LlamaAsk
response = await workflow.run(user_msg="How do I run Weaviate with Docker?")
print(response)
# END LlamaAsk

# START Close
weaviate_client.close()
# END Close
