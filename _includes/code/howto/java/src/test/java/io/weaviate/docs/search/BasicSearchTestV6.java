package io.weaviate.docs.search;

import io.weaviate.client6.Config;
import io.weaviate.client6.WeaviateClient;
// START BasicGet
import io.weaviate.client6.v1.collections.object.WeaviateObject;


// END BasicGet

import io.weaviate.docs.helper.EnvHelper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("crud")
@Tag("search")
public class BasicSearchTest {

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
  public void shouldPerformBasicSearch() {
    // START BasicGet
    String collectionName = "Article";
    String objectIdToFetch = "12345"; // Replace with the actual object ID you want to fetch
    
    // END BasicGet

    getById(collectionName);
  }

  private void getById(String collectionName) {
    // START BasicGet
    var collection = client.collections.use(collectionName);

    Optional<WeaviateObject<Map<String, Object>>> fetchResult = collection.data.get(objectIdToFetch);

    if (fetchResult.isPresent()) {
      WeaviateObject<Map<String, Object>> fetchedObject = fetchResult.get();
      System.out.println("Fetched object: " + fetchedObject);
    }
    // END BasicGet
  }
}
