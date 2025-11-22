import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import io.weaviate.client6.v1.api.collections.query.Target;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class MultiTargetSearchTest {

  private static WeaviateClient client;
  private static final String COLLECTION_NAME = "JeopardyTiny";
  private static final ObjectMapper objectMapper = new ObjectMapper();

  @BeforeAll
  public static void beforeAll() throws IOException, InterruptedException {
    // START LoadDataNamedVectors
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String openaiApiKey = System.getenv("OPENAI_APIKEY");
    String cohereApiKey = System.getenv("COHERE_APIKEY");

    client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey,
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey,
            "X-Cohere-Api-Key", cohereApiKey)));

    // Start with a new collection
    if (client.collections.exists(COLLECTION_NAME)) {
      client.collections.delete(COLLECTION_NAME);
    }

    // Define a new schema
    client.collections.create(COLLECTION_NAME,
        col -> col.description("Jeopardy game show questions")
            .vectorConfig(
                VectorConfig.text2vecOpenAi("jeopardy_questions_vector",
                    vc -> vc.sourceProperties("question")

                ), VectorConfig.text2vecOpenAi("jeopardy_answers_vector",
                    vc -> vc.sourceProperties("answer")

                ))
            .properties(Property.text("category"), Property.text("question"),
                Property.text("answer")));

    // Get the sample data set
    HttpClient httpClient = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(
            "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"))
        .build();
    HttpResponse<String> responseHttp =
        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    String responseBody = responseHttp.body();

    List<Map<String, String>> data =
        objectMapper.readValue(responseBody, new TypeReference<>() {});

    // Prepare the sample data for upload
    List<Map<String, Object>> questionObjects = new ArrayList<>();
    for (Map<String, String> row : data) {
      Map<String, Object> questionObject = new HashMap<>();
      questionObject.put("question", row.get("Question"));
      questionObject.put("answer", row.get("Answer"));
      questionObject.put("category", row.get("Category"));
      questionObjects.add(questionObject);
    }

    // Upload the sample data
    CollectionHandle<Map<String, Object>> nvjcCollection =
        client.collections.use(COLLECTION_NAME);
    nvjcCollection.data.insertMany(questionObjects.toArray(new Map[0]));
    // END LoadDataNamedVectors

    // Small delay to allow indexing
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
  void testMultiBasic() throws Exception {
    // START MultiBasic
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use(COLLECTION_NAME);

    var response = collection.query.nearText(
        // highlight-start
        // In Java, a plain list of target vectors implies an "average" strategy
        Target.average("a wild animal", "jeopardy_questions_vector",
            "jeopardy_answers_vector"),
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
          .writeValueAsString(o.properties()));
      System.out.println("Distance: " + o.metadata().distance());
    }
    // END MultiBasic
    assertThat(response.objects()).hasSize(2);
  }

  @Test
  void testMultiTargetNearVector() throws Exception {
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use(COLLECTION_NAME);
    var someResult =
        collection.query.fetchObjects(q -> q.limit(2).includeVector());
    assertThat(someResult.objects()).hasSize(2);

    float[] v1 = someResult.objects()
        .get(0)
        .metadata()
        .vectors()
        .getSingle("jeopardy_questions_vector");
    float[] v2 = someResult.objects()
        .get(1)
        .metadata()
        .vectors()
        .getSingle("jeopardy_answers_vector");
    assertThat(v1).isNotEmpty();
    assertThat(v2).isNotEmpty();

    // START MultiTargetNearVector
    var response = collection.query.nearVector(
        // highlight-start
        // Specify the query vectors for each target vector using Target objects
        // The default combination strategy is "average"
        Target.average(Target.vector("jeopardy_questions_vector", v1),
            Target.vector("jeopardy_answers_vector", v2)),
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
          .writeValueAsString(o.properties()));
      System.out.println("Distance: " + o.metadata().distance());
    }
    // END MultiTargetNearVector
    assertThat(response.objects()).hasSize(2);
  }

  @Test
  void testMultiTargetMultipleNearVectors() throws Exception {
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use(COLLECTION_NAME);
    var someResult =
        collection.query.fetchObjects(q -> q.limit(3).includeVector());
    assertThat(someResult.objects()).hasSize(3);

    float[] v1 = someResult.objects()
        .get(0)
        .metadata()
        .vectors()
        .getSingle("jeopardy_questions_vector");
    float[] v2 = someResult.objects()
        .get(1)
        .metadata()
        .vectors()
        .getSingle("jeopardy_answers_vector");
    float[] v3 = someResult.objects()
        .get(2)
        .metadata()
        .vectors()
        .getSingle("jeopardy_answers_vector");
    assertThat(v1).isNotEmpty();
    assertThat(v2).isNotEmpty();
    assertThat(v3).isNotEmpty();

    // START MultiTargetMultipleNearVectorsV1
    var responseV1 = collection.query.nearVector(
        // highlight-start
        // Pass multiple Target.vector objects with the same name
        // The default combination strategy is "average"
        Target.average(Target.vector("jeopardy_questions_vector", v1),
            Target.vector("jeopardy_answers_vector", v2),
            Target.vector("jeopardy_answers_vector", v3)),
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : responseV1.objects()) {
      System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
          .writeValueAsString(o.properties()));
      System.out.println("Distance: " + o.metadata().distance());
    }
    // END MultiTargetMultipleNearVectorsV1
    assertThat(responseV1.objects()).hasSize(2);


    // START MultiTargetMultipleNearVectorsV2
    var responseV2 = collection.query.nearVector(
        // highlight-start
        // Specify weights for each vector
        Target.manualWeights(
            Target.vector("jeopardy_questions_vector", 10f, v1),
            Target.vector("jeopardy_answers_vector", 30f, v2),
            Target.vector("jeopardy_answers_vector", 30f, v3) // Weights match the vectors
        ),
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : responseV2.objects()) {
      System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
          .writeValueAsString(o.properties()));
      System.out.println("Distance: " + o.metadata().distance());
    }
    // END MultiTargetMultipleNearVectorsV2
    assertThat(responseV2.objects()).hasSize(2);
  }

  @Test
  void testMultiTargetWithSimpleJoin() throws Exception {
    // START MultiTargetWithSimpleJoin
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use(COLLECTION_NAME);

    var response = collection.query.nearText(
        // highlight-start
        Target.average("a wild animal", "jeopardy_questions_vector",
            "jeopardy_answers_vector"), // Specify the target vectors and the join strategy
        // .sum(), .min(), .manualWeights(), .relativeScore() also available
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
          .writeValueAsString(o.properties()));
      System.out.println("Distance: " + o.metadata().distance());
    }
    // END MultiTargetWithSimpleJoin
    assertThat(response.objects()).hasSize(2);
  }

  @Test
  void testMultiTargetManualWeights() throws Exception {
    // START MultiTargetManualWeights
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use(COLLECTION_NAME);

    var response = collection.query.nearText(
        // highlight-start
        Target.manualWeights("a wild animal",
            Target.weight("jeopardy_questions_vector", 10f),
            Target.weight("jeopardy_answers_vector", 50f)),
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
          .writeValueAsString(o.properties()));
      System.out.println("Distance: " + o.metadata().distance());
    }
    // END MultiTargetManualWeights
    assertThat(response.objects()).hasSize(2);
  }

  @Test
  void testMultiTargetRelativeScore() throws Exception {
    // START MultiTargetRelativeScore
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use(COLLECTION_NAME);

    var response = collection.query.nearText(
        // highlight-start
        Target.relativeScore("a wild animal",
            Target.weight("jeopardy_questions_vector", 10f),
            Target.weight("jeopardy_answers_vector", 10f)),
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
          .writeValueAsString(o.properties()));
      System.out.println("Distance: " + o.metadata().distance());
    }
    // END MultiTargetRelativeScore
    assertThat(response.objects()).hasSize(2);
  }
}
