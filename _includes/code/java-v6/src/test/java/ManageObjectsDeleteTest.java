import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import io.weaviate.client6.v1.api.collections.query.QueryResponse;
import io.weaviate.client6.v1.api.collections.query.Where;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class ManageObjectsDeleteTest {

  private static WeaviateClient client;
  private static final String COLLECTION_NAME = "EphemeralObject";

  @BeforeAll
  public static void beforeAll() throws IOException {
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    client = WeaviateClient.connectToLocal(
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @BeforeEach
  public void setup() throws IOException {
    if (client.collections.exists(COLLECTION_NAME)) {
      client.collections.delete(COLLECTION_NAME);
    }
    client.collections.create(COLLECTION_NAME, col -> col.properties(Property.text("name")));
  }

  @AfterEach
  public void cleanup() throws IOException {
    if (client.collections.exists(COLLECTION_NAME)) {
      client.collections.delete(COLLECTION_NAME);
    }
  }

  @Test
  void testDeleteObject() throws IOException {
    CollectionHandle<Map<String, Object>> collection = client.collections.use(COLLECTION_NAME);
    String uuidToDelete = collection.data.insert(Map.of("name", "EphemeralObjectA")).uuid();
    assertThat(collection.query.byId(uuidToDelete)).isPresent();

    // START DeleteObject
    collection.data.delete(uuidToDelete);
    // END DeleteObject

    assertThat(collection.query.byId(uuidToDelete)).isNotPresent();
  }

  @Test
  void testDeleteErrorHandling() {
    // START DeleteError
    // try {
    // String nonExistentUuid = "00000000-0000-0000-0000-000000000000";
    // CollectionHandle<Map<String, Object>> collection =
    // client.collections.use(COLLECTION_NAME);
    // collection.data.deleteById(nonExistentUuid);
    // } catch (WeaviateApiException e) {
    // // 404 error if the id was not found
    // System.out.println(e);
    // // assertThat(e.getStatusCode()).isEqualTo(404);
    // }
    // END DeleteError
  }

  @Test
  void testBatchDelete() {
    CollectionHandle<Map<String, Object>> collection = client.collections.use(COLLECTION_NAME);
    List<Map<String, Object>> objects = IntStream.range(0, 5)
        .mapToObj(i -> Map.<String, Object>of("name", "EphemeralObject_" + i))
        .collect(Collectors.toList());
    collection.data.insertMany(objects.toArray(new Map[0]));
    assertThat(collection.aggregate.overAll(a -> a.includeTotalCount(true)).totalCount()).isEqualTo(5);

    // START DeleteBatch
    collection.data.deleteMany(
        // highlight-start
        Where.property("name").like("EphemeralObject*")
    // highlight-end
    );
    // END DeleteBatch

    assertThat(collection.aggregate.overAll(a -> a.includeTotalCount(true)).totalCount()).isZero();
  }

  @Test
  void testDeleteContains() {
    // START DeleteContains
    CollectionHandle<Map<String, Object>> collection = client.collections.use(COLLECTION_NAME);
    collection.data.insertMany(
        Map.of("name", "asia"),
        Map.of("name", "europe"));

    collection.data.deleteMany(
        // highlight-start
        Where.property("name").containsAny("europe", "asia")
    // highlight-end
    );
    // END DeleteContains
  }

  @Test
  void testDryRun() {
    CollectionHandle<Map<String, Object>> collection = client.collections.use(COLLECTION_NAME);
    List<Map<String, Object>> objects = IntStream.range(0, 5)
        .mapToObj(i -> Map.<String, Object>of("name", "EphemeralObject_" + i))
        .collect(Collectors.toList());
    collection.data.insertMany(objects.toArray(new Map[0]));

    // START DryRun
    var result = collection.data.deleteMany(
        Where.property("name").like("EphemeralObject*"),
        // highlight-start
        c -> c.dryRun(true).verbose(true)
    // highlight-end
    );

    System.out.println(result);
    // END DryRun

    assertThat(result.matches()).isEqualTo(5);
    assertThat(collection.aggregate.overAll(a -> a.includeTotalCount(true)).totalCount()).isEqualTo(5);
  }

  // TODO[g-despot]: containsAny should take list not single string
  @Test
  void testBatchDeleteWithIDs() {
    CollectionHandle<Map<String, Object>> collection = client.collections.use(COLLECTION_NAME);
    List<Map<String, Object>> objects = IntStream.range(0, 5)
        .mapToObj(i -> Map.<String, Object>of("name", "EphemeralObject_" + i))
        .collect(Collectors.toList());
    collection.data.insertMany(objects.toArray(new Map[0]));
    assertThat(collection.aggregate.overAll(a -> a.includeTotalCount(true)).totalCount()).isEqualTo(5);

    // START DeleteByIDBatch
    QueryResponse<Map<String, Object>> queryResponse = collection.query.fetchObjects(q -> q.limit(3));
    List<String> ids = queryResponse.objects().stream()
        .map(WeaviateObject::uuid)
        .collect(Collectors.toList());

    collection.data.deleteMany(
        // highlight-start
        Where.uuid().containsAny(ids.toString()) // Delete the 3 objects
    // highlight-end
    );
    // END DeleteByIDBatch

    assertThat(collection.aggregate.overAll(a -> a.includeTotalCount(true)).totalCount()).isEqualTo(2);
  }
}