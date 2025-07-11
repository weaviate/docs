package io.weaviate.docs.search;

import io.weaviate.client6.Config;
import io.weaviate.client6.WeaviateClient;
// START BasicGet
import io.weaviate.client6.v1.api.collections.query.Metadata;


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

    getById(collectionName, objectIdToFetch);
  }

  private void getById(String collectionName, String objectIdToFetch) {
    // START BasicGet
    var collection = client.collections.use(collectionName);

    var result = collection.query.byId(objectIdToFetch, query -> query.returnProperties("name")
                .returnMetadata(Metadata.DISTANCE));

    System.out.println("Fetched object metadata: " + result.get().metadata());
    // END BasicGet
  }
}
