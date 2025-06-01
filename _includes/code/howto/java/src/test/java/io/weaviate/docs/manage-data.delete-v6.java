// How-to: Manage-data -> Delete objects
package io.weaviate.docs;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import io.weaviate.client6.Config;
import io.weaviate.client6.WeaviateClient;

@Tag("crud")
@Tag("delete")
class ManageDataDeleteTest {

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
  public void shouldManageDataRead() {
    // START DeleteObject
    String collectionName = "JeopardyQuestion";

    // END DeleteObject
  
    deleteObject(collectionName);
  }

  private void deleteObject(String collectionName) {
    // START DeleteObject
    var collection = client.collections.use(collectionName);
    collection.data.delete(objectIdToDelete); 
    // END DeleteObject
  }
}
