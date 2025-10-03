import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.query.GroupBy;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import io.weaviate.client6.v1.api.collections.query.Where;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

class SearchSimilarityTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START INSTANTIATION-COMMON
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String openaiApiKey = System.getenv("OPENAI_APIKEY");
    String cohereApiKey = System.getenv("COHERE_APIKEY");

    client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey, config -> config
        .setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey, "X-Cohere-Api-Key", cohereApiKey)));
    // END INSTANTIATION-COMMON
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.collections.deleteAll();
    client.close();
  }

  // TODO[g-despot] Why isn't targetVector available?
  @Test
  void testNamedVectorNearText() {
    // START NamedVectorNearText
    CollectionHandle<Map<String, Object>> reviews = client.collections.use("WineReviewNV");
    var response = reviews.query.nearText("a sweet German white wine", q -> q.limit(2)
        // highlight-start
        // .targetVector("title_country") // Specify the target vector for named vector
        // collections
        // highlight-end
        .returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      System.out.println(o.metadata().distance());
    }
    // END NamedVectorNearText
  }

  @Test
  void testGetNearText() {
    // START GetNearText
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText(
        // highlight-start
        "animals in movies",
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      System.out.println(o.metadata().distance());
    }
    // END GetNearText
  }

  @Test
  void testGetNearObject() {
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var initialResponse = jeopardy.query.fetchObjects(q -> q.limit(1));
    if (initialResponse.objects().isEmpty())
      return; // Skip test if no data
    var uuid = initialResponse.objects().get(0).uuid();

    // START GetNearObject
    // highlight-start
    var response = jeopardy.query.nearObject(uuid, // A UUID of an object (e.g. "56b9449e-65db-5df4-887b-0a4773f52aa7")
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      System.out.println(o.metadata().distance());
    }
    // END GetNearObject
  }

  // TODO[g-despot] Why do some argument accept Vector.of while other float[]?
  @Test
  void testGetNearVector() {
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var initialResponse =
        jeopardy.query.fetchObjects(q -> q.limit(1).returnMetadata(Metadata.VECTOR));
    if (initialResponse.objects().isEmpty())
      return; // Skip test if no data
    var queryVector = initialResponse.objects().get(0).metadata().vectors().getSingle("default");

    // START GetNearVector
    // highlight-start
    var response = jeopardy.query.nearVector(queryVector, // your query vector goes here
        // highlight-end
        q -> q.limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      System.out.println(o.metadata().distance());
    }
    // END GetNearVector
  }

  @Test
  void testGetLimitOffset() {
    // START GetLimitOffset
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("animals in movies", q -> q
        // highlight-start
        .limit(2) // return 2 objects
        .offset(1) // With an offset of 1
        // highlight-end
        .returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      System.out.println(o.metadata().distance());
    }
    // END GetLimitOffset
  }

  @Test
  void testGetWithDistance() {
    // START GetWithDistance
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("animals in movies", q -> q
        // highlight-start
        .distance(0.25f) // max accepted distance
        // highlight-end
        .returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      System.out.println(o.metadata().distance());
    }
    // END GetWithDistance
  }

  // TODO[g-despot] Should autocut be autolimit?
  @Test
  void testAutocut() {
    // START Autocut
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("animals in movies", q -> q
        // highlight-start
        .autocut(1) // number of close groups
        // highlight-end
        .returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      System.out.println(o.metadata().distance());
    }
    // END Autocut
  }

  @Test
  // TODO[g-despot] Why isn't UUID available on top-level?
  void testGetWithGroupby() {
    // START GetWithGroupby
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    // highlight-start
    var response = jeopardy.query.nearText("animals in movies", // find object based on this query
        q -> q.limit(10) // maximum total objects
            .returnMetadata(Metadata.DISTANCE),
        GroupBy.property("round", // group by this property
            2, // maximum number of groups
            2 // maximum objects per group
        ));
    // highlight-end

    for (var o : response.objects()) {
      System.out.println(o.metadata().uuid());
      System.out.println(o.belongsToGroup());
      System.out.println(o.metadata().distance());
    }

    response.groups().forEach((groupName, group) -> {
      System.out.println("=" + "=".repeat(10) + group.name() + "=" + "=".repeat(10));
      System.out.println(group.numberOfObjects());
      for (var o : group.objects()) {
        System.out.println(o.properties());
        System.out.println(o.metadata());
      }
    });
    // END GetWithGroupby
  }

  @Test
  void testGetWithWhere() {
    // START GetWithFilter
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("animals in movies", q -> q
        // highlight-start
        .where(Where.property("round").eq("Double Jeopardy!"))
        // highlight-end
        .limit(2).returnMetadata(Metadata.DISTANCE));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      System.out.println(o.metadata().distance());
    }
    // END GetWithFilter
  }
}
