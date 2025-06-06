# ================================
# ===== INSTANTIATION-COMMON =====
# ================================

import weaviate
from weaviate.classes.init import Auth
import os

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]
openai_api_key = os.environ["OPENAI_APIKEY"]

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=Auth.api_key(weaviate_api_key),
    headers={
        "X-OpenAI-Api-Key": openai_api_key,
    }
)

# ===============================
# ===== meta count EXAMPLES =====
# ===============================

# MetaCount Python
jeopardy = client.collections.get("JeopardyQuestion")
# highlight-start
response = jeopardy.aggregate.over_all(total_count=True)
# highlight-end

print(response.total_count)
# END MetaCount Python

# Tests
assert response.total_count > 0
# End test


# ==================================
# ===== Text property EXAMPLES =====
# ==================================

# TextProp Python
from weaviate.classes.query import Metrics

jeopardy = client.collections.get("JeopardyQuestion")
response = jeopardy.aggregate.over_all(
    # highlight-start
    return_metrics=Metrics("answer").text(
        top_occurrences_count=True,
        top_occurrences_value=True,
        min_occurrences=5  # Threshold minimum count
    )
    # highlight-end
)

print(response.properties["answer"].top_occurrences)
# END TextProp Python

# Tests
assert type(response.properties["answer"].top_occurrences) == list
assert response.properties["answer"].top_occurrences[0].count >= 5
# End test


# ====================================
# ===== int property EXAMPLES =====
# ====================================

# IntProp Python
from weaviate.classes.query import Metrics

jeopardy = client.collections.get("JeopardyQuestion")
response = jeopardy.aggregate.over_all(
    # highlight-start
    # Use `.number` for floats (`NUMBER` datatype in Weaviate)
    return_metrics=Metrics("points").integer(sum_=True, maximum=True, minimum=True),
    # highlight-end
)

print(response.properties["points"].sum_)
print(response.properties["points"].minimum)
print(response.properties["points"].maximum)
# END IntProp Python


# Tests
assert response.properties["points"].sum_ > 0
assert response.properties["points"].maximum > 0
# End test


# ============================
# ===== groupBy EXAMPLES =====
# ============================

# groupBy Python
from weaviate.classes.aggregate import GroupByAggregate

jeopardy = client.collections.get("JeopardyQuestion")
response = jeopardy.aggregate.over_all(
    # highlight-start
    group_by=GroupByAggregate(prop="round")
    # highlight-end
)

# print rounds names and the count for each
for group in response.groups:
    print(f"Value: {group.grouped_by.value} Count: {group.total_count}")
# END groupBy Python


# Tests
assert response.groups[0].grouped_by.prop == "round"
assert response.groups[0].total_count > 0
# End test


# =========================================
# ===== nearTextWithLimit EXAMPLES =====
# =========================================

# nearTextWithLimit Python
from weaviate.classes.query import Metrics

jeopardy = client.collections.get("JeopardyQuestion")
response = jeopardy.aggregate.near_text(
    query="animals in space",
    # highlight-start
    object_limit=10,
    # highlight-end
    return_metrics=Metrics("points").number(sum_=True),
)

print(response.properties["points"].sum_)
# END nearTextWithLimit Python


# Tests
assert response.properties["points"].sum_ > 0
# End test



# =========================================
# ===== hybrid EXAMPLES =====
# =========================================

# HybridExample
from weaviate.classes.query import Metrics, BM25Operator

jeopardy = client.collections.get("JeopardyQuestion")
response = jeopardy.aggregate.hybrid(
    query="animals in space",
    bm25_operator=BM25Operator.and_(),  # Additional parameters available, such as `bm25_operator`, `filter` etc.
    # highlight-start
    object_limit=10,
    # highlight-end
    return_metrics=Metrics("points").number(sum_=True),
)

print(response.properties["points"].sum_)
# END HybridExample


# Tests
assert response.properties["points"].sum_ > 0
# End test


# ============================
# ===== nearTextWithDistance EXAMPLES =====
# ============================

# nearTextWithDistance Python
from weaviate.classes.query import Metrics

jeopardy = client.collections.get("JeopardyQuestion")
response = jeopardy.aggregate.near_text(
    query="animals in space",
    # highlight-start
    distance=0.19,
    # highlight-end
    return_metrics=Metrics("points").number(sum_=True),
)

print(response.properties["points"].sum_)
# END nearTextWithDistance Python


# Tests
assert response.properties["points"].sum_ > 0
# End test


# =================================
# ===== where filter EXAMPLES =====
# =================================

# whereFilter Python
# highlight-start
from weaviate.classes.query import Filter
# highlight-end

jeopardy = client.collections.get("JeopardyQuestion")
response = jeopardy.aggregate.over_all(
    # highlight-start
    filters=Filter.by_property("round").equal("Final Jeopardy!"),
    # highlight-end
)

print(response.total_count)
# END whereFilter Python


# Tests
assert response.total_count is not None
# End test


client.close()
