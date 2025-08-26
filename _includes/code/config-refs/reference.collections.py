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
        async_enabled=False,
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
from weaviate.classes.config import Property, DataType

# Note that you can use `client.collections.create_from_dict()` to create a collection from a v3-client-style JSON object
client.collections.create(
    "Article",
    # highlight-start
    vector_config=Configure.Vectors.text2vec_openai(),
    # highlight-end
    properties=[  # properties configuration is optional
        Property(name="title", data_type=DataType.TEXT),
        Property(name="description", data_type=DataType.TEXT, skip_vectorization=True),
        Property(name="rating", data_type=DataType.NUMBER),
    ],
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

# ===============================================
# ===== CREATE A COLLECTION WITH NAMED VECTORS =====
# ===============================================

# Clean slate
client.collections.delete("ArticleNV")

# START BasicNamedVectors
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "ArticleNV",
    # highlight-start
    vector_config=[
        # Set a named vector with the "text2vec-cohere" vectorizer
        Configure.Vectors.text2vec_cohere(
            name="title",
            source_properties=["title"],  # (Optional) Set the source property(ies)
            vector_index_config=Configure.VectorIndex.hnsw(),  # (Optional) Set vector index options
        ),
        # Set another named vector with the "text2vec-openai" vectorizer
        Configure.Vectors.text2vec_openai(
            name="title_country",
            source_properties=[
                "title",
                "country",
            ],  # (Optional) Set the source property(ies)
            vector_index_config=Configure.VectorIndex.hnsw(),  # (Optional) Set vector index options
        ),
        # Set a named vector for your own uploaded vectors
        Configure.Vectors.self_provided(
            name="custom_vector",
            vector_index_config=Configure.VectorIndex.hnsw(),  # (Optional) Set vector index options
        ),
    ],
    # highlight-end
    properties=[  # Define properties
        Property(name="title", data_type=DataType.TEXT),
        Property(name="country", data_type=DataType.TEXT),
    ],
)
# END BasicNamedVectors

# Test
collection = client.collections.use("ArticleNV")
config = collection.config.get()

assertion_dicts = {
    "title": ["title"],
    "title_country": ["title", "country"],
    "custom_vector": None,
}
for k, v in config.vector_config.items():
    assert (
        v.vectorizer.source_properties == assertion_dicts[k]
    )  # Test that the source properties are correctly set

# ===========================
# ===== SET VECTOR INDEX TYPE =====
# ===========================

# Clean slate
client.collections.delete("Article")

# START SetVectorIndexType
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "Article",
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",
        # highlight-start
        vector_index_config=Configure.VectorIndex.hnsw(),  # Use the HNSW index
        # vector_index_config=Configure.VectorIndex.flat(),  # Use the FLAT index
        # vector_index_config=Configure.VectorIndex.dynamic(),  # Use the DYNAMIC index
        # highlight-end
    ),
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="body", data_type=DataType.TEXT),
    ],
)
# END SetVectorIndexType

# Test
from weaviate.collections.classes.config import _VectorIndexConfigHNSW

collection = client.collections.use("Article")
config = collection.config.get()
assert config.vector_config["default"].vectorizer.vectorizer == "text2vec-openai"
assert isinstance(
    config.vector_config["default"].vector_index_config, _VectorIndexConfigHNSW
)

# ===========================
# ===== SET VECTOR INDEX PARAMETERS =====
# ===========================

# Clean slate
client.collections.delete("Article")

# START SetVectorIndexParams
from weaviate.classes.config import (
    Configure,
    Property,
    DataType,
    VectorDistances,
    VectorFilterStrategy,
)

client.collections.create(
    "Article",
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",
        # highlight-start
        vector_index_config=Configure.VectorIndex.hnsw(
            ef_construction=300,
            distance_metric=VectorDistances.COSINE,
            filter_strategy=VectorFilterStrategy.SWEEPING,  # or ACORN (Available from Weaviate v1.27.0)
        ),
        # highlight-end
    ),
)
# END SetVectorIndexParams

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert config.vector_config["default"].vector_index_config.filter_strategy == "sweeping"
assert isinstance(
    config.vector_config["default"].vector_index_config, _VectorIndexConfigHNSW
)


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


# ===============================================
# ===== CREATE A COLLECTION WITH A RERANKER MODULE =====
# ===============================================

client.collections.delete("Article")

# START SetReranker
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "Article",
    vector_config=Configure.Vectors.text2vec_openai(),
    # highlight-start
    reranker_config=Configure.Reranker.cohere(),
    # highlight-end
)
# END SetReranker

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert config.reranker_config.reranker == "reranker-cohere"

# Delete the collection to recreate it
client.collections.delete("Article")


# ===============================================
# ===== UPDATE A COLLECTION'S RERANKER MODULE =====
# ===============================================

client.collections.delete("Article")

from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "Article",
    vector_config=Configure.Vectors.text2vec_openai(),
    # highlight-start
    reranker_config=Configure.Reranker.voyageai(),
    # highlight-end
)

# START UpdateReranker
from weaviate.classes.config import Reconfigure

collection = client.collections.use("Article")

collection.config.update(
    # highlight-start
    reranker_config=Reconfigure.Reranker.cohere()  # Update the reranker module
    # highlight-end
)
# END UpdateReranker

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert config.reranker_config.reranker == "reranker-cohere"

# Delete the collection to recreate it
client.collections.delete("Article")


# ===============================================
# ===== CREATE A COLLECTION WITH A GENERATIVE MODULE =====
# ===============================================

client.collections.delete("Article")

# START SetGenerative
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "Article",
    vector_config=Configure.Vectors.text2vec_openai(),
    # highlight-start
    generative_config=Configure.Generative.openai(
        model="gpt-4o"  # set your generative model (optional parameter)
    ),
    # highlight-end
)
# END SetGenerative

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert config.generative_config.generative == "generative-openai"

# Delete the collection to recreate it
client.collections.delete("Article")

# ===============================================
# ===== UPDATE A COLLECTION'S GENERATIVE MODULE =====
# ===============================================

client.collections.delete("Article")

from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "Article",
    vector_config=Configure.Vectors.text2vec_openai(),
    # highlight-start
    generative_config=Configure.Generative.openai(),
    # highlight-end
)

# START UpdateGenerative
from weaviate.classes.config import Reconfigure

collection = client.collections.use("Article")

collection.config.update(
    # highlight-start
    generative_config=Reconfigure.Generative.cohere()  # Update the generative module
    # highlight-end
)
# END UpdateGenerative

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert config.generative_config.generative == "generative-cohere"

# Delete the collection to recreate it
client.collections.delete("Article")


# ======================================================
# ===== MULTI-VECTOR EMBEDDINGS (ColBERT, ColPali)
# ======================================================

# Clean slate
client.collections.delete("DemoCollection")

# START MultiValueVectorCollection
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    "DemoCollection",
    vector_config=[
        # Example 1 - Use a model integration
        # The factory function will automatically enable multi-vector support for the HNSW index
        # highlight-start
        Configure.MultiVectors.text2vec_jinaai(
            name="jina_colbert",
            source_properties=["text"],
        ),
        # highlight-end
        # Example 2 - User-provided multi-vector representations
        # Must explicitly enable multi-vector support for the HNSW index
        # highlight-start
        Configure.MultiVectors.self_provided(
            # highlight-end
            name="custom_multi_vector",
        ),
    ],
    properties=[Property(name="text", data_type=DataType.TEXT)],
    # Additional parameters not shown
)
# END MultiValueVectorCollection

# ==========================================
# ===== MULTI-VECTOR EMBEDDINGS MUVERA
# ==========================================

# Clean slate
client.collections.delete("DemoCollection")

# START MultiValueVectorMuvera
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    vector_config=[
        # Example 1 - Use a model integration
        Configure.MultiVectors.text2vec_jinaai(
            name="jina_colbert",
            source_properties=["text"],
            # highlight-start
            encoding=Configure.VectorIndex.MultiVector.Encoding.muvera(
                # Optional parameters for tuning MUVERA
                # ksim: 4,
                # dprojections: 16,
                # repetitions: 20,
            ),
            # highlight-end
        ),
        # Example 2 - User-provided multi-vector representations
        Configure.MultiVectors.self_provided(
            name="custom_multi_vector",
            encoding=Configure.VectorIndex.MultiVector.Encoding.muvera(),
        ),
    ],
    # Additional parameters not shown
)
# END MultiValueVectorMuvera

# ================================================
# ===== MULTI-VECTOR EMBEDDINGS QUANTIZATION
# ================================================

# Clean slate
client.collections.delete("DemoCollection")

# START MultiValueVectorPQ
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    vector_config=[
        # Example 1 - Use a model integration
        Configure.MultiVectors.text2vec_jinaai(
            name="jina_colbert",
            source_properties=["text"],
            # highlight-start
            quantizer=Configure.VectorIndex.Quantizer.pq(training_limit=50000),
            # highlight-end
        ),
        # Example 2 - User-provided multi-vector representations
        Configure.MultiVectors.self_provided(
            name="custom_multi_vector",
            quantizer=Configure.VectorIndex.Quantizer.pq(training_limit=50000),
        ),
    ],
    # Additional parameters not shown
)
# END MultiValueVectorPQ

# ===========================
# ===== MODULE SETTINGS =====
# ===========================

# Clean slate
client.collections.delete("Article")

# START ModuleSettings
from weaviate.classes.config import Configure

client.collections.create(
    "Article",
    # highlight-start
    vector_config=Configure.Vectors.text2vec_cohere(
        model="embed-multilingual-v2.0", vectorize_collection_name=True
    ),
    # highlight-end
)
# END ModuleSettings

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert config.vector_config["default"].vectorizer.vectorizer == "text2vec-cohere"
assert (
    config.vector_config["default"].vectorizer.model["model"]
    == "embed-multilingual-v2.0"
)

# ====================================
# ===== MODULE SETTINGS PROPERTY =====
# ====================================

# Clean slate
client.collections.delete("Article")

# START PropModuleSettings
from weaviate.classes.config import Configure, Property, DataType, Tokenization

client.collections.create(
    "Article",
    vector_config=Configure.Vectors.text2vec_cohere(),
    properties=[
        Property(
            name="title",
            data_type=DataType.TEXT,
            # highlight-start
            vectorize_property_name=True,  # Use "title" as part of the value to vectorize
            tokenization=Tokenization.LOWERCASE,  # Use "lowecase" tokenization
            description="The title of the article.",  # Optional description
            # highlight-end
        ),
        Property(
            name="body",
            data_type=DataType.TEXT,
            # highlight-start
            skip_vectorization=True,  # Don't vectorize this property
            tokenization=Tokenization.WHITESPACE,  # Use "whitespace" tokenization
            # highlight-end
        ),
    ],
)
# END PropModuleSettings

# ====================================
# ===== MODULE SETTINGS PROPERTY =====
# ====================================

# START AddNamedVectors
from weaviate.classes.config import Configure

articles = client.collections.use("Article")

articles.config.add_vector(
    vector_config=Configure.Vectors.text2vec_cohere(
        name="body_vector",
        source_properties=["body"],
    )
)
# END AddNamedVectors

# Test
collection = client.collections.use("Article")
config = collection.config.get()

assert config.vector_config["default"].vectorizer.vectorizer == "text2vec-cohere"
for p in config.properties:
    if p.name == "title":
        assert p.tokenization.name == "LOWERCASE"
    elif p.name == "body":
        assert p.tokenization.name == "WHITESPACE"

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
        async_enabled=True,
        deletion_strategy=ReplicationDeletionStrategy.TIME_BASED_RESOLUTION,
    ),
    # highlight-end
)
# END AllReplicationSettings

# Test
collection = client.collections.use("Article")
config = collection.config.get()
assert config.replication_config.async_enabled == True
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

# =========================
# ===== MULTI-TENANCY =====
# =========================

# Clean slate
client.collections.delete("Article")

# START Multi-tenancy
from weaviate.classes.config import Configure

client.collections.create(
    "Article",
    # highlight-start
    multi_tenancy_config=Configure.multi_tenancy(True),
    # highlight-end
)
# END Multi-tenancy

collection = client.collections.use("Article")
config = collection.config.get()
assert config.multi_tenancy_config.enabled == True


client.close()
