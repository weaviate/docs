import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Replication.DeletionStrategy;
import io.weaviate.client6.v1.api.collections.Tokenization;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.vectorindex.Distance;
import io.weaviate.client6.v1.api.collections.vectorindex.Flat;
import io.weaviate.client6.v1.api.collections.vectorindex.Hnsw;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

// Reference: Collection definition - the examples rendered on
// docs/weaviate/config-refs/collections.mdx. They mirror the Python examples
// in _includes/code/config-refs/reference.collections.py one-for-one.
class ReferenceCollectionsTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // Instantiate the client with the OpenAI API key
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    assertThat(openaiApiKey).isNotBlank()
        .withFailMessage("Please set the OPENAI_API_KEY environment variable.");

    client = WeaviateClient.connectToLocal(
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    client.collections.deleteAll();
  }

  @AfterEach
  public void afterEach() throws IOException {
    // Clean up all collections after each test
    client.collections.deleteAll();
  }

  @Test
  void testReferenceFullDefinition() throws IOException {
    // START ReferenceFullDefinition
    client.collections.create("Article",
        col -> col
            .description("A collection of articles")
            .properties(Property.text("title"), Property.text("body"))
            .vectorConfig(VectorConfig.text2vecTransformers("default",
                vec -> vec.sourceProperties("title", "body")
                    .vectorIndex(Hnsw.of(hnsw -> hnsw.efConstruction(300)
                        .distance(Distance.COSINE)
                        .filterStrategy(Hnsw.FilterStrategy.SWEEPING)))))
            .multiTenancy(mt -> mt.enabled(false))
            .sharding(s -> s.virtualPerPhysical(128)
                .desiredCount(1)
                .desiredVirtualCount(128))
            .replication(rep -> rep.replicationFactor(1)
                .deletionStrategy(DeletionStrategy.TIME_BASED_RESOLUTION)));
    // END ReferenceFullDefinition

    var config = client.collections.getConfig("Article").get();
    assertThat(config.description()).isEqualTo("A collection of articles");
    assertThat(config.properties()).hasSize(2);
    assertThat(config.vectors()).containsKey("default");
    assertThat(config.sharding().desiredVirtualCount()).isEqualTo(128);
  }

  @Test
  void testReferenceVectorizer() throws IOException {
    // START ReferenceVectorizer
    client.collections.create("Article",
        col -> col
            // highlight-start
            .vectorConfig(VectorConfig.text2vecTransformers("default", // (Optional) Set the name of the vector, default name is "default"
                vec -> vec.sourceProperties("title", "body") // (Optional) Set the source property(ies)
                    .vectorIndex(Hnsw.of(hnsw -> hnsw.efConstruction(300)
                        .distance(Distance.COSINE)
                        .filterStrategy(Hnsw.FilterStrategy.SWEEPING))))) // (Optional) Set vector index options
            // highlight-end
            .properties( // properties configuration is optional
                Property.text("title", p -> p.vectorizePropertyName(true)),
                Property.text("body")));
    // END ReferenceVectorizer

    var config = client.collections.getConfig("Article").get();
    assertThat(config.vectors()).containsKey("default");
  }

  @Test
  void testReferenceNamedVectors() throws IOException {
    // START ReferenceNamedVectors
    client.collections.create("Article",
        col -> col
            // highlight-start
            .vectorConfig(
                VectorConfig.text2vecTransformers("default",
                    vec -> vec.sourceProperties("title", "body")
                        .vectorIndex(Hnsw.of(hnsw -> hnsw.efConstruction(300)
                            .distance(Distance.COSINE)
                            .filterStrategy(Hnsw.FilterStrategy.SWEEPING)))),
                VectorConfig.text2vecTransformers("body_vectors",
                    vec -> vec.sourceProperties("body")
                        .vectorIndex(Flat.of())))
            // highlight-end
            .properties( // properties configuration is optional
                Property.text("title", p -> p.vectorizePropertyName(true)),
                Property.text("body")));
    // END ReferenceNamedVectors

    var config = client.collections.getConfig("Article").get();
    assertThat(config.vectors()).hasSize(2).containsKeys("default", "body_vectors");
  }

  @Test
  void testReferencePropertyOptions() throws IOException {
    // START ReferencePropertyOptions
    client.collections.create("Article",
        col -> col
            .vectorConfig(VectorConfig.text2vecTransformers())
            .properties(
                Property.text("title",
                    p -> p.description("The article headline")
                        .tokenization(Tokenization.WORD)), // How the text is split for the inverted index
                Property.text("description",
                    p -> p.skipVectorization(true) // Exclude this property from the vector
                        .indexSearchable(false)), // Exclude it from keyword search
                Property.number("rating",
                    p -> p.indexRangeFilters(true)))); // Index for range-based filtering
    // END ReferencePropertyOptions

    var config = client.collections.getConfig("Article").get();
    assertThat(config.properties()).hasSize(3);
  }
}
