# How-to: Manage-Data -> Classes
import os

# ================================
# ===== INSTANTIATION-COMMON =====
# ================================

import weaviate

# Instantiate the client with the OpenAI API key
client = weaviate.connect_to_local(
    headers={
        "X-OpenAI-Api-Key": os.environ[
            "OPENAI_API_KEY"
        ]  # Replace with your inference API key
    }
)

# ================================
# ===== CREATE A COLLECTION =====
# ================================

# Clean slate
client.collections.delete("Article")

# START BasicCreateCollection
from weaviate.classes.config import (
    Configure,
    DataType,
    Property,
    ReplicationDeletionStrategy,
    VectorDistances,
    VectorFilterStrategy,
)

client.collections.create(
    "Article",
    description="A collection of articles",
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="body", data_type=DataType.TEXT),
    ],
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",
        source_properties=["title", "body"],
        vector_index_config=Configure.VectorIndex.hnsw(
            ef_construction=300,
            distance_metric=VectorDistances.COSINE,
            filter_strategy=VectorFilterStrategy.SWEEPING,
        ),
    ),
    multi_tenancy_config=Configure.multi_tenancy(False),
    sharding_config=Configure.sharding(
        virtual_per_physical=128,
        desired_count=1,
        desired_virtual_count=128,
    ),
    replication_config=Configure.replication(
        factor=1,
        deletion_strategy=ReplicationDeletionStrategy.TIME_BASED_RESOLUTION,
    ),
)
# END BasicCreateCollection

# Test
assert client.collections.exists("Article")

# ===============================================
# ===== CREATE A COLLECTION WITH PROPERTIES =====
# ===============================================

# Clean slate
client.collections.delete("Article")

# START CreateCollectionWithProperties
from weaviate.classes.config import DataType, Property, Tokenization

# Note that you can use `client.collections.create_from_dict()` to create a collection from a v3-client-style JSON object
client.collections.create(
    "Article",
    vector_config=Configure.Vectors.text2vec_openai(),
    # highlight-start
    properties=[  # properties configuration is optional
        Property(
            name="title",
            data_type=DataType.TEXT,
            description="The article headline",
            tokenization=Tokenization.WORD,  # How the text is split for the inverted index
        ),
        Property(
            name="description",
            data_type=DataType.TEXT,
            skip_vectorization=True,  # Exclude this property from the vector
            index_searchable=False,  # Exclude it from keyword search
        ),
        Property(
            name="rating",
            data_type=DataType.NUMBER,
            index_range_filters=True,  # Index for range-based filtering
        ),
    ],
    # highlight-end
)
# END CreateCollectionWithProperties

# Test
articles = client.collections.use("Article")
assert client.collections.exists("Article")
assert len(articles.config.get().properties) == 3

# ===============================================
# ===== CREATE A COLLECTION WITH VECTORIZER =====
# ===============================================

# Clean slate
client.collections.delete("Article")

# START Vectorizer
from weaviate.classes.config import (
    Configure,
    DataType,
    Property,
    VectorDistances,
    VectorFilterStrategy,
)

client.collections.create(
    "Article",
    # highlight-start
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",  # (Optional) Set the name of the vector, default name is "default"
        source_properties=["title", "body"],  # (Optional) Set the source property(ies)
        vector_index_config=Configure.VectorIndex.hnsw(
            ef_construction=300,
            distance_metric=VectorDistances.COSINE,
            filter_strategy=VectorFilterStrategy.SWEEPING,
        ),  # (Optional) Set vector index options
        vectorize_collection_name=True,  # (Optional) Set to True to vectorize the collection name
    ),
    # highlight-end
    properties=[  # properties configuration is optional
        Property(name="title", data_type=DataType.TEXT, vectorize_property_name=True),
        Property(name="body", data_type=DataType.TEXT),
    ],
)
# END Vectorizer

# Test
collection = client.collections.use("Article")
config = collection.config.get()

assert config.vector_config["default"].vectorizer.vectorizer == "text2vec-openai"

# Clean slate
client.collections.delete("Article")

# START MultipleVectors
from weaviate.classes.config import (
    Configure,
    DataType,
    Property,
    VectorDistances,
    VectorFilterStrategy,
)

client.collections.create(
    "Article",
    # highlight-start
    vector_config=[
        Configure.Vectors.text2vec_openai(
            name="default",  # (Optional) Set the name of the vector, default name is "default"
            source_properties=[
                "title",
                "body",
            ],  # (Optional) Set the source property(ies)
            vector_index_config=Configure.VectorIndex.hnsw(
                ef_construction=300,
                distance_metric=VectorDistances.COSINE,
                filter_strategy=VectorFilterStrategy.SWEEPING,
            ),  # (Optional) Set vector index options
            vectorize_collection_name=True,  # (Optional) Set to True to vectorize the collection name
        ),
        Configure.Vectors.text2vec_openai(
            name="body_vectors",
            source_properties=["body"],
            vector_index_config=Configure.VectorIndex.flat(),
        ),
    ],
    # highlight-end
    properties=[  # properties configuration is optional
        Property(name="title", data_type=DataType.TEXT, vectorize_property_name=True),
        Property(name="body", data_type=DataType.TEXT),
    ],
)
# END MultipleVectors

# Test
collection = client.collections.use("Article")
config = collection.config.get()

assert config.vector_config["default"].vectorizer.vectorizer == "text2vec-openai"

# ===================================================================
# ===== CREATE A COLLECTION WITH CUSTOM INVERTED INDEX SETTINGS =====
# ===================================================================

client.collections.delete("Article")

# START SetInvertedIndexParams
from weaviate.classes.config import (
    Configure,
    DataType,
    Property,
    StopwordsPreset,
    Tokenization,
)

client.collections.create(
    "Article",
    # Additional settings not shown
    properties=[  # properties configuration is optional
        Property(
            name="title",
            data_type=DataType.TEXT,
            # highlight-start
            index_filterable=True,
            index_searchable=True,
            tokenization=Tokenization.WORD,
            # highlight-end
        ),
        Property(
            name="chunk",
            data_type=DataType.TEXT,
            # highlight-start
            index_filterable=True,
            index_searchable=True,
            tokenization=Tokenization.FIELD,
            # highlight-end
        ),
        Property(
            name="chunk_number",
            data_type=DataType.INT,
            # highlight-start
            index_range_filters=True,
            # highlight-end
        ),
    ],
    # highlight-start
    inverted_index_config=Configure.inverted_index(  # Optional
        bm25_b=0.7,
        bm25_k1=1.25,
        index_null_state=True,
        index_property_length=True,
        index_timestamps=True,
        stopwords_preset=StopwordsPreset.EN,
        stopwords_additions=["example", "stopword"],
        stopwords_removals=["the", "and"],
    ),
    # highlight-end
)
# END SetInvertedIndexParams

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert config.inverted_index_config.bm25.b == 0.7
assert config.inverted_index_config.bm25.k1 == 1.25

# Delete the collection to recreate it
client.collections.delete("Article")


# Close the first session before connecting to the 3-replica setup.
client.close()

# ==============================================
# ===== ALL REPLICATION SETTINGS
# ==============================================

# Connect to a setting with 3 replicas
client = weaviate.connect_to_local(port=8180)  # Port for demo setup with 3 replicas

# Clean slate
client.collections.delete("Article")

# START AllReplicationSettings
from weaviate.classes.config import Configure, ReplicationDeletionStrategy

client.collections.create(
    "Article",
    # highlight-start
    replication_config=Configure.replication(
        factor=3,
        deletion_strategy=ReplicationDeletionStrategy.TIME_BASED_RESOLUTION,
        async_enabled=True,
        async_config=Configure.Replication.async_config(
            hashtree_height=16,
            frequency=30,
        ),
    ),
    # highlight-end
)
# END AllReplicationSettings

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert (
    config.replication_config.deletion_strategy
    == ReplicationDeletionStrategy.TIME_BASED_RESOLUTION
)

client.close()

# ====================
# ===== SHARDING =====
# ====================

client = weaviate.connect_to_local()

# Clean slate
client.collections.delete("Article")

# START ShardingSettings
from weaviate.classes.config import Configure

client.collections.create(
    "Article",
    # highlight-start
    sharding_config=Configure.sharding(
        virtual_per_physical=128,
        desired_count=1,
        desired_virtual_count=128,
    ),
    # highlight-end
)
# END ShardingSettings

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert config.sharding_config.virtual_per_physical == 128
assert config.sharding_config.desired_count == 1
assert config.sharding_config.desired_virtual_count == 128

client.close()