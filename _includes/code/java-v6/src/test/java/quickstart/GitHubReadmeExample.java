package quickstart;

import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import java.util.Map;

public class GitHubReadmeExample {

  public static void main(String[] args) throws Exception {
    // Connect to Weaviate
    // Using try-with-resources ensures client.close() is called automatically
    try (WeaviateClient client = WeaviateClient.connectToLocal()) {

      // Clean slate (not in original script, but helpful for re-running main methods)
      if (client.collections.exists("Article")) {
        client.collections.delete("Article");
      }

      // Create a collection
      client.collections.create("Article",
          col -> col.properties(Property.text("content"))
              .vectorConfig(VectorConfig.text2vecTransformers()) // Use a vectorizer to generate embeddings during import
           // .vectorConfig(VectorConfig.selfProvided()) // If you want to import your own pre-generated embeddings
      );

      // Insert objects and generate embeddings
      CollectionHandle<Map<String, Object>> articles =
          client.collections.use("Article");

      articles.data.insertMany(
          Map.of("content", "Vector databases enable semantic search"),
          Map.of("content", "Machine learning models generate embeddings"),
          Map.of("content", "Weaviate supports hybrid search capabilities"));

      Thread.sleep(1000);
      // Perform semantic search
      var results =
          articles.query.nearText("Search objects by meaning", q -> q.limit(1));

      // Print result
      if (!results.objects().isEmpty()) {
        System.out.println(results.objects().get(0));
      }
    }
  }
}
