import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.query.GroupBy;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import io.weaviate.client6.v1.api.collections.query.Where;
// import io.weaviate.client6.v1.internal.grpc.protocol.WeaviateProtoBase.Filters.Operator;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

class SearchKeywordTest {

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
  void testBM25Basic() {
    // START BM25Basic
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.bm25(
        // highlight-start
        "food",
        // highlight-end
        q -> q.limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BM25Basic
  }

  // TODO[g-espot] Why isn't operator available?
  // @Test
  // void testBM25OperatorOrWithMin() {
  //   CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
  //   var response = jeopardy.query.bm25(
  //       // highlight-start
  //       "Australian mammal cute"
  //   // q -> q.operator(Operator.OPERATOR_OR_VALUE, 1)
  //   // highlight-end
  //   // .limit(3));
  //   );
  //   for (var o : response.objects()) {
  //     System.out.println(o.properties());
  //   }
  // }
  // START BM25OperatorOrWithMin
  // Coming soon
  // END BM25OperatorOrWithMin


  // TODO[g-espot] Why isn't operator available?
  // @Test
  // void testBM25OperatorAnd() {
  //   CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
  //   var response = jeopardy.query.bm25(
  //       // highlight-start
  //       "Australian mammal cute"
  //   // q -> q.operator(Operator.OPERATOR_AND) // Each result must include all tokens
  //   // (e.g. "australian", "mammal", "cute")
  //   // highlight-end
  //   // .limit(3)
  //   );

  //   for (var o : response.objects()) {
  //     System.out.println(o.properties());
  //   }
  // }
  // START BM25OperatorAnd
  // Coming soon
  // END BM25OperatorAnd


  @Test
  void testBM25WithScore() {
    // START BM25WithScore
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.bm25("food", q -> q.returnMetadata(Metadata.SCORE).limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      // highlight-start
      System.out.println(o.metadata().score());
      // highlight-end
    }
    // END BM25WithScore
  }

  @Test
  void testLimit() {
    // START limit
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.bm25("safety", q -> q
        // highlight-start
        .limit(3).offset(1)
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END limit
  }

  @Test
  void testAutocut() {
    // START autocut
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.bm25("safety", q -> q
        // highlight-start
        .autocut(1)
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END autocut
  }

  @Test
  void testBM25WithProperties() {
    // START BM25WithProperties
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.bm25("safety", q -> q
        // highlight-start
        .queryProperties("question")
        // highlight-end
        .returnMetadata(Metadata.SCORE).limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      System.out.println(o.metadata().score());
    }
    // END BM25WithProperties
  }

  @Test
  void testBM25WithBoostedProperties() {
    // START BM25WithBoostedProperties
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.bm25("food", q -> q
        // highlight-start
        .queryProperties("question^2", "answer")
        // highlight-end
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BM25WithBoostedProperties
  }

  @Test
  void testMultipleKeywords() {
    // START MultipleKeywords
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.bm25(
        // highlight-start
        "food wine", // search for food or wine
        // highlight-end
        q -> q.queryProperties("question").limit(5));

    for (var o : response.objects()) {
      System.out.println(o.properties().get("question"));
    }
    // END MultipleKeywords
  }

  @Test
  void testBM25WithFilter() {
    // START BM25WithFilter
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.bm25("food", q -> q
        // highlight-start
        .where(Where.property("round").eq("Double Jeopardy!"))
        // highlight-end
        .returnProperties("answer", "question", "round") // return these properties
        .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BM25WithFilter
  }

  @Test
  void testBM25GroupBy() {
    // START BM25GroupByPy4
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");

    var response = jeopardy.query.bm25("California", q -> q, // No query options needed for this example
        GroupBy.property("round", // group by this property
            2, // maximum number of groups
            3 // maximum objects per group
        ));

    response.groups().forEach((groupName, group) -> {
      System.out.println(group.name() + " " + group.objects());
    });
    // END BM25GroupByPy4
  }
}
