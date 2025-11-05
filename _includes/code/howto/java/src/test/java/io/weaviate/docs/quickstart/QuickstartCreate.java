package io.weaviate.docs.quickstart;

// START CreateCollection
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.schema.model.WeaviateClass;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QuickstartCreate {
  public static void main(String[] args) throws AuthException {
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    // Step 1.1: Connect to your Weaviate Cloud instance
    Config config = new Config("https", weaviateUrl.replace("https://", ""));
    WeaviateClient client = WeaviateAuthClient.apiKey(config, weaviateApiKey);

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
        .vectorizer("text2vec-weaviate")
        .moduleConfig(moduleConfig)
        .build();

    Result<Boolean> result = client.schema().classCreator()
        .withClass(movieClass)
        .run();
    // highlight-end

    // Step 1.3: Import three objects
    List<Map<String, Object>> dataObjects = List.of(
        Map.of(
            "title", "The Matrix",
            "description",
            "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
            "genre", "Science Fiction"),
        Map.of(
            "title", "Spirited Away",
            "description",
            "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
            "genre", "Animation"),
        Map.of(
            "title", "The Lord of the Rings: The Fellowship of the Ring",
            "description",
            "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
            "genre", "Fantasy"));

    // Insert objects
    for (Map<String, Object> obj : dataObjects) {
      client.data().creator()
          .withClassName("Movie")
          .withProperties(obj)
          .run();
    }

    System.out.println("Imported & vectorized " + dataObjects.size() + " objects into the Movie collection");
  }
}
// END CreateCollection
