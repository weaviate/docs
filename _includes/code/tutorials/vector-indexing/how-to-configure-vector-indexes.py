import weaviate
import os

client = weaviate.connect_to_local()

collection_name = "CollectionWithHNSW"

client.collections.delete(name=collection_name)

# START ConfigHNSW
from weaviate.classes.config import Configure

client.collections.create(
    name=collection_name,
    # ... other parameters
    # highlight-start
    vector_config=Configure.Vectors.text2vec_weaviate(
        vector_index_config=Configure.VectorIndex.hnsw()
    ),
    # highlight-end
)
# END ConfigHNSW

client.collections.delete(name=collection_name)

# START CustomConfigHNSW
from weaviate.classes.config import Configure, VectorDistances

client.collections.create(
    name=collection_name,
    # ... other parameters
    # highlight-start
    vector_config=Configure.Vectors.text2vec_weaviate(
        vector_index_config=Configure.VectorIndex.hnsw(
            # Distance metric
            distance_metric=VectorDistances.COSINE,
            # Parameters for HNSW index construction
            ef_construction=256,    # Dynamic list size during construction
            max_connections=128,    # Maximum number of connections per node
            quantizer=Configure.VectorIndex.Quantizer.bq(), # Quantizer configuration
            # Parameters for HNSW search
            ef=-1,                  # Dynamic list size during search; -1 enables dynamic Ef
            dynamic_ef_factor=15,   # Multiplier for dynamic Ef
            dynamic_ef_min=200,     # Minimum threshold for dynamic Ef
            dynamic_ef_max=1000,    # Maximum threshold for dynamic Ef
        )
    ),
    # highlight-end
)
# END CustomConfigHNSW

client.collections.delete(name=collection_name)

# START ConfigFlat
from weaviate.classes.config import Configure

client.collections.create(
    name=collection_name,
    # ... other parameters
    # highlight-start
    vector_config=Configure.Vectors.text2vec_weaviate(
        vector_index_config=Configure.VectorIndex.flat()
    ),
    # highlight-end
)
# END ConfigFlat

client.collections.delete(name=collection_name)

# START CustomConfigFlat
from weaviate.classes.config import Configure, VectorDistances

client.collections.create(
    name=collection_name,
    # ... other parameters
    # highlight-start
    vector_config=Configure.Vectors.text2vec_weaviate(
        vector_index_config=Configure.VectorIndex.flat(
            distance_metric=VectorDistances.COSINE,                     # Distance metric
            quantizer=Configure.VectorIndex.Quantizer.bq(cache=True),   # Quantizer configuration
            vector_cache_max_objects=1000000,                           # Maximum number of objects in the cache
        )
    ),
    # highlight-end
)
# END CustomConfigFlat

client.collections.delete(name=collection_name)

# START ConfigDynamic
from weaviate.classes.config import Configure

client.collections.create(
    name=collection_name,
    # ... other parameters
    # highlight-start
    vector_config=Configure.Vectors.text2vec_weaviate(
        vector_index_config=Configure.VectorIndex.dynamic()
    ),
    multi_tenancy_config=Configure.multi_tenancy(enabled=True), # Dynamic index works well with multi-tenancy set-ups
    # highlight-end
)
# END ConfigDynamic

client.collections.delete(name=collection_name)

# START CustomConfigDynamic
from weaviate.classes.config import Configure, VectorDistances

client.collections.create(
    name=collection_name,
    # ... other parameters
    # highlight-start
    vector_config=Configure.Vectors.text2vec_weaviate(
        vector_index_config=Configure.VectorIndex.dynamic(
            distance_metric=VectorDistances.COSINE,                     # Distance metric
            threshold=25000,                                            # Threshold for switching to dynamic index
            hnsw=Configure.VectorIndex.hnsw(
                # Your preferred HNSW configuration
            ),
            flat=Configure.VectorIndex.flat(
                # Your preferred flat configuration
            ),
        )
    ),
    multi_tenancy_config=Configure.multi_tenancy(   # Dynamic index works well with multi-tenancy set-ups
        enabled=True,
        auto_tenant_creation=True,
        auto_tenant_activation=True,
    ),
    # highlight-end
)
# END CustomConfigDynamic

client.collections.delete(name=collection_name)

# START ConfigHFresh
from weaviate.classes.config import Configure

client.collections.create(
    name=collection_name,
    # ... other parameters
    # highlight-start
    vector_config=Configure.Vectors.text2vec_weaviate(
        vector_index_config=Configure.VectorIndex.hfresh()
    ),
    # highlight-end
)
# END ConfigHFresh

client.collections.delete(name=collection_name)

# START CustomConfigHFresh
from weaviate.classes.config import Configure, VectorDistances

client.collections.create(
    name=collection_name,
    # ... other parameters
    # highlight-start
    vector_config=Configure.Vectors.text2vec_weaviate(
        vector_index_config=Configure.VectorIndex.hfresh(
            distance_metric=VectorDistances.COSINE,     # Distance metric
            max_posting_size_kb=1024,                    # Max posting list size in KB
            replicas=4,                                  # Number of posting lists per vector
            search_probe=64,                             # Number of posting lists to search
        )
    ),
    # highlight-end
)
# END CustomConfigHFresh

client.collections.delete(name=collection_name)

client.close()
