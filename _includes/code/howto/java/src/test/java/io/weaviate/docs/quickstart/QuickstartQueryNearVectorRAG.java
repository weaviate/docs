package io.weaviate.docs.quickstart;

// START RAG
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.graphql.model.GraphQLResponse;
import io.weaviate.client.v1.graphql.query.argument.NearVectorArgument;
import io.weaviate.client.v1.graphql.query.fields.Field;
import io.weaviate.client.v1.graphql.query.fields.GenerativeSearchBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QuickstartQueryNearVectorRAG {
  public static void main(String[] args) throws AuthException {
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String anthropicApiKey = System.getenv("ANTHROPIC_API_KEY");

    // Step 2.1: Connect to your Weaviate Cloud instance
    // highlight-start
    Map<String, String> headers = new HashMap<>();
    headers.put("X-Anthropic-Api-Key", anthropicApiKey);

    Config config = new Config("https", weaviateUrl.replace("https://", ""), headers);
    WeaviateClient client = WeaviateAuthClient.apiKey(config, weaviateApiKey);
    // highlight-end

    // Step 2.2: Perform RAG with NearVector results
    // highlight-start
    Field title = Field.builder().name("title").build();
    Field description = Field.builder().name("description").build();
    Field genre = Field.builder().name("genre").build();

    NearVectorArgument nearVector = NearVectorArgument.builder()
        .vector(new Float[] { 0.11f, 0.21f, 0.31f, 0.41f, 0.51f, 0.61f, 0.71f, 0.81f })
        .build();

    GenerativeSearchBuilder generativeSearch = GenerativeSearchBuilder.builder()
        .groupedResultTask("Write a tweet with emojis about this movie.")
        .build();

    Result<GraphQLResponse> response = client.graphQL().get()
        .withClassName("Movie")
        .withNearVector(nearVector)
        .withLimit(1)
        .withFields(title, description, genre)
        .withGenerativeSearch(generativeSearch)
        .run();
    // highlight-end

    // Inspect the results
    if (response.hasErrors()) {
      System.out.println("Error: " + response.getError());
    } else {
      System.out.println(response.getResult());
    }
    // END RAG
  }
}