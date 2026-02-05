# Code examples for updating collections with RQ-8 compression

# ==============================
# =====  CONNECT =====
# ==============================

# START ConnectCode
import os, weaviate

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url, auth_credentials=weaviate_api_key
)
# END ConnectCode

from weaviate.classes.config import Configure

client.collections.delete("MyUncompressedCollection")
client.collections.create(
    "MyUncompressedCollection",
    vector_config=Configure.Vectors.text2vec_openai(
        quantizer=Configure.VectorIndex.Quantizer.none()
    ),
)

client.collections.delete("MyLegacyCollection")
client.collections.create(
    "MyLegacyCollection",
    vectorizer_config=Configure.Vectorizer.text2vec_weaviate(),
)

# ==============================
# =====  UPDATE SINGLE COLLECTION (HNSW) =====
# ==============================

# START UpdateSingleCollectionHNSW
from weaviate.classes.config import Reconfigure

collection = client.collections.get("MyUncompressedCollection")
collection.config.update(
    vector_config=Reconfigure.Vectors.update(
        name="default",
        vector_index_config=Reconfigure.VectorIndex.hnsw(
            quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
        ),
    )
)
# END UpdateSingleCollectionHNSW

"""TODO[g-despot] Can't test until cluster has async indexing.
client.collections.delete("MyUncompressedCollection")
client.collections.create(
    "MyUncompressedCollection",
    vector_config=Configure.Vectors.text2vec_openai(
        vector_index_config=Configure.VectorIndex.dynamic(),
        quantizer=Configure.VectorIndex.Quantizer.none(),
    ),
)
# ==============================
# =====  UPDATE SINGLE COLLECTION (DYNAMIC) =====
# ==============================

# START UpdateSingleCollectionDynamic
from weaviate.classes.config import Reconfigure

# For dynamic indexes, only the HNSW portion can be updated after creation
# The flat index compression settings are immutable
collection = client.collections.get("MyUncompressedCollection")
collection.config.update(
    vector_config=Reconfigure.Vectors.update(
        name="default",
        vector_index_config=Reconfigure.VectorIndex.dynamic(
            hnsw=Reconfigure.VectorIndex.hnsw(
                quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
            ),
        ),
    )
)
# END UpdateSingleCollectionDynamic
"""
# ==============================
# =====  UPDATE LEGACY COLLECTION (pre-named vectors) =====
# ==============================

# START UpdateLegacyCollection
from weaviate.classes.config import Reconfigure

# For collections created before named vectors were introduced (pre-v1.24),
# use vector_index_config directly instead of vector_config
collection = client.collections.get("MyLegacyCollection")
collection.config.update(
    vector_index_config=Reconfigure.VectorIndex.hnsw(
        quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
    )
)
# END UpdateLegacyCollection

# ==============================
# =====  LIST COLLECTIONS BY INDEX TYPE =====
# ==============================

# START ListCollectionsByIndexType
from weaviate.collections.classes.config import (
    _VectorIndexConfigHNSW,
    _VectorIndexConfigFlat,
    _VectorIndexConfigDynamic,
)

# Group collections by their vector index type
hnsw_collections = []
flat_collections = []
dynamic_collections = []
legacy_collections = []

collections = client.collections.list_all()

for collection_name in collections:
    collection = client.collections.get(collection_name)
    config = collection.config.get()

    # Check if this is a legacy collection (no named vectors)
    if not config.vector_config:
        # Legacy collection - check the top-level vector_index_config
        legacy_collections.append(collection_name)
        continue

    # For each named vector, determine its index type
    for vector_name, vector_config in config.vector_config.items():
        index_config = vector_config.vector_index_config
        entry = {"collection": collection_name, "vector": vector_name}

        if isinstance(index_config, _VectorIndexConfigHNSW):
            hnsw_collections.append(entry)
        elif isinstance(index_config, _VectorIndexConfigFlat):
            flat_collections.append(entry)
        elif isinstance(index_config, _VectorIndexConfigDynamic):
            dynamic_collections.append(entry)

print(f"HNSW collections: {len(hnsw_collections)}")
print(f"Flat collections: {len(flat_collections)}")
print(f"Dynamic collections: {len(dynamic_collections)}")
print(f"Legacy collections: {len(legacy_collections)}")
# END ListCollectionsByIndexType

# ==============================
# =====  UPDATE MULTIPLE COLLECTIONS =====
# ==============================

# START UpdateMultipleCollections
from weaviate.classes.config import Reconfigure

# Process collections in batches to avoid cluster instability
BATCH_SIZE = 100

# Only process the first batch (adjust slice for subsequent batches)
batch = hnsw_collections[:BATCH_SIZE]

for entry in batch:
    collection_name = entry["collection"]
    vector_name = entry["vector"]

    collection = client.collections.get(collection_name)
    print(f"Enabling RQ-8 compression for {collection_name} (vector: {vector_name})")
    # END UpdateMultipleCollections
    """
    # START UpdateMultipleCollections
    collection.config.update(
        vector_config=Reconfigure.Vectors.update(
            name=vector_name,
            vector_index_config=Reconfigure.VectorIndex.hnsw(
                quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
            ),
        )
    )
    # END UpdateMultipleCollections
    """
    # START UpdateMultipleCollections

print(
    f"Processed {len(batch)} collections. Remaining: {len(hnsw_collections) - BATCH_SIZE}"
)
# END UpdateMultipleCollections

# ==============================
# =====  CHECK COMPRESSION STATUS =====
# ==============================

# START CheckCompressionStatus
collection = client.collections.get("MyUncompressedCollection")
config = collection.config.get()

# Check if this is a legacy collection (no named vectors)
if config.vector_config:
    # Named vectors - iterate through vector_config
    for vector_name, vector_config in config.vector_config.items():
        print(f"\nVector: {vector_name}")
        quantizer = vector_config.vector_index_config.quantizer
        if quantizer:
            print(f"  Quantizer type: {type(quantizer).__name__}")
            if hasattr(quantizer, "bits"):
                print(f"  Bits: {quantizer.bits}")
        else:
            print("  No compression enabled")
else:
    # Legacy collection - check vector_index_config directly
    print(f"\nLegacy collection (no named vectors)")
    quantizer = config.vector_index_config.quantizer
    if quantizer:
        print(f"  Quantizer type: {type(quantizer).__name__}")
        if hasattr(quantizer, "bits"):
            print(f"  Bits: {quantizer.bits}")
    else:
        print("  No compression enabled")
# END CheckCompressionStatus

client.close()
