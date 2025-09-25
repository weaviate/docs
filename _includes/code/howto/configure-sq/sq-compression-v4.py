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
# =====  EnableSQ =====
# ==============================

client.collections.delete("MyCollection")

# START EnableSQ
from weaviate.classes.config import Configure

client.collections.create(
    name="MyCollection",
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",
        # highlight-start
        quantizer=Configure.VectorIndex.Quantizer.sq(),
        # highlight-end
    ),
)
# END EnableSQ

# ==============================
# =====  EnableSQ with Options =====
# ==============================

client.collections.delete("MyCollection")

# START SQWithOptions
from weaviate.classes.config import Configure

client.collections.create(
    name="MyCollection",
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",
        # highlight-start
        quantizer=Configure.VectorIndex.Quantizer.sq(
            rescore_limit=200,
            training_limit=50000,
            cache=True,
        ),
        # highlight-end
        vector_index_config=Configure.VectorIndex.hnsw(
            vector_cache_max_objects=100000,
        ),
    ),
)
# END SQWithOptions

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
            quantizer=Reconfigure.VectorIndex.Quantizer.sq(
                rescore_limit=20
            ),
        )
    )
)
# END UpdateSchema

from weaviate.collections.classes.config import _SQConfig

config = client.collections.use("MyCollection").config.get()
assert type(config.vector_config["default"].vector_index_config.quantizer) == _SQConfig

client.close()
