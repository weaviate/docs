import io.weaviate.client6.v1.api.Authentication;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.aggregate.Aggregate;
import io.weaviate.client6.v1.api.collections.aggregate.GroupBy;
import io.weaviate.client6.v1.api.collections.generate.GenerativeProvider;
import io.weaviate.client6.v1.api.collections.query.Filter;
import io.weaviate.client6.v1.api.collections.query.Target;
import io.weaviate.client6.v1.api.collections.tenants.Tenant;
import io.weaviate.client6.v1.api.rbac.CollectionsPermission;
import io.weaviate.client6.v1.api.rbac.DataPermission;
import io.weaviate.client6.v1.api.rbac.Permission;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Runnable copies of the Java code snippets shown in llms.txt. */
class LlmsTxtTest {

  private static Map.Entry<String, VectorConfig> ollamaVectorizer() {
    return VectorConfig.text2vecOllama(b -> b
        .apiEndpoint("http://ollama:11434")
        .model("nomic-embed-text"));
  }

  @Test
  void testLocalConnection() throws Exception {
    // START llms_local_connection
    WeaviateClient client = WeaviateClient.connectToLocal();
    // END llms_local_connection
    assertTrue(client.isReady());
    client.close();
  }

  @Test
  void testCrud() throws Exception {
    WeaviateClient client = WeaviateClient.connectToLocal();
    try {
      if (client.collections.exists("Movie")) client.collections.delete("Movie");
      client.collections.create("Movie", col -> col.vectorConfig(ollamaVectorizer()));

      // START llms_crud
      CollectionHandle<Map<String, Object>> movies = client.collections.use("Movie");

      // Create — insert one object, returns its UUID
      String uuid = movies.data.insert(Map.of("title", "Inception", "genre", "Science Fiction")).uuid();

      // Read — fetch the object by its UUID
      var obj = movies.query.fetchObjectById(uuid);
      System.out.println(obj);

      // Update — merge new property values into the object
      movies.data.update(uuid, u -> u.properties(Map.of("genre", "Sci-Fi Thriller")));

      // Delete — remove the object by its UUID
      movies.data.deleteById(uuid);
      // END llms_crud

      assertTrue(movies.query.fetchObjectById(uuid).isEmpty());
    } finally {
      if (client.collections.exists("Movie")) client.collections.delete("Movie");
      client.close();
    }
  }

  @Test
  void testQueries() throws Exception {
    WeaviateClient client = WeaviateClient.connectToLocal();
    try {
      if (client.collections.exists("Movie")) client.collections.delete("Movie");
      client.collections.create("Movie", col -> col.vectorConfig(ollamaVectorizer()));
      CollectionHandle<Map<String, Object>> col = client.collections.use("Movie");
      col.data.insertMany(
          Map.of("title", "The animals of the savannah"),
          Map.of("title", "A bowl of ramen and other street food"));

      // START llms_queries
      // Vector search
      var vectorRes = col.query.nearText("animals in movies", q -> q.limit(3));
      // Keyword search
      var keywordRes = col.query.bm25("food", q -> q.limit(3));
      // END llms_queries

      assertTrue(keywordRes.objects().size() >= 1);
      assertNotNull(vectorRes);
    } finally {
      if (client.collections.exists("Movie")) client.collections.delete("Movie");
      client.close();
    }
  }

  @Test
  void testFiltering() throws Exception {
    WeaviateClient client = WeaviateClient.connectToLocal();
    try {
      if (client.collections.exists("Restaurant")) client.collections.delete("Restaurant");

      // START llms_filtering_create_minimal
      // Minimal: auto-schema sets filterable + searchable defaults on every property
      client.collections.create("Restaurant", col -> col.vectorConfig(ollamaVectorizer()));
      // END llms_filtering_create_minimal

      client.collections.delete("Restaurant");

      // START llms_filtering_create_full
      // Full control: every knob set explicitly
      client.collections.create("Restaurant", col -> col
          .vectorConfig(ollamaVectorizer())
          .properties(
              Property.text("name"),
              Property.text("cuisine"),
              Property.text("url"),
              Property.number("price")));
      // END llms_filtering_create_full

      CollectionHandle<Map<String, Object>> col = client.collections.use("Restaurant");
      col.data.insertMany(
          Map.of("name", "Ramen House", "cuisine", "Japanese", "url", "https://a.example", "price", 15),
          Map.of("name", "Sushi Bar", "cuisine", "Japanese", "url", "https://b.example", "price", 25),
          Map.of("name", "Pasta Place", "cuisine", "Italian", "url", "https://c.example", "price", 40));

      // START llms_filtering_query
      // Single condition
      var cheapRamen = col.query.hybrid("ramen", q -> q
          .filters(Filter.property("price").lt(20))
          .limit(3));

      // Combine conditions with Filter.and / Filter.or
      var japaneseUnder30 = col.query.fetchObjects(q -> q
          .filters(Filter.and(
              Filter.property("cuisine").eq("Japanese"),
              Filter.property("price").lt(30)))
          .limit(5));
      // END llms_filtering_query

      assertEquals(2, japaneseUnder30.objects().size());
      assertNotNull(cheapRamen);
    } finally {
      if (client.collections.exists("Restaurant")) client.collections.delete("Restaurant");
      client.close();
    }
  }

  @Test
  void testMultiTenancy() throws Exception {
    WeaviateClient client = WeaviateClient.connectToLocal();
    try {
      if (client.collections.exists("Docs")) client.collections.delete("Docs");

      // START llms_multi_tenancy
      client.collections.create("Docs", col -> col
          .vectorConfig(ollamaVectorizer())
          .multiTenancy(mt -> mt.enabled(true)));
      CollectionHandle<Map<String, Object>> col = client.collections.use("Docs");
      col.tenants.create(Tenant.active("tenantA"), Tenant.active("tenantB"));
      var tenantCol = col.withTenant("tenantA");
      tenantCol.data.insert(Map.of("title", "Hello"));
      var res = tenantCol.query.hybrid("hello", q -> q.limit(3));
      // END llms_multi_tenancy

      assertEquals(1, res.objects().size());
    } finally {
      if (client.collections.exists("Docs")) client.collections.delete("Docs");
      client.close();
    }
  }

  @Test
  void testNamedVectors() throws Exception {
    WeaviateClient client = WeaviateClient.connectToLocal();
    try {
      if (client.collections.exists("Article")) client.collections.delete("Article");

      // START llms_named_vectors
      client.collections.create("Article", col -> col
          .vectorConfig(
              VectorConfig.text2vecOllama("title", b -> b
                  .sourceProperties("title")
                  .apiEndpoint("http://ollama:11434").model("nomic-embed-text")),
              VectorConfig.text2vecOllama("body", b -> b
                  .sourceProperties("body")
                  .apiEndpoint("http://ollama:11434").model("nomic-embed-text")))
          .properties(Property.text("title"), Property.text("body")));
      CollectionHandle<Map<String, Object>> col = client.collections.use("Article");
      var res = col.query.nearText(Target.text("title", "machine learning"), q -> q.limit(3));
      // END llms_named_vectors

      col.data.insert(Map.of("title", "Deep learning advances", "body", "A study of neural networks."));
      Thread.sleep(2000);
      var res2 = col.query.nearText(Target.text("title", "machine learning"), q -> q.limit(3));
      assertEquals(1, res2.objects().size());
      assertNotNull(res);
    } finally {
      if (client.collections.exists("Article")) client.collections.delete("Article");
      client.close();
    }
  }

  @Test
  void testAggregations() throws Exception {
    WeaviateClient client = WeaviateClient.connectToLocal();
    try {
      if (client.collections.exists("Movie")) client.collections.delete("Movie");
      client.collections.create("Movie", col -> col
          .vectorConfig(ollamaVectorizer())
          .properties(Property.text("title"), Property.text("genre"), Property.number("rating")));
      CollectionHandle<Map<String, Object>> movies = client.collections.use("Movie");
      movies.data.insertMany(
          Map.of("title", "The Matrix", "genre", "Science Fiction", "rating", 8.7),
          Map.of("title", "Spirited Away", "genre", "Animation", "rating", 8.6),
          Map.of("title", "Blade Runner", "genre", "Science Fiction", "rating", 8.1));

      // START llms_aggregations
      // Total object count
      var total = movies.aggregate.overAll(a -> a.includeTotalCount(true));

      // Numeric metric over a property (mean rating)
      var ratingAgg = movies.aggregate.overAll(a -> a
          .metrics(Aggregate.number("rating", m -> m.mean())));

      // Group object counts by a property
      var byGenre = movies.aggregate.overAll(GroupBy.property("genre"));
      // END llms_aggregations

      assertEquals(3L, total.totalCount());
      assertEquals(2, byGenre.groups().size());
      assertNotNull(ratingAgg);
    } finally {
      if (client.collections.exists("Movie")) client.collections.delete("Movie");
      client.close();
    }
  }

  @Test
  void testGenerative() throws Exception {
    WeaviateClient client = WeaviateClient.connectToLocal();
    try {
      if (client.collections.exists("Movie")) client.collections.delete("Movie");
      client.collections.create("Movie", col -> col.vectorConfig(ollamaVectorizer()));
      CollectionHandle<Map<String, Object>> movies = client.collections.use("Movie");
      movies.data.insertMany(
          Map.of("title", "The Matrix", "genre", "Science Fiction"),
          Map.of("title", "Blade Runner", "genre", "Science Fiction"));
      Thread.sleep(3000);

      // START llms_generative
      var response = movies.generate.nearText(
          "science fiction",
          q -> q.limit(2),
          g -> g
              .singlePrompt("Write a one-line tagline for {title}")
              .groupedTask(
                  "In one sentence, what common theme do these movies share?",
                  c -> c.generativeProvider(GenerativeProvider.ollama(o -> o
                      .apiEndpoint("http://ollama:11434")
                      .model("llama3.2")))));

      // Per-object result from the single prompt
      for (var obj : response.objects()) {
        System.out.println(obj.generative().text());
      }
      // Combined result from the grouped task
      System.out.println(response.generative().text());
      // END llms_generative

      assertNotNull(response.generative().text());
    } finally {
      if (client.collections.exists("Movie")) client.collections.delete("Movie");
      client.close();
    }
  }

  @Test
  void testRbac() throws Exception {
    // RBAC requires an authenticated connection; the test instance runs on :8580
    WeaviateClient client = WeaviateClient.connectToLocal(config -> config
        .port(8580)
        .authentication(Authentication.apiKey("root-user-key")));
    try {
      try { client.roles.delete("movie_reader"); } catch (Exception ignored) {}
      try { client.users.db.delete("alice"); } catch (Exception ignored) {}

      // START llms_rbac
      // Create a role scoped to one collection
      client.roles.create("movie_reader", new Permission[] {
          Permission.collections("Movie", CollectionsPermission.Action.READ),
          Permission.data("Movie", DataPermission.Action.READ),
      });

      // Create a user and assign the role
      String apiKey = client.users.db.create("alice");
      client.users.db.assignRoles("alice", "movie_reader");
      // END llms_rbac

      assertTrue(client.roles.exists("movie_reader"));
      assertNotNull(apiKey);
    } finally {
      try { client.roles.delete("movie_reader"); } catch (Exception ignored) {}
      try { client.users.db.delete("alice"); } catch (Exception ignored) {}
      client.close();
    }
  }
}
