# How-to: Search > Boost results — Python examples.
#
# Requires Weaviate v1.38+ and the Python client release that adds Boost
# support (PR weaviate/weaviate-python-client#2030). Boost is gRPC-only —
# REST/curl is not supported.
#
# Uses the text2vec-transformers vectorizer. Run against the local stack
# in tests/docker-compose-anon.yml (Weaviate + transformers inference).

import time
from datetime import datetime, timedelta, timezone

import weaviate
from weaviate.classes.config import Configure, DataType, Property, Tokenization
from weaviate.classes.query import Boost, Filter

client = weaviate.connect_to_local()

# ---- Fixture: an Articles collection with date + numeric properties ----
client.collections.delete("Articles")
client.collections.create(
    name="Articles",
    vector_config=Configure.Vectors.text2vec_transformers(),
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
        Property(name="published", data_type=DataType.DATE),
        Property(name="likes", data_type=DataType.INT),
        Property(name="price", data_type=DataType.NUMBER),
        Property(name="draft", data_type=DataType.BOOL),
    ],
)

now = datetime.now(timezone.utc)
articles = client.collections.use("Articles")
articles.data.insert_many([
    {"title": "Transformers explained",        "category": "research", "published": now - timedelta(days=2),   "likes": 100,     "price": 49.99, "draft": False},
    {"title": "Old transformer survey",        "category": "research", "published": now - timedelta(days=400), "likes": 5000,    "price": 49.99, "draft": False},
    {"title": "How to fine-tune a model",      "category": "tutorial", "published": now - timedelta(days=1),   "likes": 30,      "price": 9.99,  "draft": False},
    {"title": "Pricing transformers",          "category": "tutorial", "published": now - timedelta(days=10),  "likes": 5000000, "price": 199.0, "draft": False},
    {"title": "Draft: transformer architecture","category": "research", "published": now - timedelta(days=3),   "likes": 200,     "price": 9.99,  "draft": True},
])

# Wait briefly for the vectorizer to finish indexing the new objects.
time.sleep(3)


# ==========================================
# ===== Filter boost (soft WHERE) =====
# ==========================================

# START BoostFilter
# Promote articles in the "research" category without filtering others out.
response = articles.query.near_text(
    query="transformer architectures",
    limit=5,
    # highlight-start
    boost=Boost.filter(
        Filter.by_property("category").equal("research"),
        weight=0.5,
    ),
    # highlight-end
    return_properties=["title", "category"],
)

for o in response.objects:
    print(o.properties["category"], "-", o.properties["title"])
# END BoostFilter

assert response.objects[0].properties["category"] == "research"


# ==========================================
# ===== Property boost (numeric value) =====
# ==========================================

# START BoostProperty
# Bias toward articles with more `likes`. LOG1P dampens the long tail so a
# single 5-million-likes outlier doesn't dominate.
response = articles.query.near_text(
    query="transformer architectures",
    limit=5,
    # highlight-start
    boost=Boost.property(
        "likes",
        modifier=Boost.Modifier.LOG1P,
        weight=0.7,
    ),
    # highlight-end
    return_properties=["title", "likes"],
)

for o in response.objects:
    print(o.properties["likes"], "-", o.properties["title"])
# END BoostProperty


# ==========================================
# ===== Time decay (boost recent docs) =====
# ==========================================

# START BoostTimeDecay
# Score decays exponentially over time. "30d scale" + decay=0.5 means an
# article that's 30 days old gets half the score of one published "now".
response = articles.query.near_text(
    query="transformer architectures",
    limit=5,
    # highlight-start
    boost=Boost.time_decay(
        "published",
        origin="now",
        scale=timedelta(days=30),
        curve=Boost.Curve.EXPONENTIAL,
        decay=0.5,
        weight=0.6,
    ),
    # highlight-end
    return_properties=["title", "published"],
)
# END BoostTimeDecay

# The 400-day-old "Old transformer survey" should be demoted vs the 2-day-old article.
top_titles = [o.properties["title"] for o in response.objects[:2]]
assert "Old transformer survey" not in top_titles


# ==========================================
# ===== Numeric decay (closest to a value) =====
# ==========================================

# START BoostNumericDecay
# Score peaks at a target price and falls off symmetrically. Gauss gives a
# bell-shaped falloff: items within `offset` of $49.99 score 1.0, items at
# $59.99 (one scale away) score `decay`.
response = articles.query.near_text(
    query="transformer architectures",
    limit=5,
    # highlight-start
    boost=Boost.numeric_decay(
        "price",
        origin=49.99,
        scale=10.0,
        curve=Boost.Curve.GAUSSIAN,
        decay=0.5,
        weight=0.5,
    ),
    # highlight-end
    return_properties=["title", "price"],
)
# END BoostNumericDecay


# ==========================================
# ===== Blend multiple conditions =====
# ==========================================

# START BoostBlend
# Combine two soft signals: recency (weight 2) + popularity (weight 1).
# The outer weight=0.4 controls how much the blended rank affects the
# final score; the inner weights are *per-condition* and balance each
# other.
response = articles.query.near_text(
    query="transformer architectures",
    limit=5,
    # highlight-start
    boost=Boost.blend(
        Boost.time_decay("published", origin="now", scale=timedelta(days=30), weight=2.0),
        Boost.property("likes", modifier=Boost.Modifier.LOG1P, weight=1.0),
        weight=0.4,
        depth=200,  # rescore the top 200 vector matches
    ),
    # highlight-end
    return_properties=["title", "likes", "published"],
)
# END BoostBlend


# ==========================================
# ===== Negative weights demote =====
# ==========================================

# START BoostNegativeWeight
# A negative per-condition weight pushes matching documents DOWN — they
# stay in the result set but lose ground against everything else. Use
# this to deprioritize drafts without filtering them out entirely.
response = articles.query.bm25(
    query="transformer",
    limit=5,
    # highlight-start
    boost=Boost.blend(
        Boost.filter(Filter.by_property("draft").equal(True), weight=-2.0),
        weight=0.5,
    ),
    # highlight-end
    return_properties=["title", "draft"],
)

# The draft article is still in results, just no longer first.
all_titles = [o.properties["title"] for o in response.objects]
assert any("Draft" in t for t in all_titles)
assert response.objects[0].properties["draft"] is False
# END BoostNegativeWeight


# ==========================================
# ===== Boost on hybrid search =====
# ==========================================

# START BoostOnHybrid
# Hybrid keeps its own alpha-blend of BM25 + vector. The boost runs once
# over the fused hybrid result — the sub-search legs don't see it.
response = articles.query.hybrid(
    query="transformer architectures",
    alpha=0.75,
    limit=5,
    # highlight-start
    boost=Boost.blend(
        Boost.filter(Filter.by_property("category").equal("research"), weight=1.0),
        Boost.filter(Filter.by_property("draft").equal(True), weight=-2.0),
        weight=0.3,
    ),
    # highlight-end
    return_properties=["title", "category", "draft"],
)
# END BoostOnHybrid


client.collections.delete("Articles")
client.close()
