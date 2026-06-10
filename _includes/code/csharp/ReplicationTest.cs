using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

public class ReplicationTest : IAsyncLifetime
{
    private WeaviateClient client;
    private const string CollectionName = "MyReplicatedDocCollection";

    public async Task InitializeAsync()
    {
        // Connect to local Weaviate instance (Ports match Python script)
        // Assuming a multi-node cluster is running at these ports
        client = await Connect.Local(restPort: 8180, grpcPort: 50151);

        // Cleanup from previous runs
        if (await client.Collections.Exists(CollectionName))
        {
            await client.Collections.Delete(CollectionName);
        }
        await client.Cluster.Replications.DeleteAll();
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }

    [Fact]
    public async Task TestReplicationWorkflow()
    {
        // Setup: Create collection with Replication Factor = 2
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = CollectionName,
                Properties = [Property.Text("title"), Property.Text("body")],
                ReplicationConfig = new ReplicationConfig { Factor = 2 },
            }
        );

        var replicaCollection = client.Collections.Use(CollectionName);

        // Insert dummy data
        await replicaCollection.Data.Insert(
            new
            {
                title = "Lorem Ipsum",
                body = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            }
        );

        // Give the cluster a moment to propagate metadata
        await Task.Delay(1000);

        // --- Logic to determine Source and Target Nodes ---

        // In C#, we use ListVerbose to get sharding state
        var nodes = await client.Cluster.Nodes.ListVerbose(collection: CollectionName);
        Assert.True(nodes.Length >= 2, "Cluster must have at least 2 nodes for this test");

        // Find a shard and its current replicas
        // We look for a node that holds a shard for this collection
        var sourceNodeData = nodes.First(n =>
            n.Shards != null && n.Shards.Any(s => s.Collection == CollectionName)
        );
        var shardData = sourceNodeData.Shards!.First(s => s.Collection == CollectionName);

        string shardName = shardData.Name;
        string sourceNodeName = sourceNodeData.Name;

        // Find all current replicas for this specific shard
        // (Nodes that have a shard with the same name and collection)
        var currentReplicaNodes = nodes
            .Where(n =>
                n.Shards != null
                && n.Shards.Any(s => s.Name == shardName && s.Collection == CollectionName)
            )
            .Select(n => n.Name)
            .ToHashSet();

        // Find a target node that DOES NOT currently hold this shard
        var targetNodeName = nodes
            .Select(n => n.Name)
            .FirstOrDefault(n => !currentReplicaNodes.Contains(n));

        // Fallback if all nodes hold the shard (unlikely with factor 2 on 3 nodes, but safe check)
        if (targetNodeName == null)
        {
            Console.WriteLine("All nodes already hold this shard. Using node2 as fallback/force.");
            targetNodeName = "node2";
        }

        Console.WriteLine(
            $"Shard: {shardName}, Source: {sourceNodeName}, Target: {targetNodeName}"
        );

        // 1. Replicate (Copy) a shard
        // START ReplicateShard
        var replicateRequest = new ReplicateRequest(
            Collection: CollectionName,
            Shard: shardName,
            SourceNode: sourceNodeName,
            TargetNode: targetNodeName,
            Type: ReplicationType.Copy // For copying a shard
        // Type: ReplicationType.Move // For moving a shard
        );

        var operation = await client.Cluster.Replicate(replicateRequest);
        var operationId = operation.Current.Id;

        Console.WriteLine($"Replication initiated, ID: {operationId}");
        // END ReplicateShard

        // 2. List replication operations
        // START ListReplicationOperations
        var allOps = await client.Cluster.Replications.ListAll();
        Console.WriteLine($"Total replication operations: {allOps.Count()}");

        var filteredOps = await client.Cluster.Replications.List(
            collection: CollectionName,
            targetNode: targetNodeName
        );
        Console.WriteLine(
            $"Filtered operations for collection '{CollectionName}' on '{targetNodeName}': {filteredOps.Count()}"
        );
        // END ListReplicationOperations

        // Wait for operation to progress slightly
        await Task.Delay(2000);

        // 3. Get replication operation status
        // START CheckOperationStatus
        var opStatus = await client.Cluster.Replications.Get(operationId, includeHistory: true);
        Console.WriteLine($"Status for {operationId}: {opStatus.Status.State}");
        Console.WriteLine(
            $"History for {operationId}: {JsonSerializer.Serialize(opStatus.StatusHistory)}"
        );
        // END CheckOperationStatus

        // 4. Cancel a replication operation
        // START CancelOperation
        await client.Cluster.Replications.Cancel(operationId);
        // END CancelOperation

        // 5. Delete a replication operation record
        // START DeleteOperationRecord
        await client.Cluster.Replications.Delete(operationId);
        // END DeleteOperationRecord

        // 6. Delete all replication operations
        // START DeleteAllOperationRecords
        await client.Cluster.Replications.DeleteAll();
        // END DeleteAllOperationRecords

        // 7. Query Sharding State
        // START CheckShardingState
        var shardingState = await client.Cluster.Nodes.ListVerbose(collection: CollectionName);

        Console.WriteLine($"Nodes participating in '{CollectionName}':");
        foreach (var node in shardingState)
        {
            if (node.Shards != null)
            {
                foreach (var s in node.Shards)
                {
                    if (s.Collection == CollectionName)
                    {
                        Console.WriteLine($"Node: {node.Name}, Shard: {s.Name}");
                    }
                }
            }
        }
        // END CheckShardingState
    }
}
