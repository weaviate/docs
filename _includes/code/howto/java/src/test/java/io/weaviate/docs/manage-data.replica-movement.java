package io.weaviate.docs;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.cluster.model.ShardReplicas;
import io.weaviate.client.v1.cluster.model.ShardingState;
import io.weaviate.client.v1.cluster.api.replication.model.ReplicateOperation;
import io.weaviate.client.v1.misc.model.ReplicationConfig;
import io.weaviate.client.v1.schema.model.DataType;
import io.weaviate.client.v1.schema.model.Property;
import io.weaviate.client.v1.schema.model.WeaviateClass;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * This test demonstrates replication operations in Weaviate.
 * Note: This requires a multi-node Weaviate cluster to be running.
 * The example assumes nodes named "node1", "node2", "node3" are available.
 */
@Tag("replication")
class ReplicaMovementTest {

  private static WeaviateClient client;
  private static final String COLLECTION_NAME = "MyReplicatedDocCollection";

  @BeforeAll
  public static void beforeAll() {
    Config config = new Config("http", "localhost:8180");
    // Note: gRPC port 50151 configuration would be needed for gRPC-based operations
    client = new WeaviateClient(config);
  }

  @Test
  public void shouldHandleReplicationOperations() throws InterruptedException {
    // Create collection with replication if it doesn't exist
    createReplicatedCollectionIfNotExists();

    // Insert sample data
    insertSampleData();

    // Get sharding state for setup
    ShardingState collectionShardingState = getShardingStateForSetup();

    String shardName = collectionShardingState.getShards().get(0).getName();
    List<String> replicas = collectionShardingState.getShards().get(0).getReplicas();
    String sourceNodeName = replicas.get(0);

    // Find target node
    // Find target node
    String[] potentialTargetNodes = { "node1", "node2", "node3" };
    String targetNodeName = Stream.of(potentialTargetNodes)
        .filter(node -> !node.equals(sourceNodeName)) // Ensure not the source node
        .filter(node -> !replicas.contains(node)) // Ensure not already a replica
        .findFirst()
        .orElse(null); // If no valid node, set to null

    if (targetNodeName == null) {
      throw new IllegalStateException("No valid target node found for replication.");
    }
    // 1. Replicate (Copy) a shard
    String operationId = replicateShard(shardName, sourceNodeName, targetNodeName);

    // 2. List replication operations
    listReplicationOperations(targetNodeName);

    // Wait for the operation to change state
    Thread.sleep(2000);

    // 3. Get replication operation status
    checkOperationStatus(operationId);

    // 4. Cancel a replication operation
    cancelOperation(operationId);

    // 5. Delete a replication operation record
    deleteOperationRecord(operationId);

    // 6. Delete all replication operations
    deleteAllOperationRecords();

    // 7. Query Sharding State
    checkShardingState();
  }

  private void createReplicatedCollectionIfNotExists() {
    Result<Boolean> exists = client.schema().exists().withClassName(COLLECTION_NAME).run();

    if (!exists.getResult()) {
      WeaviateClass replicaCollection = WeaviateClass.builder()
          .className(COLLECTION_NAME)
          .properties(Arrays.asList(
              Property.builder()
                  .name("title")
                  .dataType(Arrays.asList(DataType.TEXT))
                  .build(),
              Property.builder()
                  .name("body")
                  .dataType(Arrays.asList(DataType.TEXT))
                  .build()))
          .replicationConfig(ReplicationConfig.builder()
              .factor(2)
              .build())
          .build();

      Result<Boolean> createResult = client.schema().classCreator()
          .withClass(replicaCollection)
          .run();

      assertThat(createResult).isNotNull()
          .returns(true, Result::getResult);
    }
  }

  private void insertSampleData() {
    client.data().creator().withProperties(new HashMap<String, Object>() {
      {
        put("title", "Lorem Ipsum");
        put("body", "Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
      }
    }).withClassName(COLLECTION_NAME).run();
  }

  private ShardingState getShardingStateForSetup() {
    Result<ShardingState> shardingStateResult = client.cluster()
        .shardingStateQuerier()
        .withClassName(COLLECTION_NAME)
        .run();

    ShardingState shardingState = shardingStateResult.getResult();
    assertThat(shardingState).isNotNull();
    assertThat(shardingState.getShards()).isNotEmpty();

    return shardingState;
  }

  private String replicateShard(String shardName, String sourceNodeName, String targetNodeName) {
    // START ReplicateShard
    Result<String> replicateResult = client.cluster().replicator()
        .withClassName(COLLECTION_NAME)
        .withShard(shardName)
        .withSourceNode(sourceNodeName)
        .withTargetNode(targetNodeName)
        .run();
    // Note: The Java client defaults to ReplicationType.COPY
    // To perform a MOVE operation, this may require additional configuration

    String operationId = replicateResult.getResult();
    System.out.println("Replication initiated, ID: " + operationId);
    // END ReplicateShard

    assertThat(operationId).isNotNull();
    return operationId;
  }

  private void listReplicationOperations(String targetNodeName) {
    // START ListReplicationOperations
    Result<List<ReplicateOperation>> allOpsResult = client.cluster()
        .replication()
        .allGetter()
        .run();

    List<ReplicateOperation> allOps = allOpsResult.getResult();
    System.out.println("Total replication operations: " +
        (allOps != null ? allOps.size() : 0));

    Result<List<ReplicateOperation>> filteredOpsResult = client.cluster()
        .replication()
        .querier()
        .withClassName(COLLECTION_NAME)
        .withTargetNode(targetNodeName)
        .run();

    List<ReplicateOperation> filteredOps = filteredOpsResult.getResult();
    System.out.println("Filtered operations for collection '" + COLLECTION_NAME +
        "' on '" + targetNodeName + "': " +
        (filteredOps != null ? filteredOps.size() : 0));
    // END ListReplicationOperations
  }

  private void checkOperationStatus(String operationId) {
    // START CheckOperationStatus
    Result<ReplicateOperation> opStatusResult = client.cluster()
        .replication()
        .getter()
        .withUuid(operationId)
        .withIncludeHistory(true)
        .run();

    ReplicateOperation opStatus = opStatusResult.getResult();
    if (opStatus != null) {
      System.out.println("Status for " + operationId + ": " + opStatus.getStatus());
      System.out.println("History for " + operationId + ": " + opStatus.getStatusHistory());
    }
    // END CheckOperationStatus
  }

  private void cancelOperation(String operationId) {
    // START CancelOperation
    Result<Boolean> cancelResult = client.cluster()
        .replication()
        .canceler()
        .withUuid(operationId)
        .run();
    // END CancelOperation

    assertThat(cancelResult).isNotNull();
  }

  private void deleteOperationRecord(String operationId) {
    // START DeleteOperationRecord
    Result<Boolean> deleteResult = client.cluster()
        .replication()
        .deleter()
        .withUuid(operationId)
        .run();
    // END DeleteOperationRecord

    assertThat(deleteResult).isNotNull();
  }

  private void deleteAllOperationRecords() {
    // START DeleteAllOperationRecords
    Result<Boolean> deleteAllResult = client.cluster()
        .replication()
        .allDeleter()
        .run();
    // END DeleteAllOperationRecords

    assertThat(deleteAllResult).isNotNull();
  }

  private void checkShardingState() {
    // START CheckShardingState
    Result<ShardingState> shardingStateResult = client.cluster()
        .shardingStateQuerier()
        .withClassName(COLLECTION_NAME)
        // .withShard(shardName) // Optional: specify a shard to filter results
        .run();

    ShardingState shardingState = shardingStateResult.getResult();

    if (shardingState != null && shardingState.getShards() != null) {
      System.out.println("Shards in '" + COLLECTION_NAME + "': " +
          shardingState.getShards().stream()
              .map(ShardReplicas::getName)
              .collect(Collectors.toList()));

      for (ShardReplicas shard : shardingState.getShards()) {
        System.out.println("Nodes for shard '" + shard.getName() + "': " +
            Arrays.toString(shard.getReplicas().toArray(new String[0])));
      }
    }
    // END CheckShardingState
  }

  @AfterAll
  public static void cleanup() {
    // Clean up test collection
    client.schema().classDeleter()
        .withClassName(COLLECTION_NAME)
        .run();
  }
}