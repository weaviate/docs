# THIS FILE NEEDS TESTS

# ==============================
# =====  CONNECT =====
# ==============================

# START ConnectCode
import weaviate, os
import weaviate.classes.config as wc

client = weaviate.connect_to_local(
    headers={
        "X-OpenAI-Api-Key": os.environ[
            "OPENAI_API_KEY"
        ]  # Replace with your OpenAI API key
    }
)

client.is_ready()

# END ConnectCode

# ==============================
# =====  EnableSQ =====
# ==============================

client.collections.delete("MyCollection")

# START EnableSQ
import weaviate.classes.config as wc

client.collections.create(
    name="MyCollection",
    vector_config=wc.Configure.Vectors.text2vec_openai(
        name="default",
        # highlight-start
        quantizer=wc.Configure.VectorIndex.Quantizer.sq(),
        # highlight-end
    ),
)
# END EnableSQ

# ==============================
# =====  EnableSQ with Options =====
# ==============================

client.collections.delete("MyCollection")

# START SQWithOptions
import weaviate.classes.config as wc

client.collections.create(
    name="MyCollection",
    vector_config=wc.Configure.Vectors.text2vec_openai(
        name="default",
        # highlight-start
        quantizer=wc.Configure.VectorIndex.Quantizer.sq(
            rescore_limit=200,
            training_limit=50000,
            cache=True,
        ),
        # highlight-end
        vector_index_config=wc.Configure.VectorIndex.hnsw(
            distance_metric=wc.VectorDistances.COSINE,
            vector_cache_max_objects=100000,
        ),
    ),
)
# END SQWithOptions

client.close()
