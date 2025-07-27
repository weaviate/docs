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

client.close()
