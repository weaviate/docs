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

  private static WeaviateClient connectCloud() throws Exception {
    return WeaviateClient.connectToWeaviateCloud(
        System.getenv("WEAVIATE_URL"),
        System.getenv("WEAVIATE_API_KEY"));
  }

  private static WeaviateClient connectCloudWithOpenAi() throws Exception {
    return WeaviateClient.connectToWeaviateCloud(
        System.getenv("WEAVIATE_URL"),
        System.getenv("WEAVIATE_API_KEY"),
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", System.getenv("OPENAI_API_KEY"))));
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
    WeaviateClient client = connectCloud();
    try {
      if (client.collections.exists("Movie__CrudJv")) client.collections.delete("Movie__CrudJv");
      client.collections.create("Movie__CrudJv", col -> col.vectorConfig(VectorConfig.text2vecWeaviate()));

      // START llms_crud
      CollectionHandle<Map<String, Object>> movies = client.collections.use("Movie__CrudJv");

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
      if (client.collections.exists("Movie__CrudJv")) client.collections.delete("Movie__CrudJv");
      client.close();
    }
  }

  @Test
  void testQueries() throws Exception {
    WeaviateClient client = connectCloud();
    try {
      if (client.collections.exists("Movie__QueriesJv")) client.collections.delete("Movie__QueriesJv");
      client.collections.create("Movie__QueriesJv", col -> col.vectorConfig(VectorConfig.text2vecWeaviate()));
      CollectionHandle<Map<String, Object>> col = client.collections.use("Movie__QueriesJv");
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
      if (client.collections.exists("Movie__QueriesJv")) client.collections.delete("Movie__QueriesJv");
      client.close();
    }
  }

  @Test
  void testFiltering() throws Exception {
    WeaviateClient client = connectCloud();
    try {
      if (client.collections.exists("Restaurant__FilteringJv")) client.collections.delete("Restaurant__FilteringJv");

      // START llms_filtering_create_minimal
      // Minimal: auto-schema sets filterable + searchable defaults on every property
      client.collections.create("Restaurant__FilteringJv", col -> col.vectorConfig(VectorConfig.text2vecWeaviate()));
      // END llms_filtering_create_minimal

      client.collections.delete("Restaurant__FilteringJv");

      // START llms_filtering_create_full
      // Full control: every knob set explicitly
      client.collections.create("Restaurant__FilteringJv", col -> col
          .vectorConfig(VectorConfig.text2vecWeaviate())
          .properties(
              Property.text("name"),
              Property.text("cuisine"),
              Property.text("url"),
              Property.number("price")));
      // END llms_filtering_create_full

      CollectionHandle<Map<String, Object>> col = client.collections.use("Restaurant__FilteringJv");
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
      if (client.collections.exists("Restaurant__FilteringJv")) client.collections.delete("Restaurant__FilteringJv");
      client.close();
    }
  }

  @Test
  void testMultiTenancy() throws Exception {
    WeaviateClient client = connectCloud();
    try {
      if (client.collections.exists("Docs__MtJv")) client.collections.delete("Docs__MtJv");

      // START llms_multi_tenancy
      client.collections.create("Docs__MtJv", col -> col
          .vectorConfig(VectorConfig.text2vecWeaviate())
          .multiTenancy(mt -> mt.enabled(true)));
      CollectionHandle<Map<String, Object>> col = client.collections.use("Docs__MtJv");
      col.tenants.create(Tenant.active("tenantA"), Tenant.active("tenantB"));
      var tenantCol = col.withTenant("tenantA");
      tenantCol.data.insert(Map.of("title", "Hello"));
      var res = tenantCol.query.hybrid("hello", q -> q.limit(3));
      // END llms_multi_tenancy

      assertEquals(1, res.objects().size());
    } finally {
      if (client.collections.exists("Docs__MtJv")) client.collections.delete("Docs__MtJv");
      client.close();
    }
  }

  @Test
  void testNamedVectors() throws Exception {
    WeaviateClient client = connectCloud();
    try {
      if (client.collections.exists("Article__NvJv")) client.collections.delete("Article__NvJv");

      // START llms_named_vectors
      client.collections.create("Article__NvJv", col -> col
          .vectorConfig(
              VectorConfig.text2vecWeaviate("title", c -> c.sourceProperties("title")),
              VectorConfig.text2vecWeaviate("body", c -> c.sourceProperties("body")))
          .properties(Property.text("title"), Property.text("body")));
      CollectionHandle<Map<String, Object>> col = client.collections.use("Article__NvJv");
      var res = col.query.nearText(Target.text("title", "machine learning"), q -> q.limit(3));
      // END llms_named_vectors

      col.data.insert(Map.of("title", "Deep learning advances", "body", "A study of neural networks."));
      Thread.sleep(2000);
      var res2 = col.query.nearText(Target.text("title", "machine learning"), q -> q.limit(3));
      assertEquals(1, res2.objects().size());
      assertNotNull(res);
    } finally {
      if (client.collections.exists("Article__NvJv")) client.collections.delete("Article__NvJv");
      client.close();
    }
  }

  @Test
  void testAggregations() throws Exception {
    WeaviateClient client = connectCloud();
    try {
      if (client.collections.exists("Movie__AggsJv")) client.collections.delete("Movie__AggsJv");
      client.collections.create("Movie__AggsJv", col -> col
          .vectorConfig(VectorConfig.text2vecWeaviate())
          .properties(Property.text("title"), Property.text("genre"), Property.number("rating")));
      CollectionHandle<Map<String, Object>> movies = client.collections.use("Movie__AggsJv");
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
      if (client.collections.exists("Movie__AggsJv")) client.collections.delete("Movie__AggsJv");
      client.close();
    }
  }

  @Test
  void testGenerative() throws Exception {
    WeaviateClient client = connectCloudWithOpenAi();
    try {
      if (client.collections.exists("Movie__GenJv")) client.collections.delete("Movie__GenJv");
      client.collections.create("Movie__GenJv", col -> col.vectorConfig(VectorConfig.text2vecWeaviate()));
      CollectionHandle<Map<String, Object>> movies = client.collections.use("Movie__GenJv");
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
                  c -> c.generativeProvider(GenerativeProvider.openai(o -> o))));

      // Per-object result from the single prompt
      for (var obj : response.objects()) {
        System.out.println(obj.generative().text());
      }
      // Combined result from the grouped task
      System.out.println(response.generative().text());
      // END llms_generative

      assertNotNull(response.generative().text());
    } finally {
      if (client.collections.exists("Movie__GenJv")) client.collections.delete("Movie__GenJv");
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
