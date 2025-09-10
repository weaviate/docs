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
# =====  EnableBQ =====
# ==============================

client.collections.delete("MyCollection")

# START EnableBQ
from weaviate.classes.config import Configure

client.collections.create(
    name="MyCollection",
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",
        # highlight-start
        quantizer=Configure.VectorIndex.Quantizer.bq(),
        # highlight-end
    ),
)
# END EnableBQ

# ==============================
# =====  EnableBQ with Options =====
# ==============================

client.collections.delete("MyCollection")

# START BQWithOptions
from weaviate.classes.config import Configure

client.collections.create(
    name="MyCollection",
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",
        # highlight-start
        quantizer=Configure.VectorIndex.Quantizer.bq(rescore_limit=200, cache=True),
        # highlight-end
        vector_index_config=Configure.VectorIndex.flat(
            vector_cache_max_objects=100000,
        ),
    ),
)
# END BQWithOptions

# ==============================
# =====  UPDATE SCHEMA =====
# ==============================

# START UpdateSchema
from weaviate.classes.config import Reconfigure

collection = client.collections.use("MyCollection")
collection.config.update(
    vector_config=Reconfigure.Vectors.update(
        name="default",
        vector_index_config=Reconfigure.VectorIndex.flat(
            quantizer=Reconfigure.VectorIndex.Quantizer.bq(
                rescore_limit=20,
            ),
        ),
    )
)
# END UpdateSchema

from weaviate.collections.classes.config import _BQConfig

config = client.collections.use("MyCollection").config.get()
assert type(config.vector_config["default"].vector_index_config.quantizer) == _BQConfig

client.close()
