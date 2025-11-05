package io.weaviate.docs.quickstart;

// NearText
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.graphql.model.GraphQLResponse;
import io.weaviate.client.v1.graphql.query.argument.NearVectorArgument;
import io.weaviate.client.v1.graphql.query.fields.Field;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.List;
import java.util.Map;

public class QuickstartQueryNearVector {
  public static void main(String[] args) throws AuthException {
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    // Step 2.1: Connect to your Weaviate Cloud instance
    Config config = new Config("https", weaviateUrl.replace("https://", ""));
    WeaviateClient client = WeaviateAuthClient.apiKey(config, weaviateApiKey);

    // Step 2.2 & 2.3: Perform a vector search with NearVector
    // highlight-start
    // END NearText

    // NearText
    Field title = Field.builder().name("title").build();
    Field description = Field.builder().name("description").build();
    Field genre = Field.builder().name("genre").build();

    NearVectorArgument nearVector = NearVectorArgument.builder()
        .vector(new Float[] { 0.11f, 0.21f, 0.31f, 0.41f, 0.51f, 0.61f, 0.71f, 0.81f })
        .build();

    Result<GraphQLResponse> response = client.graphQL().get()
        .withClassName("Movie")
        .withNearVector(nearVector)
        .withLimit(2)
        .withFields(title, description, genre)
        .run();
    // END NearText

    // NearText
    // highlight-end

    // Inspect the results
    if (response.hasErrors()) {
      System.out.println("Error: " + response.getError());
    } else {
      GraphQLResponse data = response.getResult();
      Gson gson = new GsonBuilder().setPrettyPrinting().create();

      if (data.getData() != null) {
        @SuppressWarnings("unchecked")
        Map<String, Object> dataMap = (Map<String, Object>) data.getData();
        @SuppressWarnings("unchecked")
        Map<String, Object> get = (Map<String, Object>) dataMap.get("Get");
        @SuppressWarnings("unchecked")
        List<Object> movies = (List<Object>) get.get("Movie");

        for (Object movie : movies) {
          System.out.println(gson.toJson(movie));
        }
      }
    }
  }
}
// END NearText
