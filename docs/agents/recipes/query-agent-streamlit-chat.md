---
layout: recipe
toc: True
title: "Build a Streaming Chat UI with Streamlit"
featured: True
integration: True
agent: True
sidebar_position: 30
tags: ['Query Agent', 'Streamlit', 'Streaming', 'UI']
---

In this recipe, we'll build a chat UI for the Weaviate Query Agent using [Streamlit](https://streamlit.io). The UI streams the agent's progress (which collection it's searching, what query it's running) *and* the final answer token by token, so the user sees something happen the moment they hit enter — instead of waiting silently for the full response.

We'll use the **ECommerce + Brands** datasets and give the agent a system prompt that frames it as a shopping assistant. The result is a working chat app you can run locally with `streamlit run app.py`.

This recipe focuses on three things:

- **Streaming responses** via the Query Agent's `ask_stream` API.
- **Multi-turn conversations** with persisted chat history.
- **Surfacing the agent's reasoning** so the user can see *what* it's doing, not just the final answer.

> 💡 New to the Query Agent? Start with the [**Get Started**](./query-agent-get-started.md) recipe — it covers Ask Mode, Search Mode and Suggest Queries at a higher level.

## What You'll Build

When you run the app, the user types a question like *"recommend me some vintage shoes under $80"* and immediately sees a sequence of progress lines — *"Analyzing query…"*, *"Searching ECommerce…"*, *"Generating answer…"* — appear above an empty assistant bubble. As soon as the agent starts composing its response, the answer streams in token by token. When the run completes, a *Sources* expander appears underneath with the UUIDs of the products the agent referenced. The whole experience feels alive instead of stuck.

## What You'll Need

- A **Weaviate Cloud** cluster — [create a free sandbox here](https://console.weaviate.cloud/). When you create the cluster, enable **Embeddings** so you don't need to provide an external embedding provider's API key.
- The Weaviate client with the `agents` extras, plus Streamlit and `datasets` (for the one-time data import):

```bash
pip install -U "weaviate-client[agents]" streamlit datasets
```

- Two environment variables in the shell you'll run from:

```bash
export WEAVIATE_URL="https://your-cluster.weaviate.network"
export WEAVIATE_API_KEY="your-api-key"
```

## Setting Up the Data

The chat app reads from two collections: **ECommerce** (clothing items with brands, prices, reviews, tags) and **Brands** (brand metadata including parent/child relationships). We'll load both from open datasets on Hugging Face.

This is a **one-time setup** — once the collections exist and have data you can re-run the Streamlit app as many times as you like without re-importing.

Save the following as `load_data.py` and run it once:

```python
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
```

Run it:

```bash
python load_data.py
```

The import takes a couple of minutes — Hugging Face streams the data, Weaviate Embeddings vectorizes it on the way in. If you re-run this script and the collections already exist, the `client.collections.create(...)` calls will error; uncomment the `client.collections.delete(...)` lines or delete the collections from the Weaviate Cloud console first.

The two datasets used here are public on Hugging Face:

- [**weaviate/agents · query-agent-ecommerce**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-ecommerce) — clothing items with brands, prices, reviews and tags.
- [**weaviate/agents · query-agent-brands**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-brands) — clothing brand metadata including parent/child brand relationships.

## The App

Save the following as `app.py`. We'll walk through what each part does in the next section.

```python
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
```

Run it with:

```bash
streamlit run app.py
```

This will open a browser at `http://localhost:8501` with the chat UI.

## How It Works

### Connecting once with `@st.cache_resource`

Streamlit re-runs the entire script on every interaction — every chat submission, every button click. Without caching, that would mean opening a fresh Weaviate connection and instantiating a new `QueryAgent` for every message the user sends.

```python
@st.cache_resource
def get_agent() -> QueryAgent:
    client = weaviate.connect_to_weaviate_cloud(...)
    return QueryAgent(client=client, collections=[...], system_prompt=...)
```

`@st.cache_resource` marks a function whose return value is a long-lived resource. The agent and its underlying Weaviate client are created exactly once per session, no matter how many turns the user takes.

### Chat history in `st.session_state`

`st.session_state.messages` is a list of `{role, content}` dicts that survives across script re-runs. On every new prompt we:

1. Append the user message to history.
2. Build a `list[ChatMessage]` from the full history and pass it to `ask_stream`.
3. Append the agent's final answer to history once the stream completes.

Passing the *entire* history on every call is what gives the agent full context for follow-up questions like *"what about under $50?"* or *"tell me more about the second one."* See [Multi-turn Conversations](../reference/multi_turn_conversations.md) for more on this pattern.

### Streaming three kinds of output

`agent.ask_stream(conversation)` is a generator that yields three different payload types as the agent works through your question. The UI handles each one differently:

```python
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
```

- **`ProgressMessage`** — Updates like *"Analyzing query…"*, *"Running search…"*, *"Generating answer…"*. We show only the latest in `progress_box`. This is the part that makes the app feel responsive — within a second of the user hitting enter, they see *something* describing what the agent is doing.
- **`StreamedTokens`** — Incremental chunks of the final answer. We append `output.delta` to a running string and re-render. The trailing `▌` is a fake cursor that visually communicates *still generating*.
- **`AskModeResponse`** — The final payload, emitted once when the run completes. We clear the progress indicator, render the answer one last time without the cursor, and grab the `sources` list to display in an expander below.

The two `st.empty()` placeholders are the trick that makes this work. Calling `.info(...)` or `.markdown(...)` on an `empty()` placeholder *replaces* its contents, so the UI updates in place instead of appending a new line for every chunk.

### Sources expander

When the run is done, we render an expander with the UUIDs of the source objects the agent used:

```python
if sources_to_show:
    with st.expander(f"Sources ({len(sources_to_show)})"):
        for src in sources_to_show:
            st.write(f"- `{src.object_id}` in **{src.collection}**")
```

For a real storefront app you'd likely fetch each object and render its full properties (name, brand, image, price) — see [Extending the App](#extending-the-app) below.

## Try It Out

Some questions to throw at the assistant once it's running:

- *"Recommend me some vintage shoes under $80."*
- *"Which brand has the most products under $50?"*
- *"Tell me more about the parent brand of Loom & Aura."*
- *"What about something more colorful in the same price range?"* — a follow-up to test multi-turn context.

## Extending the App

A few directions you can take this from here:

- **Render product cards from sources.** Instead of showing UUIDs, fetch each source object via `client.collections.use("ECommerce").query.fetch_object_by_id(src.object_id)` and render its name, price, and image in `st.columns`. This is what a real storefront chat would do.
- **Toggle between Ask and Search Modes.** Add a sidebar radio to pick *"answer me"* (Ask Mode) versus *"show me the products"* (Search Mode). In Search Mode, call `agent.search(...)` and render `search_results.objects` as a product grid. See the [Search Mode](../guides/search_mode.md) page.
- **Show suggested follow-ups.** After each turn, call `agent.suggest_queries(num_queries=3, instructions="Based on the conversation, suggest follow-up questions a shopper might ask.")` and render the suggestions as buttons that re-submit when clicked. See [Suggest Queries](../guides/suggest_queries.md).
- **Surface partial-answer warnings.** Pass `result_evaluation="llm"` to enable `is_partial_answer` and `missing_information`. Display a small warning above the answer when the agent flags the response as incomplete. See [Ask Mode](../guides/ask_mode.md#response).
- **Deploy it.** Streamlit apps run on [Streamlit Community Cloud](https://streamlit.io/cloud), Hugging Face Spaces, or your own server. For deployment, move the env vars into [Streamlit secrets](https://docs.streamlit.io/develop/concepts/connections/secrets-management) (`st.secrets["WEAVIATE_URL"]`) instead of `os.environ`.

## Next Steps

- [**Ask Mode**](../guides/ask_mode.md) — Full details on `ask_stream`, the three streaming payload classes, and parameter reference.
- [**Get Started with the Weaviate Query Agent**](./query-agent-get-started.md) — Walkthrough of Ask Mode, Search Mode and Suggest Queries at a higher level.
- [**Build a Query Agent E-Commerce Assistant**](./query-agent-ecommerce-assistant.md) — Use-case-focused tutorial that wraps the Query Agent into a reusable assistant class.
- [**Using the Query Agent as a Tool**](./query-agent-as-a-tool.md) — Hand the agent to other frameworks (Gemini, Vertex AI, Ollama, LangChain, LlamaIndex) as a callable tool.
