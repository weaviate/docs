---
layout: recipe
toc: True
title: "Query Agent vs. doing it yourself"
featured: True
integration: False
agent: True
sidebar_position: 50
tags: ['Query Agent', 'Comparison']
---

In this recipe, we'll answer the same natural-language question against the same Weaviate collection two ways: first by writing the LLM pipeline ourselves with Pydantic-typed plans and explicit filter/sort builders, then by calling `agent.ask(...)`. The goal is to show what scaffolding the DIY approach needs to support even a small slice of what the Query Agent handles.

The DIY side of this recipe is **deliberately minimal**: six filter operators, basic sorting, no aggregations, no multi-turn context, one collection. We'll then list what you'd have to add to match the Query Agent feature-for-feature.

> 💡 New to the Query Agent? Start with the [**Get Started**](./query-agent-get-started.md) recipe — it covers Ask Mode, Search Mode and Suggest Queries at a higher level.

## What you'll need

- A **Weaviate Cloud** cluster — [create a free sandbox here](https://console.weaviate.cloud/). When you create the cluster, enable **Embeddings** so you don't need to provide an external embedding provider's API key.
- The Weaviate client with the `agents` extras, the OpenAI SDK, and `datasets` (for the one-time data import):

```bash
pip install -U "weaviate-client[agents]" openai datasets
```

- Three environment variables:

```bash
export WEAVIATE_URL="https://your-cluster.weaviate.network"
export WEAVIATE_API_KEY="your-api-key"
export OPENAI_API_KEY="sk-..."
```

## Setting up the data

We'll use the **Weather** dataset — daily weather records with date, temperature, wind speed, precipitation, humidity, visibility and pressure. The numeric properties are well-suited to showing filter and sort extraction: the DIY pipeline has to translate phrases like *"more than 5mm"* and *"windiest"* into operators and orderings.

This is a **one-time setup** — once the `Weather` collection exists and has data, you can re-run the rest of the recipe freely. Save the following as `load_data.py` and run it once:

```python
"""One-time data import for the Query-Agent-vs-DIY recipe."""
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType
from datasets import load_dataset

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)

client.collections.create(
    "Weather",
    description=(
        "Daily weather information including temperature, wind speed, "
        "precipitation, pressure etc."
    ),
    vector_config=Configure.Vectors.text2vec_weaviate(),
    properties=[
        Property(name="date", data_type=DataType.DATE),
        Property(name="humidity", data_type=DataType.NUMBER),
        Property(name="precipitation", data_type=DataType.NUMBER),
        Property(name="wind_speed", data_type=DataType.NUMBER),
        Property(name="visibility", data_type=DataType.NUMBER),
        Property(name="pressure", data_type=DataType.NUMBER),
        Property(
            name="temperature",
            data_type=DataType.NUMBER,
            description="temperature value in Celsius",
        ),
    ],
)

weather_dataset = load_dataset(
    "weaviate/agents", "query-agent-weather", split="train", streaming=True
)
weather_collection = client.collections.use("Weather")

print("Importing Weather…")
with weather_collection.batch.dynamic() as batch:
    for item in weather_dataset:
        batch.add_object(properties=item["properties"], vector=item["vector"])

print(f"Weather collection: {len(weather_collection)} objects")
client.close()
```

Run it once:

```bash
python load_data.py
```

The dataset is public on Hugging Face: [**weaviate/agents · query-agent-weather**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-weather).

## The question

We'll use this single user question throughout the rest of the recipe:

> *"Show me the top 5 windiest days where it rained more than 5mm."*

It has all three of the structured pieces the DIY pipeline has to extract: a **filter** (`precipitation > 5`), a **sort** (`wind_speed` descending), and a **limit** (`5`). Anything simpler hides the work the agent does internally.

Both sides of the comparison share a tiny bit of setup — connecting to Weaviate and grabbing the collection handle:

```python
import os
import weaviate
from weaviate.classes.init import Auth

weaviate_client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)
weather = weaviate_client.collections.use("Weather")

question = "Show me the top 5 windiest days where it rained more than 5mm."
```

## Without the Query Agent

Building this yourself means breaking the question down into stages: tell an LLM what properties exist, ask it to produce a typed plan (filters, sort, limit, optional semantic query), translate that plan into Weaviate query objects, run the query, then ask the LLM to write a final answer using the rows.

Each step below is a small Python function. At the end of this section we compose them all into a single `ask_diy(question, collection)` that matches the shape of `agent.ask(question)`. Read the steps as building blocks — they're meant to be assembled.

### Step 1 — Type the plan with Pydantic

The first job is to constrain what the LLM is allowed to emit. Pydantic gives us strong types we can pass straight to the OpenAI parser, and clear field descriptions the LLM will read to understand what to populate.

```python
from typing import Literal
from pydantic import BaseModel, Field


class SearchFilter(BaseModel):
    field: str = Field(description="Property name to filter on.")
    operator: Literal["=", "!=", ">", "<", ">=", "<="] = Field(
        description="Comparison operator to apply between the property and the value."
    )
    value: str | float | int | bool = Field(
        description="Value to compare the property against."
    )


class SearchSort(BaseModel):
    field: str = Field(description="Property name to sort by.")
    direction: Literal["asc", "desc"] = Field(description="Sort direction.")


class Search(BaseModel):
    query: str | None = Field(
        default=None,
        description=(
            "Optional semantic search string. Set this only when the question has a "
            "free-text or topical component (e.g. 'hot summer days'). Leave None for "
            "purely structured queries that filter and sort numeric or date properties."
        ),
    )
    filters: list[SearchFilter] = Field(
        default_factory=list,
        description="Filters to apply, combined with AND.",
    )
    sort: SearchSort | None = Field(
        default=None,
        description="Optional sort order. Use it for questions like 'windiest', 'coldest', 'most recent'.",
    )
    limit: int = Field(default=10, description="Maximum number of results to return.")
```

The `query` field is what lets the planner choose between **semantic** search and **structured** retrieval depending on the question. For our example, the LLM should set `query=None` — *"top 5 windiest days where it rained more than 5mm"* has no free-text component — but the field exists so the same plumbing handles a question like *"hot summer days"* too.

> **In production**, this schema grows to cover every shape of question. You'd add OR groupings inside `filters`, an `is_null` operator, date arithmetic, and array operators (`contains_any`) for properties like `tags` or `colors`. Each addition is a new field on `Search`, a new branch in the executor, and a new instruction line in the prompt.

### Step 2 — Read the collection schema

The LLM has no idea what's in your database, so before we ask it to plan a query we have to tell it which properties exist and what type each one is. The Weaviate client exposes this via `collection.config.get()`:

```python
def get_schema(collection) -> list[dict]:
    """Read the collection schema so the LLM knows what properties exist."""
    config = collection.config.get()
    return [
        {"name": p.name, "type": str(p.data_type)}
        for p in config.properties
    ]
```

> **In production**, the schema alone isn't enough — the LLM also needs realistic example values per property (so it knows `category` is one of a fixed set rather than free-form). You'd sample rows, fold them into the description, and budget a token cap. If you have many collections, a routing step has to run first to pick which one(s) to even describe.

### Step 3 — Ask the LLM to plan the query

With the schema and the question, the LLM emits a `Search`. We use OpenAI's typed-output API (`beta.chat.completions.parse`) so the response is already a `Search` instance — no JSON parsing, no validation glue.

```python
import json
from openai import OpenAI

openai_client = OpenAI()


def plan_query(question: str, schema: list[dict]) -> Search:
    """Ask the LLM to turn a natural-language question into a structured Search."""
    prompt = (
        f"Collection schema:\n{json.dumps(schema, indent=2)}\n\n"
        f'User question: "{question}"\n\n'
        "Return a Search object with the filters, sort and limit needed to answer it."
    )
    completion = openai_client.beta.chat.completions.parse(
        model="gpt-5.4-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format=Search,
    )
    return completion.choices[0].message.parsed
```

> **In production**, this prompt grows considerably: few-shot examples for each filter shape, instructions for ambiguous values (*"under $80"* → `< 80` vs `<= 80`?), and stricter validation that string values look reasonable for their declared types. Once `Search` has 10+ fields you'd also split prompts by question category — one for filter-only questions, one for semantic, one for aggregation — because a single prompt covering everything starts to lose accuracy.

### Step 4 — Translate the plan into Weaviate query objects

The LLM produces a `Search` of typed Python objects, but Weaviate's query API wants its own `Filter` and `Sort` objects. Two small helpers handle the mapping:

```python
from weaviate.classes.query import Filter, Sort


def build_filter(f: SearchFilter) -> Filter:
    """Convert a single SearchFilter into a Weaviate Filter."""
    prop = Filter.by_property(f.field)
    if f.operator == "=":
        return prop.equal(f.value)
    if f.operator == "!=":
        return prop.not_equal(f.value)
    if f.operator == ">":
        return prop.greater_than(f.value)
    if f.operator == "<":
        return prop.less_than(f.value)
    if f.operator == ">=":
        return prop.greater_or_equal(f.value)
    if f.operator == "<=":
        return prop.less_or_equal(f.value)
    raise ValueError(f"Unsupported operator: {f.operator}")


def build_filters(filters: list[SearchFilter]) -> Filter | None:
    """Combine multiple SearchFilters with AND. Returns None if there are none."""
    if not filters:
        return None
    if len(filters) == 1:
        return build_filter(filters[0])
    return Filter.all_of([build_filter(f) for f in filters])


def build_sort(s: SearchSort | None) -> Sort | None:
    """Convert a SearchSort into a Weaviate Sort, or None if not specified."""
    if s is None:
        return None
    return Sort.by_property(s.field, ascending=(s.direction == "asc"))
```

> **In production**, this is where most of the long tail of work lives. Weaviate also supports `like`, `contains_any` / `contains_all` (for array properties like `tags`, `colors`), `is_null`, and per-tenant filtering — each needs a branch here and a matching entry in `SearchFilter.operator`. `Sort.by_property` also doesn't combine with `near_text`, so any time you sort while doing semantic search you have to pick a tradeoff the agent resolves automatically.

### Step 5 — Run the query

Now we hit Weaviate. The executor branches on whether the LLM set `query`: with a semantic query we use `near_text`, without one we fall through to `fetch_objects` (which is the path that supports `sort`).

```python
def run_query(collection, plan: Search):
    """Execute the Search against Weaviate, picking the right query method."""
    filters = build_filters(plan.filters)
    if plan.query:
        return collection.query.near_text(
            query=plan.query,
            filters=filters,
            limit=plan.limit,
        )
    return collection.query.fetch_objects(
        filters=filters,
        sort=build_sort(plan.sort),
        limit=plan.limit,
    )
```

> **In production**, this branching expands. Real apps also need `hybrid` (with a tunable `alpha`) and `bm25` (keyword), plus rules for when each combines with `sort`. Aggregation questions go to `collection.aggregate.*` entirely — a separate API with its own planner schema and answer composer.

### Step 6 — Compose the final answer

Weaviate returns rows. The user wants a written answer, so a second LLM call turns the rows into prose:

```python
def compose_answer(question: str, objects: list) -> str:
    """Turn the matching rows into a natural-language answer."""
    rows = [obj.properties for obj in objects]
    prompt = (
        f'User question: "{question}"\n\n'
        f"Results:\n{json.dumps(rows, default=str, indent=2)}\n\n"
        "Write a short, friendly answer using only the results above."
    )
    completion = openai_client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    return completion.choices[0].message.content
```

> **In production**, this prompt also has to handle the empty-result case (apologise, suggest a relaxed filter), the too-many-rows case (truncate intelligently, flag the answer as partial), and streaming (`stream=True` and propagate chunks). UI integrations want to surface which rows informed the answer so they can be rendered as sources.

### Step 7 — Tie it all together

All the building blocks compose into one function — the DIY equivalent of `agent.ask(question)`:

```python
def ask_diy(question: str, collection) -> str:
    """End-to-end DIY pipeline: schema → plan → query → answer."""
    schema = get_schema(collection)
    plan = plan_query(question, schema)
    print(f"LLM plan: {plan}")
    results = run_query(collection, plan)
    return compose_answer(question, results.objects)


print(ask_diy(question, weather))
```

<details>
<summary>Example output</summary>

```text
LLM plan: query=None filters=[SearchFilter(field='precipitation', operator='>', value=5)] sort=SearchSort(field='wind_speed', direction='desc') limit=5
Here are the top 5 windiest days with more than 5 mm of rain:

1. 2023-05-02 — Wind: 93.5, Rain: 12.0 mm
2. 2023-05-02 — Wind: 93.5, Rain: 12.0 mm
3. 2023-08-18 — Wind: 74.1, Rain: 6.3 mm
4. 2023-08-18 — Wind: 74.1, Rain: 6.3 mm
5. 2023-08-18 — Wind: 74.1, Rain: 6.3 mm
```

Notice the duplicates. The DIY pipeline returns whatever `fetch_objects` gives it, so when the underlying data has near-identical rows the final answer reflects that — and the `limit=5` cap gets consumed by them, hiding windier rainy days that would otherwise appear in the result.

</details>

That's the minimum DIY pipeline. Roughly 90 lines once you count the Pydantic models, two LLM calls, six filter operators, sort, two search methods, one collection.

## With the Query Agent

```python
from weaviate.agents.query import QueryAgent

agent = QueryAgent(client=weaviate_client, collections=["Weather"])
print(agent.ask(question).final_answer)
```

<details>
<summary>Example output</summary>

```text
Here are the top 5 windiest days with rainfall over 5 mm:

1. 2023-09-04 — wind speed: 94.9, precipitation: 28.6 mm
2. 2023-05-02 — wind speed: 93.5, precipitation: 12.0 mm
3. 2023-11-08 — wind speed: 91.5, precipitation: 30.6 mm
4. 2023-12-13 — wind speed: 91.1, precipitation: 30.0 mm
5. 2023-08-18 — wind speed: 74.1, precipitation: 6.3 mm
```

Five distinct windier rainy days — including three the DIY pipeline missed (the 94.9, 91.5 and 91.1 m/s days) because its `limit=5` was consumed by duplicate rows.

</details>

The agent runs the same stages internally — schema introspection, query planning, execution, answer composition — and also covers multi-collection routing, the full set of filter and aggregation types Weaviate supports, search-method selection across `near_text`, `hybrid`, `bm25` and `fetch_objects`, source attribution, streaming, and multi-turn context. None of which the DIY example handles.

## What you'd have to add to match the Query Agent

The DIY pipeline above is a starting point. Here's what you'd extend, roughly in order of how often you actually need each thing:

| Feature | What's involved |
|---|---|
| **More filter operators** | Adds `Literal` variants to `SearchFilter.operator`, a branch in `build_filter`, and an instruction line in the planner prompt. Common ones: `like`, `contains_any`, `contains_all`, `is_null`. |
| **Aggregations** | A whole second pipeline. The planner first decides *aggregate or search?*, then aggregations have their own model (`group_by`, `metrics`) and a different Weaviate API entirely. |
| **Search-method selection** | The pipeline above covers `near_text` and `fetch_objects`. Real apps also need `hybrid` (with a tunable `alpha`) and `bm25`, plus rules for when each combines with `sort`. |
| **Multi-collection routing** | A planner step *before* `plan_query` that picks the right collection(s) from the available list. Adds an LLM call and another prompt to budget. |
| **Multi-turn conversations** | Track message history, decide what to carry forward, manage prompt size. |
| **Streaming** | Stream the answer composer's output (and ideally the planner's, for very fast first-token UX). Propagate the right structured payloads through your stack. |
| **Source attribution** | Track which row IDs informed the final answer. The Query Agent surfaces this in `response.sources` and, with `result_evaluation="llm"`, trims it down to only the rows actually used. |
| **Schema sampling** | Production LLMs need to see example values, not just types — otherwise filtering on enumerated string fields becomes unreliable. |

## Further resources

- [**Get Started with the Weaviate Query Agent**](./query-agent-get-started.md) — Walkthrough of the Query Agent's own Ask Mode, Search Mode and Suggest Queries.
- [**Ask Mode**](../guides/ask_mode.md) — Streaming, system prompts, result evaluation.
- [**Additional Filters**](../reference/additional_filters.md) — How to enforce fixed filters that always apply regardless of what the agent's planner decides.
- [**Collection Configuration**](../reference/advanced_collections.md) — Target vectors, view properties, multi-tenancy.

Close the Weaviate client when you're done:

```python
weaviate_client.close()
```
