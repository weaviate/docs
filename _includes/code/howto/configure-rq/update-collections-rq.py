# Code examples for updating collections with RQ-8 compression

# ==============================
# =====  CONNECT =====
# ==============================

# START ConnectCode
import weaviate

client = weaviate.connect_to_weaviate_cloud(
    cluster_url="YOUR-WEAVIATE-CLOUD-URL",
    auth_credentials=weaviate.auth.AuthApiKey("YOUR-API-KEY")
)
# END ConnectCode

# ==============================
# =====  UPDATE SINGLE COLLECTION =====
# ==============================

# START UpdateSingleCollection
from weaviate.classes.config import Reconfigure

collection = client.collections.get("MyCollection")
collection.config.update(
    vector_config=Reconfigure.Vectors.update(
        name="default",
        vector_index_config=Reconfigure.VectorIndex.hnsw(
            quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
        ),
    )
)
# END UpdateSingleCollection

# ==============================
# =====  UPDATE MULTIPLE COLLECTIONS =====
# ==============================

# START UpdateMultipleCollections
from weaviate.classes.config import Reconfigure

# Get all collection names
collections = client.collections.list_all()

# Loop through collections
for collection_name in collections:
    collection = client.collections.get(collection_name)
    config = collection.config.get()

    # vector_config is a dict of named vectors, e.g. {"default": VectorConfig}
    vector_configs = config.vector_config

    # Check each named vector in the collection
    for vector_name, vector_config in vector_configs.items():
        # Check if this vector has ANY compression enabled
        has_compression = hasattr(vector_config, 'quantizer') and vector_config.quantizer is not None

        # Only enable RQ if there's NO compression at all
        if not has_compression:
            print(f"Enabling RQ-8 compression for {collection_name} (vector: {vector_name})")
            collection.config.update(
                vector_config=Reconfigure.Vectors.update(
                    name=vector_name,
                    vector_index_config=Reconfigure.VectorIndex.hnsw(
                        quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
                    ),
                )
            )
        else:
            # Collection already has some compression (RQ, PQ, BQ, SQ, etc.)
            quantizer_type = vector_config.quantizer.type if hasattr(vector_config.quantizer, 'type') else str(vector_config.quantizer)
            print(f"{collection_name} (vector: {vector_name}) already has compression: {quantizer_type}")
# END UpdateMultipleCollections

# ==============================
# =====  CHECK COMPRESSION STATUS =====
# ==============================

# START CheckCompressionStatus
collection = client.collections.get("MyCollection")
config = collection.config.get()

# vector_config is a dict of named vectors
for vector_name, vector_config in config.vector_config.items():
    print(f"\nVector: {vector_name}")
    if hasattr(vector_config, 'quantizer') and vector_config.quantizer:
        print(f"  Quantizer type: {vector_config.quantizer.type}")
        if hasattr(vector_config.quantizer, 'bits'):
            print(f"  Bits: {vector_config.quantizer.bits}")
    else:
        print("  No compression enabled")
# END CheckCompressionStatus

client.close()
