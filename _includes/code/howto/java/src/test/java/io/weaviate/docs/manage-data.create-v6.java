// How-to: Manage-data -> Create objects
package io.weaviate.docs;

import io.weaviate.docs.helper.EnvHelper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import io.weaviate.client6.Config;
import io.weaviate.client6.WeaviateClient;
// START CreateObject // START ObjectWithCrossRef
import io.weaviate.client6.v1.collections.object.WeaviateObject;
import io.weaviate.client6.v1.collections.Reference;


// END CreateObject // END ObjectWithCrossRef

@Tag("crud")
@Tag("create")
class ManageDataCreateTest {

  private static final int MAX_ROWS_TO_IMPORT = 50; // limit vectorization calls
  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    String scheme = EnvHelper.scheme("http");
    String host = EnvHelper.host("localhost");
    String port = EnvHelper.port("8080");

    Config config = new Config(scheme, host + ":" + port);
    client = new WeaviateClient(config);
  }

  @Test
  public void shouldManageDataCreate() {
    // START ObjectWithCrossRef
    String targetCollectionName = "JeopardyQuestion";
    String targetObjectId = "12345"; // Example target object ID, replace with actual ID
    // END ObjectWithCrossRef
    // START CreateObject // START ObjectWithCrossRef
    String collectionName = "JeopardyQuestion";

    // END CreateObject // END ObjectWithCrossRef
    createObject(collectionName);
  }

  private void createObject(String collectionName) {
    // START CreateObject
    var collection = client.collections.use(collectionName);

    WeaviateObject<Map<String, Object>> objectResult = collection.data.insert(
        Map.of("propertyName1", "Some Value"));
  
    String createdObjectId = objectResult.metadata().id(); // Get ID of the created object
    // END CreateObject
  }

  private void createObjectWithReference(String collectionName, String targetCollectionName, String targetObjectId) {
    // START ObjectWithCrossRef
    var collection = client.collections.use(collectionName);

    WeaviateObject<Map<String, Object>> objectResult = collection.data.insert(
        Map.of(
            "propertyName1", "Another Value",
            "integerPropertyName", 100),
        opt -> opt.reference(
            "referencePropertyName", // Name of the reference property
            Reference.collection(targetCollectionName, targetObjectId) // Target target collection and ID
        ));

    String createdObjectId = objectResult.metadata().id(); // Get ID of the created object
    // END ObjectWithCrossRef
  }
}
