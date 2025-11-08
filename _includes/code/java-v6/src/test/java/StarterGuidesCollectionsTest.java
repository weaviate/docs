import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionConfig;
import io.weaviate.client6.v1.api.collections.Generative;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Quantization;
import io.weaviate.client6.v1.api.collections.Tokenization;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.vectorindex.Distance;
import io.weaviate.client6.v1.api.collections.vectorindex.Hnsw;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;

class StarterGuidesCollectionsTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    // START-ANY
    String openaiApiKey = System.getenv("OPENAI_APIKEY");
    client = WeaviateClient.connectToLocal(
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));

    // END-ANY
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @AfterEach
  public static void afterEach() throws Exception {
    client.collections.delete("Question");
  }

  @Test
  void testBasicSchema() throws IOException {
    // START BasicSchema
    Optional<CollectionConfig> questionsConfig =
        client.collections.create("Question",
            col -> col.vectorConfig(VectorConfig.text2vecWeaviate()) // Set the vectorizer to use the OpenAI API for vector-related operations
                .generativeModule(Generative.cohere()) // Set the generative module to use the Cohere API for RAG
                .properties(Property.text("question"), Property.text("answer"),
                    Property.text("category"))).config.get();

    System.out.println(questionsConfig);
    // END BasicSchema

  }

  @Test
  void testSchemaWithPropertyOptions() throws IOException {
    // START SchemaWithPropertyOptions
    client.collections.create("Question",
        col -> col.vectorConfig(VectorConfig.text2vecWeaviate())
            .generativeModule(Generative.cohere())
            .properties(Property.text("question", p -> p
                // highlight-start
                .vectorizePropertyName(true) // Include the property name ("question") when vectorizing
                .tokenization(Tokenization.LOWERCASE) // Use "lowercase" tokenization
            // highlight-end
            ), Property.text("answer", p -> p
                // highlight-start
                .vectorizePropertyName(false) // Skip the property name ("answer") when vectorizing
                .tokenization(Tokenization.WHITESPACE) // Use "whitespace" tokenization
            // highlight-end
            )));
    // END SchemaWithPropertyOptions
  }

  @Test
  void testSchemaWithMultiTenancy() throws IOException {
    // START SchemaWithMultiTenancy
    client.collections.create("Question",
        col -> col.vectorConfig(VectorConfig.text2vecWeaviate())
            .generativeModule(Generative.cohere())
            .properties(Property.text("question"), Property.text("answer"))
            // highlight-start
            .multiTenancy(c -> c.autoTenantCreation(true)) // Enable multi-tenancy
    // highlight-end
    );
    // END SchemaWithMultiTenancy

  }

  @Test
  void testSchemaWithIndexSettings() throws IOException {
    // START SchemaWithIndexSettings
    client.collections.create("Question",
        col -> col.vectorConfig(VectorConfig.text2vecWeaviate("default", // Set the name of the vector configuration
            // highlight-start
            vc -> vc
                .vectorIndex(Hnsw.of(hnsw -> hnsw.distance(Distance.COSINE))) // Configure the vector index
                .quantization(Quantization.rq()) // Enable vector compression (quantization)
        // highlight-end
        ))
            .generativeModule(Generative.cohere())
            .properties(Property.text("question"), Property.text("answer"))
            // highlight-start
            // Configure the inverted index
            .invertedIndex(iic -> iic.indexNulls(true)
                .indexPropertyLength(true)
                .indexTimestamps(true))
    // highlight-end
    );
    // END SchemaWithIndexSettings
  }
}
