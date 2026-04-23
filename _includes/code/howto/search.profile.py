# START ProfileNearVector
import weaviate
from weaviate.classes.query import MetadataQuery

client = weaviate.connect_to_local()

collection = client.collections.get("Article")

response = collection.query.near_vector(
    near_vector=[0.1, 0.2, 0.3],
    limit=5,
    return_metadata=MetadataQuery(query_profile=True, distance=True),
)

if response.query_profile:
    for shard in response.query_profile.shards:
        print(f"Shard: {shard.name} (node: {shard.node})")
        for search_type, profile in shard.searches.items():
            print(f"  [{search_type}]")
            for key, value in profile.details.items():
                print(f"    {key}: {value}")
# END ProfileNearVector

# START ProfileBM25
from weaviate.classes.query import MetadataQuery

collection = client.collections.get("Article")

response = collection.query.bm25(
    query="machine learning",
    return_metadata=MetadataQuery(query_profile=True, score=True),
)

if response.query_profile:
    for shard in response.query_profile.shards:
        print(f"Shard: {shard.name} (node: {shard.node})")
        for search_type, profile in shard.searches.items():
            print(f"  [{search_type}]")
            for key, value in profile.details.items():
                print(f"    {key}: {value}")
# END ProfileBM25

# START ProfileHybrid
from weaviate.classes.query import MetadataQuery

collection = client.collections.get("Article")

response = collection.query.hybrid(
    query="machine learning",
    return_metadata=MetadataQuery(query_profile=True),
    limit=5,
)

if response.query_profile:
    for shard in response.query_profile.shards:
        print(f"Shard: {shard.name} (node: {shard.node})")
        for search_type, profile in shard.searches.items():
            print(f"  [{search_type}]")
            for key, value in profile.details.items():
                print(f"    {key}: {value}")
# END ProfileHybrid

# START ProfileMetadataList
# You can also use list-style metadata
response = collection.query.near_vector(
    near_vector=[0.1, 0.2, 0.3],
    limit=5,
    return_metadata=["query_profile", "distance"],
)
# END ProfileMetadataList

client.close()
