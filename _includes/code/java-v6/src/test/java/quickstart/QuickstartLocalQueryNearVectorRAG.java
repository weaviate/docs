package quickstart;

// TODO[g-despot] NearVector arguments not correct
// START RAG
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;

import java.util.Map;

public class QuickstartLocalQueryNearVectorRAG {
  public static void main(String[] args) throws Exception {
    WeaviateClient client = null;

    try {
      // Step 2.1: Connect to your local Weaviate instance
      client = WeaviateClient.connectToLocal();

      // Step 2.2: Perform RAG with NearVector results
      CollectionHandle<Map<String, Object>> movies =
          client.collections.use("Movie");

      // highlight-start
      // Use primitive float[] for v6
      float[] queryVector =
          new float[] {0.11f, 0.21f, 0.31f, 0.41f, 0.51f, 0.61f, 0.71f, 0.81f};

      var response = movies.generate.nearVector(queryVector,
          q -> q.limit(1).returnProperties("title", "description", "genre"),
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
