package io.weaviate.docs.quickstart;

// START CreateCollection
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.schema.model.WeaviateClass;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QuickstartLocalCreateVectors {
  public static void main(String[] args) throws AuthException {
    // Step 1.1: Connect to your Weaviate Cloud instance
    Config config = new Config("http", "localhost:8080");
    WeaviateClient client = new WeaviateClient(config);

    // END CreateCollection

    // NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
    client.schema().classDeleter().withClassName("Movie").run();

    // START CreateCollection
    // Step 1.2: Create a collection
    Map<String, Object> moduleConfig = new HashMap<>();
    Map<String, Object> generativeAnthropicSettings = new HashMap<>();
    moduleConfig.put("generative-anthropic", generativeAnthropicSettings);

    // highlight-start
    WeaviateClass movieClass = WeaviateClass.builder()
        .className("Movie")
        .vectorizer("none") // No automatic vectorization since we're providing vectors
        .moduleConfig(moduleConfig)
        .build();

    Result<Boolean> result = client.schema().classCreator()
        .withClass(movieClass)
        .run();
    // highlight-end

    // END CreateCollection

    // START CreateCollection
    // Step 1.3: Import three objects
    List<Map<String, Object>> dataObjects = List.of(
        Map.of(
            "properties", Map.of(
                "title", "The Matrix",
                "description",
                "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
                "genre", "Science Fiction"),
            "vector", new Float[] { 0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f }),
        Map.of(
            "properties", Map.of(
                "title", "Spirited Away",
                "description",
                "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
                "genre", "Animation"),
            "vector", new Float[] { 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f }),
        Map.of(
            "properties", Map.of(
                "title", "The Lord of the Rings: The Fellowship of the Ring",
                "description",
                "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
                "genre", "Fantasy"),
            "vector", new Float[] { 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f, 1.0f }));

    // Insert the objects with vectors
    for (Map<String, Object> obj : dataObjects) {
      @SuppressWarnings("unchecked")
      Map<String, Object> properties = (Map<String, Object>) obj.get("properties");
      Float[] vector = (Float[]) obj.get("vector");

      client.data().creator()
          .withClassName("Movie")
          .withProperties(properties)
          .withVector(vector)
          .run();
    }

    System.out.println("Imported " + dataObjects.size() + " objects with vectors into the Movie collection");
  }
}
// END CreateCollection
