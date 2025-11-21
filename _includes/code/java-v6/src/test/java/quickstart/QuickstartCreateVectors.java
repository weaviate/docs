package quickstart;

// START CreateCollection
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.Vectors;
import io.weaviate.client6.v1.api.collections.data.InsertManyResponse;
import io.weaviate.client6.v1.api.collections.data.WriteWeaviateObject;
import java.util.Map;

public class QuickstartCreateVectors {

  // TODO[g-despot] DX: Far to complicated vector insertion
  public static void main(String[] args) throws Exception {
    WeaviateClient client = null;
    String collectionName = "Movie";

    try {
      // Best practice: store your credentials in environment variables
      String weaviateUrl = System.getenv("WEAVIATE_URL");
      String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

      // Step 1.1: Connect to your Weaviate Cloud instance
      client =
          WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey);
      // END CreateCollection

      // NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
      if (client.collections.exists(collectionName)) {
        client.collections.delete(collectionName);
      }

      // START CreateCollection
      // Step 1.2: Create a collection
      // highlight-start
      client.collections.create(collectionName, col -> col
          // No automatic vectorization since we're providing vectors
          .vectorConfig(VectorConfig.selfProvided())
          // Define properties for the collection
          .properties(Property.text("title"), Property.text("description"),
              Property.text("genre")));
      // highlight-end

      // Step 1.3: Import three objects
      Map<String, Object> props1 = Map.of("title", "The Matrix", "description",
          "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
          "genre", "Science Fiction");
      // Use primitive float[] for v6
      float[] vector1 =
          new float[] {0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f};

      Map<String, Object> props2 = Map.of("title", "Spirited Away",
          "description",
          "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
          "genre", "Animation");
      float[] vector2 =
          new float[] {0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f};

      Map<String, Object> props3 = Map.of("title",
          "The Lord of the Rings: The Fellowship of the Ring", "description",
          "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
          "genre", "Fantasy");
      float[] vector3 =
          new float[] {0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f, 1.0f};

      // Insert the objects with vectors
      CollectionHandle<Map<String, Object>> movies =
          client.collections.use(collectionName);
      InsertManyResponse insertResponse = movies.data.insertMany(
          WriteWeaviateObject.of(v -> v.properties(props1)
              .vectors(Vectors.of(vector1))),
          WriteWeaviateObject.of(v -> v.properties(props2)
              .vectors(Vectors.of(vector2))),
          WriteWeaviateObject.of(v -> v.properties(props3)
              .vectors(Vectors.of(vector3))));
      if (!insertResponse.errors().isEmpty()) {
        System.err.println("Errors during import: " + insertResponse.errors());
      } else {
        System.out.println("Imported " + insertResponse.uuids().size()
            + " objects with vectors into the Movie collection");
      }
    } finally {
      if (client != null) {
        client.close(); // Free up resources
      }
    }
  }
}
// END CreateCollection
