import weaviate
from weaviate.classes.config import Configure, Property, DataType

client = weaviate.connect_to_local(
    port=8180,
    grpc_port=50151,
)

collection_name = "MyReplicatedDocCollection"

if not client.collections.exists(collection_name):
    replica_collection = client.collections.create(
        name=collection_name,
        properties=[
            Property(name="title", data_type=DataType.TEXT),
            Property(name="body", data_type=DataType.TEXT),
        ],
        replication_config=Configure.replication(factor=2),
    )
else:
    replica_collection = client.collections.use(collection_name)

replica_collection.data.insert(
    {
        "title": "Lorem Ipsum",
        "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    }
)

_collection_sharding_state_for_setup = client.cluster.query_sharding_state(
    collection=collection_name
)
assert (
    _collection_sharding_state_for_setup and _collection_sharding_state_for_setup.shards
)


shard_name = _collection_sharding_state_for_setup.shards[0].name
replicas = _collection_sharding_state_for_setup.shards[0].replicas
source_node_name = replicas[0]

potential_target_nodes = [
    "node1",
    "node2",
    "node3",
]
target_node_name = next(
    (node for node in potential_target_nodes if node not in replicas), "node2"
)  # Default to "node2" if no other node is available; adjust as needed

# 1. Replicate (Copy) a shard
# Initiates the copy of a shard to another node.
# START ReplicateShard
from weaviate.cluster.models import ReplicationType

operation_id = client.cluster.replicate(
    collection=collection_name,
    shard=shard_name,
    source_node=source_node_name,
    target_node=target_node_name,
    replication_type=ReplicationType.COPY,  # For copying a shard
    # replication_type=ReplicationType.MOVE,  # For moving a shard
)
print(f"Replication initiated, ID: {operation_id}")
# END ReplicateShard

# 2. List replication operations
# START ListReplicationOperations
all_ops = client.cluster.replications.list_all()
print(f"Total replication operations: {len(all_ops)}")

filtered_ops = client.cluster.replications.query(
    collection=collection_name,
    target_node=target_node_name,
)
print(
    f"Filtered operations for collection '{collection_name}' on '{target_node_name}': {len(filtered_ops)}"
)
# END ListReplicationOperations

# Wait for the operation to change state
import time
time.sleep(2)

# 3. Get replication operation status
# START CheckOperationStatus
op_status = client.cluster.replications.get(
    uuid=operation_id,
    include_history=True
)
print(f"Status for {operation_id}: {op_status.status}")
print(f"History for {operation_id}: {op_status.status_history}")
# END CheckOperationStatus

# 4. Cancel a replication operation
# START CancelOperation
client.cluster.replications.cancel(uuid=operation_id)
# END CancelOperation

# 5. Delete a replication operation record
# START DeleteOperationRecord
client.cluster.replications.delete(uuid=operation_id)
# END DeleteOperationRecord

# 6. Delete all replication operations
# START DeleteAllOperationRecords
client.cluster.replications.delete_all()
# END DeleteAllOperationRecords

# 7. Query Sharding State
# START CheckShardingState
sharding_state = client.cluster.query_sharding_state(
    collection=collection_name,
    # shard=shard_name,  # Optional: specify a shard to filter results
)

print(f"Shards in '{collection_name}': {[s.name for s in sharding_state.shards]}")
for shard in sharding_state.shards:
    print(f"Nodes for shard '{shard.name}': {shard.replicas}")
# END CheckShardingState

client.close()
