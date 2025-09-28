import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.aggregate.Aggregate;
import io.weaviate.client6.v1.api.collections.aggregate.GroupBy;
import io.weaviate.client6.v1.api.collections.query.Where;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

class SearchAggregateTest {

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
  void testMetaCount() {
    // START MetaCount Python
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.aggregate.overAll(
        // highlight-start
        a -> a.includeTotalCount(true)
    // highlight-end
    );

    System.out.println(response.totalCount());
    // END MetaCount Python
  }

  @Test
  void testTextProp() {
    // START TextProp Python
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.aggregate.overAll(
        // TODO[g-despot] Count, value and min occurences?
        // highlight-start
        a -> a.metrics(
            Aggregate.text("answer", m -> m
                .topOccurences()
                .topOccurencesCutoff(5) // Threshold minimum count
            ))
    // highlight-end
    );
    // TODOπ[g-despot] How to get topOccurences here
    System.out.println(response.properties().get("answer"));
    // END TextProp Python
  }

  @Test
  void testIntProp() {
    // START IntProp Python
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.aggregate.overAll(
        // highlight-start
        // Use .number for floats (NUMBER datatype in Weaviate)
        a -> a.metrics(
            Aggregate.integer("points", m -> m
                .sum()
                .max()
                .min()))
    // highlight-end
    );

    // TODOπ[g-despot] How to get sum, min and max here
    System.out.println(response.properties().get("points"));
    System.out.println(response.properties().get("points"));
    System.out.println(response.properties().get("points"));
    // END IntProp Python
  }

  @Test
  void testGroupBy() {
    // START groupBy Python
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.aggregate.overAll(
        // TODO[g-despot] Why is metrics needed here?
        // highlight-start
        c -> c.metrics(),
        GroupBy.property("round")
    // highlight-end
    );

    // print rounds names and the count for each
    for (var group : response.groups()) {
      System.out.printf("Value: %s Count: %d\n", group.groupedBy().value(), group.totalCount());
    }
    // END groupBy Python
  }

  @Test
  void testNearTextWithLimit() {
    // START nearTextWithLimit Python
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.aggregate.nearText(
        "animals in space",
        a -> a
            // highlight-start
            .objectLimit(10)
            // highlight-end
            .metrics(Aggregate.number("points", m -> m.sum())));

    System.out.println(response.properties().get("points"));
    // END nearTextWithLimit Python
  }

  @Test
  void testHybrid() {
    // START HybridExample
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.aggregate.hybrid(
        "animals in space",
        a -> a
            // TODO what about bm25Operator?
            // .bm25Operator(...) // Additional parameters available, such as
            // `bm25_operator`, `filter` etc.
            // highlight-start
            .objectLimit(10)
            // highlight-end
            .metrics(Aggregate.number("points", m -> m.sum())));

    System.out.println(response.properties().get("points"));
    // END HybridExample
  }

  @Test
  void testNearTextWithDistance() {
    // START nearTextWithDistance Python
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.aggregate.nearText(
      // TODO[g-despot] Should be distance instead of objectLimit
        "animals in space",
        a -> a.objectLimit(10)
            // highlight-start
            //.distance(0.19f)
            // highlight-end
            .metrics(Aggregate.number("points", m -> m.sum())));

    System.out.println(response.properties().get("points"));
    // END nearTextWithDistance Python
  }

  @Test
  void testWhereFilter() {
    // START whereFilter Python
    // TODO[g-despot] Why is where not available on overAll()?
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.aggregate.overAll(
        a -> a
            // highlight-start
            // .where(Where.property("round").eq("Final Jeopardy!"))
            // highlight-end
            .includeTotalCount(true));

    System.out.println(response.totalCount());
    // END whereFilter Python
  }
}