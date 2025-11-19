package quickstart;

// START CreateCollection
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.data.InsertManyResponse;

import java.util.List;
import java.util.Map;

public class QuickstartCreate {

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
      client.collections.create(collectionName,
          col -> col.vectorConfig(VectorConfig.text2vecWeaviate())
              // Define properties for the collection
              .properties(Property.text("title"), Property.text("description"),
                  Property.text("genre")));
      // highlight-end

      // Step 1.3: Import three objects
      List<Map<String, Object>> dataObjects = List.of(Map.of("title",
          "The Matrix", "description",
          "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
          "genre", "Science Fiction"),
          Map.of("title", "Spirited Away", "description",
              "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
              "genre", "Animation"),
          Map.of("title", "The Lord of the Rings: The Fellowship of the Ring",
              "description",
              "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
              "genre", "Fantasy"));

      // Insert objects using insertMany
      CollectionHandle<Map<String, Object>> movies =
          client.collections.use(collectionName);
      InsertManyResponse insertResponse =
          movies.data.insertMany(dataObjects.toArray(new Map[0]));

      if (!insertResponse.errors().isEmpty()) {
        System.err.println("Errors during import: " + insertResponse.errors());
      } else {
        System.out
            .println("Imported & vectorized " + insertResponse.uuids().size()
                + " objects into the Movie collection");
      }
    } finally {
      if (client != null) {
        client.close(); // Free up resources
      }
    }
  }
}
// END CreateCollection
