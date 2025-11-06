package io.weaviate.docs.quickstart;

// START RAG
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.graphql.model.GraphQLResponse;
import io.weaviate.client.v1.graphql.query.argument.NearTextArgument;
import io.weaviate.client.v1.graphql.query.fields.Field;
import io.weaviate.client.v1.graphql.query.fields.GenerativeSearchBuilder;

public class QuickstartLocalQueryNearTextRAG {
  public static void main(String[] args) throws AuthException {
    // Step 2.1: Connect to your local Weaviate instance
    // highlight-start
    Config config = new Config("http", "localhost:8080");
    WeaviateClient client = new WeaviateClient(config);
    // highlight-end

    // Step 2.2: Perform RAG with NearVector results
    // highlight-start
    Field title = Field.builder().name("title").build();
    Field description = Field.builder().name("description").build();
    Field genre = Field.builder().name("genre").build();

    NearTextArgument nearText = NearTextArgument.builder()
        .concepts(new String[] {"sci-fi"})
        .build();

    GenerativeSearchBuilder generativeSearch = GenerativeSearchBuilder.builder()
        .groupedResultTask("Write a tweet with emojis about this movie.")
        .build();

    Result<GraphQLResponse> response = client.graphQL()
        .get()
        .withClassName("Movie")
        .withNearText(nearText)
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
  }
}
// END RAG
