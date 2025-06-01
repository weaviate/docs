// How-to: Manage-data -> Create objects
package io.weaviate.docs;

import io.weaviate.docs.helper.EnvHelper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import io.weaviate.client6.Config;
import io.weaviate.client6.WeaviateClient;
import io.weaviate.client6.v1.collections.object.WeaviateObject;
import io.weaviate.client6.v1.collections.Reference;

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
    // CreateObject START
    String collectionName = "JeopardyQuestion";

    // CreateObject END
    createObject(collectionName);
  }

  private void createObject(String collectionName) {
    // CreateObject START
    var collection = client.collections.use(collectionName);

    // 1. Insert an object with basic properties
    WeaviateObject<Map<String, Object>> objectResult1 = collection.data.insert(
        Map.of("propertyName1", "Some Value"));
    String createdObjectId1 = objectResult1.metadata().id(); // Get ID of the created object

    // 2. Insert an object with a reference to another object
    WeaviateObject<Map<String, Object>> objectResult2 = collection.data.insert(
        Map.of(
            "propertyName1", "Another Value",
            "integerPropertyName", 100),
        opt -> opt.reference(
            "referencePropertyName", // Name of the reference property in COLLECTION_NAME
            Reference.collection(TARGET_COLLECTION_NAME, createdObjectId1) // Target collection and ID
        ));
    // CreateObject END
  }
}
