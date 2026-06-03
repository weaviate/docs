import sys

sys.path.insert(0, "docs/agents/_includes/code")
import os
from util import populate_weaviate

# This recipe requires an OpenAI API key (it builds a DIY LLM pipeline with the
# OpenAI SDK). The test that runs this file is skipped when OPENAI_API_KEY is unset.

# -- Shown in the docs as a standalone `load_data.py`, but not executed here:
# the Weather collection + data are provisioned once via the helper below.
"""
# START LoadData
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
# END LoadData
"""

# START SharedSetup
import os
import weaviate
from weaviate.classes.init import Auth

weaviate_client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)
weather = weaviate_client.collections.use("Weather")

question = "Show me the top 5 windiest days where it rained more than 5mm."
# END SharedSetup

populate_weaviate(weaviate_client, overwrite_existing=False, include_ecommerce=False)

# START PydanticModels
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
# END PydanticModels

# START GetSchema
def get_schema(collection) -> list[dict]:
    """Read the collection schema so the LLM knows what properties exist."""
    config = collection.config.get()
    return [
        {"name": p.name, "type": str(p.data_type)}
        for p in config.properties
    ]
# END GetSchema

# START PlanQuery
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
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format=Search,
    )
    return completion.choices[0].message.parsed
# END PlanQuery

# START BuildQuery
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
# END BuildQuery

# START RunQuery
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
# END RunQuery

# START ComposeAnswer
def compose_answer(question: str, objects: list) -> str:
    """Turn the matching rows into a natural-language answer."""
    rows = [obj.properties for obj in objects]
    prompt = (
        f'User question: "{question}"\n\n'
        f"Results:\n{json.dumps(rows, default=str, indent=2)}\n\n"
        "Write a short, friendly answer using only the results above."
    )
    completion = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    return completion.choices[0].message.content
# END ComposeAnswer

# START AskDiy
def ask_diy(question: str, collection) -> str:
    """End-to-end DIY pipeline: schema → plan → query → answer."""
    schema = get_schema(collection)
    plan = plan_query(question, schema)
    print(f"LLM plan: {plan}")
    results = run_query(collection, plan)
    return compose_answer(question, results.objects)


print(ask_diy(question, weather))
# END AskDiy

# START WithAgent
from weaviate.agents.query import QueryAgent

agent = QueryAgent(client=weaviate_client, collections=["Weather"])
print(agent.ask(question).final_answer)
# END WithAgent

# START Close
weaviate_client.close()
# END Close
