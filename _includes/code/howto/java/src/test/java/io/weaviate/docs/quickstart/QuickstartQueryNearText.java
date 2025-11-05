package io.weaviate.docs.quickstart;

// NearText
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.graphql.model.GraphQLResponse;
import io.weaviate.client.v1.graphql.query.argument.NearTextArgument;
import io.weaviate.client.v1.graphql.query.fields.Field;

public class QuickstartQueryNearText {
  public static void main(String[] args) throws AuthException {
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    // Step 2.1: Connect to your Weaviate Cloud instance
    Config config = new Config("https", weaviateUrl.replace("https://", ""));
    WeaviateClient client = WeaviateAuthClient.apiKey(config, weaviateApiKey);

    // Step 2.2 & 2.3: Perform a semantic search with NearText
    // highlight-start
    // END NearText

    // NearText
    Field title = Field.builder().name("title").build();
    Field description = Field.builder().name("description").build();
    Field genre = Field.builder().name("genre").build();

    NearTextArgument nearText = NearTextArgument.builder()
        .concepts(new String[] { "sci-fi" })
        .build();

    Result<GraphQLResponse> response = client.graphQL().get()
        .withClassName("Movie")
        .withNearText(nearText)
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
      System.out.println(response.getResult());
    }
  }
}
// END NearText
