import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionConfig;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Quantization;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class ConfigurePQTest {

  private static WeaviateClient client;
  private static List<Map<String, String>> data;
  private static final String COLLECTION_NAME = "Question";

  @BeforeAll
  public static void beforeAll() throws IOException, InterruptedException {
    // START DownloadData
    HttpClient httpClient = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(
            "https://raw.githubusercontent.com/weaviate-tutorials/intro-workshop/main/data/jeopardy_1k.json"))
        .build();
    HttpResponse<String> responseHttp =
        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    String responseBody = responseHttp.body();

    ObjectMapper objectMapper = new ObjectMapper();
    data = objectMapper.readValue(responseBody, new TypeReference<>() {});

    System.out.printf("Data type: %s, Length: %d\n", data.getClass().getName(),
        data.size());
    System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
        .writeValueAsString(data.get(1)));
    // END DownloadData

    // START ConnectCode
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    client = WeaviateClient.connectToLocal(
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));

    assertThat(client.isReady()).isTrue();
    // END ConnectCode
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @AfterEach
  public void cleanup() throws IOException {
    if (client.collections.exists(COLLECTION_NAME)) {
      client.collections.delete(COLLECTION_NAME);
    }
  }

  @Test
  void testCollectionWithAutoPQ() throws IOException {
    // START CollectionWithAutoPQ
    client.collections.create("Question",
        col -> col.vectorConfig(VectorConfig.text2vecOpenAi("default",
            // highlight-start
            vc -> vc
                .quantization(Quantization.pq(pq -> pq.trainingLimit(50000))) // Set the threshold to begin training
        // highlight-end
        )));
    // END CollectionWithAutoPQ

    // Confirm that the collection has been created with the right settings
    var collection = client.collections.use(COLLECTION_NAME);
    var config = collection.config.get();
    assertThat(config).isPresent();
    assertThat(config.get().vectors().get("default").quantization())
        .isNotNull();
  }

  @Test
  void testUpdateSchemaWithPQ() throws IOException {
    // START InitialSchema
    client.collections.create("Question",
        col -> col.description("A Jeopardy! question")
            .properties(Property.text("question"), Property.text("answer"))
            .vectorConfig(VectorConfig.text2vecOpenAi(
                vc -> vc.quantization(Quantization.uncompressed()))));
    // END InitialSchema

    var collection = client.collections.use(COLLECTION_NAME);
    var initialConfig = collection.config.get();
    assertThat(initialConfig).isPresent();

    // START LoadData
    List<WeaviateObject<Map<String, Object>>> objectList =
        data.stream().map(obj -> {
          Map<String, Object> properties = new HashMap<>();
          properties.put("question", obj.get("Question"));
          properties.put("answer", obj.get("Answer"));
          return WeaviateObject.<Map<String, Object>>of(
              builder -> builder.properties(properties));
        }).collect(Collectors.toList());

    var response = collection.data.insertMany(objectList);
    // END LoadData

    // Debug: Check for errors
    if (!response.errors().isEmpty()) {
      System.out.println("Insert errors:");
      response.errors().forEach((error) -> {
        System.out.println("  Error: " + error.toString());
      });
    }
    assertThat(response.uuids().size()).isEqualTo(1000);

    // START UpdateSchema
    collection.config
        .update(c -> c.vectorConfig(VectorConfig.text2vecOpenAi(vc -> vc
            .quantization(Quantization.pq(pq -> pq.trainingLimit(50000))))));
    // END UpdateSchema

    var updatedConfig = collection.config.get();
    assertThat(updatedConfig).isPresent();
    assertThat(updatedConfig.get().vectors().get("default").quantization())
        .isInstanceOf(Quantization.class);
  }

  //TODO[g-despot] DX: How to get quantizer parameters from config?
  @Test
  void testGetSchema() throws IOException {
    // Create a collection with PQ enabled to inspect its schema
    client.collections.create("Question",
        col -> col.vectorConfig(VectorConfig.text2vecOpenAi(vc -> vc
            .quantization(Quantization.pq(pq -> pq.trainingLimit(50000))))));

    // START GetSchema
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("Question");
    Optional<CollectionConfig> configOpt = jeopardy.config.get();

    System.out.println(configOpt);
    // END GetSchema
    assertThat(configOpt).isPresent();
    CollectionConfig config = configOpt.get();

    Quantization pqConfig = config.vectors().get("default").quantization();
    assertThat(pqConfig).isNotNull();
    // print some of the config properties
    // System.out.printf("Encoder: %s\n", pqConfig.encoder());
    // System.out.printf("Training: %d\n", pqConfig.getTrainingLimit());
    // System.out.printf("Segments: %d\n", pqConfig.getSegments());
    // System.out.printf("Centroids: %d\n", pqConfig.getCentroids());
  }
}
