package quickstart;
// TODO[g-despot] Should it be generated or generative?
// START RAG
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;

import java.util.Map;

public class QuickstartLocalQueryNearTextRAG {
  public static void main(String[] args) throws Exception {
    WeaviateClient client = null;

    try {
      // Step 2.1: Connect to your local Weaviate instance
      client = WeaviateClient.connectToLocal();

      // Step 2.2: Perform RAG with nearText results
      CollectionHandle<Map<String, Object>> movies =
          client.collections.use("Movie");

      // highlight-start
      var response = movies.generate.nearText(
          "sci-fi",
          q -> q.limit(1)
              .returnProperties("title", "description", "genre"),
          // Generative configuration (RAG task)
          g -> g.groupedTask("Write a tweet with emojis about this movie."));
      // highlight-end

      // Inspect the results
      System.out.println(response.generated().text());

    } finally {
      if (client != null) {
        client.close(); // Free up resources
      }
    }
  }
}
// END RAG
