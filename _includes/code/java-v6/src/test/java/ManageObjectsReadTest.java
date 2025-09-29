import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

class ManageObjectsReadTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START INSTANTIATION-COMMON
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String openaiApiKey = System.getenv("OPENAI_APIKEY");

    client = WeaviateClient.connectToWeaviateCloud(
        weaviateUrl,
        weaviateApiKey,
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    // END INSTANTIATION-COMMON
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @Test
  void testReadObject() {
    // START ReadSimpleObject
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");

    // highlight-start
    var dataObjectOpt = jeopardy.query.byId("00ff6900-e64f-5d94-90db-c8cfa3fc851b");
    // highlight-end

    dataObjectOpt.ifPresent(dataObject -> System.out.println(dataObject.properties()));
    // END ReadSimpleObject
  }

  @Test
  void testReadObjectWithVector() {
    // START ReadObjectWithVector
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");

    var dataObjectOpt = jeopardy.query.byId(
        "00ff6900-e64f-5d94-90db-c8cfa3fc851b",
        // highlight-start
        q -> q.returnMetadata(Metadata.VECTOR)
    // highlight-end
    );

    dataObjectOpt.ifPresent(
        dataObject -> System.out.println(Arrays.toString(dataObject.metadata().vectors().getSingle("default"))));
    // END ReadObjectWithVector
  }

  @Test
  void testReadObjectNamedVectors() {
    // START ReadObjectNamedVectors
    CollectionHandle<Map<String, Object>> reviews = client.collections.use("WineReviewNV"); // Collection with named
                                                                                            // vectors

    var someObjResponse = reviews.query.fetchObjects(q -> q.limit(1));
    if (someObjResponse.objects().isEmpty()) {
      return; // Skip if no data
    }
    String objUuid = someObjResponse.objects().get(0).uuid();

    // highlight-start
    List<String> vectorNames = List.of("title", "review_body");
    // highlight-end

    var dataObjectOpt = reviews.query.byId(
        objUuid, // Object UUID
        // highlight-start
        q -> q.returnMetadata(Metadata.VECTOR) // Specify to include vectors
    // highlight-end
    );

    // The vectors are returned in the `vectors` property as a dictionary
    dataObjectOpt.ifPresent(dataObject -> {
      for (String n : vectorNames) {
        float[] vector = dataObject.metadata().vectors().getSingle(n);
        if (vector != null) {
          System.out.printf("Vector '%s': %s...\n", n, Arrays.toString(Arrays.copyOf(vector, 5)));
        }
      }
    });
    // END ReadObjectNamedVectors
  }

  @Test
  void testCheckObject() {
    // START CheckForAnObject
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    boolean exists = jeopardy.data.exists("00ff6900-e64f-5d94-90db-c8cfa3fc851b");
    System.out.println(exists);
    // END CheckForAnObject
  }
}