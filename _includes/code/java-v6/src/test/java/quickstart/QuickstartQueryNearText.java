package quickstart;

// START NearText
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import com.fasterxml.jackson.databind.ObjectMapper; // For pretty-printing JSON

import java.util.Map;

public class QuickstartQueryNearText {
  public static void main(String[] args) throws Exception {
    WeaviateClient client = null;

    try {
      // Best practice: store your credentials in environment variables
      String weaviateUrl = System.getenv("WEAVIATE_URL");
      String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

      // Step 2.1: Connect to your Weaviate Cloud instance
      client =
          WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey);

      // Step 2.2: Perform a semantic search with NearText
      CollectionHandle<Map<String, Object>> movies =
          client.collections.use("Movie");
      ObjectMapper objectMapper = new ObjectMapper();

      // highlight-start
      var response = movies.query.nearText("sci-fi",
          q -> q.limit(2).returnProperties("title", "description", "genre"));
      // highlight-end

      // Inspect the results
      System.out.println("--- Query Results ---");
      for (var obj : response.objects()) {
        System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(obj.properties()));
      }
    } finally {
      if (client != null) {
        client.close(); // Free up resources
      }
    }
  }
}
// END NearText
