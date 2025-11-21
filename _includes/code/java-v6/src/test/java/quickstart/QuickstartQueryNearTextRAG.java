package quickstart;

// START RAG
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.generate.GenerativeProvider;
import java.util.Map;

public class QuickstartQueryNearTextRAG {
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

      // Step 2.2: Perform RAG with nearText results
      CollectionHandle<Map<String, Object>> movies =
          client.collections.use("Movie");

      // highlight-start
      var response = movies.generate.nearText("sci-fi",
          // Query configuration (nearText and limit)
          q -> q.limit(1).returnProperties("title", "description", "genre"),
          // Generative configuration (RAG task)
          g -> g.groupedTask("Write a tweet with emojis about this movie.",
              c -> c.generativeProvider(GenerativeProvider
                  .anthropic(o -> o.model("claude-3-5-haiku-latest"))))); // The model to use
      // highlight-end

      // Inspect the results
      // Use .generative() to access the generative result
      System.out.println(response.generative().text());

    } finally {
      if (client != null) {
        client.close(); // Free up resources
      }
    }
  }
}
// END RAG
