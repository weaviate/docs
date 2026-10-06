import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.query.Boost;
import io.weaviate.client6.v1.api.collections.query.Filter;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

// Boost requires Weaviate v1.38+ and client6 v6.3.0 or higher.
class SearchBoostTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START INSTANTIATION-COMMON
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String openaiApiKey = System.getenv("OPENAI_API_KEY");

    client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey,
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    // END INSTANTIATION-COMMON
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @Test
  void testBoostFilter() {
    // START BoostFilter
    // Promote questions from the "Double Jeopardy!" round without filtering others out.
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("animals in movies", q -> q
        .limit(5)
        // highlight-start
        .boost(Boost.filter(Filter.property("round").eq("Double Jeopardy!"),
            b -> b.weight(0.5f)))
        // highlight-end
        .returnProperties("question", "round"));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BoostFilter
  }

  @Test
  void testBoostProperty() {
    // START BoostProperty
    // Bias toward questions worth more points. LOG1P dampens the long tail so a
    // single high-value outlier doesn't dominate.
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("animals in movies", q -> q
        .limit(5)
        // highlight-start
        .boost(Boost.numericProperty("points",
            b -> b.modifier(Boost.Modifier.LOG1P).weight(0.7f)))
        // highlight-end
        .returnProperties("question", "points"));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BoostProperty
  }

  @Test
  void testBoostTimeDecay() {
    // START BoostTimeDecay
    // Score decays exponentially with age. A "365d" scale with decay 0.5 means an
    // episode that aired a year before the origin gets half the score of one that
    // aired on it.
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("animals in movies", q -> q
        .limit(5)
        // highlight-start
        .boost(Boost.timeDecay("air_date", "365d",
            b -> b.origin("2005-01-01T00:00:00Z")
                .curve(Boost.Curve.EXPONENTIAL)
                .decay(0.5f)
                .weight(0.6f)))
        // highlight-end
        .returnProperties("question", "air_date"));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BoostTimeDecay
  }

  @Test
  void testBoostNumericDecay() {
    // START BoostNumericDecay
    // Score peaks at a target value and falls off symmetrically. Gaussian gives a
    // bell-shaped falloff: questions worth 400 points score 1.0, questions 200
    // points away (one scale) score `decay`.
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("animals in movies", q -> q
        .limit(5)
        // highlight-start
        .boost(Boost.numericDecay("points", 400f, 200f,
            b -> b.curve(Boost.Curve.GAUSSIAN).decay(0.5f).weight(0.5f)))
        // highlight-end
        .returnProperties("question", "points"));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BoostNumericDecay
  }

  @Test
  void testBoostBlend() {
    // START BoostBlend
    // Combine two soft signals: recency (weight 2) + points (weight 1).
    // The outer weight 0.4 controls how much the blended rank affects the final
    // score; the inner weights are *per-condition* and balance each other.
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.nearText("animals in movies", q -> q
        .limit(5)
        // highlight-start
        .boost(Boost.blend(0.4f, 200, // outer weight, and the candidate pool to rescore
            Boost.timeDecay("air_date", "365d", b -> b.weight(2f)),
            Boost.numericProperty("points",
                b -> b.modifier(Boost.Modifier.LOG1P).weight(1f))))
        // highlight-end
        .returnProperties("question", "points", "air_date"));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BoostBlend
  }

  @Test
  void testBoostNegativeWeight() {
    // START BoostNegativeWeight
    // A negative per-condition weight pushes matching documents DOWN - they stay
    // in the result set but lose ground against everything else. Use this to
    // deprioritize a category without filtering it out entirely.
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.bm25("animal", q -> q
        .limit(5)
        // highlight-start
        .boost(Boost.blend(0.5f, null,
            Boost.filter(Filter.property("round").eq("Final Jeopardy!"),
                b -> b.weight(-2f))))
        // highlight-end
        .returnProperties("question", "round"));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BoostNegativeWeight
  }

  @Test
  void testBoostOnHybrid() {
    // START BoostOnHybrid
    // Hybrid keeps its own alpha-blend of BM25 + vector. The boost runs once over
    // the fused hybrid result - the sub-search legs don't see it.
    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.query.hybrid("animals in movies", q -> q
        .alpha(0.75f)
        .limit(5)
        // highlight-start
        .boost(Boost.blend(0.3f, null,
            Boost.filter(Filter.property("round").eq("Double Jeopardy!"),
                b -> b.weight(1f)),
            Boost.filter(Filter.property("round").eq("Final Jeopardy!"),
                b -> b.weight(-2f))))
        // highlight-end
        .returnProperties("question", "round"));

    for (var o : response.objects()) {
      System.out.println(o.properties());
    }
    // END BoostOnHybrid
  }
}
