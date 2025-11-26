import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.Vectors;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class ManageObjectsUpdateTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START INSTANTIATION-COMMON
    // Instantiate the client with the OpenAI API key
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    client = WeaviateClient
        .connectToLocal(config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    // END INSTANTIATION-COMMON

    // Simulate weaviate-datasets and set up collections
    if (client.collections.exists("WineReviewNV")) {
      client.collections.delete("WineReviewNV");
    }
    client.collections.create("WineReviewNV",
        col -> col
            .properties(Property.text("review_body", p -> p.description("Review body")),
                Property.text("title", p -> p.description("Name of the wine")),
                Property.text("country", p -> p.description("Originating country")))
            .vectorConfig(VectorConfig.text2vecTransformers("title"),
                VectorConfig.text2vecTransformers("review_body"),
                VectorConfig.text2vecTransformers("title_country",
                    vc -> vc.sourceProperties("title", "country"))));

    // highlight-start
    // ===== Add three mock objects to the WineReviewNV collection =====
    var reviews = client.collections.use("WineReviewNV");
    reviews.data.insertMany(
        Map.of("title", "Mock Wine A", "review_body", "A fine mock vintage.", "country",
            "Mocktugal"),
        Map.of("title", "Mock Wine B", "review_body", "Notes of mockberry.", "country",
            "Mockstralia"),
        Map.of("title", "Mock Wine C", "review_body", "Pairs well with mock turtle soup.",
            "country", "Republic of Mockdova"));
    // highlight-end

    // START Define the class
    if (client.collections.exists("JeopardyQuestion")) {
      client.collections.delete("JeopardyQuestion");
    }
    client.collections.create("JeopardyQuestion",
        col -> col.description("A Jeopardy! question")
            .properties(Property.text("question", p -> p.description("The question")),
                Property.text("answer", p -> p.description("The answer")),
                Property.number("points", p -> p.description("The points the question is worth")))
            .vectorConfig(VectorConfig.text2vecTransformers()));
    // END Define the class
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.collections.delete("WineReviewNV");
    client.collections.delete("JeopardyQuestion");
    client.close();
  }

  // START DelProps
  private static void delProps(WeaviateClient client, String uuidToUpdate, String collectionName,
      List<String> propNames) throws IOException {
    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);

    // fetch the object to update
    Optional<WeaviateObject<Map<String, Object>>> objectDataOpt =
        collection.query.fetchObjectById(uuidToUpdate);
    if (objectDataOpt.isEmpty()) {
      return;
    }
    Map<String, Object> propertiesToUpdate = new HashMap<>(objectDataOpt.get().properties());

    // remove unwanted properties
    for (String propName : propNames) {
      propertiesToUpdate.remove(propName);
    }

    // replace the properties
    collection.data.replace(uuidToUpdate, r -> r.properties(propertiesToUpdate));
  }
  // END DelProps

  @Test
  void testUpdateAndReplaceFlow() throws IOException {
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");

    String uuid = jeopardy.data
        .insert(Map.of("question", "Test question", "answer", "Test answer", "points", -1.0 // JSON numbers are doubles
        )).uuid();

    // START UpdateProps
    jeopardy.data.update(uuid,
        // highlight-start
        u -> u.properties(Map.of("points", 100.0))
    // highlight-end
    );
    // END UpdateProps

    Optional<WeaviateObject<Map<String, Object>>> result1 =
        jeopardy.query.fetchObjectById(uuid);
    assertThat(result1).isPresent();
    assertThat(result1.get().properties().get("points")).isEqualTo(100.0);

    // START UpdateVector
    float[] vector = new float[384];
    Arrays.fill(vector, 0.12345f);

    jeopardy.data.update(uuid, u -> u.properties(Map.of("points", 100.0))
        // highlight-start
        .vectors(Vectors.of(vector))
    // highlight-end
    );
    // END UpdateVector

    Optional<WeaviateObject<Map<String, Object>>> result2 =
        jeopardy.query.fetchObjectById(uuid, q -> q.includeVector());
    assertThat(result2).isPresent();
    assertThat(result2.get().vectors().getSingle("default")).hasSize(384);

    // START UpdateNamedVector
    CollectionHandle<Map<String, Object>> reviews = client.collections.use("WineReviewNV");
    String reviewUuid = reviews.query.fetchObjects(q -> q.limit(3)).objects().get(0).uuid();
    float[] titleVector = new float[384];
    float[] reviewBodyVector = new float[384];
    float[] titleCountryVector = new float[384];
    Arrays.fill(titleVector, 0.12345f);
    Arrays.fill(reviewBodyVector, 0.12345f);
    Arrays.fill(titleCountryVector, 0.12345f);

    reviews.data.update(reviewUuid,
        u -> u
            .properties(Map.of("title", "A delicious wine", "review_body",
                "This mystery wine is a delight to the senses.", "country", "Mordor"))
            // highlight-start
            .vectors(Vectors.of("title", titleVector), Vectors.of("review_body", reviewBodyVector),
                Vectors.of("title_country", titleCountryVector))
    // highlight-end
    );
    // END UpdateNamedVector

    // START Replace
    // highlight-start
    jeopardy.data.replace(
        // highlight-end
        uuid, r -> r.properties(Map.of("answer", "Replaced"
        // The other properties will be deleted
        )));
    // END Replace

    Optional<WeaviateObject<Map<String, Object>>> result3 =
        jeopardy.query.fetchObjectById(uuid);
    assertThat(result3).isPresent();
    assertThat(result3.get().properties().get("answer")).isEqualTo("Replaced");

    // START DelProps

    delProps(client, uuid, "JeopardyQuestion", List.of("answer"));
    // END DelProps

    Optional<WeaviateObject<Map<String, Object>>> result4 =
        jeopardy.query.fetchObjectById(uuid);
    assertThat(result4).isPresent();
    assertThat(result4.get().properties().get("answer")).isNull();
  }
}
