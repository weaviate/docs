package io.weaviate.docs.search;

import io.weaviate.client6.Config;
import io.weaviate.client6.WeaviateClient;
// START GetNearText
import io.weaviate.client6.v1.collections.query.QueryResult;

// END GetNearText
import io.weaviate.docs.helper.EnvHelper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("crud")
@Tag("vector-search")
public class VectorSearchTest {

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
  public void shouldPerformVectorSearch() {
    String collectionName = "JeopardyQuestion";

    searchWithNearText(collectionName);
  }

  private void searchWithNearText(String collectionName) {
    // START GetNearText
    var collection = client.collections.use(collectionName);
    
    String yourQueryText = "your search query"; // The text to search for

    QueryResult<Map<String, Object>> queryResult = collection.query.nearText(
        yourQueryText,
        opt -> opt.limit(1) // Example: Limit to 1 result
    );

    System.out.println("NearText query result: " + queryResult.objects);
    // END GetNearText
  }
}
