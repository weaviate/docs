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
            bits=8,  # Optional: Number of bits, only 8 is supported for now
            rescore_limit=20,  # Optional: Number of candidates to fetch before rescoring
        ),
        # highlight-end
    ),
    properties=[
        Property(name="title", data_type=DataType.TEXT),
    ],
)
# END RQWithOptions

# ==============================
# =====  UPDATE SCHEMA =====
# ==============================

# START UpdateSchema
from weaviate.classes.config import Reconfigure

collection = client.collections.use("MyCollection")
collection.config.update(
    vector_config=Reconfigure.Vectors.update(
        name="default",
        vector_index_config=Reconfigure.VectorIndex.hnsw(
            quantizer=Reconfigure.VectorIndex.Quantizer.rq(
                rescore_limit=20,  # Optional: Number of candidates to fetch before rescoring
            ),
        ),
    )
)
# END UpdateSchema

from weaviate.collections.classes.config import _RQConfig

config = client.collections.use("MyCollection").config.get()
assert type(config.vector_config["default"].vector_index_config.quantizer) == _RQConfig

client.close()
