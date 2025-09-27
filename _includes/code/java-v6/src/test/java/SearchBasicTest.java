import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.ReferenceProperty;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import io.weaviate.client6.v1.api.collections.query.QueryReference;
import io.weaviate.client6.v1.api.collections.tenants.Tenant;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;

class BasicSearchTest {

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
        config -> config
            .setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    // END INSTANTIATION-COMMON
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @Test
  void testBasicGet() {
    // START BasicGetPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    // highlight-start
    // TODO[g-despot] Why doesn't standalone fetachObjects work?
    var response = jeopardy.query.fetchObjects(config -> config.limit(1));
    // highlight-end

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BasicGetPython
  }

  @Test
  void testGetWithLimit() {
    // START GetWithLimitPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(
        // highlight-start
        q -> q.limit(1)
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END GetWithLimitPython
  }

  @Test
  void testGetWithLimitOffset() {
    // START GetWithLimitOffsetPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(
        // highlight-start
        q -> q.limit(1).offset(1)
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END GetWithLimitOffsetPython
  }

  @Test
  void testGetProperties() {
    // START GetPropertiesPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(
        // highlight-start
        q -> q.limit(1)
            .returnProperties("question", "answer", "points")
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END GetPropertiesPython
  }

  @Test
  void testGetObjectVector() {
    // START GetObjectVectorPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(
        q -> q
            // highlight-start
            .returnMetadata(Metadata.VECTOR)
            // highlight-end
            .limit(1));

    // For collections with a single, unnamed vector, the vector is returned
    // directly
    if (!response.objects().isEmpty()) {
      System.out.println(response.objects().get(0).metadata().vectors());
    }
    // END GetObjectVectorPython
  }

  @Test
  void testGetObjectId() {
    // START GetObjectIdPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(
        // Object IDs are included by default with the v6 client! :)
        q -> q.limit(1));

    for (var o : response.objects()) {
      System.out.println(o.uuid());
    }
    // END GetObjectIdPython
  }

  @Test
  void testGetWithCrossRefs() {
    // START GetWithCrossRefsPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(
        q -> q
            // highlight-start
            .returnReferences(
                QueryReference.single("hasCategory", r -> r.returnProperties("title")))
            // highlight-end
            .limit(2));

    for (var o : response.objects()) {
      System.out.println(o.properties().get("question"));
      // print referenced objects
      if (o.references() != null && o.references().get("hasCategory") != null) {
        for (var refObj : o.references().get("hasCategory")) {
          System.out.println(refObj);
        }
      }
    }
    // END GetWithCrossRefsPython
  }

  @Test
  void testGetWithMetadata() {
    // START GetWithMetadataPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(
        q -> q
            .limit(1)
            // highlight-start
            .returnMetadata(Metadata.CREATION_TIME_UNIX)
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties()); // View the returned properties
      System.out.println(o.metadata().creationTimeUnix()); // View the returned creation time
    }
    // END GetWithMetadataPython
  }

  @Test
  void testMultiTenancy() {
    // START MultiTenancy
    // Connect to the collection
    CollectionHandle<Map<String, Object>> mtCollection = client.collections.use("WineReviewMT");

    // Get the specific tenant's version of the collection
    // highlight-start
    var collectionTenantA = mtCollection.withTenant("tenantA");
    // highlight-end

    // Query tenantA's version
    var response = collectionTenantA.query.fetchObjects(
        q -> q
            .returnProperties("review_body", "title")
            .limit(1));

    if (!response.objects().isEmpty()) {
      System.out.println(response.objects().get(0).properties());
    }
    // END MultiTenancy
  }
}