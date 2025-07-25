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
# =====  EnableRQ =====
# ==============================

client.collections.delete("MyCollection")

# START EnableRQ
import weaviate.classes.config as wc

client.collections.create(
    name="MyCollection",
    vector_config=wc.Configure.Vectors.text2vec_openai(
        # highlight-start
        quantizer=wc.Configure.VectorIndex.Quantizer.rq()
        # highlight-end
    ),
    properties=[
        wc.Property(name="title", data_type=wc.DataType.TEXT),
    ],
)
# END EnableRQ

# ==============================
# =====  EnableRQ with Options =====
# ==============================

client.collections.delete("MyCollection")

# START RQWithOptions
import weaviate.classes.config as wc

client.collections.create(
    name="MyCollection",
    vector_config=wc.Configure.Vectors.text2vec_openai(
        # highlight-start
        quantizer=wc.Configure.VectorIndex.Quantizer.rq(
            bits=8,  # Number of bits, only 8 is supported for now
        ),
        # highlight-end
        vector_index_config=wc.Configure.VectorIndex.hnsw(
            distance_metric=wc.VectorDistances.COSINE,
            vector_cache_max_objects=100000,
        ),
    ),
    properties=[
        wc.Property(name="title", data_type=wc.DataType.TEXT),
    ],
)
# END RQWithOptions

client.close()
