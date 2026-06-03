---
layout: recipe
toc: True
title: "Using the Query Agent as a tool"
featured: True
integration: True
agent: True
sidebar_position: 40
# tags: ['Query Agent', 'Integration', 'Function Calling']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/agents/_includes/code/query_agent_as_a_tool.py';

In this recipe, we'll show how to expose the [Weaviate Query Agent](https://docs.weaviate.io/agents) as a **tool** to other LLMs and agent frameworks. The Query Agent already handles search, filtering, aggregation, and writing a natural-language answer — wrapping it as a tool lets a higher-level model decide *when* to consult your Weaviate data as part of a larger reasoning flow.

We'll cover five integrations:

- **Google Gemini API** (via `google-genai`)
- **Google Vertex AI** (via `google-genai` with a GCP project)
- **Ollama** (local LLMs with function calling)
- **LangChain**
- **LlamaIndex**

Because the Query Agent is just a Python call (`agent.ask(query).final_answer`), the same pattern works in any framework that supports tools or function calling — see [the closing section](#using-the-query-agent-as-a-tool-anywhere) for how to adapt this to anything else.

> 💡 New to the Query Agent itself? Start with the [**Get Started**](./query-agent-get-started.md) recipe first — it walks through the agent's own Ask Mode, Search Mode and Suggest Queries features before treating it as a building block.

## What you'll need

This recipe assumes:

- A **Weaviate Cloud** cluster — [create a free sandbox here](https://console.weaviate.cloud/).
- A populated collection. The examples below use `WeaviateBlogChunks` (the Weaviate blog content), but you can substitute your own collection name throughout.
- The Weaviate client with the `agents` extras:

```python
!pip install -U "weaviate-client[agents]"
```

Each framework section adds its own additional installs.

## Connect to Weaviate and define the tool

The trick to using the Query Agent as a tool is simple: it's a Python function that takes a string in and returns a string out. Most modern agent frameworks can consume a regular Python function directly — the function's name and docstring become the tool's name and description, which is what the calling LLM uses to decide whether to invoke it.

We'll create the Weaviate client and the `QueryAgent` **once**, and wrap a thin function around them. Reusing a single client across calls avoids reopening a connection on every invocation, which is what you want in any real application.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START DefineTool"
  endMarker="# END DefineTool"
  language="py"
/>

</TabItem>
</Tabs>

A few things to notice:

- The **docstring matters**. Tool-calling LLMs read it to decide when to invoke the function and what argument to pass. Be specific about what the tool is for and when to use it.
- The function returns a plain `str` (the agent's `final_answer`). Some frameworks can also pass through structured objects, but a single string is the most portable form.
- The `agent` is captured in a closure. In a long-running application you'd put this inside a class or module so you can close the client cleanly on shutdown.

The rest of this recipe is just five different ways to hand `ask_weaviate` to a calling LLM.

## Google Gemini API

The [Google Gen AI SDK](https://googleapis.github.io/python-genai/) lets you pass a regular Python function directly as a tool — it inspects the signature and docstring to build the function declaration.

### Setup

You'll need a Gemini API key, which you can generate in [Google AI Studio](https://aistudio.google.com/).

```python
!pip install -U google-genai
```

```python
import os
os.environ["GOOGLE_API_KEY"] = ""  # your Gemini API key
```

### Create the client and register the tool

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START GeminiClient"
  endMarker="# END GeminiClient"
  language="py"
/>

</TabItem>
</Tabs>

`ask_weaviate` goes in the `tools` list and Gemini will call it when its response logic decides the user's question requires looking something up. The SDK reads the function's signature and docstring to build the tool declaration for you.

### Ask a question

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START GeminiAsk"
  endMarker="# END GeminiAsk"
  language="py"
/>

</TabItem>
</Tabs>

```text
To deploy Weaviate with Docker, you need to:

1. Install Docker and Docker Compose.
2. Obtain the Weaviate Docker image using:
   docker pull cr.weaviate.io/semitechnologies/weaviate:latest
3. Prepare a docker-compose.yml file, which you can generate using the
   Weaviate configuration tool or example files from the documentation.
4. Start Weaviate using either:
   - docker run -p 8080:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:latest
   - docker-compose up -d
5. Access Weaviate at http://localhost:8080 and configure as needed.
6. Check if Weaviate is ready by hitting the readiness endpoint:
   curl localhost:8080/v1/.well-known/ready
```

Because we're using `client.chats.create(...)`, follow-up questions in the same chat preserve context — Gemini will only re-call `ask_weaviate` if it needs more information.

## Google Vertex AI

Vertex AI uses the `google-genai` SDK and authenticates against your GCP project. This is the path to take if you're already deploying on Google Cloud — you get IAM-controlled access and can call any model in the Vertex AI Model Garden. The SDK reads your Python function's signature and docstring to build the tool declaration automatically.

### Setup

You need an existing GCP project with the [Vertex AI API enabled](https://console.cloud.google.com/apis/), and the [`gcloud` CLI](https://cloud.google.com/sdk/docs/install) installed and initialized (`gcloud init`).

```python
!pip install -U google-genai
```

```python
import os
os.environ["GCP_PROJECT_ID"] = ""
os.environ["GOOGLE_CLOUD_REGION"] = ""  # e.g. "us-central1"
```

### Create the Vertex client

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START VertexClient"
  endMarker="# END VertexClient"
  language="py"
/>

</TabItem>
</Tabs>

### Ask a question

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START VertexAsk"
  endMarker="# END VertexAsk"
  language="py"
/>

</TabItem>
</Tabs>

```text
To deploy Weaviate on Docker, you need Docker and Docker Compose CLI.
Download a 'docker-compose.yml' file using Weaviate's configuration tool to
customize it. Then, navigate to the directory containing the file and run
`docker compose up -d` in the terminal. This will start the setup in detached
mode. Ensure the file is correctly named and located before starting.
```

`ask_weaviate` goes in the `tools` list on `GenerateContentConfig`, and Vertex will invoke it whenever the model decides the user's question needs a lookup against your Weaviate data.

## Ollama

[Ollama](https://ollama.com/) runs open models locally and supports function calling for models that have been trained for it (Llama 3.1, Llama 3.2, etc.). It requires you to declare the tool schema explicitly and drive the function-calling loop yourself — there's no automatic introspection of Python signatures.

### Setup

[Install Ollama](https://ollama.com/download) and pull a model that supports tool use:

```bash
ollama pull llama3.1
```

```python
!pip install ollama
```

### Declare the tool schema

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START OllamaSchema"
  endMarker="# END OllamaSchema"
  language="py"
/>

</TabItem>
</Tabs>

### Drive the function-calling loop

With Ollama you make a first call to let the model decide whether to invoke a tool, execute the tool yourself if it does, then make a second call with the tool's output appended to the message history.

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START OllamaLoop"
  endMarker="# END OllamaLoop"
  language="py"
/>

</TabItem>
</Tabs>

### Ask a question

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START OllamaAsk"
  endMarker="# END OllamaAsk"
  language="py"
/>

</TabItem>
</Tabs>

```text
Querying Weaviate with: docker deployment
To deploy Weaviate with Docker, you'll need to follow these steps:

1. Pull the Weaviate Docker image:
   docker pull weaviate/weaviate:latest

2. Run Weaviate in a container:
   docker run -p 8080:8080 -v /path/to/your/data:/data weaviate/weaviate:latest

3. Verify Weaviate is running by visiting http://localhost:8080

4. Stop or remove containers as needed.
```

The loop above makes the tool-calling contract very explicit: the model proposes a tool call, your code decides whether to honor it, and you control what gets fed back in. The same pattern works against any provider that exposes raw OpenAI-style function calling.

## LangChain

[LangChain](https://www.langchain.com/) wraps tool-using LLMs behind a uniform interface, so once you've declared your tool you can switch model providers with a one-line change.

### Setup

```python
!pip install -U langchain langchain-openai
```

```python
import os
os.environ["OPENAI_API_KEY"] = ""
```

### Declare the tool

LangChain's `@tool` decorator turns a regular Python function into a `BaseTool`, using the docstring as the tool description. You can pass `ask_weaviate` as-is by decorating a wrapper, or apply `@tool` directly:

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START LangchainTool"
  endMarker="# END LangchainTool"
  language="py"
/>

</TabItem>
</Tabs>

### Bind the tool to a model

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START LangchainBind"
  endMarker="# END LangchainBind"
  language="py"
/>

</TabItem>
</Tabs>

`bind_tools` is the swap-friendly part — change the `init_chat_model` call to point at Anthropic, Vertex, or any other supported provider and the rest stays the same.

### Ask a question

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START LangchainAsk"
  endMarker="# END LangchainAsk"
  language="py"
/>

</TabItem>
</Tabs>

```text
To run Weaviate with Docker, you can follow these steps:

1. Install Docker on your machine.
2. Pull the Weaviate image:
   docker pull semitechnologies/weaviate
3. Run the container:
   docker run -d -p 8080:8080 semitechnologies/weaviate
4. Verify by visiting http://localhost:8080/v1
...
```

For a full agent loop (multiple tool calls, reasoning between them) wire `llm_with_tools` into a LangGraph agent or use `AgentExecutor`. The single `invoke` call above is enough to demonstrate the tool wiring.

## LlamaIndex

[LlamaIndex](https://docs.llamaindex.ai/) has a high-level `AgentWorkflow` that accepts plain Python functions directly — pass `ask_weaviate` in and the workflow handles the tool-calling protocol for you.

### Setup

```python
!pip install -U llama-index llama-index-llms-openai
```

```python
import os
os.environ["OPENAI_API_KEY"] = ""
```

### Build the agent workflow

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START LlamaWorkflow"
  endMarker="# END LlamaWorkflow"
  language="py"
/>

</TabItem>
</Tabs>

The `system_prompt` here is the *outer* agent's prompt — it shapes how the LlamaIndex agent decides when and how to call the tool. The Query Agent itself has its own (separate) system prompt, which you can configure on the `QueryAgent` constructor; see [Customizing the System Prompt](../reference/system_prompt.md).

### Ask a question

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START LlamaAsk"
  endMarker="# END LlamaAsk"
  language="py"
/>

</TabItem>
</Tabs>

```text
To run Weaviate with Docker, follow these steps:

1. Install Docker and Docker Compose.
2. Download the Weaviate Docker image:
   docker pull cr.weaviate.io/semitechnologies/weaviate:latest
3. Run Weaviate:
   docker run -p 8080:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:latest
4. Or use Docker Compose with a docker-compose.yml file.
5. Verify it's ready:
   curl --fail -s localhost:8080/v1/.well-known/ready
```

Because `workflow.run` is async, call it with `await` inside an async function (or wrap it with `asyncio.run(...)` in a script).

## Using the Query Agent as a tool anywhere

The pattern is the same regardless of framework:

1. You have a Python function — `ask_weaviate(query: str) -> str` — that takes a question and returns the Query Agent's `final_answer`.
2. You hand that function to a calling LLM, either as a Python callable (when the framework can introspect signatures) or with a thin schema or decorator wrapper around it.
3. The LLM decides when the user's request needs to consult your Weaviate data and routes a question through the tool.

This means you can plug the Query Agent into **anything** that supports function calling or tools:

- **OpenAI Assistants / Responses API** — declare the tool schema (same shape as the Ollama example) and hand it to the API.
- **Anthropic tool use** — pass a tool definition with name `ask_weaviate` and the description from the docstring.
- **MCP servers** — wrap the function as an MCP tool so any MCP-aware client (Claude Desktop, Cursor, custom IDE plugins) can call into your Weaviate data.
- **Custom agent frameworks** — anything that can execute a Python callable can use this directly.

### Production tips

A few things worth knowing once you take this past a notebook:

- **Reuse a single client and agent.** Opening a Weaviate client per call is slow and creates more connections than you need. Create them once on startup and close them on shutdown.
- **Close the client cleanly.** When your process exits, call `weaviate_client.close()`. If you're using a framework with a lifecycle hook (FastAPI's `lifespan`, Django's `appconfig`, etc.), tie it in there.
- **Watch your usage.** Each tool invocation runs a Query Agent call, which uses model units from your Weaviate Cloud plan. The calling LLM may call the tool multiple times per turn — guard against runaway loops if cost matters.
- **Consider returning more than the final answer.** For some apps, the calling agent benefits from seeing the `sources` or executed `searches`, not just the natural-language answer. You can change `ask_weaviate` to return a structured object (JSON) and update the docstring to tell the LLM what to do with each field.
- **Constrain the collections.** If you have many collections, instantiate separate agents over different subsets (e.g. `ask_products`, `ask_docs`) and expose each as its own tool. The calling LLM will pick the right one based on the docstrings.

## Further resources

- [**Get Started with the Weaviate Query Agent**](./query-agent-get-started.md) — Walkthrough of the Query Agent's own Ask Mode, Search Mode and Suggest Queries features.
- [**Build a Query Agent E-Commerce Assistant**](./query-agent-ecommerce-assistant.md) — Use-case-focused tutorial that wraps the Query Agent into a reusable customer-facing assistant.
- [**Ask Mode**](../guides/ask_mode.md) — Streaming, system prompts, multi-turn conversations, result evaluation.
- [**Customizing the System Prompt**](../reference/system_prompt.md) — Tune the Query Agent's own behavior independent of the outer agent's prompt.

Close the Weaviate client when your application shuts down:

<Tabs className="code" groupId="languages">
<TabItem value="py_agents" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START Close"
  endMarker="# END Close"
  language="py"
/>

</TabItem>
</Tabs>
