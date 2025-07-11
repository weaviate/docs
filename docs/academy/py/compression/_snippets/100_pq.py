import weaviate
# PQBasicConfig  # PQCustomConfig
from weaviate.classes.config import Configure, DataType, Property
# END PQBasicConfig  # PQCustomConfig
from weaviate.collections.classes.config import PQEncoderType, PQEncoderDistribution
# END PQCustomConfig

from weaviate.collections.classes.config import PQConfig

client = weaviate.connect_to_local()

# PQBasicConfig  # PQCustomConfig

# Client instantiation not shown
collection_name = "PQExampleCollection"

# END PQBasicConfig  # END PQCustomConfig

client.collections.delete(collection_name)

# PQBasicConfig
client.collections.create(
    name=collection_name,
    # END PQBasicConfig
    properties=[
        Property(name="title", data_type=DataType.TEXT)
    ],
    vector_config=Configure.Vectors.text2vec_openai(
        # PQBasicConfig
        # highlight-start
        quantizer=Configure.VectorIndex.Quantizer.pq()
        # highlight-end
    ),

    # Other configuration not shown
)
# END PQBasicConfig

# Confirm creation
c = client.collections.get(collection_name)
coll_config = c.config.get()
assert type(coll_config.vector_config["default"].vector_index_config.quantizer) == PQConfig


client.collections.delete(collection_name)

# PQCustomConfig
client.collections.create(
    name=collection_name,
    # END PQCustomConfig
    properties=[
        Property(name="title", data_type=DataType.TEXT)
    ],
    vector_config=Configure.Vectors.text2vec_openai(
        # PQCustomConfig
        # highlight-start
        quantizer=Configure.VectorIndex.Quantizer.pq(
            segments=512,
            centroids=256,
            training_limit=50000,
            encoder_distribution=PQEncoderDistribution.NORMAL,
            encoder_type=PQEncoderType.TILE,
        )
        # highlight-end
    ),
    # Other configuration not shown
)
# END PQCustomConfig

c = client.collections.get(collection_name)
coll_config = c.config.get()
assert type(coll_config.vector_config["default"].vector_index_config.quantizer) == PQConfig
assert coll_config.vector_config["default"].vector_index_config.quantizer.segments == 512
assert coll_config.vector_config["default"].vector_index_config.quantizer.training_limit == 50000

# START-ANY

client.close()
# END-ANY
