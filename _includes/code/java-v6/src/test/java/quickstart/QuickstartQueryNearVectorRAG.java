package quickstart;

// START RAG
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;

import java.util.Map;

public class QuickstartQueryNearVectorRAG {
  public static void main(String[] args) throws Exception {
    WeaviateClient client = null;

    try {
      // Best practice: store your credentials in environment variables
      String weaviateUrl = System.getenv("WEAVIATE_URL");
      String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
      String anthropicApiKey = System.getenv("ANTHROPIC_API_KEY");

      // Step 2.1: Connect to your Weaviate Cloud instance
      // highlight-start
      client = WeaviateClient.connectToWeaviateCloud(weaviateUrl,
          weaviateApiKey, config -> config
              .setHeaders(Map.of("X-Anthropic-Api-Key", anthropicApiKey)));
      // highlight-end

      // Step 2.2: Perform RAG with NearVector results
      CollectionHandle<Map<String, Object>> movies =
          client.collections.use("Movie");

      // highlight-start
      // Use primitive float[] for v6
      float[] queryVector =
          new float[] {0.11f, 0.21f, 0.31f, 0.41f, 0.51f, 0.61f, 0.71f, 0.81f};

      var response = movies.generate.nearVector(
          queryVector,
          q -> q.limit(1)
              .returnProperties("title", "description", "genre"),
          // Generative configuration (RAG task)
          g -> g.groupedTask("Write a tweet with emojis about this movie."));
      // highlight-end

      // Inspect the results
      // Use .generated() to access the generative result
      System.out.println(response.generated().text());

    } finally {
      if (client != null) {
        client.close(); // Free up resources
      }
    }
  }
}
// END RAG
