import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.data.InsertManyResponse;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import io.weaviate.client6.v1.api.collections.query.QueryResponse;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ModelProvidersTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, // Replace with your Weaviate Cloud
        // URL
        weaviateApiKey // Replace with your Weaviate Cloud key
    );

    client.collections.delete("DemoCollection");
  }

  @AfterAll
  public static void afterAll() throws IOException {
    client.collections.delete("DemoCollection");
  }

  @Test
  void testWeaviateInstantiation() throws Exception {
    // START WeaviateInstantiation
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    // highlight-start
    WeaviateClient client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, // Replace with your
        // Weaviate Cloud URL
        weaviateApiKey // Replace with your Weaviate Cloud key
    );

    System.out.println(client.isReady()); // Should print: `True`
    // highlight-end

    client.close(); // Free up resources
    // END WeaviateInstantiation
  }

  @Test
  void testWeaviateVectorizer() throws IOException {
    client.collections.delete("DemoCollection");
    // START BasicVectorizerWeaviate
    client.collections.create("DemoCollection",
        col -> col
            .vectorConfig(
                VectorConfig.text2vecWeaviate("title_vector", c -> c.sourceProperties("title")))
            .properties(Property.text("title"), Property.text("description")));
    // END BasicVectorizerWeaviate

    var config = client.collections.getConfig("DemoCollection").get();
    assertThat(config.vectors()).containsKey("title_vector");
    System.out.println("first: " + config.vectors().get("title_vector"));
    assertThat(config.vectors().get("title_vector").getClass().getSimpleName())
        .isEqualTo("Text2VecWeaviateVectorizer");
    client.collections.delete("DemoCollection");
  }

  @Test
  void testWeaviateVectorizerModel() throws IOException {
    // START VectorizerWeaviateCustomModel
    client.collections
        .create("DemoCollection",
            col -> col
                .vectorConfig(VectorConfig.text2vecWeaviate("title_vector",
                    c -> c.sourceProperties("title")
                        .model("Snowflake/snowflake-arctic-embed-l-v2.0")))
                .properties(Property.text("title"), Property.text("description")));
    // END VectorizerWeaviateCustomModel

    var config = client.collections.getConfig("DemoCollection").get();
    assertThat(config.vectors()).containsKey("title_vector");
    System.out.println("first: " + config.vectors().get("title_vector"));
    assertThat(config.vectors().get("title_vector").getClass().getSimpleName())
        .isEqualTo("Text2VecWeaviateVectorizer");
    client.collections.delete("DemoCollection");
  }

  @Test
  void testWeaviateVectorizerParameters() throws IOException {
    // START SnowflakeArcticEmbedMV15
    client.collections.create("DemoCollection",
        col -> col.vectorConfig(VectorConfig.text2vecWeaviate("title_vector",
            c -> c.sourceProperties("title").model("Snowflake/snowflake-arctic-embed-m-v1.5")
        // .inferenceUrl(null)
        // .dimensions(0)
        )).properties(Property.text("title"), Property.text("description")));
    // END SnowflakeArcticEmbedMV15

    var config = client.collections.getConfig("DemoCollection").get();
    assertThat(config.vectors()).containsKey("title_vector");
    System.out.println("first: " + config.vectors().get("title_vector"));
    assertThat(config.vectors().get("title_vector").getClass().getSimpleName())
        .isEqualTo("Text2VecWeaviateVectorizer");
  }

  @Test
  void testWeaviateMMVectorizer() throws IOException {
    client.collections.delete("DemoCollection");
    // START BasicVectorizerMMWeaviate
    client.collections.create("DemoCollection",
        col -> col
            .vectorConfig(
                VectorConfig.text2vecWeaviate("title_vector", c -> c.sourceProperties("title")))
            .properties(Property.text("title"), Property.text("description")));
    // END BasicVectorizerMMWeaviate

    var config = client.collections.getConfig("DemoCollection").get();
    assertThat(config.vectors()).containsKey("title_vector");
    System.out.println("first: " + config.vectors().get("title_vector"));
    assertThat(config.vectors().get("title_vector").getClass().getSimpleName())
        .isEqualTo("Text2VecWeaviateVectorizer");
    client.collections.delete("DemoCollection");
  }

  @Test
  void testInsertData() {
    // START BatchImportExample
    // Define the source objects
    List<Map<String, Object>> sourceObjects = List.of(Map.of("title", "The Shawshank Redemption",
        "description",
        "A wrongfully imprisoned man forms an inspiring friendship while finding hope and redemption in the darkest of places."),
        Map.of("title", "The Godfather", "description",
            "A powerful mafia family struggles to balance loyalty, power, and betrayal in this iconic crime saga."),
        Map.of("title", "The Dark Knight", "description",
            "Batman faces his greatest challenge as he battles the chaos unleashed by the Joker in Gotham City."),
        Map.of("title", "Jingle All the Way", "description",
            "A desperate father goes to hilarious lengths to secure the season's hottest toy for his son on Christmas Eve."),
        Map.of("title", "A Christmas Carol", "description",
            "A miserly old man is transformed after being visited by three ghosts on Christmas Eve in this timeless tale of redemption."));

    // Get a handle to the collection
    CollectionHandle<Map<String, Object>> collection = client.collections.use("DemoCollection");

    // Insert the data using insertMany
    InsertManyResponse response = collection.data.insertMany(sourceObjects.toArray(new Map[0]));

    // Check for errors
    if (!response.errors().isEmpty()) {
      System.err.printf("Number of failed imports: %d\n", response.errors().size());
      System.err.printf("First failed object error: %s\n", response.errors().get(0));
    } else {
      System.out.printf("Successfully inserted %d objects.\n", response.uuids().size());
    }
    // END BatchImportExample
  }

  @Test
  void testNearText() {
    // START NearTextExample
    CollectionHandle<Map<String, Object>> collection = client.collections.use("DemoCollection");

    // highlight-start
    var response = collection.query.nearText("A holiday film", // The model provider integration will automatically vectorize the query
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));
    // highlight-end

    for (var o : response.objects()) {
      System.out.println(o.properties().get("title"));
    }
    // END NearTextExample
  }

  @Test
  void testHybrid() {
    // START HybridExample
    CollectionHandle<Map<String, Object>> collection = client.collections.use("DemoCollection");

    // highlight-start
    QueryResponse<Map<String, Object>> response = collection.query.hybrid("A holiday film", // The model provider integration will automatically vectorize the query
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));
    // highlight-end

    for (var o : response.objects()) {
      System.out.println(o.properties().get("title"));
    }
    // END HybridExample
  }
}
