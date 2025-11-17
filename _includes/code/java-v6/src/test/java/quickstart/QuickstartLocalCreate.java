package quickstart;

// START CreateCollection
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Generative;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.data.InsertManyResponse;

import java.util.List;
import java.util.Map;

public class QuickstartLocalCreate {

  public static void main(String[] args) throws Exception {
    WeaviateClient client = null;
    String collectionName = "Movie";

    try {
      // Step 1.1: Connect to your local Weaviate instance
      client = WeaviateClient.connectToLocal();
      // END CreateCollection

      // NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
      if (client.collections.exists(collectionName)) {
        client.collections.delete(collectionName);
      }

      // START CreateCollection
      // Step 1.2: Create a collection
      // highlight-start
      client.collections.create(collectionName,
          col -> col.vectorConfig(VectorConfig.text2vecOllama(v -> v
              // If using Docker you might need: http://host.docker.internal:11434
              .baseUrl("http://ollama:11434")
              .model("nomic-embed-text") // The model to use
          ))
              .generativeModule(Generative.ollama(g -> g
                  // If using Docker you might need: http://host.docker.internal:11434
                  .baseUrl("http://ollama:11434")
                  .model("llama3.2") // The model to use
              ))
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
        if (client.collections.exists(collectionName)) {
          client.collections.delete(collectionName);
        }
        client.close(); // Free up resources
      }
    }
  }
}
// END CreateCollection
