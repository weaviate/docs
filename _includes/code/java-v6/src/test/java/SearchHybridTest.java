import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.query.GroupBy;
import io.weaviate.client6.v1.api.collections.query.Hybrid.FusionType;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import io.weaviate.client6.v1.api.collections.query.NearVector;
import io.weaviate.client6.v1.api.collections.query.Where;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

class SearchHybridTest {

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
  void testNamedVectorHybrid() {
    // START NamedVectorHybridPython
    CollectionHandle<Map<String, Object>> reviews = client.collections.use("WineReviewNV");
    var response = reviews.query.hybrid(
        // TODO[g-despot] Why isn't targetVector available?
        // highlight-start
        "A French Riesling",
        q -> q
            // .targetVector("title_country")
            .limit(3)

    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END NamedVectorHybridPython
  }

  @Test
  void testHybridBasic() {
    // START HybridBasicPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        // highlight-start
        "food",
        q -> q.limit(3)
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END HybridBasicPython
  }

  @Test
  void testHybridWithScore() {
    // START HybridWithScorePython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "food",
        q -> q
            .alpha(0.5f)
            // highlight-start
            .returnMetadata(Metadata.SCORE, Metadata.EXPLAIN_SCORE)
            // highlight-end
            .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
      // highlight-start
      System.out.println(o.metadata().score() + " " + o.metadata().explainScore());
      // highlight-end
    }
    // END HybridWithScorePython
  }

  @Test
  void testLimit() {
    // START limit Python
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "food",
        q -> q
            // highlight-start
            .limit(3)
            .offset(1)
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END limit Python
  }

  @Test
  void testAutocut() {
    // START autocut Python
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "food",
        q -> q
            // highlight-start
            .fusionType(FusionType.RELATIVE_SCORE)
            .autocut(1)
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END autocut Python
  }

  @Test
  void testHybridWithAlpha() {
    // START HybridWithAlphaPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "food",
        q -> q
            // highlight-start
            .alpha(0.25f)
            // highlight-end
            .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END HybridWithAlphaPython
  }

  @Test
  void testHybridWithFusionType() {
    // START HybridWithFusionTypePython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "food",
        q -> q
            // highlight-start
            .fusionType(FusionType.RELATIVE_SCORE)
            // highlight-end
            .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END HybridWithFusionTypePython
  }

  @Test
  void testHybridWithBM25OperatorOrWithMin() {
    // START HybridWithBM25OperatorOrWithMin
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        // highlight-start
        "Australian mammal cute"
    // TODO what about bm25Operator?
    // .bm25Operator(BM25Operator.or(2))
    // highlight-end
    // .limit(3)
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END HybridWithBM25OperatorOrWithMin
  }

  @Test
  void testHybridWithBM25OperatorAnd() {
    // START HybridWithBM25OperatorAnd
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        // highlight-start
        "Australian mammal cute"
    // TODO what about bm25Operator?
    // .bm25Operator(BM25Operator.and()) // Each result must include all tokens
    // (e.g. "australian", "mammal", "cute")
    // highlight-end
    // .limit(3)
    );

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END HybridWithBM25OperatorAnd
  }

  @Test
  void testHybridWithProperties() {
    // START HybridWithPropertiesPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "food",
        q -> q
            // highlight-start
            .queryProperties("question")
            // highlight-end
            .alpha(0.25f)
            .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END HybridWithPropertiesPython
  }

  @Test
  void testHybridWithPropertyWeighting() {
    // START HybridWithPropertyWeightingPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "food",
        q -> q
            // highlight-start
            .queryProperties("question^2", "answer")
            // highlight-end
            .alpha(0.25f)
            .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END HybridWithPropertyWeightingPython
  }

  @Test
  void testHybridWithVector() {
    // START HybridWithVectorPython
    float[] queryVector = new float[1536]; // Some vector that is compatible with object vectors
    for (int i = 0; i < queryVector.length; i++) {
      queryVector[i] = -0.02f;
    }

    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "food",
        q -> q
            // highlight-start
            .nearVector(NearVector.of(queryVector))
            // highlight-end
            .alpha(0.25f)
            .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END HybridWithVectorPython
  }

  @Test
  void testHybridWithFilter() {
    // START HybridWithFilterPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "food",
        q -> q
            // highlight-start
            .where(Where.property("round").eq("Double Jeopardy!"))
            // highlight-end
            .limit(3));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END HybridWithFilterPython
  }

  @Test
  void testVectorParameters() {
    // START VectorParametersPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "California",
        q -> q
            // highlight-start
            // TODO[g-despot] Why is distance not available?
            // TODO[g-despot] Is there a simpler syntax?
            // .distance(0.4f) // Maximum threshold for the vector search component
            .nearVector(NearVector.of(jeopardy.query.nearText("large animal", c -> c
                .moveAway(0.5f, from -> from.concepts("mammal", "terrestrial")))
                .objects().get(0).vectors().getDefaultSingle()))
            // highlight-end
            .alpha(0.75f)
            .limit(5));
    // END VectorParametersPython
  }

  @Test
  void testVectorSimilarity() {
    // START VectorSimilarityPython
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "California",
        q -> q
            // highlight-start
            // TODO[g-despot] Why is distance not available?
            // .distance(0.4f) // Maximum threshold for the vector search component
            // highlight-end
            .alpha(0.75f)
            .limit(5));
    // END VectorSimilarityPython
  }

  @Test
  void testHybridGroupBy() {
    // START HybridGroupByPy4
    // Query
    CollectionHandle<Map<String, Object>> jeopardy = client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid(
        "California",
        q -> q.alpha(0.75f),
        GroupBy.property(
            "round", // group by this property
            2, // maximum number of groups
            3 // maximum objects per group
        ));

    response.groups().forEach((groupName, group) -> {
      System.out.println(group.name() + " " + group.objects());
    });
    // END HybridGroupByPy4
  }
}