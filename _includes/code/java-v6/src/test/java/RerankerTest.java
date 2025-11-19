import com.fasterxml.jackson.databind.ObjectMapper;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Reranker;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RerankTest {

  private static WeaviateClient client;
  private static final String COLLECTION_NAME = "JeopardyQuestionCollection";
  private final ObjectMapper objectMapper = new ObjectMapper();

  @BeforeAll
  public static void beforeAll() throws Exception {
    // START INSTANTIATION-COMMON
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String openaiApiKey = System.getenv("OPENAI_APIKEY");
    String cohereApiKey = System.getenv("COHERE_APIKEY");

    client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey,
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey,
            "X-Cohere-Api-Key", cohereApiKey)));
    // END INSTANTIATION-COMMON

    // Setup: Create and populate "JeopardyQuestionCollection"
    if (client.collections.exists(COLLECTION_NAME)) {
      client.collections.delete(COLLECTION_NAME);
    }
    client.collections.create(COLLECTION_NAME,
        col -> col.properties(Property.text("question"))
            .vectorConfig(VectorConfig.text2vecAzureOpenAi())
            // Configure the Cohere reranker module
            .rerankerModules(Reranker.cohere()));

    // Add mock data
    var collection = client.collections.use(COLLECTION_NAME);
    collection.data.insertMany(
        Map.of("question", "This is a question about flying a kite."),
        Map.of("question", "This is a question about paper airplanes."),
        Map.of("question",
            "This is a question about a scientific publication."),
        Map.of("question",
            "This paper discusses the aerodynamics of flying insects."));

    // Wait for indexing
    Thread.sleep(2000);
  }

  @AfterAll
  public static void afterAll() throws Exception {
    if (client != null) {
      if (client.collections.exists(COLLECTION_NAME)) {
        client.collections.delete(COLLECTION_NAME);
      }
      client.close();
    }
  }

  @Test
  void testNearText() throws Exception {
    // START nearText Python
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestionCollection");
    var response = jeopardy.query.nearText("flying", q -> q.limit(10));

    for (var o : response.objects()) {
      System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
          .writeValueAsString(o.properties()));
    }
    // END nearText Python

    assertThat(response.objects()).isNotEmpty();
  }

  // @Test
  // void testNearTextRerank() throws Exception {
  //   // START nearTextRerank Python
  //   CollectionHandle<Map<String, Object>> jeopardy =
  //       client.collections.use("JeopardyQuestionCollection");

  //   var response = jeopardy.query.nearText("flying",
  //       q -> q.limit(10)
  //           .rerank(Reranker.cohere(r -> r.query("publication")))
  //           .returnMetadata(Metadata.RERANK_SCORE));

  //   for (var o : response.objects()) {
  //     System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
  //         .writeValueAsString(o.properties()));
  //     System.out.println(o.metadata().rerankScore());
  //   }
  //   // END nearTextRerank Python

  //   assertThat(response.objects()).isNotEmpty();
  //   assertThat(response.objects().get(0).metadata().rerankScore()).isNotNull();
  // }

  // @Test
  // void testBm25Rerank() throws Exception {
  //   // START bm25Rerank Python
  //   CollectionHandle<Map<String, Object>> jeopardy =
  //       client.collections.use("JeopardyQuestionCollection");

  //   var response = jeopardy.query.bm25("paper",
  //       q -> q.limit(10)
  //           .rerank(Reranker.cohere(r -> r.query("publication")))
  //           .returnMetadata(Metadata.RERANK_SCORE));

  //   for (var o : response.objects()) {
  //     System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
  //         .writeValueAsString(o.properties()));
  //     System.out.println(o.metadata().rerankScore());
  //   }
  //   // END bm25Rerank Python

  //   assertThat(response.objects()).isNotEmpty();
  //   assertThat(response.objects().get(0).metadata().rerankScore()).isNotNull();
  // }
}
