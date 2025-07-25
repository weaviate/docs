# THIS FILE NEEDS TESTS

# ==============================
# =====  CONNECT =====
# ==============================

# START ConnectCode
import weaviate, os

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
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    name="MyCollection",
    vector_config=Configure.Vectors.text2vec_openai(
        # highlight-start
        quantizer=Configure.VectorIndex.Quantizer.rq()
        # highlight-end
    ),
    properties=[
        Property(name="title", data_type=DataType.TEXT),
    ],
)
# END EnableRQ

# ==============================
# =====  EnableRQ with Options =====
# ==============================

client.collections.delete("MyCollection")

# START RQWithOptions
from weaviate.classes.config import Configure, Property, DataType

client.collections.create(
    name="MyCollection",
    vector_config=Configure.Vectors.text2vec_openai(
        # highlight-start
        quantizer=Configure.VectorIndex.Quantizer.rq(
            bits=8,  # Number of bits, only 8 is supported for now
        ),
        # highlight-end
        vector_index_config=Configure.VectorIndex.hnsw(
            vector_cache_max_objects=100000,
        ),
    ),
    properties=[
        Property(name="title", data_type=DataType.TEXT),
    ],
)
# END RQWithOptions

client.close()
