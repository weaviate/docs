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
# =====  UPDATE SINGLE COLLECTION (HNSW) =====
# ==============================

# START UpdateSingleCollectionHNSW
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
# END UpdateSingleCollectionHNSW

# ==============================
# =====  UPDATE SINGLE COLLECTION (FLAT) =====
# ==============================

# START UpdateSingleCollectionFlat
from weaviate.classes.config import Reconfigure

collection = client.collections.get("MyCollection")
collection.config.update(
    vector_config=Reconfigure.Vectors.update(
        name="default",
        vector_index_config=Reconfigure.VectorIndex.flat(
            quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
        ),
    )
)
# END UpdateSingleCollectionFlat

# ==============================
# =====  UPDATE SINGLE COLLECTION (DYNAMIC) =====
# ==============================

# START UpdateSingleCollectionDynamic
from weaviate.classes.config import Reconfigure

collection = client.collections.get("MyCollection")
collection.config.update(
    vector_config=Reconfigure.Vectors.update(
        name="default",
        vector_index_config=Reconfigure.VectorIndex.dynamic(
            hnsw=Reconfigure.VectorIndex.hnsw(
                quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
            ),
            flat=Reconfigure.VectorIndex.flat(
                quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
            ),
        ),
    )
)
# END UpdateSingleCollectionDynamic

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

# Loop through HNSW collections identified above
for entry in hnsw_collections:
    collection_name = entry["collection"]
    vector_name = entry["vector"]

    collection = client.collections.get(collection_name)
    print(f"Enabling RQ-8 compression for {collection_name} (vector: {vector_name})")
    collection.config.update(
        vector_config=Reconfigure.Vectors.update(
            name=vector_name,
            vector_index_config=Reconfigure.VectorIndex.hnsw(
                quantizer=Reconfigure.VectorIndex.Quantizer.rq(bits=8),
            ),
        )
    )
# END UpdateMultipleCollections

# ==============================
# =====  CHECK COMPRESSION STATUS =====
# ==============================

# START CheckCompressionStatus
collection = client.collections.get("MyCollection")
config = collection.config.get()

# Check if this is a legacy collection (no named vectors)
if config.vector_config:
    # Named vectors - iterate through vector_config
    for vector_name, vector_config in config.vector_config.items():
        print(f"\nVector: {vector_name}")
        quantizer = vector_config.vector_index_config.quantizer
        if quantizer:
            print(f"  Quantizer type: {type(quantizer).__name__}")
            if hasattr(quantizer, 'bits'):
                print(f"  Bits: {quantizer.bits}")
        else:
            print("  No compression enabled")
else:
    # Legacy collection - check vector_index_config directly
    print(f"\nLegacy collection (no named vectors)")
    quantizer = config.vector_index_config.quantizer
    if quantizer:
        print(f"  Quantizer type: {type(quantizer).__name__}")
        if hasattr(quantizer, 'bits'):
            print(f"  Bits: {quantizer.bits}")
    else:
        print("  No compression enabled")
# END CheckCompressionStatus

client.close()
