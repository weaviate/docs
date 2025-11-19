import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.data.InsertManyResponse;
import io.weaviate.client6.v1.api.collections.query.QueryReference;
import io.weaviate.client6.v1.api.collections.query.Where;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

class SearchFilterTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START INSTANTIATION-COMMON
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String openaiApiKey = System.getenv("OPENAI_APIKEY");

    client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey,
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    // END INSTANTIATION-COMMON
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @Test
  void testSingleFilter() {
    // START SingleFilter
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        .where(Where.property("round").eq("Double Jeopardy!"))
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END SingleFilter
  }

  @Test
  void testSingleFilterNearText() {
    // START NearTextSingleFilter
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("fashion icons", q -> q
        // highlight-start
        .where(Where.property("points").gt(200))
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END NearTextSingleFilter
  }

  @Test
  void testContainsAnyFilter() {
    // START ContainsAnyFilter
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");

    // highlight-start
    String[] tokens = new String[] {"australia", "india"};
    // highlight-end
    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        // Find objects where the `answer` property contains any of the strings in `token_list`
        .where(Where.property("answer").containsAny(tokens))
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END ContainsAnyFilter
  }

  @Test
  void testContainsAllFilter() {
    // START ContainsAllFilter
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");

    // highlight-start
    String[] tokens = new String[] {"blue", "red"};

    // highlight-end

    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        // Find objects where the `question` property contains all of the strings in `tokens`
        .where(Where.property("question").containsAll(tokens))
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END ContainsAllFilter
  }

  @Test
  void testContainsNoneFilter() {
    // START ContainsNoneFilter
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");

    // highlight-start
    String[] tokens = new String[] {"bird", "animal"};
    // highlight-end

    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        // Find objects where the `question` property contains none of the strings in `token_list`
        .where(Where.property("question").containsNone(tokens))
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END ContainsNoneFilter
  }

  @Test
  void testLikeFilter() {
    // START LikeFilter
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        .where(Where.property("answer").like("*ala*"))
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END LikeFilter
  }

  @Test
  void testMultipleFiltersAnd() {
    // START MultipleFiltersAnd
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        // Combine filters with Where.and(), Where.or(), and Where.not()
        .where(Where.and(Where.property("round").eq("Double Jeopardy!"),
            Where.property("points").lt(600),
            Where.not(Where.property("answer").eq("Yucatan"))))
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END MultipleFiltersAnd
  }

  @Test
  void testMultipleFiltersAnyOf() {
    // START MultipleFiltersAnyOf
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        .where(Where.or(Where.property("points").gte(700),
            Where.property("points").lt(500),
            Where.property("round").eq("Double Jeopardy!")))
        // highlight-end
        .limit(5));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END MultipleFiltersAnyOf
  }

  @Test
  void testMultipleFiltersAllOf() {
    // START MultipleFiltersAllOf
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        .where(Where.and(Where.property("points").gt(300),
            Where.property("points").lt(700),
            Where.property("round").eq("Double Jeopardy!")))
        // highlight-end
        .limit(5));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END MultipleFiltersAllOf
  }

  @Test
  void testMultipleFiltersNested() {
    // START MultipleFiltersNested
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        .where(Where.and(Where.property("answer").like("*bird*"),
            Where.or(Where.property("points").gt(700),
                Where.property("points").lt(300))))
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END MultipleFiltersNested
  }

  @Test
  void testCrossReference() {
    // START CrossReference
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.fetchObjects(q -> q
        // highlight-start
        .where(Where.reference("hasCategory", "JeopardyQuestion", "title")
            .eq("Sport"))
        .returnReferences(QueryReference.single("hasCategory",
            r -> r.returnProperties("title")))
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      if (o.references() != null && o.references().get("hasCategory") != null) {
        System.out.println(o.references().get("hasCategory").get(0));
      }
    }
    // END CrossReference
  }

  @Test
  void testFilterById() {
    // START FilterById
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use("Article");

    String targetId = "00037775-1432-35e5-bc59-443baaef7d80";
    var response =
        collection.query.fetchObjects(q -> q.where(Where.uuid().eq(targetId)));

    for (var o : response.objects()) {
      System.out.println(o.properties()); // Inspect returned objects
      System.out.println(o.uuid());
    }
    // END FilterById
  }

  // TODO[g-despot] How to filter by creation time?
  // @Test
  // void testFilterByTimestamp() {
  //   // START FilterByTimestamp
  //   // highlight-start
  //   // Set the timezone for avoidance of doubt
  //   OffsetDateTime filterTime =
  //       OffsetDateTime.of(2020, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC);
  //   // highlight-end

  //   CollectionHandle<Map<String, Object>> collection =
  //       client.collections.use("Article");
  //   var response = collection.query.fetchObjects(q -> q.limit(3)
  //       // highlight-start
  //       .where(Where.byCreationTime().gt(filterTime.toInstant()))
  //       .returnMetadata(Metadata.CREATION_TIME_UNIX)
  //   // highlight-end
  //   );

  //   for (var o : response.objects()) {
  //     System.out.println(o.properties()); // Inspect returned objects
  //     System.out.println(o.metadata().creationTimeUnix()); // Inspect object creation time
  //   }
  //   // END FilterByTimestamp
  // }

  @Test
  void testFilterByDateDatatype() throws IOException {
    String collectionName = "CollectionWithDate";
    client.collections.delete(collectionName);
    try {
      client.collections.create(collectionName,
          col -> col
              .properties(Property.text("title"), Property.date("some_date"))
              .vectorConfig(VectorConfig.selfProvided()));

      // Get a handle to your collection
      var collection = client.collections.use(collectionName);

      // 1. Create a list to hold all the objects for insertion.
      List<Map<String, Object>> objects = new ArrayList<>();

      // 2. Populate the list with your data.
      for (int year = 2020; year <= 2024; year++) {
        for (int month = 1; month <= 12; month += 2) {
          for (int day = 1; day <= 20; day += 5) {
            Instant date =
                OffsetDateTime.of(year, month, day, 0, 0, 0, 0, ZoneOffset.UTC)
                    .toInstant();
            objects.add(
                Map.of("title", String.format("Object: yr/month/day:%d/%d/%d",
                    year, month, day), "some_date", date));
          }
        }
      }

      // 3. Call insertMany with the list of objects.
      // Note: We convert the List to an array to match the method's varargs
      // signature.
      InsertManyResponse insertResponse =
          collection.data.insertMany(objects.toArray(new Map[0]));

      // 4. (Optional) Check for errors.
      if (!insertResponse.errors().isEmpty()) {
        throw new RuntimeException("Errors occurred during batch insertion: "
            + insertResponse.errors());
      }

      System.out.printf("Successfully inserted %d objects.",
          insertResponse.uuids().size());

      // START FilterByDateDatatype
      // highlight-start
      // Set the timezone for avoidance of doubt
      Instant filterTime =
          OffsetDateTime.of(2022, 6, 10, 0, 0, 0, 0, ZoneOffset.UTC)
              .toInstant();
      // The filter threshold could also be an RFC 3339 timestamp, e.g.:
      // String filter_time = "2022-06-10T00:00:00.00Z";
      // highlight-end

      var response = collection.query.fetchObjects(q -> q.limit(3)
          // highlight-start
          // This property (`some_date`) is a `DATE` datatype
          .where(Where.property("some_date").gt(filterTime))
      // highlight-end
      );

      for (var o : response.objects()) {
        System.out.println(o.properties()); // Inspect returned objects
      }
      // END FilterByDateDatatype
    } finally {
      if (client.collections.exists(collectionName)) {
        client.collections.delete(collectionName);
      }
    }
  }

  // TODO[g-despot] Is this implemented yet, length?
  @Test
  void testFilterByPropertyLength() {
    // START FilterByPropertyLength
    int lengthThreshold = 20;

    CollectionHandle<Map<String, Object>> collection =
        client.collections.use("JeopardyQuestion");
    var response = collection.query.fetchObjects(q -> q.limit(3)
        // highlight-start
        .where(Where.property("answer").gt(lengthThreshold))
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties()); // Inspect returned objects
      System.out.println(((String) o.properties().get("answer")).length()); // Inspect property length
    }
    // END FilterByPropertyLength
  }

  // TODO[g-despot] How to filter for property null state?
  // @Test
  // void testFilterByPropertyNullState() {
  // // START FilterByPropertyNullState
  // CollectionHandle<Map<String, Object>> collection =
  // client.collections.use("WineReview");
  // var response = collection.query.fetchObjects(
  // q -> q
  // .limit(3)
  // // highlight-start
  // // This requires the `country` property to be configured with
  // // `index_null_state=True``
  // .where(Where.property("country").isNull()) // Find objects where the
  // `country` property is null
  // // highlight-end
  // );

  // for (var o : response.objects()) {
  // System.out.println(o.properties()); // Inspect returned objects
  // }
  // // END FilterByPropertyNullState
  // }

  @Test
  void testFilterByGeolocation() throws Exception {
    String collectionName = "Publication";
    WeaviateClient localClient = WeaviateClient.connectToLocal();
    try {
      localClient.collections.create(collectionName,
          col -> col.properties(Property.text("title"),
              Property.geoCoordinates("headquartersGeoLocation")));
      var publications = localClient.collections.use(collectionName);
      publications.data.insert(Map.of("headquartersGeoLocation",
          Map.of("latitude", 52.3932696, "longitude", 4.8374263)));

      // START FilterbyGeolocation
      var response = publications.query
          .fetchObjects(q -> q.where(Where.property("headquartersGeoLocation")
              .withinGeoRange(52.39f, 4.84f, 1000.0f) // In meters
          ));

      for (var o : response.objects()) {
        System.out.println(o.properties()); // Inspect returned objects
      }
      // END FilterbyGeolocation
    } finally {
      if (localClient.collections.exists(collectionName)) {
        localClient.collections.delete(collectionName);
      }
      try {
        localClient.close();
      } catch (IOException e) {
        // ignore
      }
    }
  }
}
