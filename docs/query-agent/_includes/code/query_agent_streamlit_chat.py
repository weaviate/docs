# Reference snippets for the "Build a streaming chat UI with Streamlit" recipe.
# This is a Streamlit application (`streamlit run app.py`) and is NOT executed by
# the test suite. The file exists so the documentation has a single source of
# truth for each snippet.

# START LoadData
"""One-time data import for the Streamlit chat recipe."""
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType
from datasets import load_dataset

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)

# --- Create the collections --------------------------------------------------
# The `description` fields below are what the Query Agent reads to decide
# which collection to search and how to interpret each property — providing
# them is what lets the agent route a question like "what's the cheapest
# vintage dress?" to the right place.

client.collections.create(
    "Brands",
    description=(
        "A dataset that lists information about clothing brands, their "
        "parent companies, average rating and more."
    ),
    vector_config=Configure.Vectors.text2vec_weaviate(),
)

client.collections.create(
    "ECommerce",
    description="A dataset that lists clothing items, their brands, prices, and more.",
    vector_config=Configure.Vectors.text2vec_weaviate(),
    properties=[
        Property(name="collection", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT),
        Property(name="tags", data_type=DataType.TEXT_ARRAY),
        Property(name="subcategory", data_type=DataType.TEXT),
        Property(name="name", data_type=DataType.TEXT),
        Property(name="description", data_type=DataType.TEXT),
        Property(name="brand", data_type=DataType.TEXT),
        Property(name="product_id", data_type=DataType.UUID),
        Property(name="colors", data_type=DataType.TEXT_ARRAY),
        Property(name="reviews", data_type=DataType.TEXT_ARRAY),
        Property(name="image_url", data_type=DataType.TEXT),
        Property(
            name="price",
            data_type=DataType.NUMBER,
            description="price of item in USD",
        ),
    ],
)

# --- Pull the datasets from Hugging Face ------------------------------------
brands_dataset = load_dataset(
    "weaviate/agents", "query-agent-brands", split="train", streaming=True
)
ecommerce_dataset = load_dataset(
    "weaviate/agents", "query-agent-ecommerce", split="train", streaming=True
)

brands_collection = client.collections.use("Brands")
ecommerce_collection = client.collections.use("ECommerce")

print("Importing Brands…")
with brands_collection.batch.dynamic() as batch:
    for item in brands_dataset:
        batch.add_object(properties=item["properties"])

print("Importing ECommerce…")
with ecommerce_collection.batch.dynamic() as batch:
    for item in ecommerce_dataset:
        batch.add_object(properties=item["properties"])

print(f"\nBrands collection:    {len(brands_collection)} objects")
print(f"ECommerce collection: {len(ecommerce_collection)} objects")

client.close()
# END LoadData

# START AppFull
"""Streamlit chat UI for the Weaviate Query Agent."""
import os

import streamlit as st
import weaviate
from weaviate.classes.init import Auth
from weaviate.agents.query import QueryAgent
from weaviate.agents.classes import (
    ProgressMessage,
    StreamedTokens,
    AskModeResponse,
    ChatMessage,
)

st.set_page_config(page_title="E-Commerce Assistant", page_icon="🛍️")
st.title("🛍️ E-Commerce Assistant")
st.caption("Powered by the Weaviate Query Agent")


@st.cache_resource
def get_agent() -> QueryAgent:
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=os.environ["WEAVIATE_URL"],
        auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
    )
    return QueryAgent(
        client=client,
        collections=["ECommerce", "Brands"],
        system_prompt=(
            "You are a friendly e-commerce shopping assistant. "
            "Help the user find products from the catalog, compare options, "
            "and answer questions about brands. Recommend specific items with "
            "their name, brand and price, and explain why they match."
        ),
    )


agent = get_agent()

# Chat history persists across script re-runs
if "messages" not in st.session_state:
    st.session_state.messages = []

with st.sidebar:
    st.header("Settings")
    if st.button("Reset conversation", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

# Render history so the user sees prior turns
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Handle a new prompt
if prompt := st.chat_input("Ask about products, brands, prices…"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Build the full conversation for the agent
    conversation = [
        ChatMessage(role=m["role"], content=m["content"])
        for m in st.session_state.messages
    ]

    # Stream the agent's response
    with st.chat_message("assistant"):
        progress_box = st.empty()
        answer_box = st.empty()
        sources_to_show = []
        answer_so_far = ""

        for output in agent.ask_stream(conversation):
            if isinstance(output, ProgressMessage):
                progress_box.info(f"🔄 {output.message}")
            elif isinstance(output, StreamedTokens):
                answer_so_far += output.delta
                answer_box.markdown(answer_so_far + "▌")
            elif isinstance(output, AskModeResponse):
                progress_box.empty()
                answer_box.markdown(answer_so_far)
                sources_to_show = output.sources or []

        if sources_to_show:
            with st.expander(f"Sources ({len(sources_to_show)})"):
                for src in sources_to_show:
                    st.write(f"- `{src.object_id}` in **{src.collection}**")

    st.session_state.messages.append({"role": "assistant", "content": answer_so_far})
# END AppFull

# START GetAgentExcerpt
@st.cache_resource
def get_agent() -> QueryAgent:
    client = weaviate.connect_to_weaviate_cloud(...)
    return QueryAgent(client=client, collections=[...], system_prompt=...)
# END GetAgentExcerpt

# START StreamingExcerpt
for output in agent.ask_stream(conversation):
    if isinstance(output, ProgressMessage):
        progress_box.info(f"🔄 {output.message}")
    elif isinstance(output, StreamedTokens):
        answer_so_far += output.delta
        answer_box.markdown(answer_so_far + "▌")
    elif isinstance(output, AskModeResponse):
        progress_box.empty()
        answer_box.markdown(answer_so_far)
        sources_to_show = output.sources or []
# END StreamingExcerpt

# START SourcesExcerpt
if sources_to_show:
    with st.expander(f"Sources ({len(sources_to_show)})"):
        for src in sources_to_show:
            st.write(f"- `{src.object_id}` in **{src.collection}**")
# END SourcesExcerpt
