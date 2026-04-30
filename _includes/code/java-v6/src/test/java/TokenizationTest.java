// START AccentFoldingCreateCollection
// START CustomStopwordsCreate
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.TextAnalyzer;
import io.weaviate.client6.v1.api.collections.Tokenization;
import io.weaviate.client6.v1.api.collections.VectorConfig;
// END AccentFoldingCreateCollection
// END CustomStopwordsCreate

// START TokenizeEndpointFreeform
import io.weaviate.client6.v1.api.tokenize.TokenizeResponse;
// END TokenizeEndpointFreeform

import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.query.Filter;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Combined Java v6 test suite covering all v1.37 tokenization features:
 * accent folding, custom stopword presets, and the /v1/tokenize endpoint.
 */
class TokenizationTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    client = WeaviateClient.connectToLocal();
  }

  @AfterAll
  public static void afterAll() throws Exception {
    if (client != null) {
      client.close();
    }
  }

  // ============================================================
  // Accent folding (asciiFold / asciiFoldIgnore)
  // ============================================================
  @Test
  void testAccentFolding() throws IOException {
    final String COLLECTION = "AccentFoldingDemo";
    client.collections.delete(COLLECTION);
    try {
      // START AccentFoldingCreateCollection
      client.collections.create(COLLECTION, c -> c
          .properties(
              Property.text("text_default",
                  p -> p.tokenization(Tokenization.WORD)),
              Property.text("text_folded",
                  p -> p.tokenization(Tokenization.WORD)
                      .textAnalyzer(TextAnalyzer.of(t -> t.foldAscii(true)))),
              Property.text("text_folded_keep_e",
                  p -> p.tokenization(Tokenization.WORD)
                      .textAnalyzer(TextAnalyzer.of(t -> t
                          .foldAscii(true)
                          .keepAscii("é")))))
          .vectorConfig(VectorConfig.selfProvided()));
      // END AccentFoldingCreateCollection

      // START AccentFoldingAddObjects
      CollectionHandle<Map<String, Object>> products =
          client.collections.use(COLLECTION);

      List<String> testStrings = List.of(
          "Café Crème Bio",
          "Łódź Ceramics",
          "São Paulo Sandals",
          "Müller Bräu");

      for (String text : testStrings) {
        products.data.insert(Map.of(
            "text_default", text,
            "text_folded", text,
            "text_folded_keep_e", text));
      }
      // END AccentFoldingAddObjects

      // START AccentFoldingFilter
      String[] queries = {"cafe", "Café", "lodz", "sao paulo", "muller"};
      String[] properties = {"text_default", "text_folded", "text_folded_keep_e"};

      for (String query : queries) {
        System.out.println("\nQuery: \"" + query + "\"");
        for (String prop : properties) {
          var response = products.query.fetchObjects(
              q -> q.filters(Filter.property(prop).eq(query)));
          var matches = response.objects().stream()
              .map(o -> (String) o.properties().get(prop))
              .toList();
          System.out.println(
              "  " + prop + ": " + (matches.isEmpty() ? "no match" : matches));
        }
      }
      // END AccentFoldingFilter

      // Test: "cafe" matches folded but not default or keep_e
      var r = products.query.fetchObjects(
          q -> q.filters(Filter.property("text_folded").eq("cafe")));
      assertThat(r.objects()).hasSize(1);
      assertThat((String) r.objects().get(0).properties().get("text_folded"))
          .isEqualTo("Café Crème Bio");

      r = products.query.fetchObjects(
          q -> q.filters(Filter.property("text_default").eq("cafe")));
      assertThat(r.objects()).isEmpty();

      r = products.query.fetchObjects(
          q -> q.filters(Filter.property("text_folded_keep_e").eq("cafe")));
      assertThat(r.objects()).isEmpty();

      // Test: "Café" matches all three
      for (String prop : properties) {
        var rr = products.query.fetchObjects(
            q -> q.filters(Filter.property(prop).eq("Café")));
        assertThat(rr.objects())
            .as("Expected 'Café' to match on %s", prop)
            .hasSize(1);
      }

      // Test: "lodz" matches folded and keep_e but not default
      r = products.query.fetchObjects(
          q -> q.filters(Filter.property("text_folded").eq("lodz")));
      assertThat(r.objects()).hasSize(1);
      assertThat((String) r.objects().get(0).properties().get("text_folded"))
          .contains("Łódź");

      r = products.query.fetchObjects(
          q -> q.filters(Filter.property("text_default").eq("lodz")));
      assertThat(r.objects()).isEmpty();

      r = products.query.fetchObjects(
          q -> q.filters(Filter.property("text_folded_keep_e").eq("lodz")));
      assertThat(r.objects()).hasSize(1);

      // Test: "muller" matches folded but not default
      r = products.query.fetchObjects(
          q -> q.filters(Filter.property("text_folded").eq("muller")));
      assertThat(r.objects()).hasSize(1);
      assertThat((String) r.objects().get(0).properties().get("text_folded"))
          .contains("Müller");

      r = products.query.fetchObjects(
          q -> q.filters(Filter.property("text_default").eq("muller")));
      assertThat(r.objects()).isEmpty();
    } finally {
      client.collections.delete(COLLECTION);
    }
  }

  // ============================================================
  // Custom and per-property stopword presets
  // ============================================================
  @Test
  void testCustomStopwords() throws IOException {
    final String COLLECTION = "StopwordsDemo";
    client.collections.delete(COLLECTION);
    try {
      // START CustomStopwordsCreate
      Map<String, List<String>> presets = Map.of(
          "fr", List.of("le", "la", "les", "un", "une", "des", "du", "de", "et"));

      client.collections.create(COLLECTION, c -> c
          .invertedIndex(idx -> idx.stopwordPresets(presets))
          .properties(
              Property.text("name_en",
                  p -> p.tokenization(Tokenization.WORD)
                      .textAnalyzer(TextAnalyzer.of(t -> t.stopwordPreset("en")))),
              Property.text("name_fr",
                  p -> p.tokenization(Tokenization.WORD)
                      .textAnalyzer(TextAnalyzer.of(t -> t.stopwordPreset("fr")))))
          .vectorConfig(VectorConfig.selfProvided()));
      // END CustomStopwordsCreate

      // START CustomStopwordsAddObjects
      CollectionHandle<Map<String, Object>> products =
          client.collections.use(COLLECTION);

      products.data.insert(Map.of(
          "name_en", "The Blue Cup and the Bowl",
          "name_fr", "La Tasse Bleue et le Bol"));
      products.data.insert(Map.of(
          "name_en", "A Red Plate with the Saucer",
          "name_fr", "Une Assiette Rouge avec la Soucoupe"));
      // END CustomStopwordsAddObjects

      // START CustomStopwordsSearch
      var responseFr = products.query.bm25(
          "la tasse bleue et le bol",
          q -> q.queryProperties("name_fr").returnMetadata(Metadata.SCORE));

      System.out.println("French property search:");
      for (var o : responseFr.objects()) {
        System.out.println(
            "  " + o.properties().get("name_fr")
                + " (score: " + o.queryMetadata().score() + ")");
      }

      var responseEn = products.query.bm25(
          "la tasse bleue et le bol",
          q -> q.queryProperties("name_en").returnMetadata(Metadata.SCORE));

      System.out.println("\nEnglish property search:");
      for (var o : responseEn.objects()) {
        System.out.println(
            "  " + o.properties().get("name_en")
                + " (score: " + o.queryMetadata().score() + ")");
      }
      // END CustomStopwordsSearch

      // Test: French search finds the matching document
      assertThat(responseFr.objects()).hasSize(1);
      assertThat((String) responseFr.objects().get(0).properties().get("name_fr"))
          .isEqualTo("La Tasse Bleue et le Bol");
      assertThat(responseFr.objects().get(0).queryMetadata().score())
          .isPositive();

      // Test: English search returns no results (French words aren't in English data)
      var enOnEn = products.query.bm25(
          "la tasse bleue et le bol",
          q -> q.queryProperties("name_en"));
      assertThat(enOnEn.objects()).isEmpty();

      // Test: Searching French property for English content returns no results
      var enOnFr = products.query.bm25(
          "blue cup bowl",
          q -> q.queryProperties("name_fr"));
      assertThat(enOnFr.objects()).isEmpty();

      // Test: "la" alone shouldn't score on French property — it's a stopword
      var laResponse = products.query.bm25(
          "la",
          q -> q.queryProperties("name_fr"));
      assertThat(laResponse.objects()).isEmpty();
    } finally {
      client.collections.delete(COLLECTION);
    }
  }

  // ============================================================
  // /v1/tokenize endpoint — freeform
  // ============================================================
  @Test
  void testTokenizeFreeform() throws IOException {
    // START TokenizeEndpointFreeform
    // Ad-hoc tokenization with custom config
    TokenizeResponse result = client.tokenize.text(
        "The organic café crème blend",
        t -> t
            .tokenization(Tokenization.WORD)
            .textAnalyzer(TextAnalyzer.of(a -> a
                .foldAscii(true)
                .stopwordPreset("en"))));

    System.out.println("indexed: " + result.indexed());
    System.out.println("query:   " + result.query());
    // END TokenizeEndpointFreeform

    // Test: accent folding converts café→cafe, crème→creme
    assertThat(result.indexed()).contains("cafe");
    assertThat(result.indexed()).contains("creme");
    // Test: stopword "the" is in indexed but not in query
    assertThat(result.indexed()).contains("the");
    assertThat(result.query()).doesNotContain("the");
    // Test: non-stopwords are in both
    assertThat(result.indexed()).contains("organic");
    assertThat(result.query()).contains("organic");
  }

  // ============================================================
  // /v1/tokenize endpoint — with custom preset
  // ============================================================
  @Test
  void testTokenizeCustomPreset() throws IOException {
    // START TokenizeEndpointCustomPreset
    // Define a named "fr" preset and reference it from analyzer config.
    // stopwordPresets is mutually exclusive with stopwords — pass at most one.
    Map<String, List<String>> presets = Map.of(
        "fr", List.of("le", "la", "les", "un", "une", "des", "du", "de", "et"));

    TokenizeResponse result = client.tokenize.text(
        "La Tasse Bleue et le Bol",
        t -> t
            .tokenization(Tokenization.WORD)
            .textAnalyzer(TextAnalyzer.of(a -> a.stopwordPreset("fr")))
            .stopwordPresets(presets));

    System.out.println("indexed: " + result.indexed());
    System.out.println("query:   " + result.query());
    // END TokenizeEndpointCustomPreset

    // Test: French stopwords are indexed but removed from query
    assertThat(result.indexed()).contains("la", "et", "le");
    assertThat(result.query()).doesNotContain("la", "et", "le");
    assertThat(result.query()).contains("tasse", "bleue", "bol");
  }

  // ============================================================
  // /v1/tokenize endpoint — for an existing property's config
  // ============================================================
  @Test
  void testTokenizeForProperty() throws IOException {
    final String COLLECTION = "TokenizeDemo";
    client.collections.delete(COLLECTION);
    try {
      Map<String, List<String>> presets = Map.of(
          "fr", List.of("le", "la", "les", "un", "une", "des", "du", "de", "et"));

      client.collections.create(COLLECTION, c -> c
          .invertedIndex(idx -> idx.stopwordPresets(presets))
          .properties(
              Property.text("name_fr",
                  p -> p.tokenization(Tokenization.WORD)
                      .textAnalyzer(TextAnalyzer.of(t -> t.stopwordPreset("fr")))))
          .vectorConfig(VectorConfig.selfProvided()));

      // START TokenizeEndpointProperty
      // Tokenize using an existing property's configuration
      TokenizeResponse result = client.tokenize.forProperty(
          "La Tasse Bleue et le Bol", COLLECTION, "name_fr");

      System.out.println("indexed: " + result.indexed());
      System.out.println("query:   " + result.query());
      // END TokenizeEndpointProperty

      // Test: all words are indexed (stopwords are still stored)
      assertThat(result.indexed()).contains("la", "et", "le");
      assertThat(result.indexed()).contains("tasse", "bleue", "bol");
      // Test: French stopwords are removed from query tokens
      assertThat(result.query()).doesNotContain("la", "et", "le");
      // Test: non-stopwords remain in query tokens
      assertThat(result.query()).contains("tasse", "bleue", "bol");
      assertThat(result.indexed()).hasSize(6);
      assertThat(result.query()).hasSize(3);
    } finally {
      client.collections.delete(COLLECTION);
    }
  }
}
