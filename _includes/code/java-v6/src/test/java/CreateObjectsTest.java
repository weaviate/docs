import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.Vectors;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CreateObjectsTest {

  private static WeaviateClient client;

  // A helper method to generate a deterministic UUID from a seed, similar to
  // Python's generate_uuid5
  private static UUID generateUuid5(String seed) {
    return UUID.nameUUIDFromBytes(seed.getBytes(StandardCharsets.UTF_8));
  }

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START INSTANTIATION-COMMON
    client = WeaviateClient.connectToLocal();
    // END INSTANTIATION-COMMON

    // TODO[g-despot]: Wasn't able to create collection with vectorizer but without
    // properties
    // START Define the class
    client.collections.create("JeopardyQuestion", col -> col
        .properties(
            Property.text("title", p -> p.description("Name of the wine")))
        .vectorConfig(VectorConfig.text2vecContextionary()));

    // TODO[g-despot]: Add source properties
    client.collections.create("WineReviewNV", col -> col
        .properties(
            Property.text("review_body", p -> p.description("Review body")),
            Property.text("title", p -> p.description("Name of the wine")),
            Property.text("country", p -> p.description("Originating country")))
        .vectorConfig(
            VectorConfig.text2vecContextionary("title"),
            VectorConfig.text2vecContextionary("review_body"),
            VectorConfig.text2vecContextionary("title_country")));
    // END Define the class

    // Additional collections for other tests
    // TODO[g-despot]: Uncomment once GEO type added
    // client.collections.create("Publication", col -> col
    // .properties(Property.geo("headquartersGeoLocation")));
    client.collections.create("Author", col -> col
        .vectorConfig(VectorConfig.selfProvided()));
  }

  @AfterAll
  public static void afterAll() throws IOException {
    client.collections.deleteAll();
  }

  @Test
  void testCreateObject() throws IOException {
    // START CreateObject
    var jeopardy = client.collections.use("JeopardyQuestion");

    // highlight-start
    var uuid = jeopardy.data.insert(Map.of(
        // highlight-end
        "question", "This vector DB is OSS & supports automatic property type inference on import",
        // "answer": "Weaviate", // properties can be omitted
        "newProperty", 123 // will be automatically added as a number property
    )).metadata().uuid();

    System.out.println(uuid); // the return value is the object's UUID
    // END CreateObject

    var result = jeopardy.query.byId(uuid);
    assertThat(result).isPresent();
    assertThat(result.get().properties().get("newProperty")).isEqualTo(123.0); // JSON numbers are parsed as Long
  }

  @Test
  void testCreateObjectWithVector() throws IOException {
    // START CreateObjectWithVector
    var jeopardy = client.collections.use("JeopardyQuestion");
    var uuid = jeopardy.data.insert(
        Map.of(
            "question", "This vector DB is OSS and supports automatic property type inference on import",
            "answer", "Weaviate"),
        // highlight-start
        meta -> meta.vectors(Vectors.of(new float[300])) // Using a zero vector for demonstration
    // highlight-end
    ).metadata().uuid();

    System.out.println(uuid); // the return value is the object's UUID
    // END CreateObjectWithVector

    var result = jeopardy.query.byId(uuid);
    assertThat(result).isPresent();
  }

  @Test
  void testCreateObjectNamedVectors() throws IOException {
    // START CreateObjectNamedVectors
    var reviews = client.collections.use("WineReviewNV"); // This collection must have named vectors configured
    var uuid = reviews.data.insert(
        Map.of(
            "title", "A delicious Riesling",
            "review_body", "This wine is a delicious Riesling which pairs well with seafood.",
            "country", "Germany"),
        // highlight-start
        // Specify the named vectors, following the collection definition
        meta -> meta.vectors(
            Vectors.of("title", new float[1536]))
    // TODO[g-despot]: How to insert multiple vectors?
    // Vectors.of("review_body", new float[1536]),
    // Vectors.of("title_country", new float[1536]))
    // highlight-end
    ).metadata().uuid();

    System.out.println(uuid); // the return value is the object's UUID
    // END CreateObjectNamedVectors

    var result = reviews.query.byId(uuid, q -> q.returnMetadata(Metadata.VECTOR));
    assertThat(result).isPresent();
    // assertThat(result.get().metadata().vectors().getVectors()).containsOnlyKeys("title",
    // "review_body",
    // "title_country");
  }

  @Test
  void testCreateObjectWithDeterministicId() throws IOException {
    // START CreateObjectWithDeterministicId
    // highlight-start
    // In Java, you can generate a deterministic UUID from a string or bytes.
    // This helper function uses UUID.nameUUIDFromBytes for this purpose.
    // highlight-end

    Map<String, Object> dataObject = new HashMap<>();
    dataObject.put("question", "This vector DB is OSS and supports automatic property type inference on import");
    dataObject.put("answer", "Weaviate");

    var jeopardy = client.collections.use("JeopardyQuestion");
    var uuid = jeopardy.data.insert(
        dataObject,
        // highlight-start
        meta -> meta.uuid(generateUuid5(dataObject.toString()).toString())
    // highlight-end
    ).metadata().uuid();
    // END CreateObjectWithDeterministicId

    assertThat(uuid).isEqualTo(generateUuid5(dataObject.toString()).toString());
    jeopardy.data.delete(uuid); // Clean up
  }

  @Test
  void testCreateObjectWithId() throws IOException {
    // START CreateObjectWithId
    Map<String, Object> properties = new HashMap<>();
    properties.put("question", "This vector DB is OSS and supports automatic property type inference on import");
    properties.put("answer", "Weaviate");

    var jeopardy = client.collections.use("JeopardyQuestion");
    var uuid = jeopardy.data.insert(
        properties,
        // highlight-start
        meta -> meta.uuid("12345678-e64f-5d94-90db-c8cfa3fc1234")
    // highlight-end
    ).metadata().uuid();

    System.out.println(uuid); // the return value is the object's UUID
    // END CreateObjectWithId

    var result = jeopardy.query.byId(uuid);
    assertThat(result).isPresent();
    assertThat(result.get().properties().get("question")).isEqualTo(properties.get("question"));
  }

  // TODO[g-despot]: Uncomment once GEO type added
  // @Test
  void testWithGeoCoordinates() throws IOException {
    // START WithGeoCoordinates
    var publications = client.collections.use("Publication");

    var uuid = publications.data.insert(
        Map.of(
            "headquartersGeoLocation", Map.of(
                "latitude", 52.3932696,
                "longitude", 4.8374263)))
        .metadata().uuid();
    // END WithGeoCoordinates

    assertThat(publications.data.exists(uuid)).isTrue();
    publications.data.delete(uuid);
  }

  @Test
  void testCheckForAnObject() throws IOException {
    // START CheckForAnObject
    // generate uuid based on the key properties used during data insert
    String objectUuid = generateUuid5("Author to fetch").toString();
    // END CheckForAnObject

    var authors = client.collections.use("Author");
    authors.data.insert(
        Map.of("name", "Author to fetch"),
        meta -> meta.uuid(objectUuid).vectors(Vectors.of(new float[1536])));

    // START CheckForAnObject
    // highlight-start
    boolean authorExists = authors.data.exists(objectUuid);
    // highlight-end

    System.out.println("Author exist: " + authorExists);
    // END CheckForAnObject

    assertThat(authorExists).isTrue();
    authors.data.delete(objectUuid);
    assertThat(authors.data.exists(objectUuid)).isFalse();
  }
}
