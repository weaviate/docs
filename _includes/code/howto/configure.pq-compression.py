# THIS FILE NEEDS TESTS

# ==============================
# =====  DOWNLOAD DATA =====
# ==============================

# START DownloadData
import requests
import json

# Download the data
resp = requests.get(
    "https://raw.githubusercontent.com/weaviate-tutorials/intro-workshop/main/data/jeopardy_1k.json"
)

# Load the data so you can see what it is
data = json.loads(resp.text)

# Parse the JSON and preview it
print(type(data), len(data))
print(json.dumps(data[1], indent=2))

# END DownloadData

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

assert client.is_ready()

# END ConnectCode


# ==============================
# =====  AUTOPQ =====
# ==============================

client.collections.delete("Question")


# START CollectionWithAutoPQ
from weaviate.classes.config import Configure

client.collections.create(
    name="Question",
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",
        # highlight-start
        quantizer=Configure.VectorIndex.Quantizer.pq(training_limit=50000),  # Set the threshold to begin training
        # highlight-end
    ),
)

# END CollectionWithAutoPQ


# Confirm that the collection has been created with the right settings
collection = client.collections.use("Question")
config = collection.config.get()

from weaviate.collections.classes.config import _PQConfig

assert type(config.vector_config["default"].vector_index_config.quantizer) == _PQConfig
# No import test as it would take a long time


# ==============================
# =====  INITIAL SCHEMA =====
# ==============================

client.collections.delete("Question")

# START InitialSchema
from weaviate.classes.config import Configure

client.collections.create(
    name="Question",
    description="A Jeopardy! question",
    vector_config=Configure.Vectors.text2vec_openai(
        name="default",
    ),
    generative_config=Configure.Generative.openai(),
)

# END InitialSchema
config = client.collections.use("Question").config.get()
assert config.vector_config["default"].vector_index_config.quantizer is None

# ==============================
# =====  LOAD DATA =====
# ==============================


# START LoadData
def parse_data(data):
    object_list = []
    for obj in data:
        object_list.append(
            {
                "question": obj["Question"],
                "answer": obj["Answer"],
            }
        )

    return object_list


jeopardy = client.collections.use("Question")
jeopardy.data.insert_many(parse_data(data))
# END LoadData


response = jeopardy.aggregate.over_all(total_count=True)
assert response.total_count == 1000

# ==============================
# =====  UPDATE SCHEMA =====
# ==============================

# START UpdateSchema
from weaviate.classes.config import Reconfigure

jeopardy = client.collections.use("Question")
jeopardy.config.update(
    vector_config=Reconfigure.Vectors.update(
        name="default",
        vector_index_config=Reconfigure.VectorIndex.hnsw(
            quantizer=Reconfigure.VectorIndex.Quantizer.pq(
                training_limit=50000  # Default: 100000
            ),
        )
    )
)
# END UpdateSchema

config = client.collections.use("Question").config.get()
assert type(config.vector_config["default"].vector_index_config.quantizer) == _PQConfig

# ==============================
# =====  GET THE SCHEMA =====
# ==============================

# START GetSchema
jeopardy = client.collections.use("Question")
config = jeopardy.config.get()
pq_config = config.vector_config["default"].vector_index_config.quantizer

# print some of the config properties
print(f"Encoder: { pq_config.encoder }")
print(f"Training: { pq_config.training_limit }")
print(f"Segments: { pq_config.segments }")
print(f"Centroids: { pq_config.centroids }")
# END GetSchema

client.close()
